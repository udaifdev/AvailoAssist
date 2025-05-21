import { FaSignInAlt, FaSignOutAlt, FaBell, FaUserCircle } from 'react-icons/fa';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector  } from 'react-redux';
import { RootState } from '../../store';

import './header.css';

const Header = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false); // For mobile menu toggle
  
  const { userDetails } = useSelector((state: RootState) => state.user);

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen); // Toggle mobile menu

  return (
    <header className="bg-white shadow-lg border-b border-gray-300">
      <div className="container mx-auto flex justify-between items-center py-4">
        {/* Brand Name */}
        <Link to='/' >
          <div className="mainHead">
            <span className="myHead text-4xl text-tealCustom font-extrabold tracking-wide">AVAILOASSIST</span>
          </div>
        </Link>

        {/* Hamburger icon for mobile */}
        <button
          className="lg:hidden text-3xl"
          onClick={toggleMenu}
        >
          {isMenuOpen ? '✕' : '☰'}
        </button>

        {/* Navigation */}
        <nav className={`lg:flex ${isMenuOpen ? 'flex' : 'hidden'} flex-col lg:flex-row space-x-8 items-center`}>
          {/* Services Link */}
          <ul className="flex flex-col lg:flex-row items-center space-y-4 lg:space-y-0 lg:space-x-8">
            <li>
              <Link to="/allServices" className="text-lg font-bold text-black">
                Services
              </Link>
            </li>
            <li>
              <Link to="/careers" className="text-lg font-bold text-black">
                Careers
              </Link>
            </li>

            {/* Authenticated User Dropdown, Notifications, or Login/Signup */}
            {userDetails ? (
              <>

                {/* Notification Icon */}
                <li>
                  <button className="relative flex items-center justify-center">
                    <FaBell className="text-3xl text-green-800 hover:text-green-700" />
                    {/* Optional notification badge */}
                    <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full"></span>
                  </button>
                </li>

                {/* Profile Dropdown */}
                <li className="relative">
                  <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    <button onClick={toggleDropdown} className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100 focus:outline-none">
                      <FaUserCircle className="text-3xl text-green-800" />
                    </button>
                  </Link>
                </li>
              </>
            ) : (
              <>
                {/* Login Link */}
                <li>
                  <Link to="/login" className="flex items-center gap-2 text-lg font-bold text-black">
                    <FaSignInAlt className="text-green-700" />
                    Log in
                  </Link>
                </li>

                {/* Become a Tasker Button */}
                <li>
                  <Link to="/workerSignup" className="providerbtn text-lg font-bold border-2 border-green-800 text-green-800 bg-white px-6 py-3 rounded-xl hover:text-white hover:no-underline transition duration-300">
                    Become a Tasker
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
