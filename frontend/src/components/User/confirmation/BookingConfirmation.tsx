import React, { useEffect, useState } from 'react';
import { Clock, MapPin, Calendar, CreditCard, IndianRupee } from 'lucide-react'; // Icons
import { RootState } from '../../../store';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { clearBooking } from '../../../slice/bookingSlice';
import { sendNotification } from '../../../utils/webPushConfig';
import axiosInstance from '../../../API/axios';
import './confirm.css';

import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import StripePaymentForm from './StripePaymentForm'; // Stripe payment form component


// Initialize Stripe with your publishable key
const stripePromise = loadStripe('pk_test_51QhpWaAKDjkTYhoPMKbCbrK247r6WqPzV6SHRmw5Qh2VEixxxAHVyDFAJ4D1fnUMh9FxVDKEXFN5eBPzbN2FYWNu00ucsS6wYM');


const BookingConfirmation = () => {
    const [animationClass, setAnimationClass] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<'online' | 'cod' | null>(null); // Initially no payment method (null)
    const [showConfirmationModal, setShowConfirmationModal] = useState(false); // Modal state
    const [isPaymentConfirmed, setIsPaymentConfirmed] = useState(false); // Track if the "Yes" button is clicked

    const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
    const [clientSecret, setClientSecret] = useState<string | null>(null); // Stripe client secret


    // Get all required data from the Redux store
    const selectedService = useSelector((state: RootState) => state.booking.selectedService);
    const location = useSelector((state: RootState) => state.booking.location);
    const description = useSelector((state: RootState) => state.booking.description);
    const workerDetails = useSelector((state: RootState) => state.booking.workerDetails);
    const userId = useSelector((state: RootState) => state.user.userDetails?.id);
    const coordinates = useSelector((state: RootState) => state.booking.coordinates);
    const userDetails = useSelector((state: RootState) => state.user);

    const navigate = useNavigate();
    const dispatch = useDispatch();

    useEffect(() => {
        setAnimationClass('animate-stop-at');
    }, []);

    const handlePaymentMethodChange = async (method: 'online' | 'cod') => {
        setPaymentMethod(method);
        if (method === 'online' && selectedService?.amount) {
            try {
                setIsPaymentProcessing(true);
                const response = await axiosInstance.post('/user/payment/create-payment-intent', {
                    amount: selectedService.amount,
                });
                setClientSecret(response.data.clientSecret);
            } catch (error) {
                console.error('Error creating payment intent:', error);
            } finally {
                setIsPaymentProcessing(false);
            }
        }
    };

    const handleConfirmPayment = async () => {
        // Prepare booking data to save to the database
        const bookingData = {
            bookedDate: workerDetails?.date || '',
            bookedSlot: workerDetails?.timeSlot || '',
            bookedDescription: description,
            amount: selectedService?.amount || 0,
            paymentMethod,
            workerName: workerDetails?.name || '',
            bookedStatus: 'Pending', // Default status before confirmation
            location: location || '',
            chat: false, // Initially set to false, could be updated later
            workerId: workerDetails?.workerId || '',
            userId: userId, // Assuming the userId is stored in Redux
            serviceName: selectedService?.categoryName || '',
            coordinates: coordinates,
            createdAt: new Date().toISOString(), // add timestamp
            slotId: workerDetails?.slotId || '',
        };

        try {
            // Send data to the backend to save the booking
            const response = await axiosInstance.post('/user/bookings', bookingData);

            // Send notification to worker
            if (workerDetails?.workerId) {
                const message = `📅 New Booking Request!\n👤 From: ${userDetails?.userDetails?.name || 'a customer'}\n🗓️ Date: ${workerDetails?.date || 'unknown date'}\n🔧 Service: ${selectedService?.categoryName || 'service'}`;
                await sendNotification(workerDetails.workerId, message);
            } else {
                console.log('Worker ID not found, notification could not be sent');
            }
            // After saving, navigate to the success page
            setShowConfirmationModal(false); // Close the confirmation modal
            setIsPaymentConfirmed(true); // Set payment confirmed state to true
            const bookingId = response.data._id; // Assuming _id is returned in the response
            navigate(`/bookingSuccess/${bookingId}`);

            // Dispatch clearBooking to reset Redux store
            dispatch(clearBooking());
        } catch (error) {
            console.error('Error saving booking:', error);
            // Handle error (e.g., show an error message to the user)
        }

    }

    const handlePaymentSuccess = async (bookingId: string) => {
        dispatch(clearBooking());
        navigate(`/bookingSuccess/${bookingId}`);
    };


    const handleCancelPayment = () => {
        setShowConfirmationModal(false); // Close the modal
        setPaymentMethod(null); // Reset the payment method (if needed)
    };
    const handleYesButtonClick = () => {
        setIsPaymentConfirmed(true); // Set payment confirmed state to true when "Yes" button is clicked
    };

    return (
        <div className="max-w-4xl mb-20 mx-auto p-4">
            {/* Progress Bar */}
            <div className="mb-5 mt-7">
                <div className="relative">
                    <div className="h-1 bg-gray-200 rounded-full">
                        {/* Animated Progress Bar */}
                        <div className={`h-1 bg-tealCustom rounded-full transition-all duration-500 ${animationClass}`}></div>
                    </div>
                    <div className="flex justify-between -mt-2">
                        {[1, 2, 3, 4].map((num) => (
                            <div key={num} className="flex flex-col items-center">
                                <div className={`w-4 h-4 rounded-full ${num <= 3 ? 'bg-tealCustom' : 'bg-gray-200'}`}></div>
                                <span className={`text-sm mt-1 ${num <= 3 ? 'text-tealCustom' : 'text-gray-500'}`}>
                                    {num}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="text-right mt-1 text-tealCustom font-bold text-sm">
                    4: Confirm details
                </div>
            </div>

            <div className="text-center mb-12">
                <p className="text-gray-600">
                    You're almost done! We just need a few more details to connect you
                    with your Tasker.
                </p>
            </div>

            <h1 className="text-2xl font-semibold text-tealCustom mb-12 text-center">Confirm Details</h1>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Payment Method Section */}
                <div className="bg-gray-100 rounded-lg p-6 border">
                    <h2 className="text-lg font-semibold mb-4">Payment method</h2>
                    <div className="text-sm text-gray-600 mb-4">
                        You may see a temporary hold on your payment method in the amount of
                        your Technician hourly rate. Don't worry - you're only billed when
                        your task is completed!
                    </div>

                    {/* Payment Options */}
                    <div className="space-y-4">
                        {/* Online Payment Option */}
                        <div className="flex items-center gap-3 bg-tealCustom p-4 rounded-lg shadow-md">
                            <CreditCard className="w-6 h-6 text-white" />
                            <div className="flex-1">
                                <p className="font-semibold text-gray-100">Online Payment</p>
                                <p className="text-sm text-gray-100">Pay securely via card or wallet.</p>
                            </div>
                            <input type="radio" name="payment-method" className="text-tealCustom"
                                checked={paymentMethod === 'online'}
                                onChange={() => handlePaymentMethodChange('online')}
                            />
                        </div>

                        {/* Cash on Delivery Option */}
                        <div className="flex items-center gap-3 bg-tealCustom p-4 rounded-lg shadow-md">
                            <IndianRupee className="w-6 h-6 text-white" />
                            <div className="flex-1">
                                <h3 className='text-white font-semibold text-sm'>This payment method is 🚫 currently  unavailable.!</h3>
                                <p className="font-semibold text-gray-100">Pay on Site</p>
                                <p className="text-sm text-gray-100">Pay in cash when the task is completed.</p>
                            </div>
                            <input
                                type="radio"
                                name="payment-method"
                                checked={paymentMethod === 'cod'}
                                onChange={() => handlePaymentMethodChange('cod')}
                                className="text-tealCustom"
                            />
                        </div>
                        {/* {paymentMethod === 'cod' && (
                            <button
                                onClick={handleCashPayment}
                                className="w-full bg-tealCustom text-white py-3 px-4 rounded-md hover:bg-teal-600 transition-colors"
                            >
                                Confirm Booking
                            </button>
                        )} */}
                    </div>
                </div>

                {/* Payment Form Section */}
                {paymentMethod === 'online' && clientSecret && (
                    <div className="bg-gray-50 rounded-lg p-6 border">
                        <h2 className="text-lg font-semibold mb-4">Complete Your Payment</h2>
                        <Elements stripe={stripePromise} options={{ clientSecret }}>
                            <StripePaymentForm onSuccess={handlePaymentSuccess} />
                        </Elements>
                    </div>
                )}

                {/* Service Details Section */}
                <div className="bg-gray-50 rounded-lg p-6 border">
                    <h2 className="text-lg font-semibold mb-4">{selectedService?.categoryName || 'Service'}</h2>

                    <div className="flex items-center justify-center mb-4">
                        {workerDetails?.profilePicture ? (
                            <div className="relative w-24 h-24 rounded-full overflow-hidden shadow-md">
                                <img
                                    src={workerDetails.profilePicture}
                                    alt={workerDetails.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        ) : (
                            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
                                <span className="text-gray-500">No Image</span>
                            </div>
                        )}
                    </div>

                    <div className="text-center mb-4">
                        <p className="font-semibold text-tealCustom">{workerDetails?.name || 'Worker Name'}</p>
                    </div>

                    <div className="space-y-4">
                        {/* Date, Time, and Location Sections */}
                        <div className="flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-gray-500" />
                            <span>{workerDetails?.date || 'No date specified'}</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <Clock className="w-5 h-5 text-gray-500" />
                            <span>{workerDetails?.timeSlot || 'No time specified'}</span>
                        </div>

                        <div className="flex   gap-2">
                            <MapPin className="w-10 h-15 text-gray-500" />
                            <span>{location || 'Task Location'}</span>
                        </div>
                        {/* 
                        <div className="coordinates">
                            {coordinates ? (
                                <p>
                                    Coordinates: Latitude {coordinates.lat}, Longitude {coordinates.lng}
                                </p>
                            ) : (
                                <p>Location not set</p>
                            )}
                        </div> */}

                        <div className="p-2 bg-gray-50 rounded">
                            <p className="text-sm text-gray-600">{workerDetails?.duration || 'Duration'}</p>
                        </div>

                        <div>
                            <p className="font-semibold mb-2">Your task details</p>
                            <div className="p-3 bg-gray-50 rounded">
                                <p className="text-sm text-gray-600">{description || 'Task Description'}</p>
                            </div>
                        </div>

                        <div className="mb-8">
                            <p className="font-semibold mb-2">Price Details</p>
                            <div className="flex justify-between mb-2">
                                <span>Hourly Rate</span>
                                <span>₹{selectedService?.amount || '0.00'}</span>
                            </div>
                            <div className="flex justify-between font-semibold">
                                <span>Total Rate</span>
                                <span>₹{selectedService?.amount || '0.00'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Confirmation Modal for COD */}
            {showConfirmationModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white rounded-lg p-6 w-1/3">
                        <p className="text-center text-lg font-semibold mb-4">
                            Are you sure you want to proceed with Pay on Site?
                        </p>
                        {!isPaymentConfirmed ? (
                            <div className="flex justify-between">
                                <button
                                    onClick={handleCancelPayment}
                                    className="bg-gray-300 px-4 py-2 rounded text-gray-700 hover:bg-gray-400"
                                >
                                    No
                                </button>
                                <button
                                    onClick={handleYesButtonClick}
                                    className="bg-tealCustom px-4 py-2 rounded text-white hover:bg-teal-600"
                                >
                                    Yes
                                </button>
                            </div>
                        ) : (
                            // <Link to={'/bookingSuccess'}>
                            <button
                                onClick={handleConfirmPayment}
                                className="mt-4 w-full bg-tealCustom text-white py-2 px-4 rounded hover:bg-teal-600 transition"
                            >
                                Pay & Continue
                            </button>
                            // </Link>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default BookingConfirmation;
