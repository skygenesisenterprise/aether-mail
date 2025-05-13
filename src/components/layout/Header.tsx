import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Importer useNavigate pour la redirection
import { motion } from 'framer-motion';
import {
  MoonIcon,
  SunIcon,
  Bars3Icon,
  BellIcon,
  UserCircleIcon,
  ChevronDownIcon,
  CogIcon,
  ArrowRightOnRectangleIcon,
  QuestionMarkCircleIcon
} from '@heroicons/react/24/outline';

interface HeaderProps {
  toggleSidebar: () => void;
  toggleTheme: () => void;
  isDarkMode: boolean;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar, toggleTheme, isDarkMode }) => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const navigate = useNavigate(); // Initialiser useNavigate pour la redirection

  const handleSignOut = () => {
    // Ajouter ici la logique de déconnexion si nécessaire (ex. suppression du token)
    console.log('User signed out');
    navigate('/login'); // Rediriger vers la page de connexion
  };

  return (
    <header className="border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Left side with mobile menu button */}
        <div className="flex items-center">
          <button
            className="mr-4 rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-600 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-300 md:hidden"
            onClick={toggleSidebar}
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
        </div>

        {/* Right side with user menu */}
        <div className="flex items-center space-x-4">
          {/* Theme toggle */}
          <button
            className="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-600 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-300"
            onClick={toggleTheme}
          >
            {isDarkMode ? (
              <SunIcon className="h-5 w-5" />
            ) : (
              <MoonIcon className="h-5 w-5" />
            )}
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              className="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-600 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-300"
              onClick={() => setNotificationsOpen(!notificationsOpen)}
            >
              <BellIcon className="h-5 w-5" />
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">3</span>
            </button>

            {/* Notifications dropdown */}
            {notificationsOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute right-0 mt-2 w-80 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 dark:bg-gray-800 dark:ring-gray-700"
              >
                <div className="px-4 py-3">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">Notifications</h3>
                  <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">You have 3 unread notifications</p>
                </div>
                <div className="border-t border-gray-100 dark:border-gray-700">
                  <div className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <div className="flex">
                      <div className="rounded-full bg-aether-subtle p-2 dark:bg-aether-cosmic">
                        <LockIcon className="h-5 w-5 text-aether-cosmic dark:text-white" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">Security alert</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Your encryption key was updated successfully</p>
                        <p className="mt-1 text-xs text-gray-500">Just now</p>
                      </div>
                    </div>
                  </div>
                  <div className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <div className="flex">
                      <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900">
                        <EnvelopeIcon className="h-5 w-5 text-blue-700 dark:text-blue-300" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">New message</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">You received a new message from Alice</p>
                        <p className="mt-1 text-xs text-gray-500">1 hour ago</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="border-t border-gray-100 px-4 py-2 dark:border-gray-700">
                  <button className="text-center text-xs font-medium text-aether-primary hover:text-aether-accent dark:text-aether-subtle">
                    View all notifications
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* User menu */}
          <div className="relative">
            <button
              className="flex items-center rounded-full text-gray-700 hover:text-gray-900 focus:outline-none dark:text-gray-300 dark:hover:text-white"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
            >
              <span className="sr-only">Open user menu</span>
              <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-aether-subtle text-aether-cosmic dark:bg-aether-cosmic dark:text-white">
                <UserCircleIcon className="h-8 w-8" />
              </div>
              <span className="ml-2 hidden text-sm font-medium md:block">Alex Morgan</span>
              <ChevronDownIcon className="ml-1 hidden h-4 w-4 md:block" />
            </button>

            {/* User dropdown menu */}
            {userMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 dark:bg-gray-800 dark:ring-gray-700"
              >
                <div className="border-b border-gray-100 px-4 py-3 dark:border-gray-700">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Alex Morgan</p>
                  <p className="truncate text-xs text-gray-600 dark:text-gray-400">alex.morgan@aethermail.me</p>
                </div>

                {/* Link to Profile */}
                <Link
                  to="/profile"
                  className="flex w-full items-center px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  <UserCircleIcon className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                  Your profile
                </Link>

                {/* Link to Settings */}
                <Link
                  to="/settings"
                  className="flex w-full items-center px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  <CogIcon className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                  Settings
                </Link>

                <div className="border-t border-gray-100 dark:border-gray-700">
                  {/* Button to Sign Out */}
                  <button
                    onClick={handleSignOut} // Appeler handleSignOut lors du clic
                    className="flex w-full items-center px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100 dark:text-red-400 dark:hover:bg-gray-700"
                  >
                    <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5" />
                    Sign out
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

// Define local components for use in notifications
const LockIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
  </svg>
);

const EnvelopeIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
  </svg>
);

export default Header;
