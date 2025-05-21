import React from 'react';
import { FaInstagram, FaLinkedin, FaTwitter } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-gray-700 text-white py-6">
      <div className="container mx-auto flex flex-wrap justify-between gap-8 px-4">
        {/* Social Media Section */}
        <div className="flex-1 min-w-[200px] text-center">
          <h2 className="text-lg text-white font-semibold mb-4">Follow us! We're friendly:</h2>
          <div className="flex flex-col items-center gap-4">
            <a
              href="https://instagram.com"
              className="flex items-center text-green-400 hover:underline"
            >
              <FaInstagram className="mr-2" /> Instagram
            </a>
            <a
              href="https://linkedin.com"
              className="flex items-center text-green-400 hover:underline"
            >
              <FaLinkedin className="mr-2" /> LinkedIn
            </a>
            <a
              href="https://twitter.com"
              className="flex items-center text-green-400 hover:underline"
            >
              <FaTwitter className="mr-2" /> Twitter
            </a>
          </div>
        </div>

        {/* Discover Section */}
        <div className="flex-1 min-w-[200px] text-center">
          <h2 className="text-lg text-white font-semibold mb-4">Discover</h2>
          <ul className="flex flex-col items-center gap-2">
            <li>
              <a href="/contact-us" className="text-green-400 hover:underline">
                Contact Us
              </a>
            </li>
            <li>
              <a href="/about-us" className="text-green-400 hover:underline">
                Know About
              </a>
            </li>
            <li>
              <a href="/become-worker" className="text-green-400 hover:underline">
                Become a Worker
              </a>
            </li>
          </ul>
        </div>

        {/* Contact Us Section */}
        <div className="flex-1 min-w-[200px] text-center">
          <h2 className="text-lg text-white font-semibold mb-4">Contact Us</h2>
          <ul className="flex flex-col items-center gap-2">
            <li>
              Email:{' '}
              <a
                href="mailto:support@availoassist.com"
                className="text-green-400 hover:underline"
              >
                support@availoassist.com
              </a>
            </li>
            <li>
              Phone:{' '}
              <a href="tel:+15551234567" className="text-green-400 hover:underline">
                +1-555-123-4567
              </a>
            </li>
            <li>Address: 123 Service Street, Bangalore, India</li>
          </ul>
        </div>

        {/* About Section */}
        <div className="flex-1 min-w-[200px] text-center">
          <h2 className="text-lg text-white font-semibold mb-4">About</h2>
          <p className="text-sm">
            Availo-Assist connects you with trusted professionals for all your home and
            office service needs. Quick, reliable, and easy to use.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
