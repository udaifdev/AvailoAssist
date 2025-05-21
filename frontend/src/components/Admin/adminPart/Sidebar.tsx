import React from 'react';
import { LayoutDashboard, Users, UserCog, Briefcase, CreditCard, AlertCircle, FileBarChart, Bell, LogOut } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../../../slice/adminSlice';
import { adminAxios } from '../../../API/axios';

// Define the type for navigation items
interface NavItem {
  title: string;
  icon: React.ElementType;
  path?: string;
  action?: 'logout'; // Optional logout action
}


const Sidebar = () => {

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    console.log('log out function called.....')
    try {
      await adminAxios.post('/admin/admin-logout', {}, { withCredentials: true }); // Ensure `withCredentials` is set
      localStorage.removeItem('AdminDetails');
      localStorage.removeItem('token');
      dispatch(logout());
      navigate('/admin-login');
    } catch (error) {
      console.error('Logout failed: ', error);
    }
  };

  const navItems: NavItem[] = [
    { title: 'Dashboard', icon: LayoutDashboard, path: '/admin-dashboard' },
    { title: 'Providers', icon: UserCog, path: '/admin-workermanagement' },
    { title: 'Users', icon: Users, path: '/admin-usermanagement' },
    { title: 'Services', icon: Briefcase, path: '/admin-serviceCategory' },
    { title: "Payment's", icon: CreditCard, path: '/admin-paymentHistory' },
    // { title: 'Complaints', icon: AlertCircle, path: '/complaints' },
    // { title: 'Reports', icon: FileBarChart, path: '/reports' },
    // { title: 'Notifications', icon: Bell, path: '/notifications' },
    { title: 'Logout', icon: LogOut, action: 'logout' }
  ];

  return (
    <div className="fixed mt-1 left-0 h-screen w-60 bg-tealCustom text-white flex flex-col">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;

        return (
          <button
            key={item.title}
            onClick={item.action === 'logout' ? handleLogout : () => navigate(item.path!)} // Added non-null assertion
            className={`
            flex items-center gap-3 px-6 py-4 hover:bg-gray-600 transition-colors
            ${isActive ? 'bg-white text-tealCustom' : ''}
          `}
          >
            <Icon size={20} />
            <span className="text-lg font-bold">{item.title}</span>
          </button>
        );
      })}
    </div>
  );
};

export default Sidebar;
