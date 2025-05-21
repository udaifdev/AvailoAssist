import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axiosInstance from '../../../API/axios';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const WorkerResetPass = () => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    // Password validation function
    const validatePassword = (password: string) => {
        if (password.length < 6) {
            setError('Password must be at least 6 characters long');
            return false;
        }
        return true;
    };

    // Submit handler
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!validatePassword(newPassword)) {
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setIsLoading(true);
        try {
            const email = localStorage.getItem('WorkerResetEmail');  
            if (!email) throw new Error('Reset email is missing');

            const response = await axiosInstance.post('/worker/worker-reset-password', {
                newPassword,
                email
            });

            if (response.status === 200) {
                toast.success('Password reset successfully!', { position: 'top-center' });
                localStorage.removeItem('WorkerResetEmail')
                navigate('/worker-login');
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to reset password', { position: 'top-center' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-teal-50">
            <div className="w-full max-w-md">
                <div className="p-8 rounded-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32">
                        <div className="absolute right-0 top-0 w-40 h-40 bg-teal-600 rounded-full translate-x-1/2 -translate-y-1/2 opacity-40" />
                    </div>
                    <div className="absolute bottom-0 left-0 w-32 h-32">
                        <div className="absolute left-0 bottom-0 w-40 h-40 bg-teal-600 rounded-full -translate-x-1/2 translate-y-1/2 opacity-40" />
                    </div>

                    <h1 className="text-4xl font-bold text-teal-600 text-center mb-8">AVAILOASSIST <span>Expertist</span></h1>

                    <h2 className="text-2xl font-semibold text-emerald-700 mb-2">Reset Forgot Password</h2>
                    <p className="text-gray-600 mb-6">
                        Enter your New Password and reset your password.
                    </p>

                    <form onSubmit={handleSubmit}>
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 ${error ? 'border-red-500' : 'border-gray-300'}`}
                                    placeholder="Enter new password"
                                    disabled={isLoading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2"
                                >

                                </button>
                            </div>

                            <label className="block text-sm font-medium text-gray-700 mb-2 mt-4">Confirm Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 ${error ? 'border-red-500' : 'border-gray-300'}`}
                                    placeholder="Confirm your password"
                                    disabled={isLoading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2"
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5 text-gray-500" /> : <Eye className="h-5 w-5 text-gray-500" />}
                                </button>
                            </div>

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
                                'Reset Password'
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default WorkerResetPass;
