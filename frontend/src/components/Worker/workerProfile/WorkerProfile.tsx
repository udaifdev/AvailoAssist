import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { RootState } from '../../../store'; // Adjust the import path as needed
import axiosInstance from '../../../API/axios';
import { set_Worker_Credentials } from '../../../slice/workerSlice';
import { User, UserPlus, Edit, Save, UserCheck, Bell, X, Eye, EyeOff } from 'lucide-react'; // Import Lucide icons
import { toast } from 'react-toastify'; // Import Toastify
import 'react-toastify/dist/ReactToastify.css';
import AvailabilitySection from './AvailabilitySection';
import { initializeNotifications, requestNotificationPermission } from '../../../utils/webPushConfig';
import { Availability, AvailabilityDate, TimeSlot } from '../../../types/availability';
import './profile.css';





const WorkerProfile = React.memo(() => {

    const [workerData, setWorkerData] = useState<any>(null); // Type updated to 'any' for now
    const [editMode, setEditMode] = useState(false); // State to manage edit mode
    const [editableData, setEditableData] = useState<any>(null); // To store editable data
    const [isPasswordChangeMode, setIsPasswordChangeMode] = useState(false); // State to toggle password change form
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showDocument, setShowDocument] = useState(false); // State to toggle document view
    // const [showAvailability, setShowAvailability] = useState(false); // State to toggle availability section visibility

    // const [availability, setAvailability] = useState<Availability>({
    //     dates: [],  
    //     weeklySlots: [], 
    //     fixedSlots: [], 
    //   });
      
    // Update notification state to use workerData
    const [notificationState, setNotificationState] = useState<{
        permission: NotificationPermission;
        enabled: boolean;
    }>({
        permission: 'default',
        enabled: false, // Will be updated when workerData loads
    });

    const worker_token = useSelector((state: RootState) => state.worker.workerToken);
    const dispatch = useDispatch();


    useEffect(() => {
        if (worker_token) {
            const decodedToken = JSON.parse(atob(worker_token.split('.')[1]));
            const workerId = decodedToken.userId; //  workerId in the token

            console.log('token and worker id........', workerId, worker_token)

            axiosInstance.get(`/worker/worker-profile/${workerId}`, {
                headers: {
                    Authorization: `Bearer ${worker_token}`,
                },
            })
                .then((response) => {
                    console.log('responsed data.........', response.data)
                    setWorkerData(response.data);
                    setEditableData(response.data); // Initialize editableData
                })
                .catch((error) => {
                    console.error('Error fetching worker profile:', error);
                    toast.error("Failed to fetch profile data.");
                });
        }
    }, [worker_token]);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setEditableData({ ...editableData, [name]: value });
    };


    // Handle the toggle of showing the document
    const toggleDocumentVisibility = () => {
        setShowDocument(prevState => !prevState);
    };



    const handleEdit = () => {
        setEditMode(true);
        toast.info("Profile is now in edit mode!");
    };

    // Code to save changes
    const handleSave = async () => {
        try {
            if (!worker_token) return;

            const decodedToken = JSON.parse(atob(worker_token.split('.')[1]));
            const workerId = decodedToken.userId;
            console.log('workr Id --->', workerId, 'decodedToken -------> ', decodedToken)

            // Prepare the data to be updated
            const updatedData = {
                fullName: editableData.fullName?.trim(),
                mobile: editableData.mobile?.trim(),
                category: editableData.category?.trim(),
                workRadius: editableData.workRadius?.trim(),
                notifications: editableData.notifications, // Include notifications preferences
            };
            console.log('update data -----> ', updatedData)

            // Send data as JSON to update the worker profile
            const response = await axiosInstance.put(`/worker/worker-profile-Update/${workerId}`,
                updatedData, // Send all the updated fields here
                {
                    headers: {
                        Authorization: `Bearer ${worker_token}`,
                        'Content-Type': 'application/json', // Ensure content type is JSON
                    },
                }
            );
            console.log('response data ------> ', response.data)
            if (response.data) {
                setWorkerData(response.data.user);
                setEditableData(response.data.user); // Update editable data after success
                dispatch(set_Worker_Credentials(response.data));
                setEditMode(false); // Exit edit mode
                toast.success("Profile Updated Successfully");
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error("Failed to update profile");
        }
    };

    // ================================================= Notification Section start ==================================================================

    interface NotificationState {
        enabled: boolean;
        permission: NotificationPermission;
    }

    interface EditableData {
        notifications: {
            newJobs: boolean;
        };
    }

    // Add effect to initialize notification state when workerData loads
    useEffect(() => {
        if (workerData?.notifications?.newJobs !== undefined) {
            setNotificationState(prev => ({
                ...prev,
                enabled: workerData.notifications.newJobs
            }));
        }
    }, [workerData]);

    // Add effect to check notification permission on mount
    useEffect(() => {
        const checkPermission = async () => {
            const permission = await Notification.permission;
            setNotificationState(prev => ({
                ...prev,
                permission,
            }));
        };

        checkPermission();
    }, []);


    // Add effect to initialize notification state when workerData loads
    useEffect(() => {
        if (workerData?.notifications?.newJobs !== undefined) {
            setNotificationState(prev => ({
                ...prev,
                enabled: workerData.notifications.newJobs
            }));
        }
    }, [workerData]);

    // Add effect to check notification permission on mount
    useEffect(() => {
        const checkPermission = async () => {
            const permission = await Notification.permission;
            setNotificationState(prev => ({
                ...prev,
                permission,
            }));
        };

        checkPermission();
    }, []);

    // Update the notification change handler
    const handleNotificationChange = async (newValue: boolean) => {
        try {
            if (newValue && notificationState.permission !== 'granted') {
                // Request notification permission if enabling
                const subscription = await requestNotificationPermission();

                if (!subscription) {
                    // Permission denied or subscription failed
                    setNotificationState((prev: NotificationState) => ({
                        ...prev,
                        enabled: false,
                        permission: 'denied',
                    }));
                    toast.error("Notification permission denied");
                    return;
                }
            }

            // Update local state
            setNotificationState((prev: NotificationState) => ({
                ...prev,
                enabled: newValue,
            }));

            // Update editable data with new notification preference
            setEditableData((prev: EditableData) => ({
                ...prev,
                notifications: {
                    ...prev.notifications,
                    newJobs: newValue,
                }
            }));

            // Initialize notifications if enabling
            if (newValue && worker_token) {
                const decodedToken = JSON.parse(atob(worker_token.split('.')[1]));
                const workerId = decodedToken.userId;
                await initializeNotifications(workerId);
            }

            toast.success(`Notifications ${newValue ? 'enabled' : 'disabled'} successfully`);
        } catch (error) {
            console.error('Error updating notification settings:', error);
            toast.error("Failed to update notification settings");
        }
    };



    // Update your render JSX for the notifications section
    const renderNotificationsSection = () => (
        <section className="profilePart border-b pb-4">
            <h2 className="text-lg text-teal-800 font-semibold mb-3">Notifications</h2>
            <div>
                <p className="text-gray-600 font-bold">New Jobs/Payment</p>
                {editMode ? (
                    <div className="flex gap-4">
                        <button
                            onClick={() => handleNotificationChange(true)}
                            className={`flex bg-teal-600 text-white px-4 py-2 text-xs rounded-md hover:bg-teal-700 
                                ${editableData.notifications?.newJobs ? 'bg-teal-700' : ''}`}
                            disabled={notificationState.permission === 'denied'}
                        >
                            <Bell className="mr-2 w-4 h-4" /> ALLOW
                        </button>
                        <button
                            onClick={() => handleNotificationChange(false)}
                            className={`flex bg-red-600 text-xs text-white px-4 py-2 rounded-md hover:bg-red-700 
                                ${!editableData.notifications?.newJobs ? 'bg-red-700' : ''}`}
                        >
                            <X className="mr-2 w-4 h-4" /> DISALLOW
                        </button>
                    </div>
                ) : (
                    <p className={`font-medium pl-2 pr-2 ${workerData.notifications?.newJobs ? 'bg-green-100' : 'bg-red-100'}`}>
                        {workerData.notifications?.newJobs ? 'ALLOW' : 'DISALLOW'}
                    </p>
                )}
                {notificationState.permission === 'denied' && (
                    <p className="text-xs text-red-500 mt-2">
                        Please enable notifications in your browser settings to receive job alerts.
                    </p>
                )}
            </div>
        </section>
    );

    // ================================================= Notification Section End ==================================================================


    const handlePasswordChange = async () => {
        try {
            if (newPassword !== confirmPassword) {
                toast.error("New password and confirm password do not match!");
                return;
            }
            if (worker_token) {
                const decodedToken = JSON.parse(atob(worker_token.split('.')[1]));
                const workerId = decodedToken.userId; //  workerId in the token
                console.log('worker change password id ......... ', workerId)

                const response = await axiosInstance.put(`/worker/worker-ChengePassword/${workerId}`,
                    {
                        currentPassword,
                        newPassword,
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${worker_token}`,
                        },
                    }
                );

                if (response.data) {
                    toast.success("Password updated successfully!");
                    setIsPasswordChangeMode(false); // Exit password change mode
                }
            }
        } catch (error) {
            console.error('Error updating password:', error);
            toast.error("Failed to update password");
        }
    };




    const handleCancel = () => {
        setEditableData(workerData); // Reset editable data to original
        setEditMode(false);
        setIsPasswordChangeMode(false)
    };

    if (!workerData) {
        return <div>Loading...</div>;
    }

    return (
        <div className="profile-container max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-lg">
            <div className="flex flex-col md:flex-row justify-between items-center mb-10">
                <h1 className="text-2xl font-bold text-teal-800">Worker Profile</h1>
                <div className="flex flex-col items-center">
                    {/* Profile Picture Section */}
                    <div className="w-28 h-28 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                        {workerData?.profilePicture ? (
                            <img src={workerData.profilePicture}
                                alt="Profile" className="w-full h-full rounded-full object-cover" />
                        ) : (
                            <User className="w-12 h-12 text-blue-900" />
                        )}
                    </div>

                    <div className="flex gap-4">
                        {!editMode && (
                            <button
                                onClick={handleEdit}
                                className="flex gap-1  bg-tealCustom text-xs text-white  py-2 px-2 rounded-md hover:bg-teal-700"
                            >
                                <Edit className="mr- w-4 h-4 " /> Edit Profile
                            </button>
                        )}
                        {!editMode && (
                            <button
                                className="flex gap-1  bg-tealCustom text-xs text-white  py-2 px-2 rounded-md hover:bg-teal-700"
                            >
                                <UserPlus className="mr- w-4 h-4" /> Edit Picture
                            </button>
                        )}
                    </div>

                    {/* Save or Cancel buttons */}
                    {editMode && (
                        <div className="flex gap-4 mt-6">
                            <button
                                onClick={handleSave}
                                className="flex bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700"
                            >
                                <Save className="mr-2" /> Save Changes
                            </button>
                            <button
                                onClick={handleCancel}
                                className="flex bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                            >
                                <X className="mr-2" /> Cancel Changes
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="space-y-7">
                {/* Personal Information */}
                <section className="profilePart border-b pb-4">
                    <h2 className="text-lg font-semibold text-teal-800 mb-3">Personal Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p className="text-gray-600 font-bold">Name</p>
                            {editMode ? (
                                <input
                                    type="text"
                                    name="fullName"
                                    value={editableData.fullName}
                                    onChange={handleChange}
                                    className="border rounded-md px-2 py-1 w-full"
                                />
                            ) : (
                                <p className="font-medium bg-green-100 pl-2 pr-2">{workerData.fullName}</p>
                            )}
                        </div>
                        <div>
                            <p className="text-gray-600 font-bold">Phone</p>
                            {editMode ? (
                                <input
                                    type="text"
                                    name="mobile"
                                    value={editableData.mobile}
                                    onChange={handleChange}
                                    className="border rounded-md px-2 py-1 w-full"
                                />
                            ) : (
                                <p className="font-medium bg-green-100 pl-2 pr-2">{workerData.mobile}</p>
                            )}
                        </div>
                        <div>
                            <p className="text-gray-600 font-bold">Email</p>
                            <p className="font-medium bg-green-100 pl-2 pr-2">{workerData.email}</p>
                        </div>
                    </div>
                </section>

                {/* Address Information */}
                <section className="profilePart border-b pb-4">
                    <h2 className="text-lg text-teal-800 font-semibold mb-3">Address Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p className="text-gray-600 font-bold">Street</p>
                            <p className="font-medium bg-green-100 pl-2 pr-2">{workerData.streetAddress}</p>
                        </div>
                        <div>
                            <p className="text-gray-600 font-bold">City</p>
                            <p className="font-medium bg-green-100 pl-2 pr-2">{workerData.city}</p>
                        </div>
                        <div>
                            <p className="text-gray-600 font-bold">ZipCode</p>
                            <p className="font-medium bg-green-100 pl-2 pr-2">{workerData.zipCode}</p>
                        </div>
                    </div>
                </section>

                {/* Job Preferences */}
                <section className="profilePart border-b pb-4">
                    <h2 className="text-lg text-teal-800 font-semibold mb-3">Job Preferences</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p className="text-gray-600 font-bold">Preferred Job Categories</p>
                            
                                <p className="font-medium bg-green-100 pl-2 pr-2">{workerData.category}</p>
                        </div>
                        <div>
                            <p className="text-gray-600 font-bold">Travel Distance</p>
                            {editMode ? (
                                <input
                                    type="text"
                                    name="workRadius"
                                    value={editableData.workRadius}
                                    onChange={handleChange}
                                    className="border rounded-md px-2 py-1 w-full"
                                />
                            ) : (
                                <p className="font-medium bg-green-100 pl-2 pr-2">{workerData.workRadius} km</p>
                            )}
                        </div>
                    </div>
                </section>





                {/* Notifications */}


                {renderNotificationsSection()}


                {/* Documents Section */}
                <section className='profilePart border-b pb-4'>
                    <h2 className="text-lg text-teal-800 font-semibold mb-3 flex items-center">
                        <span className="w-2 h-2 bg-gray-800 rounded-full mr-2"></span>
                        Documents
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p className="text-gray-600 font-bold">ID Proof</p>
                            <p className="font-medium bg-green-100 pl-2 pr-2">
                                {workerData?.governmentId ? 'Uploaded' : 'Not Uploaded'}
                            </p>
                        </div>
                        <div>
                            <p className="text-gray-600 font-bold">ID Proof Number</p>
                            <p className="font-medium bg-green-100 pl-2 pr-2">{workerData?.governmentIdNo}</p>
                        </div>
                    </div>

                    {/* Show Document Button */}
                    {workerData?.governmentId && (
                        <div className="mt-4">
                            <button
                                className="bg-teal-600 text-xs text-white py-1 px-2 rounded-md"
                                onClick={toggleDocumentVisibility}
                            >
                                {showDocument ? 'Hide Document' : 'Show Document'}
                                {showDocument ? <EyeOff className="inline ml-3 w-2 h-3 " /> : <Eye className="inline ml-2 w-4 h-4 " />}
                            </button>
                        </div>
                    )}

                    {/* Document Preview */}
                    {showDocument && workerData?.governmentId && (
                        <div className="mt-4">
                            <h3 className="text-gray-800 font-semibold mb-2">Document Preview</h3>
                            <div className="bg-teal-600 p-4 rounded-md">
                                <img
                                    src={workerData.governmentId}
                                    alt="Government ID"
                                    className="w-full max-w-sm mx-auto rounded-md"
                                />
                            </div>
                        </div>
                    )}
                </section>


                {/* Availability Section */}
                {/* <section className="profilePart border-b pb-4">
                    <h2 className="text-lg text-teal-800 font-semibold mb-3">Availability</h2>
                    <button onClick={() => setShowAvailability((prev) => !prev)}
                        className="bg-teal-600 text-white  py-1 px-2 text-xs   rounded-md hover:bg-teal-700">
                        {showAvailability ? 'Hide Availability' : 'Show Availability'}
                        {showAvailability ? <EyeOff className="inline ml-3 w-2 h-3 " /> : <Eye className="inline ml-2 w-4 h-4 " />}
                    </button>

                    {showAvailability && (
                        <AvailabilitySection
                            availability={availability}
                            setAvailability={setAvailability}
                            token={worker_token || ''}
                            axiosInstance={axiosInstance}
                            editMode={editMode}
                        />
                    )}

                   
                </section> */}



                {/* Security Settings */}
                <section className="profilePart border-b pb-4">
                    <h2 className="text-lg text-teal-800 font-semibold mb-3">Security Settings</h2>
                    <div>
                        <p className="text-gray-600 font-bold">Change Password</p>
                        {!isPasswordChangeMode ? (
                            <button
                                onClick={() => {
                                    setIsPasswordChangeMode(true);
                                    toast.info("Password is now in edit mode!");
                                }}
                                className="flex bg-teal-600 mt-2 text-white text-xs px-2 py-1 rounded-md hover:bg-teal-700"
                            >
                                <UserCheck className="mr-2 w-4 h-4" /> Change Password
                            </button>

                        ) : (
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="currentPassword" className="block text-gray-600">Current Password</label>
                                    <input
                                        type="password"
                                        id="currentPassword"
                                        name="currentPassword"
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        className="border rounded-md px-2 py-1 w-full"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="newPassword" className="block text-gray-600">New Password</label>
                                    <input
                                        type="password"
                                        id="newPassword"
                                        name="newPassword"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="border rounded-md px-2 py-1 w-full"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="confirmPassword" className="block text-gray-600">Confirm Password</label>
                                    <input
                                        type="password"
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="border rounded-md px-2 py-1 w-full"
                                    />
                                </div>
                                <div className='flex gap-2'>
                                    <button
                                        onClick={handlePasswordChange}
                                        className="flex bg-teal-600 text-white text-sm px-4 py-2 rounded-md hover:bg-teal-700"
                                    >
                                        <Save className="mr-2 w-5 h-5" /> Save Password
                                    </button>
                                    <button
                                        onClick={handleCancel}
                                        className="flex bg-red-600 text-white text-sm px-4 py-2 rounded-md hover:bg-red-700"
                                    >
                                        <X className="mr-2 w-5 h-5" /> Cancel Password
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </div >
    );
});

export default WorkerProfile;










// const [isPasswordChangeMode, setIsPasswordChangeMode] = useState(false); // State to toggle password change form
// const [currentPassword, setCurrentPassword] = useState('');
//     const [newPassword, setNewPassword] = useState('');
//     const [confirmPassword, setConfirmPassword] = useState('');


// const handlePasswordChange = () => {
//     if (newPassword !== confirmPassword) {
//         toast.error("New password and confirm password do not match!");
//         return;
//     }
//     // Here you would call the API to update the password.
//     toast.success("Password updated successfully!");
//     setIsPasswordChangeMode(false); // Hide password change form after success
// };



{/* Security Settings */ }
//  <section className="profilePart border-b pb-4">
//  <h2 className="text-lg text-teal-800 font-semibold mb-3">Security Settings</h2>
//  <div>
//      <p className="text-gray-600 font-bold">Change Password</p>
//      {!isPasswordChangeMode ? (
//          <button
//              onClick={() => setIsPasswordChangeMode(true)}
//              className="text-teal-600 font-medium hover:text-teal-700 bg-green-100 p-2 rounded-md"
//          >
//              <UserCheck className="mr-2" /> Change Password
//          </button>
//      ) : (
//          <div className="space-y-4">
//              <div>
//                  <label htmlFor="currentPassword" className="block text-gray-600">Current Password</label>
//                  <input
//                      type="password"
//                      id="currentPassword"
//                      name="currentPassword"
//                      value={currentPassword}
//                      onChange={(e) => setCurrentPassword(e.target.value)}
//                      className="border rounded-md px-2 py-1 w-full"
//                  />
//              </div>
//              <div>
//                  <label htmlFor="newPassword" className="block text-gray-600">New Password</label>
//                  <input
//                      type="password"
//                      id="newPassword"
//                      name="newPassword"
//                      value={newPassword}
//                      onChange={(e) => setNewPassword(e.target.value)}
//                      className="border rounded-md px-2 py-1 w-full"
//                  />
//              </div>
//              <div>
//                  <label htmlFor="confirmPassword" className="block text-gray-600">Confirm Password</label>
//                  <input
//                      type="password"
//                      id="confirmPassword"
//                      name="confirmPassword"
//                      value={confirmPassword}
//                      onChange={(e) => setConfirmPassword(e.target.value)}
//                      className="border rounded-md px-2 py-1 w-full"
//                  />
//              </div>
//              <button
//                  onClick={handlePasswordChange}
//                  className="text-teal-600 font-medium bg-teal-100 p-2 rounded-md"
//              >
//                  Save Password
//              </button>
//          </div>
//      )}
//  </div>
// </section>






// import React, { useEffect, useState } from 'react';
// import { useSelector } from 'react-redux';
// import { RootState } from '../../../store'; // Adjust the import path as needed
// import axiosInstance from '../../../API/axios';
// import { User } from 'lucide-react';
// import './profile.css'


// const WorkerProfile = React.memo(() => {
//     const [workerData, setWorkerData] = useState<any>(null); // Type updated to 'any' for now
//     const token = useSelector((state: RootState) => state.worker.token);

//     useEffect(() => {
//         if (token) {
//             // Decode token to extract workerId (if workerId is in the token)
//             const decodedToken = JSON.parse(atob(token.split('.')[1]));
//             const workerId = decodedToken.userId; // Assuming userId is workerId in the token

//             console.log("Decoded workerId: ", workerId); // Log the workerId

//             axiosInstance.get(`/worker/worker-profile/${workerId}`, {
//                 headers: {
//                     Authorization: `Bearer ${token}`,
//                 },
//             })
//                 .then((response) => {
//                     setWorkerData(response.data);
//                 })
//                 .catch((error) => {
//                     console.error('Error fetching worker profile:', error);
//                 });
//         }
//     }, [token]);

//     console.log('worker datas ----> ', workerData);

//     if (!workerData) {
//         return <div>Loading...</div>; // Loading state until data is fetched
//     }

//     return (
//         <div className="profile-container max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-lg">
//             <div className="flex flex-col md:flex-row justify-between items-center mb-10">
//                 <h1 className="text-2xl font-bold text-teal-800">Worker Profile</h1>
//                 <div className="flex flex-col items-center">
//                     <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-4">
//                         <User className="w-12 h-12 text-blue-900" />
//                     </div>
//                     <div className="flex gap-2">
//                         <button className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700">Edit Profile</button>
//                         <button className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700">Edit Picture</button>
//                     </div>
//                 </div>
//             </div>

//             <div className="space-y-7">
//                 {/* Personal Information */}
//                 <section className="profilePart border-b pb-4">
//                     <h2 className="text-lg font-semibold text-teal-800 mb-3 flex items-center">
//                         <span className="w-2 h-2 bg-gray-800 rounded-full mr-2"></span>
//                         Personal Information
//                     </h2>
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                         <div>
//                             <p className="text-gray-600 font-bold">Name</p>
//                             <p className="font-medium bg-green-100 pl-2 pr-2">{workerData.fullName}</p>
//                         </div>
//                         <div>
//                             <p className="text-gray-600 font-bold">Email</p>
//                             <p className="font-medium bg-green-100 pl-2 pr-2">{workerData.email}</p>
//                         </div>
//                         <div>
//                             <p className="text-gray-600 font-bold">Phone</p>
//                             <p className="font-medium bg-green-100 pl-2 pr-2">{workerData.mobile}</p>
//                         </div>
//                     </div>
//                 </section>

//                 {/* Address Information */}
//                 <section className="profilePart border-b pb-4">
//                     <h2 className="text-lg text-teal-800 font-semibold mb-3 flex items-center">
//                         <span className="w-2 h-2 bg-gray-800 rounded-full mr-2"></span>
//                         Address Information
//                     </h2>
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                         <div>
//                             <p className="text-gray-600 font-bold">Street</p>
//                             <p className="font-medium bg-green-100 pl-2 pr-2">{workerData.streetAddress}</p>
//                         </div>
//                         <div>
//                             <p className="text-gray-600 font-bold">City</p>
//                             <p className="font-medium bg-green-100 pl-2 pr-2">{workerData.city}</p>
//                         </div>
//                         <div>
//                             <p className="text-gray-600 font-bold">ZipCode</p>
//                             <p className="font-medium bg-green-100 pl-2 pr-2">{workerData.zipCode}</p>
//                         </div>
//                     </div>
//                 </section>

//                 {/* Availability Settings */}
//                 <section className="profilePart border-b pb-4">
//                     <h2 className="text-lg text-teal-800 font-semibold mb-3 flex items-center">
//                         <span className="w-2 h-2 bg-gray-800 rounded-full mr-2"></span>
//                         Availability Settings
//                     </h2>
//                     <div className="space-y-3">
//                         <div>
//                             <p className="text-gray-600 font-bold">Available Days/Times</p>
//                             <p className="font-medium bg-green-100 pl-2 pr-2">{workerData.availability?.days}</p>
//                         </div>
//                         <div>
//                             <p className="text-gray-600 font-bold   ">Unavailable Dates</p>
//                             <p className="font-medium bg-green-100 pl-2 pr-2">{workerData.availability?.unavailableDates}</p>
//                         </div>
//                     </div>
//                 </section>

//                 {/* Job Preferences */}
//                 <section className="profilePart border-b pb-4">
//                     <h2 className="text-lg text-teal-800 font-semibold mb-3 flex items-center">
//                         <span className="w-2 h-2 bg-gray-800 rounded-full mr-2"></span>
//                         Job Preferences
//                     </h2>
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                         <div>
//                             <p className="text-gray-600 font-bold">Preferred Job Categories</p>
//                             <p className="font-medium bg-green-100 pl-2 pr-2">{workerData.category}</p>
//                         </div>
//                         <div>
//                             <p className="text-gray-600 font-bold">Travel Distance</p>
//                             <p className="font-medium bg-green-100 pl-2 pr-2">{workerData.workRadius} km</p>
//                         </div>
//                     </div>
//                 </section>

//                 {/* Notifications */}
//                 <section className="profilePart border-b pb-4">
//                     <h2 className="text-lg text-teal-800 font-semibold mb-3 flex items-center">
//                         <span className="w-2 h-2 bg-gray-800 rounded-full mr-2"></span>
//                         Notifications
//                     </h2>
//                     <div>
//                         <p className="text-gray-600 font-bold">New Jobs/Payment/ect</p>
//                         <p className="font-medium bg-green-100 pl-2 pr-2">{workerData.notifications?.newJobs ? 'ALLOW' : 'DISALLOW'}</p>
//                     </div>
//                 </section>

//                 {/* Security Settings */}
//                 <section className="profilePart border-b pb-4">
//                     <h2 className="text-lg text-teal-800 font-semibold mb-3 flex items-center">
//                         <span className="w-2 h-2 bg-gray-800 rounded-full mr-2 "></span>
//                         Security Settings
//                     </h2>
//                     <div>
//                         <p className="text-gray-600 font-bold">Change Password</p>
//                         <button className="text-teal-600 font-medium hover:text-teal-700 bg-green-100 pl-2 pr-2">TAP ME</button>
//                     </div>
//                 </section>

//                 {/* Documents */}
//                 <section className='profilePart border-b pb-4'>
//                     <h2 className="text-lg text-teal-800 font-semibold mb-3 flex items-center">
//                         <span className="w-2 h-2 bg-gray-800 rounded-full mr-2"></span>
//                         Documents
//                     </h2>
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                         <div>
//                             <p className="text-gray-600 font-bold">ID Proof</p>
//                             <p className="font-medium bg-green-100 pl-2 pr-2">{workerData.governmentId ? 'Uploaded' : 'Not Uploaded'}</p>
//                         </div>
//                         <div>
//                             <p className="text-gray-600 font-bold">ID Proof Number</p>
//                             <p className="font-medium bg-green-100 pl-2 pr-2">{workerData.governmentIdNo}</p>
//                         </div>
//                     </div>
//                 </section>
//             </div>
//         </div>
//     );
// });

// export default WorkerProfile;

