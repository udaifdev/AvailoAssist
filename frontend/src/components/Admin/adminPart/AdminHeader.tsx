import React from 'react';

const AdminHeader = () => {
  return (
    <header className="mb-4 bg-white shadow-lg py-5 px-6 fixed top-0 left-0 w-full z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo Section */}
        <div className="flex flex-col">
          <div className="flex items-baseline">
            <span className="text-4xl font-bold text-teal-600">AVAILO</span>
            <span className="text-4xl font-bold text-teal-700">ASSIST</span>
          </div>
          <span className="text-teal-600 font-bold text-sm">ADMIN</span>
        </div>

        {/* Welcome Section */}
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse" />
          <span className="text-gray-700">Welcome Admin</span>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
