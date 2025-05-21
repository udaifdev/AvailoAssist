import React, { useState } from 'react';
import { toast } from 'react-toastify';
import axiosInstance from '../../../API/axios';
import { Save, XCircle, Eye, EyeOff } from 'lucide-react';

interface UserChangePasswordProps {
    userId: string;
    token: string | null;
    onCancel: () => void;
}

const UserChangePassword: React.FC<UserChangePasswordProps> = ({ userId, token, onCancel }) => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    
    // States to control the visibility of passwords
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleChangePassword = async () => {
        if (newPassword !== confirmPassword) {
            toast.error('New password and confirmation do not match.');
            return;
        }

        setLoading(true);
        try {
            const response = await axiosInstance.put(
                `/user/change-password/${userId}`,
                { currentPassword, newPassword },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            toast.success('Password changed successfully');
            onCancel(); // Cancel and go back to profile
        } catch (error) {
            toast.error('Failed to change password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gray-300 rounded-lg p-6 shadow-sm  mb-16 mt-12">
            <h1 className="text-2xl font-bold mb-4">Change Password</h1>
            <div className="space-y-4">
                <div className="relative">
                    <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                        Current Password
                    </label>
                    <div className="flex items-center">
                        <input
                            type={showCurrentPassword ? 'text' : 'password'}
                            id="currentPassword"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-400 rounded-md"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2"
                        >
                            {showCurrentPassword ? <EyeOff size={20} className='mt-5' /> : <Eye size={20} className='mt-5' />}
                        </button>
                    </div>
                </div>

                <div className="relative">
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                        New Password
                    </label>
                    <div className="flex items-center">
                        <input
                            type={showNewPassword ? 'text' : 'password'}
                            id="newPassword"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-400 rounded-md"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2"
                        >
                            {showNewPassword ? <EyeOff size={20} className='mt-5' /> : <Eye size={20} className='mt-5' />}
                        </button>
                    </div>
                </div>

                <div className="relative">
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                        Confirm New Password
                    </label>
                    <div className="flex items-center">
                        <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-400 rounded-md"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2"
                        >
                            {showConfirmPassword ? <EyeOff size={20} className='mt-5' /> : <Eye size={20} className='mt-5' />}
                        </button>
                    </div>
                </div>

                <div className="flex gap-4 mt-4">
                    <button
                        onClick={handleChangePassword}
                        disabled={loading}
                        className="flex items-center gap-2 bg-teal-700 text-white px-6 py-2 rounded-md hover:bg-teal-800"
                    >
                        <Save size={20} />
                        <span>{loading ? 'Changing...' : 'Change Password'}</span>
                    </button>
                    <button
                        onClick={onCancel}
                        className="flex items-center gap-2 bg-red-700 text-white px-6 py-2 rounded-md hover:bg-red-600"
                    >
                        <XCircle size={20} />
                        <span>Cancel</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserChangePassword;
