import React, { useState, useEffect } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import type { StripePaymentElementChangeEvent } from '@stripe/stripe-js';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../store';
import axiosInstance from '../../../API/axios';
import { sendNotification } from '../../../utils/webPushConfig';


interface StripePaymentFormProps {
    onSuccess: (bookingId: string) => void;
}


const StripePaymentForm: React.FC<StripePaymentFormProps> = ({ onSuccess }) => {

    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentError, setPaymentError] = useState<string | null>(null);
    const [isFormComplete, setIsFormComplete] = useState(false);
    const [isFormValid, setIsFormValid] = useState(false);

    const stripe = useStripe();
    const elements = useElements();

    const selectedService = useSelector((state: RootState) => state.booking.selectedService);
    const workerDetails = useSelector((state: RootState) => state.booking.workerDetails);
    const userId = useSelector((state: RootState) => state.user.userDetails?.id);
    const userDetails = useSelector((state: RootState) => state.user.userDetails);
    const location = useSelector((state: RootState) => state.booking.location);
    const description = useSelector((state: RootState) => state.booking.description);
    const coordinates = useSelector((state: RootState) => state.booking.coordinates);

    // Listen to changes in the PaymentElement
    useEffect(() => {
        if (!stripe || !elements) return;

        const paymentElement = elements.getElement('payment');
        if (!paymentElement) return

        // Listen to changes in the PaymentElement
        paymentElement.on('change', (event) => {
            const typedEvent = event as StripePaymentElementChangeEvent & { error?: { message: string } };
            setIsFormComplete(typedEvent.complete);
            setPaymentError(typedEvent.error?.message || null);
            setIsFormValid(typedEvent.complete && !typedEvent.error);
        });
        return () => { paymentElement.off('change') };
    }, [stripe, elements]);


    const handleSubmit = async (e: React.FormEvent) => {

        e.preventDefault();
        if (!stripe || !elements || !selectedService?.amount) return;
        if (!isFormValid) {
            setPaymentError('Please fill in all payment details correctly.');
            return;
        }
        setIsProcessing(true);
        setPaymentError(null);

        try {
            // Create booking first
            const bookingData = {
                workerId: workerDetails?.workerId,
                userId,
                bookedDate: workerDetails?.date,
                bookedSlot: workerDetails?.timeSlot,
                amount: selectedService.amount,
                paymentMethod: 'online',
                workerName: workerDetails?.name,
                bookedStatus: 'Pending',
                location,
                serviceName: selectedService.categoryName,
                coordinates,
                bookedDescription: description,
                slotId: workerDetails?.slotId,
                createdAt: new Date().toISOString(),
            };

            const bookingResponse = await axiosInstance.post('/user/bookings', bookingData);
            const bookingId = bookingResponse.data._id;

            // Confirm the payment
            const { error: paymentError, paymentIntent } = await stripe.confirmPayment({
                elements,
                confirmParams: {
                    return_url: `${window.location.origin}/bookingSuccess/${bookingId}`,
                },
                redirect: 'if_required',
            });

            if (paymentError) {
                throw new Error(paymentError.message);
            }

            if (paymentIntent?.status === 'succeeded') {
                // Update booking with payment details
                await axiosInstance.post('/user/payment/confirm', {
                    bookingId,
                    paymentIntentId: paymentIntent.id,
                    amount: selectedService.amount,
                });

                // Send notification to worker
                if (workerDetails?.workerId) {
                    const message = `📅 New Booking Request!\n👤 From: ${userDetails?.name || 'a customer'}\n🗓️ Date: ${workerDetails?.date || 'unknown date'}\n🔧 Service: ${selectedService?.categoryName || 'service'}`;
                    await sendNotification(workerDetails.workerId, message);
                } else {
                    console.log('Worker ID not found, notification could not be sent');
                }

                onSuccess(bookingId);
            }
        } catch (error: any) {
            setPaymentError(error?.message || 'Payment failed. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    const getSubmitButtonText = () => {
        if (isProcessing) return 'Processing...';
        if (!isFormComplete) return 'Please Complete Payment Details';
        return 'Pay Now';
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white p-4 rounded-lg shadow-sm">
                <PaymentElement
                    options={{
                        layout: {
                            type: 'tabs',
                            defaultCollapsed: false,
                        },
                    }}
                />
            </div>

            {paymentError && (
                <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                    {paymentError}
                </div>
            )}

            <button
                type="submit"
                disabled={!stripe || isProcessing || !isFormValid}
                className="w-full bg-tealCustom text-white py-3 px-4 rounded-md hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                {getSubmitButtonText()}
            </button>

            {!isFormComplete && (
                <p className="text-sm text-red-600 text-center">
                    Please fill in all required payment details before proceeding.
                </p>
            )}
        </form>
    );
};

export default StripePaymentForm;