import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { useNavigate } from "react-router-dom";
import axiosInstance from '../../../API/axios';

const UserForgotPass = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const navigate = useNavigate();

    const validateEmail = (email: string) => {
        return String(email).toLowerCase().match(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!email) {
            setError('Email is required');
            toast.error('Please enter your email address');
            return;
        }

        if (!validateEmail(email)) {
            setError('Invalid email format');
            toast.error('Please enter a valid email address');
            return;
        }
        setIsLoading(true);

        try {
            const response = await axiosInstance.post('/user/forgotPass-send-otp', { email });
            console.log('response data.........', response.data)

            if (response.data.success) {
                toast.success('OTP sent to your email');
                localStorage.setItem('resetEmail', email); // Store email for OTP verification
                navigate('/forgotPassword-OTP');
                setEmail('');
            } else {
                toast.error(response.data.message || 'Failed to send OTP');
            }
        } catch (error) {
            console.error('Error sending OTP:', error);
            toast.error('Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center bg-cover bg-center"
            style={{ backgroundImage: "url('https://romandecoratingproducts.com/wp-content/uploads/2022/07/workers-hanging-stylish-wall-paper-sheet-on-wall.jpg')" }}>

            <div className="w-full max-w-md">
                <div className="bg-white p-8 rounded-lg shadow-sm border relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32">
                        <div className="absolute right-0 top-0 w-40 h-40 bg-tealCustom rounded-full translate-x-1/2 -translate-y-1/2 opacity-40"></div>
                    </div>

                    <div className="absolute bottom-0 left-0 w-32 h-32">
                        <div className="absolute left-0 bottom-0 w-40 h-40 bg-tealCustom rounded-full -translate-x-1/2 translate-y-1/2 opacity-40"></div>
                    </div>
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold text-tealCustom">AVAILOASSIST</h1>
                    </div>
                    <h2 className="text-2xl font-semibold text-emerald-700 mb-2">Forgot Password</h2>

                    <p className="text-gray-600 mb-6">
                        Enter your email and we'll send you instructions to reset your password
                    </p>

                    <form onSubmit={handleSubmit}>
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 ${error ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                placeholder="enter email address"
                                disabled={isLoading}
                            />
                            {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-teal-600 text-white py-2 px-4 rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                                    Sending...
                                </>
                            ) : (
                                'SEND OTP'
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default UserForgotPass;
