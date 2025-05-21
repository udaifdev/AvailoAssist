import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axiosInstance from '../../../API/axios';
import { Loader2 } from "lucide-react";

const UserForgotPassOTP: React.FC = () => {
    const [otp, setOtp] = useState<string[]>(new Array(4).fill(''));
    const [timer, setTimer] = useState<number>(30);
    const [canResend, setCanResend] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const navigate = useNavigate();

    // Countdown timer for OTP resend
    useEffect(() => {
        if (timer > 0) {
            const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
            return () => clearInterval(interval);
        } else {
            setCanResend(true);
        }
    }, [timer]);

    const handleOtpChange = (value: string, index: number) => {
        const updatedOtp = [...otp];
        updatedOtp[index] = value.slice(-1);
        setOtp(updatedOtp);

        if (value && index < otp.length - 1) {
            const nextInput = document.getElementById(`otp-input-${index + 1}`) as HTMLInputElement;
            nextInput?.focus();
        }
    };

    const handleResend = async () => {
        if (!canResend) return;
        try {
            const email = localStorage.getItem('resetEmail');
            if (!email) throw new Error("Email data missing");

            await axiosInstance.post('/user/resend-otp', { email });
            toast.success("New OTP sent!", { position: "top-center" });

            // Reset OTP inputs and timer
            setOtp(new Array(4).fill(''));
            setTimer(30);
            setCanResend(false);
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to resend OTP.", { position: "top-center" });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // Retrieve email from localStorage
            const email = localStorage.getItem('resetEmail');
            if (!email) throw new Error("Email data is missing");

            // Send API request to verify OTP
            const response = await axiosInstance.post('/user/forgotPass-verify-otp', {
                email, // Pass email as expected by the backend
                otp: otp.join(''), // Join OTP array into a single string
            });

            if (response.status === 201) {
                toast.success("OTP verification successful!");
                navigate('/reset-password');
            }
        } catch (error: any) {
            setOtp(new Array(4).fill(''));
            toast.error(error.response?.data?.message || "Invalid OTP.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="w-full max-w-md p-8 bg-white rounded-3xl shadow-lg relative">
                <div className="absolute top-0 right-0 w-32 h-32">
                    <div className="absolute right-0 top-0 w-24 h-24 bg-emerald-600 rounded-full opacity-20" />
                    <div className="absolute right-0 top-0 w-24 h-24 bg-indigo-300 bg-opacity-20 rotate-45" />
                </div>
                <div className="absolute bottom-0 left-0 w-32 h-32">
                    <div className="absolute left-0 bottom-0 w-24 h-24 bg-emerald-600 rounded-full opacity-20" />
                    <div className="absolute left-0 bottom-0 w-24 h-24 bg-indigo-300 bg-opacity-20 rotate-45" />
                </div>

                {/* Content */}
                <h1 className="text-emerald-600 text-3xl font-semibold text-center mb-8">
                    Reset Password
                </h1>
                <div className="space-y-6">
                    <p className="text-gray-700 text-center mb-4">Enter Your OTP</p>

                    <div className="flex justify-center gap-4">
                        {otp.map((data, index) => (
                            <input
                                key={index}
                                type="text"
                                id={`otp-input-${index}`}
                                maxLength={1}
                                value={data}
                                onChange={(e) => handleOtpChange(e.target.value, index)}
                                className="w-12 h-12 border-2 rounded-lg text-center text-xl focus:border-emerald-600 focus:outline-none border-gray-300"
                            />
                        ))}
                    </div>

                    <div className="text-center text-sm text-gray-500">
                        {canResend ? (
                            <button onClick={handleResend} className="text-red-500 hover:text-red-600">
                                Resend OTP
                            </button>
                        ) : (
                            <p>Resend OTP in {timer} seconds</p>
                        )}
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={otp.some((v) => !v) || isLoading}
                        className={`w-full bg-emerald-600 text-white py-3 rounded-lg transition-colors flex items-center justify-center ${
                            isLoading || otp.some((v) => !v) ? 'cursor-not-allowed opacity-50' : 'hover:bg-emerald-700'
                        }`}
                    >
                        {isLoading ? (
                            <Loader2 className="animate-spin h-5 w-5 text-white" />
                        ) : (
                            'Verify OTP'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserForgotPassOTP;
