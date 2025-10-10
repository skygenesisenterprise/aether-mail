import type React from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuthStore } from "../../store/authStore";
import {
  MoonIcon,
  SunIcon,
  Bars3Icon,
  BellIcon,
  UserCircleIcon,
  ChevronDownIcon,
  CogIcon,
  ArrowRightOnRectangleIcon,
  MagnifyingGlassIcon,
  PencilIcon,
} from "@heroicons/react/24/outline";

interface HeaderProps {
  toggleSidebar: () => void;
  toggleTheme: () => void;
  isDarkMode: boolean;
}

const Header: React.FC<HeaderProps> = ({
  toggleSidebar,
  toggleTheme,
  isDarkMode,
}) => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);

  const handleSignOut = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="border-b border-proton-border bg-proton-dark-secondary shadow-sm">
      {/* Proton Mail inspired header */}
      <div className="flex h-16 items-center justify-between px-6">
        {/* Left side - Logo and mobile menu */}
        <div className="flex items-center">
          <button
            className="mr-4 rounded-lg p-2 text-proton-text-secondary hover:bg-proton-dark-tertiary hover:text-proton-text md:hidden"
            onClick={toggleSidebar}
          >
            <Bars3Icon className="h-5 w-5" />
          </button>

          {/* Proton Mail logo */}
          <div className="flex items-center">
            <div className="text-xl font-bold text-proton-primary">
              Aether Mail
            </div>
          </div>
        </div>

        {/* Center - Search bar */}
        <div className="flex-1 max-w-2xl mx-8">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-proton-text-muted" />
            </div>
            <input
              type="text"
              placeholder="Search emails..."
              className="block w-full pl-12 pr-4 py-2.5 text-sm bg-proton-dark border border-proton-border rounded-xl placeholder-proton-text-muted text-proton-text focus:outline-none focus:ring-2 focus:ring-proton-primary focus:border-transparent transition-colors"
            />
          </div>
        </div>

        {/* Right side - Actions and user menu */}
        <div className="flex items-center space-x-3">
          {/* New Email button - Proton style */}
          <button className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg text-white bg-proton-primary hover:bg-proton-accent-hover transition-colors shadow-sm">
            <PencilIcon className="h-4 w-4 mr-2" />
            New Email
          </button>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="rounded-lg p-2 text-proton-text-secondary hover:bg-proton-dark-tertiary hover:text-proton-text transition-colors"
          >
            {isDarkMode ? (
              <SunIcon className="h-5 w-5" />
            ) : (
              <MoonIcon className="h-5 w-5" />
            )}
          </button>

          {/* Settings */}
          <button className="rounded-lg p-2 text-proton-text-secondary hover:bg-proton-dark-tertiary hover:text-proton-text transition-colors">
            <CogIcon className="h-5 w-5" />
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              className="rounded-lg p-2 text-proton-text-secondary hover:bg-proton-dark-tertiary hover:text-proton-text transition-colors"
              onClick={() => setNotificationsOpen(!notificationsOpen)}
            >
              <BellIcon className="h-5 w-5" />
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-proton-error text-xs font-bold text-white">
                3
              </span>
            </button>

            {/* Notifications dropdown */}
            {notificationsOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute right-0 mt-2 w-80 origin-top-right rounded-xl bg-proton-dark shadow-xl border border-proton-border py-2"
              >
                <div className="px-4 py-3">
                  <h3 className="text-sm font-medium text-proton-text">
                    Notifications
                  </h3>
                  <p className="mt-1 text-xs text-proton-text-muted">
                    You have 3 unread notifications
                  </p>
                </div>
                <div className="border-t border-proton-border">
                  <div className="px-4 py-3 hover:bg-proton-dark-tertiary">
                    <div className="flex items-start">
                      <div className="rounded-full bg-proton-dark-tertiary p-2">
                        <LockIcon className="h-5 w-5 text-proton-primary" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-proton-text">
                          Security alert
                        </p>
                        <p className="text-xs text-proton-text-muted">
                          Your encryption key was updated successfully
                        </p>
                        <p className="mt-1 text-xs text-proton-text-muted">
                          Just now
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="px-4 py-3 hover:bg-proton-dark-tertiary">
                    <div className="flex items-start">
                      <div className="rounded-full bg-proton-dark-tertiary p-2">
                        <EnvelopeIcon className="h-5 w-5 text-proton-primary" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-proton-text">
                          New message
                        </p>
                        <p className="text-xs text-proton-text-muted">
                          You received a new message from Alice
                        </p>
                        <p className="mt-1 text-xs text-proton-text-muted">
                          1 hour ago
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="border-t border-proton-border px-4 py-2">
                  <button className="text-center text-xs font-medium text-proton-primary hover:text-proton-accent-hover">
                    View all notifications
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* User menu */}
          <div className="relative">
            <button
              className="flex items-center rounded-lg p-1 text-proton-text-secondary hover:bg-proton-dark-tertiary hover:text-proton-text transition-colors"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
            >
              <span className="sr-only">Open user menu</span>
              <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-proton-dark-tertiary text-proton-text">
                <UserCircleIcon className="h-6 w-6" />
              </div>
              <span className="ml-2 hidden text-sm font-medium md:block">
                Alex Morgan
              </span>
              <ChevronDownIcon className="ml-1 hidden h-4 w-4 md:block" />
            </button>

            {/* User dropdown menu */}
            {userMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute right-0 mt-2 w-56 origin-top-right rounded-xl bg-proton-dark shadow-xl border border-proton-border py-2"
              >
                <div className="border-b border-proton-border px-4 py-3">
                  <p className="text-sm font-medium text-proton-text">
                    Alex Morgan
                  </p>
                  <p className="truncate text-xs text-proton-text-muted">
                    alex.morgan@aethermail.me
                  </p>
                </div>

                {/* Link to Profile */}
                <Link
                  to="/profile"
                  className="flex w-full items-center px-4 py-2 text-left text-sm text-proton-text-secondary hover:bg-proton-dark-tertiary hover:text-proton-text"
                >
                  <UserCircleIcon className="mr-3 h-5 w-5 text-proton-text-muted" />
                  Your profile
                </Link>

                {/* Link to Settings */}
                <Link
                  to="/settings"
                  className="flex w-full items-center px-4 py-2 text-left text-sm text-proton-text-secondary hover:bg-proton-dark-tertiary hover:text-proton-text"
                >
                  <CogIcon className="mr-3 h-5 w-5 text-proton-text-muted" />
                  Settings
                </Link>

                <div className="border-t border-proton-border">
                  {/* Button to Sign Out */}
                  <button
                    onClick={handleSignOut}
                    className="flex w-full items-center px-4 py-2 text-left text-sm text-proton-error hover:bg-proton-dark-tertiary"
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
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={className}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
    />
  </svg>
);

const EnvelopeIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={className}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
    />
  </svg>
);

export default Header;
