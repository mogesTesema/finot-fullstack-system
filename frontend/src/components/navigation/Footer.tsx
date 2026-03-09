// src/components/layout/Footer.jsx
import React from "react";
import {
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";
import { FaTelegram, FaInstagram, FaTiktok } from "react-icons/fa";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer id="footer" className="bg-[#1B3067] text-white pt-12 pb-6">
      <div className="container mx-auto px-4">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* About Section */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-yellow-400">finot</h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              Digitizing our Gibigubae community for better management and
              engagement. Join us in building a stronger fellowship.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-yellow-400">
              Quick Links
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="#about"
                  className="text-gray-300 hover:text-yellow-400 transition-colors"
                >
                  About Us
                </a>
              </li>
              <li>
                <a
                  href="#join"
                  className="text-gray-300 hover:text-yellow-400 transition-colors"
                >
                  Join Gibigubae
                </a>
              </li>
              <li>
                <a
                  href="/donate"
                  className="text-gray-300 hover:text-yellow-400 transition-colors"
                >
                  Donate
                </a>
              </li>
              <li>
                <a
                  href="/anonymous"
                  className="text-gray-300 hover:text-yellow-400 transition-colors"
                >
                  Anonymous Q&A
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-yellow-400">Contact</h3>
            <div className="space-y-3 text-sm">
              <p className="flex items-center space-x-3 text-gray-300">
                <EnvelopeIcon className="h-5 w-5 text-yellow-400 flex-shrink-0" />
                <span>info@finot.org</span>
              </p>
              <p className="flex items-center space-x-3 text-gray-300">
                <PhoneIcon className="h-5 w-5 text-yellow-400 flex-shrink-0" />
                <span>+251 911 223344</span>
              </p>
              <p className="flex items-center space-x-3 text-gray-300">
                <MapPinIcon className="h-5 w-5 text-yellow-400 flex-shrink-0" />
                <span>Adama, Ethiopia</span>
              </p>
            </div>
          </div>

          {/* Social Media */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-yellow-400">Follow Us</h3>
            <div className="flex space-x-4">
              <a
                href="https://t.me/Astugibigubae"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#142850] p-3 rounded-full text-gray-300 hover:text-yellow-400 hover:bg-[#1B3067] transition-all transform hover:scale-110"
                aria-label="Telegram"
              >
                <FaTelegram className="h-5 w-5" />
              </a>
              <a
                href="https://www.instagram.com/astu_gbigubae"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#142850] p-3 rounded-full text-gray-300 hover:text-yellow-400 hover:bg-[#1B3067] transition-all transform hover:scale-110"
                aria-label="Instagram"
              >
                <FaInstagram className="h-5 w-5" />
              </a>
              <a
                href="https://www.tiktok.com/@astu_gbigubae"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#142850] p-3 rounded-full text-gray-300 hover:text-yellow-400 hover:bg-[#1B3067] transition-all transform hover:scale-110"
                aria-label="TikTok"
              >
                <FaTiktok className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 pt-6 text-center text-gray-400 text-sm">
          <p>&copy; {currentYear} finot. All rights reserved.</p>
          <p className="mt-1">Built with ❤️ for the Gibigubae community.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
