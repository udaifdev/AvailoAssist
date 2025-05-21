import React, { useState, useEffect, Suspense } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store';
import axiosInstance from '../../../API/axios';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { setCredentials } from '../../../slice/userSlice';
import { logout } from '../../../slice/userSlice';

import { User, Book, Lock, Mail, Phone, LogOut, Save, XCircle } from 'lucide-react';
import Loader from '../../globle/Loader';
import UserChangePassword from './UserChangePassword';
import BookingHistory from './BookingHistory';

const AccountProfile = () => {
    const [workerData, setWorkerData] = useState<any>(null);
    const [editMode, setEditMode] = useState(false);
    const [name, setName] = useState('');
    const [originalName, setOriginalName] = useState('');
    const [nameError, setNameError] = useState('');
    const [image, setImage] = useState<File | null>(null);
    const [originalImage, setOriginalImage] = useState<string | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [activeView, setActiveView] = useState<'profile' | 'bookings' | 'password'>('profile');

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const user_token = useSelector((state: RootState) => state.user.userToken);
    console.log(user_token)
    const userDetails = useSelector((state: RootState) => state.user.userDetails);

    useEffect(() => {
        if (user_token) {
            const decodedToken = JSON.parse(atob(user_token.split('.')[1]));
            const userId = decodedToken.userId;
            console.log('user token ..........', decodedToken.user_token)

            axiosInstance.get(`/user/profile/${userId}`, {
                headers: {
                    Authorization: `Bearer ${user_token}`,
                },
            }).then((response) => {
                console.log('responsed data......', response.data);
                setWorkerData(response.data);
                setName(response.data.name);
                setOriginalName(response.data.name);
                if (response.data.image) {
                    setImagePreview(response.data.image);
                    setOriginalImage(response.data.image);
                }
            }).catch((error) => {
                console.error('Error fetching worker profile:', error);
                toast.error('Failed to fetch profile. Please log in again.');
                if (error.response && error.response.status === 401) {
                    localStorage.removeItem('token');
                    navigate('/login');
                }
            });
        } else {
            if (!userDetails) {
                navigate('/login')
            }
        }
    }, [user_token]);

    const handleEditToggle = () => {
        setEditMode(!editMode);
    };

    const handleViewChange = (view: 'profile' | 'bookings' | 'password') => {
        // Reset states when changing views
        setActiveView(view);
        setEditMode(false);

        if (view === 'profile') {
            // Reset any changes if switching back to profile
            setName(originalName);
            setImagePreview(originalImage);
        }
    };

    const validateName = (name: string): boolean => {
        const trimmedName = name.trim();
        const nameRegex = /^[a-zA-Z\s]+$/;

        if (trimmedName === '') {
            setNameError('Name cannot be empty or whitespace only.');
            return false;
        }
        if (!nameRegex.test(trimmedName)) {
            setNameError('Name must contain only letters and spaces.');
            return false;
        }
        setNameError('');
        return true;
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];

            if (!allowedTypes.includes(file.type)) {
                toast.error('Only JPEG or PNG images are allowed.');
                return;
            }

            setImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSaveChanges = async () => {
        if (!validateName(name)) return;

        setLoading(true);
        try {
            if (!user_token) {
                return;
            }

            const decodedToken = JSON.parse(atob(user_token.split('.')[1]));
            const workerId = decodedToken.userId;

            const formData = new FormData();
            formData.append('name', name.trim());
            if (image) {
                formData.append('profilePic', image);
            }

            const response = await axiosInstance.put(`/user/profileUpdate/${workerId}`, formData, {
                headers: {
                    Authorization: `Bearer ${user_token}`,
                    'Content-Type': 'multipart/form-data',
                },
                withCredentials: true,
            });

            if (response.data) {
                setWorkerData(response.data.user);
                setEditMode(false);
                dispatch(setCredentials(response.data));
                toast.success('Profile Updated Successfully!');
                navigate('/profile');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error('Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handleCancelChanges = () => {
        setName(originalName);
        setImagePreview(originalImage);
        setEditMode(false);
    };

    if (!workerData) {
        return <div><Loader /></div>;
    }

    const handleLogout = async () => {
        try {
            await axiosInstance.post('user/logout');
            dispatch(logout());
            toast.success('Logout successful!');
            navigate('/');
        } catch (err) {
            console.log(err);
            toast.error('Failed to logout. Please try again.');
        }
    };

    const renderProfileContent = () => (
        <div className="bg-gray-300 rounded-lg p-6 shadow-sm mb-16 mt-12">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h1 className="text-2xl font-bold">Account</h1>


                {!editMode ? (
                    <button onClick={handleEditToggle} className="bg-teal-700 text-white px-6 py-2 rounded-md hover:bg-teal-800">
                        Edit Profile
                    </button>
                ) : (
                    <div className="flex gap-4">
                        <button
                            onClick={handleSaveChanges}
                            disabled={loading}
                            className={`flex items-center gap-2 ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-teal-700'} text-white px-6 py-2 rounded-md hover:bg-teal-800`}
                        >
                            {loading ? (
                                <div className="loader h-4 w-4 border-2 border-t-2 border-white rounded-full animate-spin"></div>
                            ) : (
                                <Save size={20} />
                            )}
                            <span>{loading ? 'Updating...' : 'Save Changes'}</span>
                        </button>
                        <button
                            onClick={handleCancelChanges}
                            className="flex items-center gap-2 bg-red-700 text-white px-6 py-2 rounded-md hover:bg-red-600"
                        >
                            <XCircle size={20} />
                            <span>Cancel</span>
                        </button>
                    </div>
                )}
            </div>

            <div className="flex flex-col md:flex-row gap-8">
                <div className="flex-shrink-0">
                    {imagePreview ? (
                        <img
                            src={imagePreview}
                            alt="Profile"
                            className="w-60 h-60 rounded-full object-cover"
                        />
                    ) : (
                        <div className="w-60 h-60 bg-gray-200 rounded-full flex items-center justify-center">
                            <User size={70} className="text-gray-500" />
                        </div>
                    )}
                    {editMode && (
                        <input
                            type="file"
                            accept="image/*"
                            className="mt-4"
                            onChange={handleImageChange}
                        />
                    )}
                </div>

                <div className="space-y-6 mt-6">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-3">
                            <User className="text-teal-700" size={24} />
                            {!editMode ? (
                                <span className="text-lg">{workerData.name || 'N/A'}</span>
                            ) : (
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="border border-gray-400 px-3 py-2 rounded-md"
                                />
                            )}
                        </div>
                        {editMode && nameError && (
                            <p className="text-red-600 text-sm">{nameError}</p>
                        )}
                    </div>
                    <div className="flex items-center gap-3">
                        <Mail className="text-teal-700" size={24} />
                        <span className="text-lg">{workerData.email || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Phone className="text-teal-700" size={24} />
                        <span className="text-lg">{workerData.phone || 'N/A'}</span>
                    </div>
                    <button onClick={handleLogout} className="flex items-center gap-2 bg-teal-700 text-white px-6 py-2 rounded-md hover:bg-teal-800 mt-4">
                        <LogOut size={20} />
                        <span>Log Out</span>
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto p-5 mt-8">
            <Suspense fallback={<Loader />}>
                <div className="flex justify-between items-center flex-wrap gap-4 mb-8">
                    <button
                        onClick={() => handleViewChange('profile')}
                        className={`flex items-center gap-2 px-6 py-3 border-2 border-tealCustom rounded-full ${activeView === 'profile' ? 'bg-tealCustom text-white' : 'text-teal-600'} hover:bg-teal-600 hover:text-white transform hover:scale-105 transition duration-300`}
                    >
                        <User size={30} />
                        <span className="font-bold">Account Info</span>
                    </button>
                    <button
                        onClick={() => handleViewChange('bookings')}
                        className={`flex items-center gap-2 px-6 py-3 border-2 border-tealCustom rounded-full ${activeView === 'bookings' ? 'bg-tealCustom text-white' : 'text-teal-600'} hover:bg-teal-600 hover:text-white transform hover:scale-105 transition duration-300`}
                    >
                        <Book size={30} />
                        <span className="font-bold">Booking History</span>
                    </button>
                    <button
                        onClick={() => handleViewChange('password')}
                        className={`flex items-center gap-2 px-6 py-3 border-2 border-tealCustom rounded-full ${activeView === 'password' ? 'bg-tealCustom text-white' : 'text-teal-600'} hover:bg-teal-600 hover:text-white transform hover:scale-105 transition duration-300`}
                    >
                        <Lock size={30} />
                        <span className="font-bold">Change Password</span>
                    </button>
                </div>

                {/* Content area */}
                {activeView === 'profile' && renderProfileContent()}
                {activeView === 'bookings' && <BookingHistory userId={workerData._id} />}
                {activeView === 'password' && (
                    <UserChangePassword
                        userId={workerData._id}
                        token={user_token}
                        onCancel={() => handleViewChange('profile')}
                    />
                )}
            </Suspense>
        </div>
    );
};

export default AccountProfile;  