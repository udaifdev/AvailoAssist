import React, { useState, useEffect } from 'react';
import { Wrench, ChevronLeft, ChevronRight, Calendar, IndianRupee, MessageCircle, User, Star, CheckCircle, Trash2, Info, Clock, XCircle } from 'lucide-react';
import axiosInstance from '../../../API/axios';
import { RootState } from '../../../store';
import { useNavigate } from 'react-router-dom';
import './booking.css'
import { toast } from 'react-toastify';
import { BookingHistoryProps, Booking, Review } from '../../../types/bookingHistory';
import ReviewModal from './ReviewModal';
import ChatBoard from '../communication/ChatBoard';

const BookingHistory: React.FC<BookingHistoryProps> = ({ userId }) => {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelReason, setCancelReason] = useState('');
    const [cancelBookingId, setCancelBookingId] = useState<string | null>(null);
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [reviews, setReviews] = useState<{ [key: string]: Review }>({});
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const bookingsPerPage = 4;



    const navigate = useNavigate();

    useEffect(() => {
        const fetchBookingsAndReviews = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await axiosInstance.get(`/user/bookingsHistoryPage/${userId}`);
                if (response.data) {
                    const bookingsData = response.data;

                    // Fetch reviews for each booking
                    const reviewsData: { [key: string]: Review } = {};
                    for (const booking of bookingsData) {
                        try {
                            const reviewResponse = await axiosInstance.get(`/user/review/${booking._id}`);
                            if (reviewResponse.data) {
                                reviewsData[booking._id] = reviewResponse.data;
                            }
                        } catch (err) {
                            console.log(`No review found for booking ${booking._id}`);
                        }
                    }

                    setReviews(reviewsData);
                    setBookings(bookingsData);
                }
            } catch (err: any) {
                setError(err.message || 'Something went wrong.');
            } finally {
                setLoading(false);
            }
        };

        if (userId) {
            fetchBookingsAndReviews();
        }
    }, [userId]);

    // Function to handle opening the review modal
    const handleReviewClick = (bookingId: string) => {
        setSelectedBookingId(bookingId);
        setShowReviewModal(true);
    };

    // Function to handel Deleting the review
    const handleDeleteReview = async (bookingId: string) => {
        try {
            await axiosInstance.delete(`/user/review/${bookingId}`);
            const updatedReviews = { ...reviews };
            delete updatedReviews[bookingId];
            setReviews(updatedReviews);
            toast.success("Review deleted successfully!");
        } catch (error) {
            toast.error("Failed to delete review");
        }
    };


    // Render review section for a booking
    const renderReviewSection = (booking: Booking) => {
        const review = reviews[booking._id];

        if (review) {
            return (
                <div className="mt-4 p-3 bg-gray-200 rounded-lg">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-2">
                                <Star className="text-yellow-400 fill-yellow-400" size={16} />
                                <span className="font-bold">{review.rating.toString()}/5</span>
                            </div>
                            <p className="text-sm mt-1">{review.review}</p>
                        </div>
                        <button
                            onClick={() => handleDeleteReview(booking._id)}
                            className="text-red-500 hover:text-red-300"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                </div>
            );
        }

        if (booking.bookedStatus.toLowerCase() === 'completed' && !review) {
            return (
                <button
                    onClick={() => handleReviewClick(booking._id)}
                    className="mt-4 text-xs p-2 text-gray-100 bg-tealCustom font-bold rounded-lg flex items-center gap-2"
                >
                    <Star size={16} className="text-yellow-600 bg-white p-0.5 rounded-lg font-bold" />
                    Add Review / Rate
                </button>
            );
        }

        return null;
    };

    // Function to handle submitting the review
    const handleReviewSubmit = async (review: string, rating: number, bookingId: string) => {
        if (!selectedBookingId) return;

        // Find the specific booking from the bookings array
        const booking = bookings.find(b => b._id === selectedBookingId);
        if (!booking) {
            toast.error("Booking not found.");
            return;
        }

        try {
            const payload = {
                bookingId,
                userId: booking.userId,
                workerId: booking.workerId,
                rating,
                review,
            };

            const response = await axiosInstance.post(`/user/addReview`, payload);

            // Update the reviews state with the new review data
            const newReview: Review = {
                _id: response.data.review._id,
                userId: response.data.review.userId,
                workerId: response.data.review.workerId,
                bookingId: response.data.review.bookingId,
                rating: response.data.review.rating,
                review: response.data.review.review,
                createdAt: response.data.review.createdAt,
                updatedAt: response.data.review.updatedAt,
                __v: response.data.review.__v
            };

            setReviews(prev => ({ ...prev, [bookingId]: newReview }));
            toast.success("Review submitted successfully!");
            closeReviewModal();
        } catch (error) {
            console.error("Error submitting review:", error);
            toast.error("Failed to submit review. Please try again.");
        }
    };


    // Close the Review Modal
    const closeReviewModal = () => {
        setShowReviewModal(false);
        setSelectedBookingId(null);
    };

    const itemsPerPage = 4;
    const totalPages = Math.ceil(bookings.length / itemsPerPage);
    const showSlider = bookings.length > 5;

    const getStatusColor = (status: string | undefined | null) => {
        if (!status) return 'text-gray-600';
        switch (status.toLowerCase()) {
            case 'completed': return 'text-green-600';
            case 'pending': return 'text-blue-600';
            case 'rejected': return 'text-red-600';
            case 'accepted': return 'text-yellow-600';
            case 'cancelled': return 'text-red-600';
            default: return 'text-gray-600';
        }
    };

    // Pagination calculations
    const indexOfLastBooking = currentPage * bookingsPerPage;
    const indexOfFirstBooking = indexOfLastBooking - bookingsPerPage;
    const currentBookings = bookings.slice(indexOfFirstBooking, indexOfLastBooking);
    //  const totalPages = Math.ceil(bookings.length / bookingsPerPage);

    const handlePageChange = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    };

    const handleCancelClick = (bookingId: string) => {
        setCancelBookingId(bookingId);
        setShowCancelModal(true);
    };

    const handleReasonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setCancelReason(e.target.value);
    };


    // Handle submit cancellation with validation
    const handleCancelSubmit = async () => {
        console.log('cancel booking ......................')
        if (cancelReason.length < 10 || cancelReason.length > 100) {
            setToastMessage("Cancellation reason must be between 10 and 100 characters.");
            setTimeout(() => setToastMessage(null), 3000); // Clear toast after 3 seconds
            return;
        }
        try {
            await axiosInstance.put(`/user/cancelBooking/${cancelBookingId}`, { reason: cancelReason });

            setBookings(bookings.filter(booking => booking._id !== cancelBookingId));
            toast.success('cancel booking successful..!!')
            setShowCancelModal(false);
            // navigate('/profile');
        } catch (error) {
            setToastMessage('Failed to cancel booking.');
            setError('Error canceling booking');
        } finally {
            setTimeout(() => setToastMessage(null), 3000);
        }
    };


    const closeCancelModal = () => {
        setShowCancelModal(false);
        setCancelReason('');
    };

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="flex justify-center items-center mb-8">
                <h1 className="text-2xl font-semibold">Booking Information</h1>
                <div>
                    <img
                        src="https://assets-v2.lottiefiles.com/a/82e83ee8-1153-11ee-b7f9-17cf2c7adff3/wSxSRcVdve.gif"
                        alt="Service Doll Animation"
                        className="w-24 h-24 animate-smooth-bounce"
                    />
                </div>
            </div>


            {/* Loading and error states */}
            {loading && <p className="text-center text-gray-500">Loading...</p>}
            {error && <p className="text-center text-red-500">{error}</p>}

            {!loading && !error && bookings.length === 0 && (
                <p className="text-center text-gray-500">No bookings found.</p>
            )}

            {/* Display the bookings */}
            {!loading && !error && bookings.length > 0 && (
                <div className="relative">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {currentBookings.map((booking, index) => (
                            <div key={index} className="border rounded-lg p-6 bg-gray-100 text-tealCustom font-semibold shadow-md hover:shadow-lg transition-shadow duration-300 transform hover:-translate-y-1">
                                <div className="space-y-4">
                                    <div className="booking-row">
                                        <Wrench className="text-tealCustom w-5 h-5" />
                                        <p className="booking-label">Service Request:</p>
                                        <span className="booking-value">{booking.serviceName}</span>
                                    </div>
                                    <div className="booking-row">
                                        <Calendar className="text-tealCustom w-5 h-5" />
                                        <p className="booking-label">Booking Date:</p>
                                        <span className="booking-value">{booking.bookedDate}</span>
                                    </div>
                                    <div className="booking-row">
                                        <Clock className="text-tealCustom w-5 h-5" />
                                        <p className="booking-label">Booking Time:</p>
                                        <span className="booking-value">{booking.bookedSlot}</span>
                                    </div>
                                    <div className="booking-row">
                                        <IndianRupee className="text-tealCustom w-5 h-5" />
                                        <p className="booking-label">Amount:</p>
                                        <span className="booking-value">{booking.amount} by {booking.paymentMethod}</span>
                                    </div>
                                    <div className="booking-row">
                                        <User className="text-tealCustom w-5 h-5" />
                                        <p className="booking-label">Provider:</p>
                                        <span className="booking-value">{booking.workerName}</span>
                                    </div>

                                    <div className="booking-row">
                                        <CheckCircle className="text-tealCustom w-5 h-5" />
                                        <p className="booking-label">Booked Status:</p>
                                        <span className={`booking-value ${getStatusColor(booking.bookedStatus)}`}>
                                            {booking.bookedStatus}
                                            <ChatBoard
                                                bookingId={booking._id}
                                                status={booking.bookedStatus}
                                                workerId={booking.workerId}
                                            />
                                        </span>
                                    </div>

                                    {/* Booked Description */}
                                    <div className="flex items-start gap-4">
                                        <Info className="text-tealCustom w-5 h-5 mt-1" />
                                        <p className="font-bold">Description:</p>
                                        <div className="overflow-hidden whitespace-nowrap w-full">
                                            <div className="scrolling-text text-end">{booking.bookedDescription}</div>
                                        </div>
                                    </div>

                                    {/* Review Section */}
                                    {renderReviewSection(booking)}


                                    {/* Show Cancel button for "pending" or "accepted" */}
                                    {(booking.bookedStatus.toLowerCase() === 'pending' || booking.bookedStatus.toLowerCase() === 'accepted') && (
                                        <button
                                            onClick={() => handleCancelClick(booking._id)}
                                            className="mt-4 text-xs p-2 bg-red-500 text-white rounded-lg flex items-center gap-2"
                                        >
                                            <XCircle className="w-4 h-4" />
                                            Cancel Booking
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-2 mt-6">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="px-1 py-1 bg-tealCustom text-white rounded-lg disabled:opacity-50"
                            >
                                <ChevronLeft/>
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                                <button
                                    key={pageNum}
                                    onClick={() => handlePageChange(pageNum)}
                                    className={`px-3 py-1 rounded-lg ${currentPage === pageNum
                                        ? 'bg-tealCustom text-white'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                        }`}
                                >
                                    {pageNum}
                                </button>
                            ))}
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="px-1 py-1 bg-tealCustom text-white rounded-lg disabled:opacity-50"
                            >
                                <ChevronRight/>
                            </button>
                        </div>
                    )}
                </div>
            )}


           {/* Review Modal */}
        {showReviewModal && selectedBookingId && (
            <ReviewModal
                bookingId={selectedBookingId}
                onClose={closeReviewModal}
                onSubmit={handleReviewSubmit}
            />
        )}

        {/* Cancel Modal */}
        {showCancelModal && (
            <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
                <div className="bg-tealCustom text-white p-6 rounded-lg max-w-sm w-full">
                    <h2 className="text-lg text-white font-bold mb-4">Cancel Booking</h2>

                    {/* Limited Booking Cancellation Reminder */}
                    <div className="text-gray-200 mb-6">
                        <p>You have limited booking cancellations available. Please provide a valid reason.</p>
                    </div>
                    <textarea
                        className="w-full p-2 border rounded-lg mb-4"
                        placeholder="Enter the reason for cancellation"
                        value={cancelReason}
                        onChange={handleReasonChange}
                    />
                    {toastMessage && (
                        <div className="text-center text-red-500 mb-4">{toastMessage}</div>
                    )}

                    <div className="flex justify-between">
                        <button onClick={handleCancelSubmit}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg">
                            Submit
                        </button>
                        <button onClick={closeCancelModal}
                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg">
                            Close
                        </button>
                    </div>
                </div>
            </div>
        )}

        <p className="text-center text-gray-600 mt-8">
            Book your next Service or manage future to-dos with AvailoAssist
        </p>
    </div>
);
}

export default BookingHistory;