import React from 'react';
import WorkerHeader from '../../components/Worker/parts/WorkerHeader';
import SideBar from '../../components/Worker/parts/SideBar';
import Dashboard from '../../components/Worker/dashbord/Dashbord';

const WorkerDashboard = () => {
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
      {/* Video background */}
      <div className="absolute top-0 left-0 w-full h-full z-[-1]">
        <video
          autoPlay
          loop
          muted
          className="w-full h-full object-cover"
        >
          <source src="https://cdn.dribbble.com/userupload/7620094/file/original-adaf78d30e97debd05a4776262bfa945.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        {/* Dark overlay */}
        <div className="absolute top-0 left-0 w-full h-full "></div>
      </div>
      
      {/* Header */}
      <WorkerHeader />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <SideBar />
        
        {/* Dashboard */}
        <main style={mainStyle} className="flex-1 relative z-10">
          <Dashboard />
        </main>
      </div>
    </div>
  );
};

export default WorkerDashboard;
