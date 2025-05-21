import React, { useState, useEffect } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { useSelector } from 'react-redux';
import axiosInstance, { socket } from '../../../API/axios';
import { RootState } from '../../../store';
import { toast } from 'react-toastify';
import { MessageCircle, User, MapPin, Calendar, IndianRupee, CreditCard, Package, CheckCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../ui/dailog";
import MapComponent from './MapComponent';
import { sendNotificationToUser } from '../../../utils/webPushConfig';
import Chat from '../communication/Chat';

interface Job {
    _id: string;
    userId: {
        _id: string;
        name: string;
    };
    location: string;
    bookedDate: string;
    bookedSlot: string;
    amount: number;
    bookedStatus: string;
    bookedDescription: string;
    paymentMethod: string;
    serviceName: string;
    chat: boolean;
    unreadMessages?: number;
    coordinates?: {
        lat: number;
        lng: number;
    };
}

const JobListing = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterValue, setFilterValue] = useState('All Jobs');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedJob, setSelectedJob] = useState<Job | null>(null);
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [workerCoordinates, setWorkerCoordinates] = useState<{ lat: number; lng: number } | null>(null);
    const [unreadMessageCounts, setUnreadMessageCounts] = useState<Record<string, number>>({});
    const [chatOpen, setChatOpen] = useState(false)

    useEffect(() => {
        // Check if geolocation is available
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setWorkerCoordinates({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    });
                },
                (error) => {
                    console.error('Error getting geolocation', error);
                    // You could set default coordinates if geolocation fails
                    setWorkerCoordinates({ lat: 0, lng: 0 });
                }
            );
        } else {
            console.log("Geolocation is not supported by this browser.");
        }
    }, []);



    // Get worker ID from Redux store
    const workerId = useSelector((state: RootState) => state.worker.workerDetails?.id);
    console.log('front end worker Id checking....... ', workerId)

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const response = await axiosInstance.get(`/worker/worker-bookingHistory/${workerId}`);
                setJobs(response.data.bookings);

                // Initialize unread counts
                const counts: Record<string, number> = {};
                response.data.bookings.forEach((job: Job) => {
                    counts[job._id] = job.unreadMessages || 0;
                });
                setUnreadMessageCounts(counts);
            } catch (error) {
                console.error('Error fetching jobs:', error);
            } finally {
                setLoading(false);
            }
        };

        if (workerId) {
            fetchJobs();
        }
    }, [workerId]);

    // Filter jobs based on search and filter values
    const filteredJobs = jobs.filter(job => {
        const matchesSearch = (job.userId?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            job.location?.toLowerCase().includes(searchQuery.toLowerCase())) ?? false;
        const matchesFilter = filterValue === 'All Jobs' || job.bookedStatus === filterValue;
        return matchesSearch && matchesFilter;
    });

    useEffect(() => {
        socket.on('newMessage', (data: { bookingId: string, senderId: string }) => {
            if (data.senderId !== workerId) {
                setUnreadMessageCounts(prev => ({
                    ...prev,
                    [data.bookingId]: (prev[data.bookingId] || 0) + 1
                }));
            }
        });
        return () => {
            socket.off('newMessage');
        };
    }, [workerId]);
    

    useEffect(() => {
        socket.on('newMessageNotification', (data: { bookingId: string, senderId: string }) => {
          if (data.senderId !== workerId) {
            setUnreadMessageCounts(prev => ({
              ...prev,
              [data.bookingId]: (prev[data.bookingId] || 0) + 1
            }));
          }
        });
    
        socket.on('messagesRead', ({ bookingId }) => {
          setUnreadMessageCounts(prev => ({
            ...prev,
            [bookingId]: 0
          }));
        });
    
        return () => {
          socket.off('newMessageNotification');
          socket.off('messagesRead');
        };
      }, [workerId]);


    const getStatusColor = (status: string): string => {
        switch (status.toLowerCase()) {
            case 'pending':
                return 'text-yellow-500';
            case 'accepted':
                return 'text-green-500';
            case 'rejected':
                return 'text-red-500';
            case 'completed':
                return 'text-blue-500';
            case 'Cancelled':
                return 'text-white bg-red-600';
            default:
                return 'text-gray-500';
        }
    };


    const handleShowDetails = (job: Job) => {
        setSelectedJob(job); // Set the selected job details
        setIsModalOpen(true); // Open the modal
    };

    // console.log('selected jobs..........', selectedJob)

    const closeModal = () => {
        setIsModalOpen(false); // Close the modal
        setSelectedJob(null); // Clear the selected job
    };

    const handleStatusChange = async (status: string) => {
        if (!selectedJob) return;

        try {
            // Call the backend API to update the status
            const response = await axiosInstance.put('/worker/booking/update-status', {
                bookingId: selectedJob._id,
                status: status,
            });
            if (response.status === 200) {
                const updatedJob = response.data.booking;
                // Update the local state with the new status and chat field
                setJobs((prevJobs) =>
                    prevJobs.map((job) =>
                        job._id === selectedJob._id ? { ...job, bookedStatus: status, chat: updatedJob.chat } : job
                    )
                );
                toast.success('Booking status updated successfully!');

                // Send notification with better error handling
                const notificationSent = await sendNotificationToUser(selectedJob.userId._id, `🔔 Your booking status has been updated to: \n⚠️ ${status}`);
                if (!notificationSent) {
                    console.log('Could not send notification to user, but status was updated successfully');
                }

            } else {
                toast.error('Failed to update booking status.');
            }



        } catch (error) {
            console.error('Error updating booking status:', error);
            toast.error('Error updating booking status. Please try again.');
        } finally {
            closeModal(); // Close the modal after updating
        }
    };


    return (
        <div className="max-w-6xl mx-auto p-6">
            <h1 className="text-4xl text-center font-bold text-tealCustom mb-6">My Jobs</h1>

            <div className="flex justify-between mb-6">
                {/* Search Input */}
                <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search"
                        className="pl-10 pr-4 py-2 border rounded-md w-64"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Filter Dropdown */}
                <div className="relative flex items-center">
                    <span className="mr-2">Filter by</span>
                    <Filter className="absolute right-10 top-2.5 h-5 w-5 text-gray-400" />
                    <select
                        className="pl-4 pr-10 py-2 border rounded-md appearance-none w-40"
                        value={filterValue}
                        onChange={(e) => setFilterValue(e.target.value)}
                    >
                        <option>All Jobs</option>
                        <option>Pending</option>
                        <option>Accepted</option>
                        <option>Rejected</option>
                        <option>Completed</option>
                    </select>
                </div>
            </div>

            {/* Job Table */}
            <div className="overflow-x-auto rounded-lg shadow-lg">
                <table className="w-full border-collapse bg-white">
                    <thead className="rounded-t-lg">
                        <tr className="bg-tealCustom text-white border-b border-teal-700">
                            <th className="text-left p-4">Customer Name</th>
                            {/* <th className="text-left p-4">Location</th> */}
                            <th className="text-left p-4">Date</th>
                            <th className="text-left p-4">Amount</th>
                            <th className="text-left p-4">Status</th>
                            <th className="text-left p-4">Action</th>
                        </tr>
                    </thead>

                    <tbody>
                        {filteredJobs.map((job, index) => (
                            <tr
                                key={index}
                                className={`${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                                    } hover:bg-teal-50 transition-all border-b`}
                            >
                                <td className="p-4 text-gray-700">{job.userId?.name}</td>
                                {/* <td className="p-4">{job.location}</td> */}
                                <td className="p-4 text-gray-600">{new Date(job.bookedDate).toLocaleDateString()}</td>
                                <td className="p-4 font-semibold text-emerald-700">₹{job.amount}</td>
                                <td
                                    className={`p-4 font-bold ${getStatusColor(job.bookedStatus)
                                        }  rounded-md`}
                                >
                                    {job.bookedStatus}
                                </td>
                                <td className="p-4">
                                    <button
                                        onClick={() => handleShowDetails(job)}
                                        className="bg-tealCustom text-white px-4 py-2 rounded-lg shadow-sm hover:bg-teal-700 transition-all"
                                    >
                                        View More
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>


            {/* Job Details Modal */}
            {isModalOpen && selectedJob && (
                <Dialog open={isModalOpen} onOpenChange={closeModal}>
                    <DialogContent className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-70">
                        <div className="relative bg-white rounded-lg shadow-lg max-w-lg mx-auto p-8 max-h-screen overflow-y-auto">
                            {/* Close Icon */}
                            <button
                                className="absolute top-4 right-4 text-gray-800 hover:text-gray-500"
                                onClick={closeModal}
                            >
                                <X className="font-bold w-6 h-6" />
                            </button>

                            <DialogHeader>
                                <DialogTitle className="text-xl font-bold">Job Details</DialogTitle>
                            </DialogHeader>

                            <div className="space-y-6 mt-6">
                                {/* Grid Layout for Key-Value Pairs */}
                                <div className="grid grid-cols-3 gap-y-4 gap-16 items-center">
                                    {/* Name */}
                                    <div className="ml-4 col-span-1 flex items-center text-gray-600 font-medium">
                                        <User className="w-5 h-5 mr-2 text-teal-500" />
                                        Name
                                    </div>
                                    <div className="col-span-2">{selectedJob.userId.name}</div>

                                    {/* Location */}
                                    <div className="ml-4 col-span-1 flex items-center text-gray-600 font-medium">
                                        <MapPin className="w-5 h-5 mr-2 text-teal-500" />
                                        Location
                                    </div>
                                    <div className="col-span-2">{selectedJob.location}</div>

                                    {/* Coordinates / Map */}
                                    <div className="ml-4 col-span-1 flex  text-gray-600 font-medium">
                                        <MapPin className="w-5 h-5 mr-2 text-teal-500" />
                                        Route
                                    </div>
                                    <div className="col-span-2">
                                        {selectedJob.coordinates && workerCoordinates && (
                                            <a
                                                href={`https://www.google.com/maps/dir/?api=1&origin=${workerCoordinates.lat},${workerCoordinates.lng}&destination=${selectedJob.coordinates.lat},${selectedJob.coordinates.lng}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="bg-teal-500 text-white px-3 py-1 rounded-md hover:bg-teal-600"
                                            >
                                                View Route
                                            </a>
                                        )}
                                    </div>


                                    {/* Date & Slot */}
                                    <div className="ml-4 col-span-1 flex items-center text-gray-600 font-medium">
                                        <Calendar className="w-5 h-5 mr-2 text-teal-500" />
                                        Date & Slot
                                    </div>
                                    <div className="col-span-2">
                                        {selectedJob.bookedDate} at {selectedJob.bookedSlot}
                                    </div>

                                    {/* Amount */}
                                    <div className="ml-4 col-span-1 flex items-center text-gray-600 font-medium">
                                        <IndianRupee className="w-5 h-5 mr-2 text-teal-500" />
                                        Amount
                                    </div>
                                    <div className="col-span-2">₹{selectedJob.amount}</div>

                                    {/* Chat */}
                                    {selectedJob.chat && selectedJob.bookedStatus !== 'Completed' && (
                                        <>
                                            <div className="ml-4 col-span-1 flex items-center text-gray-600 font-medium">
                                                <MessageCircle className="w-5 h-5 mr-2 text-teal-500" />
                                                Chat
                                            </div>
                                            <div className="col-span-2">
                                                <button
                                                    className="bg-teal-500 text-white px-3 py-1 rounded-md hover:bg-teal-600 flex items-center relative"
                                                    onClick={() => {
                                                        setChatOpen(true);
                                                        setUnreadMessageCounts(prev => ({
                                                            ...prev,
                                                            [selectedJob._id]: 0
                                                        }));
                                                    }}
                                                >
                                                    <span className="mr-2 text-xs">Chat</span>
                                                    <MessageCircle className="w-4 h-4" />
                                                    {unreadMessageCounts[selectedJob._id] > 0 && (
                                                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                                            {unreadMessageCounts[selectedJob._id]}
                                                        </span>
                                                    )}
                                                </button>
                                            </div>
                                        </>
                                    )}

                                    {/* Chat component */}
                                    {chatOpen && selectedJob.bookedStatus !== 'Completed' && (
                                        <Chat
                                            jobId={selectedJob._id}
                                            userId={selectedJob.userId._id}
                                            onClose={() => setChatOpen(false)}
                                        />
                                    )}



                                    {/* Payment Method */}
                                    <div className="ml-4 col-span-1 flex items-center text-gray-600 font-medium">
                                        <CreditCard className="w-5 h-5 mr-2 text-teal-500" />
                                        Payment
                                    </div>
                                    <div className="col-span-2">{selectedJob.paymentMethod}</div>

                                    {/* Service */}
                                    <div className="ml-4  col-span-1 flex items-center text-gray-600 font-medium">
                                        <Package className="w-5 h-5 mr-2 text-teal-500" />
                                        Service
                                    </div>
                                    <div className="col-span-2">{selectedJob.serviceName}</div>

                                    {/* Status */}
                                    <div className="ml-4 col-span-1 flex items-center text-gray-600 font-medium">
                                        <CheckCircle className="w-5 h-5 mr-2 text-teal-500" />
                                        Status
                                    </div>
                                    <div className={`col-span-2 font-bold ${getStatusColor(selectedJob.bookedStatus)}`}>
                                        {selectedJob.bookedStatus}
                                    </div>
                                </div>


                                {/* Cancellation Reason */}
                                {selectedJob.bookedStatus === 'Cancelled' ? (
                                    <div className="mt-6">
                                        <p className="font-semibold text-gray-600">Cancellation Reason</p>
                                        <p className="text-sm text-gray-500">{selectedJob.bookedDescription}</p>
                                    </div>
                                ) : (
                                    /* Additional Details */
                                    <div className="mt-6">
                                        <p className="font-semibold text-gray-600">Additional Details</p>
                                        <p className="text-sm text-gray-500">{selectedJob.bookedDescription}</p>
                                    </div>
                                )}





                                {selectedJob.coordinates && workerCoordinates && (
                                    <MapComponent
                                        userCoordinates={selectedJob.coordinates}
                                        workerCoordinates={workerCoordinates}
                                    />
                                )}

                                {/* Action Buttons */}
                                {selectedJob.bookedStatus !== 'Cancelled' && selectedJob.bookedStatus === 'Pending' && (
                                    <div className="mt-6 space-x-4">
                                        <button
                                            className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600"
                                            onClick={() => handleStatusChange('Pending')}
                                        >
                                            Pending
                                        </button>
                                        <button
                                            className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
                                            onClick={() => handleStatusChange('Rejected')}
                                        >
                                            Reject
                                        </button>
                                        <button
                                            className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700"
                                            onClick={() => handleStatusChange('Accepted')}
                                        >
                                            Accept
                                        </button>
                                    </div>
                                )}

                                {selectedJob.bookedStatus !== 'Cancelled' && selectedJob.bookedStatus === 'Accepted' && (
                                    <div className="mt-6 space-x-4">
                                        <button
                                            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                                            onClick={() => handleStatusChange('Completed')}
                                        >
                                            Complete
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

            )}

        </div>
    );
};

export default JobListing;
