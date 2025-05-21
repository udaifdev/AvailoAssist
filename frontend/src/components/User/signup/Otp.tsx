import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import axiosInstance from '../../../API/axios';
import { useDispatch, useSelector } from "react-redux";
import { setCredentials } from "../../../slice/userSlice"; // Redux actions
import { RootState } from "../../../store"; // Import your RootState type
import './otp.css';


const Otp: React.FC = () => {
    const [otp, setOtp] = useState<string[]>(new Array(4).fill(''));
    const [timer, setTimer] = useState<number>(30);
    const [canResend, setCanResend] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false); // Loading state for OTP verification

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { userDetails } = useSelector((state: RootState) => state.user); // Access Redux state

    // Redirect authenticated users to the home page
    useEffect(() => {
        if (userDetails) {
            navigate('/');
        }
    }, [userDetails, navigate]);

    // Check if signup data exists in local storage
    useEffect(() => {
        const signupData = localStorage.getItem('signupData');
        if (!signupData) navigate('/signup');
    }, [navigate]);

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
        updatedOtp[index] = value.slice(-1); // Only keep the last character
        setOtp(updatedOtp);

        // Move focus to the next input
        if (value && index < otp.length - 1) {
            const nextInput = document.getElementById(`otp-input-${index + 1}`) as HTMLInputElement;
            nextInput?.focus();
        }
    };

    const handleResend = async () => {
        if (!canResend) return;

        try {
            const signupData = JSON.parse(localStorage.getItem('signupData') || '{}');
            if (!signupData.email) throw new Error("Signup data missing");

            await axiosInstance.post('user/resend-otp', { email: signupData.email });
            toast.success("New OTP sent!", { position: "top-center" });

            // Reset OTP inputs and timer
            setOtp(new Array(4).fill(''));
            setTimer(30);
            setCanResend(false);
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to resend OTP.", { position: "top-center" });
        }
    };

    const dataURLToBlob = (dataURL: string) => {
        const [metadata, base64] = dataURL.split(',');
        const mime = metadata.match(/:(.*?);/)?.[1];
        const binary = atob(base64);
        const array = [];
        for (let i = 0; i < binary.length; i++) {
            array.push(binary.charCodeAt(i));
        }
        return new Blob([new Uint8Array(array)], { type: mime });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const signupData = JSON.parse(localStorage.getItem('signupData') || '{}');
            if (!signupData.email) throw new Error("Signup data missing");

            const formData = new FormData();
            formData.append('email', signupData.email);
            formData.append('otp', otp.join(''));
            formData.append('firstName', signupData.firstName);
            formData.append('password', signupData.password);
            formData.append('mobile', signupData.mobile);

          
            const profilePic = sessionStorage.getItem('profilePic');

            if (signupData.hasProfilePic && profilePic) {
                const blob = dataURLToBlob(profilePic);
                formData.append('profilePic', blob, 'profile-pic.jpg');
            }

            // Debugging: Log FormData
            for (const pair of formData.entries()) {
                console.log(pair[0], pair[1]);
            }

            const response = await axiosInstance.post('user/verify-otp', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            if (response.status === 201) {
                localStorage.removeItem('signupData');
                sessionStorage.removeItem('profilePic');
                dispatch(setCredentials(response.data));
                toast.success("Registration successful!");
                navigate('/');
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
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-32 h-32">
                    <div className="absolute right-0 top-0 w-24 h-24 bg-emerald-600 rounded-full opacity-20" />
                    <div className="absolute right-0 top-0 w-24 h-24 bg-indigo-300 bg-opacity-20 rotate-45" />
                </div>
                <div className="absolute bottom-0 left-0 w-32 h-32">
                    <div className="absolute left-0 bottom-0 w-24 h-24 bg-emerald-600 rounded-full opacity-20" />
                    <div className="absolute left-0 bottom-0 w-24 h-24 bg-indigo-300 bg-opacity-20 rotate-45" />
                </div>

                {/* Content */}
                <h1 className="text-emerald-600 text-3xl font-semibold text-center mb-8">OTP</h1>
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
                        disabled={otp.some((v) => !v) || isLoading} // Disable if OTP is incomplete or loading
                        className="w-full bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center"
                    >
                        {isLoading ? (
                            <div className="spinner"></div> // Spinner displayed while loading
                        ) : (
                            'Verify OTP'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Otp;
