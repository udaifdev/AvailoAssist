import React, { useState, useEffect } from 'react';
import axiosInstance from '../../../API/axios';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { useNavigate, useLocation } from 'react-router-dom';
import { logout } from '../../../slice/workerSlice';
import { Menu, X, LayoutGrid, Briefcase, User, Wallet, Calendar, ChevronRight, Bell, LogOut } from 'lucide-react';
import Profile from '../workerProfile/WorkerProfile';
import { RootState } from '../../../store'; // Adjust according to your store file location

interface MenuItem {
  title: string;
  icon: React.ReactNode;
  to?: string;
  onClick?: () => void;
  badge?: number;
}

interface SideBarProps {
  style?: React.CSSProperties; // Optional style prop
}

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  
  const { workerDetails } = useSelector((state: RootState) => state.worker);
  const isAccepted = workerDetails?.serviceStatus === 'Accepted';

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile && !isOpen) setIsOpen(true);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen]);

  const menuItems: MenuItem[] = [
    { title: 'Dashboard', icon: <LayoutGrid className="w-7 h-7" />, to: '/worker-dashboard' },
    // Conditionally render 'My Jobs', 'Wallet', and 'Availability' based on serviceStatus
    workerDetails?.serviceStatus !== 'pending' && workerDetails?.serviceStatus !== 'rejected' && {
      title: 'My Jobs', icon: <Briefcase className="w-6 h-6" />, to: '/worker-jobs'
    },
    workerDetails?.serviceStatus !== 'pending' && workerDetails?.serviceStatus !== 'rejected' && {
      title: 'Wallet', icon: <Wallet className="w-6 h-6" />, to: '/worker-wallet'
    },
    workerDetails?.serviceStatus !== 'pending' && workerDetails?.serviceStatus !== 'rejected' && {
      title: 'Availability', icon: <Calendar className="w-6 h-6" />, to: '/worker-availablityManagement'
    },
    { title: 'Profile', icon: <User className="w-7 h-7" />, onClick: () => setIsProfileModalOpen(true) },
  ].filter(Boolean) as MenuItem[]; // Filter out `false` and cast back to MenuItem array


  const handleLogout = async () => {
    try {
      await axiosInstance.post('worker/worker-logout');
      dispatch(logout());
      toast.success('Worker logout successful!');
      navigate('/worker-login');
    } catch (err) {
      console.log(err);
      toast.error('Failed to logout. Please try again.');
    }
  };

  const handleNavigation = (item: MenuItem) => {
    if (item.to) {
      navigate(item.to);
      if (isMobile) setIsOpen(false);
    } else if (item.onClick) {
      item.onClick();
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Toggle */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-tealCustom text-white rounded-lg shadow-lg hover:bg-teal-700 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-tealCustom text-white transition-all duration-300 ease-in-out z-40
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          ${isCollapsed ? 'w-20' : 'w-64'}
          lg:translate-x-0 lg:relative`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-end p-3 border-b border-teal-700">
            {!isMobile && (
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="p-1 hover:bg-teal-700 rounded-lg transition-colors"
              >
                <ChevronRight className={`w-6 h-6 font-bold border transition-transform ${isCollapsed ? 'rotate-180' : ''}`} />
              </button>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4">
            {menuItems.map((item) => (
              <button
                key={item.title}
                onClick={() => handleNavigation(item)}
                className={`w-full flex items-center px-4 py-3 space-x-3
                  ${location.pathname === item.to 
                    ? 'bg-teal-700 text-white' 
                    : 'text-gray-200 hover:bg-teal-700 hover:text-white'}
                  transition-colors relative group`}
              >
                <div className="relative">
                  {item.icon}
                  {item.badge && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </div>
                {!isCollapsed && <span className="font-medium">{item.title}</span>}
                {isCollapsed && (
                  <div className="absolute left-full ml-2 bg-gray-900 text-white px-2 py-1 rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap">
                    {item.title}
                  </div>
                )}
              </button>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-teal-700">
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-4 py-3 text-gray-200 hover:bg-teal-700 hover:text-white rounded-lg transition-colors"
            >
              <LogOut className="w-6 h-6" />
              {!isCollapsed && <span className="font-medium">Log Out</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Profile Modal */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="relative bg-white rounded-lg max-w-2xl w-full mx-4">
            <button
              onClick={() => setIsProfileModalOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>
            <Profile />
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;