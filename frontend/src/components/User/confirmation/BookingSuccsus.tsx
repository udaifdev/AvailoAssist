import React, { ReactNode, useState, useEffect } from 'react';
import { Wrench, MapPin, Phone, Calendar, AlertCircle, DollarSign, CreditCard, User, Check, FileText } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../../../API/axios';
import { useParams } from 'react-router-dom';



interface BookingDetails {
    serviceName: string;
    location: string;
    phone: string;
    bookedDate: string;
    bookedSlot: string;
    bookedStatus: string;
    amount: number;
    paymentMethod: string;
    workerName: string;
    bookedDescription: string
}


const BookingConfirmation = () => {
    const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const { bookingId } = useParams(); // Get the bookingId from the URL
    const navigate = useNavigate();

    useEffect(() => {
        const fetchBookingDetails = async () => {
            try {
                if (!bookingId) {
                    setError('Booking ID is missing');
                    return;
                }
                // Fetch booking details using the bookingId from the URL
                const response = await axiosInstance.get(`/user/booking/${bookingId}`, {
                    withCredentials: true, // Ensure authentication
                });
                setBookingDetails(response.data);
            } catch (error) {
                setError('Failed to fetch booking details.');
            } finally {
                setLoading(false);
            }
        };
        fetchBookingDetails();
        
        // Redirect to the home page after 2 minutes (120000 milliseconds)
        const timer = setTimeout(() => {
            navigate('/');
        }, 120000);

        // Clear the timer if the component unmounts
        return () => clearTimeout(timer);
    }, [bookingId, navigate]); // Re-run only if bookingId or navigate changes






    if (loading) {
        return <div className="text-center p-6">Loading booking details...</div>;
    }

    if (error) {
        return <div className="text-center p-6 text-red-500">{error}</div>;
    }

    return (
        <div className="max-w-3xl mx-auto p-6 animate-fadeIn">
            {/* Progress Bar with centered success mark */}
            <div className="relative w-full mb-16">
                {/* Base line */}
                <div className="absolute left-0 right-0 h-0.5 bg-gray-200 top-3"></div>

                {/* Completed progress line */}
                <div className="absolute left-0 right-0 h-0.5 bg-tealCustom top-3 animate-progressBar"></div>

                {/* Progress points */}
                <div className="relative flex justify-between items-center">
                    {/* First point */}
                    <div className="w-3 h-3 rounded-full bg-tealCustom relative z-10"></div>

                    {/* Second point */}
                    <div className="w-3 h-3 rounded-full bg-tealCustom relative z-10"></div>

                    {/* Center success mark */}
                    <div className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 top-3 z-20">
                        <div className="w-12 h-12 rounded-full border-2 border-tealCustom bg-white flex items-center justify-center">
                            <div className="w-8 h-8 rounded-full bg-tealCustom flex items-center justify-center animate-bounce">
                                <Check className="w-7 h-7 text-white" />
                            </div>
                        </div>
                    </div>

                    {/* Third point */}
                    <div className="w-3 h-3 rounded-full bg-tealCustom relative z-10"></div>

                    {/* Fourth point */}
                    <div className="w-3 h-3 rounded-full bg-tealCustom relative z-10"></div>
                </div>
            </div>

            {/* Header Section */}
            <div className="relative mb-12">
                <div className="absolute -left-4 -top-4 w-48 h-48">
                    <div className="w-full h-full bg-tealCustom rounded-full"></div>
                    <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(255,255,255,0.1)_10px,rgba(255,255,255,0.1)_20px)]"></div>
                </div>

                <div className="relative z-10 ml-32">
                    <h1 className="text-2xl font-bold mb-2">Booking Confirmation</h1>
                    <h2 className="text-xl text-gray-700 mb-4 flex items-center gap-2">
                        Review Your Booking Details
                        <span className="text-red-500">❯❯❯❯</span>
                    </h2>
                    <p className="text-gray-600 text-sm">
                        Please carefully review the details of your booking before the worker accepts. Make sure the service, time,
                        and location are correct. If everything looks good, the worker will confirm the booking. If there are any issues
                        or changes, you can update your request before proceeding.
                    </p>
                </div>
            </div>

            {/* Booking Details Card */}
            <div className="bg-white rounded-lg shadow-lg p-8 animate-slideUp">
                {bookingDetails ? (
                    <div className="space-y-6">
                        <InfoRow
                            icon={<Wrench className="text-emerald-600" />}
                            label="Service Requested"
                            value={bookingDetails.serviceName}
                        />
                        <InfoRow
                            icon={<MapPin className="text-emerald-600" />}
                            label="Location"
                            value={bookingDetails.location}
                        />
                        {/* <InfoRow
                            icon={<Phone className="text-emerald-600" />}
                            label="Phone No"
                            value={bookingDetails.phone}
                        /> */}
                        <InfoRow
                            icon={<Calendar className="text-emerald-600" />}
                            label="Booking Information"
                            value={`Confirmed for ${bookingDetails.bookedDate} at ${bookingDetails.bookedSlot}`}
                        />
                        <InfoRow
                            icon={<FileText className="text-emerald-600" />}
                            label="Booked Description"
                            value={`${bookingDetails.bookedDescription}`}
                        />
                        <InfoRow
                            icon={<AlertCircle className="text-red-500" />}
                            label="Status"
                            value={<span className="text-red-500">"{bookingDetails.bookedStatus}" (until the worker accepts the request).</span>}
                        />
                        <InfoRow
                            icon={<DollarSign className="text-emerald-600" />}
                            label="Amount"
                            value={`₹${bookingDetails.amount}/hr`}
                        />
                        <InfoRow
                            icon={<CreditCard className="text-emerald-600" />}
                            label="Payment Method"
                            value={bookingDetails.paymentMethod}
                        />
                        <InfoRow
                            icon={<User className="text-emerald-600" />}
                            label="Provider Name"
                            value={bookingDetails.workerName}
                        />
                    </div>
                ) : (
                    <p>No booking details available.</p>
                )}

                <div className="mt-8 text-center">
                    <p className="text-orange-500 font-medium mb-6">You did your part, the rest is up to our team!</p>
                    <Link to={'/profile'}>
                        <button className="px-6 py-3 bg-tealCustom text-white rounded-full hover:bg-teal-700 transition-colors duration-300 flex items-center gap-2 mx-auto">
                            View My Bookings
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
};

// Define the types for the props
interface InfoRowProps {
    icon: ReactNode;   // icon will be a React component or JSX element
    label: string;     // label is a string
    value: ReactNode | string;  // value can be a string or a React component/JSX element
}

// Define the InfoRow component with proper type annotations
const InfoRow: React.FC<InfoRowProps> = ({ icon, label, value }) => (
    <div className="flex items-start gap-4 hover:bg-gray-50 p-2 rounded-lg transition-colors duration-200">
        <div className="w-6 h-6">
            {icon}
        </div>
        <div className="flex-1">
            <div className="font-semibold text-gray-700">{label}</div>
            <div className="text-gray-600 mt-1">{value}</div>
        </div>
    </div>
)

// Add these animations to your Tailwind config
const tailwindConfig = {
    theme: {
        extend: {
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(20px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                progressBar: {
                    '0%': { width: '0%' },
                    '100%': { width: '100%' },
                }
            },
            animation: {
                fadeIn: 'fadeIn 0.5s ease-out',
                slideUp: 'slideUp 0.5s ease-out',
                progressBar: 'progressBar 1s ease-out',
            },
        },
    },
};

export default BookingConfirmation;