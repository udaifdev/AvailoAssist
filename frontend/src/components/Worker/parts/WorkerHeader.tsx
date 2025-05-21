import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store';
import { Bell, User, Search, X } from 'lucide-react';
import Profile from '../workerProfile/WorkerProfile';

const WorkerHeader = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const { workerDetails } = useSelector((state: RootState) => state.worker);

  const notifications = [
    { id: 1, text: 'New booking request received', time: '5 mins ago' },
    { id: 2, text: 'Payment of ₹1,500 received', time: '1 hour ago' },
    { id: 3, text: 'Customer left a 5-star review', time: '2 hours ago' },
  ];

  return (
    <header className="bg-white shadow-md border-b border-gray-200">
      <div className="flex items-center justify-between px-4 lg:px-8 py-5">
        {/* Logo Section */}
        <div className="flex items-center space-x-2">
          <div className="flex ml-12 flex-col items-start">
            <h1 className="text-2xl lg:text-4xl font-bold text-tealCustom tracking-tight">
              AVAILOASSIST
            </h1>
            <span className="text-xs lg:text-sm font-semibold text-teal-700 tracking-widest">
              E X P E R T I S T
            </span>
          </div>
        </div>

        {/* Search Bar - Hidden on Mobile */}
        <div className="hidden md:flex items-center flex-1 max-w-xl mx-8">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search..."
              className="w-full px-4 py-2 pl-10 pr-4 rounded-lg border border-gray-300 focus:border-tealCustom focus:ring-1 focus:ring-tealCustom transition-colors"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-6">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors focus:outline-none"
            >
              <Bell className="w-6 h-6" />
              {notifications.length > 0 && (
                <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {notifications.length}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="p-3 border-b border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-700">Notifications</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <p className="text-sm text-gray-700">{notification.text}</p>
                      <span className="text-xs text-gray-500 mt-1">{notification.time}</span>
                    </div>
                  ))}
                </div>
                <div className="p-3 text-center border-t border-gray-200">
                  <button className="text-sm text-tealCustom hover:text-teal-700 font-medium">
                    View All Notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Profile Section */}
          <div className="relative flex items-center space-x-3">
            <div className="hidden md:block text-right">
              <p className="text-sm font-medium text-gray-700">
                {workerDetails?.name || 'Worker Status'}
              </p>
              <p className="text-xs text-gray-500">{workerDetails?.serviceStatus || 'Service Category'}</p>
            </div>
            {/* Profile Picture Button */}
            <button
              onClick={() => setIsProfileModalOpen(true)}
              className="w-10 h-10 rounded-full bg-tealCustom text-white flex items-center justify-center focus:outline-none"
            >
              {workerDetails?.profilePicture ? (
                <img
                  src={workerDetails.profilePicture}
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <User className="w-6 h-6" />
              )}
            </button>

            {/* Profile Modal */}
            {isProfileModalOpen && (
              <div 
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                onClick={() => setIsProfileModalOpen(false)} // Close when clicking outside
              >
                <div
                  className="relative bg-white rounded-lg max-w-2xl w-full mx-4 p-6"
                  onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
                >
                  {/* Close Button */}
                  <button
                    onClick={() => setIsProfileModalOpen(false)}
                    className="absolute top-6 right-12 text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-6 h-6" />
                  </button>

                  {/* Profile Component */}
                  <Profile />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default WorkerHeader;
