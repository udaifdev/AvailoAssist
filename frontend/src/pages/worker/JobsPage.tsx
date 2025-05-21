import React from 'react';
import WorkerHeader from '../../components/Worker/parts/WorkerHeader';
import SideBar from '../../components/Worker/parts/SideBar';
import JobListing from '../../components/Worker/jobs/JobListing';

const JobsPage = () => {
  // Inline styles for the sidebar and main content
  const sidebarStyle: React.CSSProperties = {
    width: '16rem',  // Equivalent to w-64 in Tailwind
    height: '100vh', // Full height
    position: 'sticky', // Keeps sidebar fixed in position
  };

  const mainStyle: React.CSSProperties = {
    padding: '1rem', // Adjust as needed
    overflowY: 'auto', // Allows scrolling when content overflows
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <WorkerHeader />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <SideBar  />
        
        {/* Dashboard */}
        <main style={mainStyle} className="flex-1">
          <JobListing />
        </main>
      </div>
    </div>
  );
};

export default JobsPage;
