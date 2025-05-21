import React, { useState } from 'react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { useNavigate } from "react-router-dom";
import axiosInstance from '../../../API/axios';

const UserResetPass = () => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const navigate = useNavigate();

    const validatePassword = (password: string) => {
        const passwordRegex = /^.{6,}$/;
        return passwordRegex.test(password);
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!newPassword || !confirmPassword) {
            setError('Both password fields are required');
            toast.error('Both password fields are required');
            return;
        }
        if (!validatePassword(newPassword)) {
            setError('Password must be at least 6 characters long');
            toast.error('Password does not meet requirements');
            return;
        }
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            toast.error('Passwords do not match');
            return;
        }

        setIsLoading(true);

        try {
            const email = localStorage.getItem('resetEmail'); // Retrieve email from localStorage
            if (!email) throw new Error('Reset email is missing');

            const response = await axiosInstance.post('/user/reset-password', {
                email,
                newPassword,
                confirmPassword
            });

            if (response.data.success) {
                toast.success('Password reset successful!');
                localStorage.removeItem('resetEmail')
                navigate('/login');
            } else {
                toast.error(response.data.message || 'Password reset failed');
            }
        } catch (error: any) {
            console.error('Error resetting password:', error);
            toast.error(error.response?.data?.message || 'Something went wrong. Please try again.');
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
                    <h2 className="text-2xl font-semibold text-emerald-700 mb-2">Set New Password</h2>

                    <p className="text-gray-600 mb-6">
                        Enter your new password and confirm it to reset your account password
                    </p>

                    <form onSubmit={handlePasswordSubmit}>
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                New Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showNewPassword ? 'text' : 'password'}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 ${error ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    placeholder="Enter new password"
                                    disabled={isLoading}
                                />
                                <div
                                    className="absolute right-3 top-2 cursor-pointer"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                >
                                    {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </div>
                            </div>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 ${error ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    placeholder="Confirm new password"
                                    disabled={isLoading}
                                />
                                <div
                                    className="absolute right-3 top-2 cursor-pointer"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </div>
                            </div>
                        </div>

                        {error && <p className="mb-2 text-center text-sm text-red-500">{error}</p>}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-teal-600 text-white py-2 px-4 rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                                    Resetting...
                                </>
                            ) : (
                                'Reset Password'
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default UserResetPass;
