import React, { useState, useEffect } from 'react';
import { Search, User, Upload } from 'lucide-react';
import { adminAxios } from '../../../API/axios';
import ProfileImageUpload from './Propertiece/ProfileImageUpload';
import { toast } from 'react-toastify';

interface UserData {
    id: string;
    name: string;
    email: string;
    phone: string;
    image: string | null;
    status: boolean;
}

const UserManagement = () => {
    const [users, setUsers] = useState<UserData[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterUsers, setFilterUsers] = useState<UserData[]>(users);
    const [block, setBlock] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [imageUrl, setImageUrl] = useState<string>('');
    const [confirmationModal, setConfirmationModal] = useState<{
        isOpen: boolean;
        userId: string | null;
        action: 'block' | 'unblock' | null;
    }>({ isOpen: false, userId: null, action: null });


    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await adminAxios.get("/admin/get-all-users");
                const mappedUsers = res.data.map((user: any) => ({
                    id: user._id,  // map _id to id
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    image: user.image,
                    status: user.status,
                }));
                console.log('res data......', mappedUsers)
                setUsers(mappedUsers);
                setFilterUsers(mappedUsers);
            } catch (error) {
                console.log(error);
            }
        };
        fetchData();
    }, [block]);

    useEffect(() => {
        const filterUser = users.filter((user) => {
            const regex = new RegExp(searchTerm, "i");
            return regex.test(user.name) || regex.test(user.email);
        });
        setFilterUsers(filterUser);
    }, [searchTerm, users]);

    

    const handleStatusChange = async (userId: string, action: 'block' | 'unblock') => {
        try {
            console.log('handel status change fucntion called..........', userId, action)

            const response = await adminAxios.patch(`/admin/update-user-status/${userId}`, {
                status: action === 'block' ? false : true,
            });
            
            console.log('response data....', response.data)
            
            if (response.data.success) {
                const updateUserList = (prevUsers: UserData[]) =>
                    prevUsers.map((user) =>
                        user.id === userId 
                            ? { ...user, status: action === 'block' ? false : true }
                            : user
                    );
                
                setUsers(updateUserList);
                setFilterUsers(updateUserList);
                toast.success(`User successfully ${action === 'block' ? 'blocked' : 'unblocked'}!`, {
                    position: "top-right", autoClose: 3000,hideProgressBar: false,closeOnClick: true,pauseOnHover: true,draggable: true,});
            }
        } catch (error) {
            console.error('Error updating user status:', error);
            toast.error(`Failed to ${action} user. Please try again.`, {position: "top-right",});
        } finally {
            closeConfirmationModal();
        }
    };


  

    const openConfirmationModal = (userId: string, action: 'block' | 'unblock') => {
        setConfirmationModal({ isOpen: true, userId, action });
    };

    const closeConfirmationModal = () => {
        setConfirmationModal({ isOpen: false, userId: null, action: null });
    };


    const handleImageSave = async (userId: string, imageBlob: Blob) => {
        try {
            const formData = new FormData();
            formData.append('image', imageBlob, 'profile.jpg'); // Add filename
            formData.append('userId', userId);

            const response = await adminAxios.post('/admin/update-user-image', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data.success) {
                // Update local state
                setUsers(prevUsers =>
                    prevUsers.map(user =>
                        user.id === userId
                            ? { ...user, image: response.data.imageUrl }
                            : user
                    )
                );
                // Show success message if you have a notification system
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            // Show error message if you have a notification system
        } finally {
            setSelectedUserId(null);
        }
    };


    const handleImageClick = (userId: string, userImage: string) => {
        setSelectedUserId(userId);
        setImageUrl(userImage);  // Set the image URL of the clicked user
    };

    return (
        <div className="p-6">
            {/* Header */}
            <h1 className="text-2xl text-center font-bold text-teal-700 mb-6">
                Users Management
            </h1>

            {/* Search Bar */}
            <div className="relative mb-8 max-w-sm">
                <input
                    type="text"
                    placeholder="Search users by name or email"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-4 pr-10 py-2 border-2 border-teal-600 rounded-md focus:outline-none"
                />
                <Search className="absolute right-3 top-2.5 text-gray-400" size={20} />
            </div>

            {/* Table */}
            <div className="border-2 border-teal-600 rounded-lg overflow-hidden">
                {/* Table Header */}
                <div className="grid grid-cols-6 bg-tealCustom text-white p-4 border-b-2 border-teal-600">
                    <div className="font-bold">Image</div>
                    <div className="font-bold">Name</div>
                    <div className="font-bold">Email</div>
                    <div className="font-bold">Phone</div>
                    <div className="font-bold">Status</div>
                    <div className="font-bold">Action</div>
                </div>

                {/* Table Body */}
                {filterUsers.length === 0 ? (
                    <div className="p-4 text-center">No users found</div>
                ) : (
                    filterUsers.map((user) => (
                        <div key={user.id} className="grid grid-cols-6 bg-white p-4 border-b-2 border-gray-100">
                            <div className="flex items-center relative group cursor-pointer" onClick={() => handleImageClick(user.id, user.image || '')}>
                                {user.image ? (
                                    <img
                                        src={user.image}
                                        alt={user.name}
                                        className="w-20 h-20 rounded-full object-cover border-2 border-teal-600"
                                    />
                                ) : (
                                    <div className="w-20 h-20 rounded-full border-2 border-teal-600 flex items-center justify-center">
                                        <User size={30} className="text-teal-600" />
                                    </div>
                                )}
                            </div>

                            <div className="flex text-sm items-center text-blue-600">{user.name}</div>
                            <div className="flex text-sm items-center text-blue-600">
                                <div className="flex flex-col">
                                    <span className="truncate">{user.email.split('@')[0]}</span>
                                    <span className="text-teal-600">{`@${user.email.split('@')[1]}`}</span>
                                </div>
                            </div>
                            <div className="flex text-sm items-center">
                                <span className="truncate">{user.phone.length > 10 ? `${user.phone.substring(0, 10)}...` : user.phone}</span>
                            </div>
                            <div className="flex items-center">
                                <span className={`${user.status === true ? 'text-teal-600' : 'text-red-500'}`}>
                                    {user.status === true ? 'Active' : 'Blocked'}
                                </span>
                            </div>
                            <div className="flex items-center">
                                <button
                                    onClick={() => openConfirmationModal(user.id, user.status ? 'block' : 'unblock')}
                                    className={`px-4 py-1 rounded-md border-2 ${user.status
                                        ? 'border-red-500 text-red-500 hover:bg-red-500 hover:text-white'
                                        : 'border-teal-600 text-teal-600 hover:bg-teal-600 hover:text-white'
                                        }`}
                                >
                                    {user.status ? 'Block' : 'Unblock'}
                                </button>

                                {confirmationModal.isOpen && (
                                    <div className="fixed inset-0 bg-black bg-opacity-10 flex items-center justify-center z-50">
                                        <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
                                            <h2 className="text-lg font-bold text-center mb-4">
                                                {`Are you sure you want to ${confirmationModal.action === 'block' ? 'block' : 'unblock'
                                                    } this user?`}
                                            </h2>
                                            <div className="flex justify-between mt-4">
                                                <button
                                                    onClick={closeConfirmationModal}
                                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleStatusChange(confirmationModal.userId!, confirmationModal.action!)
                                                    }
                                                    className={`px-4 py-2 rounded-md ${confirmationModal.action === 'block'
                                                        ? 'bg-red-500 text-white hover:bg-red-600'
                                                        : 'bg-teal-600 text-white hover:bg-teal-700'
                                                        }`}
                                                >
                                                    {confirmationModal.action === 'block' ? 'Block' : 'Unblock'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Pagination */}
            <div className="flex justify-center mt-6 gap-2">
                {[1, 2, 3, 4, '....', 9, 10].map((page, index) => (
                    <button
                        key={index}
                        className={`w-8 h-8 rounded-full flex items-center justify-center
                        ${page === 1 ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                        {page}
                    </button>
                ))}
            </div>

            {/* Profile Image Upload Dialog */}
            {selectedUserId && (
                <ProfileImageUpload isOpen={!!selectedUserId} onClose={() => setSelectedUserId(null)} imageUrl={imageUrl} onImageSave={(blob: Blob) => handleImageSave(selectedUserId, blob)}
                    userId={selectedUserId} />
            )}
        </div>
    );
};

export default UserManagement;