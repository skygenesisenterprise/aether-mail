import type React from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuthStore } from "../../store/authStore";
import KeyboardShortcutsHelp from "../ui/KeyboardShortcutsHelp";
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
  PaperAirplaneIcon,
  FolderIcon,
  TagIcon,
  ArchiveBoxIcon,
  TrashIcon,
  StarIcon,
  ClockIcon,
  ArrowUturnLeftIcon,
  ArrowUturnRightIcon,
  PrinterIcon,
  EllipsisHorizontalIcon,
} from "@heroicons/react/24/outline";

interface HeaderProps {
  toggleSidebar: () => void;
  toggleTheme: () => void;
  isDarkMode: boolean;
  selectedEmail?: any;
  onReply?: (email: any) => void;
  onForward?: (email: any) => void;
  onDelete?: (email: any) => void;
}

const Header: React.FC<HeaderProps> = ({
  toggleSidebar,
  toggleTheme,
  isDarkMode,
  selectedEmail,
  onReply,
  onForward,
  onDelete,
}) => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [shortcutsHelpOpen, setShortcutsHelpOpen] = useState(false);
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);

  const handleSignOut = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="glass-strong glass-no-border border-b border-white/10">
      {/* Liquid Glass Header */}
      <div className="flex h-20 items-center justify-between px-8">
        {/* Left side - Logo and mobile menu */}
        <div className="flex items-center">
          <button
            className="mr-6 glass-button glass-shimmer md:hidden"
            onClick={toggleSidebar}
          >
            <Bars3Icon className="h-5 w-5" />
          </button>

          {/* Aether Mail logo with glass effect */}
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl glass-gradient flex items-center justify-center glass-float">
              <svg
                className="w-7 h-7 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold glass-text-primary">
                Aether Mail
              </h1>
              <p className="text-xs glass-text-muted">Liquid Glass 2025</p>
            </div>
          </div>
        </div>

        {/* Center - Glass Search bar */}
        <div className="flex-1 max-w-2xl mx-8">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 glass-text-muted" />
            </div>
            <input
              type="text"
              placeholder="Search emails, contacts, or calendar..."
              className="glass-input w-full pl-12 pr-4 py-3 text-sm glass-strong"
            />
          </div>
        </div>

        {/* Right side - Glass Actions and user menu */}
        <div className="flex items-center space-x-3">
          {/* New Email button - Glass effect */}
          <button className="glass-button glass-primary glass-shimmer">
            <PencilIcon className="h-4 w-4 mr-2" />
            New Email
          </button>

          {/* Glass Theme toggle */}
          <button
            onClick={toggleTheme}
            className="glass-button glass-shimmer"
            title="Toggle theme"
          >
            {isDarkMode ? (
              <SunIcon className="h-5 w-5" />
            ) : (
              <MoonIcon className="h-5 w-5" />
            )}
          </button>

          {/* Glass Settings */}
          <button className="glass-button glass-shimmer" title="Settings">
            <CogIcon className="h-5 w-5" />
          </button>

          {/* Glass Notifications */}
          <div className="relative">
            <button
              className="glass-button glass-shimmer relative"
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              title="Notifications"
            >
              <BellIcon className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full glass-error text-xs font-bold text-white glass-pulse">
                3
              </span>
            </button>

            {/* Glass Notifications dropdown */}
            {notificationsOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className="absolute right-0 mt-2 w-96 origin-top-right glass-modal"
              >
                <div className="mb-4">
                  <h3 className="text-lg font-semibold glass-text-primary mb-2">
                    Notifications
                  </h3>
                  <p className="text-sm glass-text-muted">
                    You have 3 unread notifications
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="glass-card glass-hover">
                    <div className="flex items-start">
                      <div className="w-10 h-10 rounded-xl glass-gradient flex items-center justify-center mr-3">
                        <LockIcon className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium glass-text-primary">
                          Security alert
                        </p>
                        <p className="text-xs glass-text-muted mt-1">
                          Your encryption key was updated successfully
                        </p>
                        <p className="text-xs glass-text-muted mt-2">
                          Just now
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="glass-card glass-hover">
                    <div className="flex items-start">
                      <div className="w-10 h-10 rounded-xl glass-gradient flex items-center justify-center mr-3">
                        <EnvelopeIcon className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium glass-text-primary">
                          New message
                        </p>
                        <p className="text-xs glass-text-muted mt-1">
                          You received a new message from Alice
                        </p>
                        <p className="text-xs glass-text-muted mt-2">
                          1 hour ago
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-white/10">
                  <button className="glass-button w-full glass-gradient">
                    View all notifications
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Glass User menu */}
          <div className="relative">
            <button
              className="flex items-center glass-button glass-shimmer"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
            >
              <span className="sr-only">Open user menu</span>
              <div className="w-8 h-8 rounded-xl glass-gradient flex items-center justify-center mr-3">
                <UserCircleIcon className="h-5 w-5 text-white" />
              </div>
              <span className="text-sm font-medium glass-text-primary hidden md:block">
                Alex Morgan
              </span>
              <ChevronDownIcon className="ml-2 h-4 w-4 glass-text-secondary hidden md:block" />
            </button>

            {/* Glass User dropdown menu */}
            {userMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className="absolute right-0 mt-2 w-72 origin-top-right glass-modal"
              >
                <div className="mb-4 pb-4 border-b border-white/10">
                  <p className="text-sm font-medium glass-text-primary">
                    Alex Morgan
                  </p>
                  <p className="text-xs glass-text-muted mt-1">
                    alex.morgan@aethermail.me
                  </p>
                </div>

                <div className="space-y-2">
                  <Link
                    to="/profile"
                    className="glass-button w-full text-left glass-hover"
                  >
                    <UserCircleIcon className="mr-3 h-5 w-5" />
                    Your profile
                  </Link>
                  <Link
                    to="/settings"
                    className="glass-button w-full text-left glass-hover"
                  >
                    <CogIcon className="mr-3 h-5 w-5" />
                    Settings
                  </Link>
                </div>

                <div className="mt-4 pt-4 border-t border-white/10">
                  <button
                    onClick={handleSignOut}
                    className="glass-button w-full text-left glass-hover text-red-400"
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

      {/* Liquid Glass Ribbon Toolbar */}
      <div className="glass-strong glass-no-border border-t border-white/10 px-8 py-3">
        <div className="flex items-center justify-between">
          {/* Left section - File operations */}
          <div className="flex items-center space-x-2">
            <button className="glass-button glass-shimmer text-xs">
              <PencilIcon className="h-4 w-4 mr-2" />
              New
            </button>
            <button className="glass-button glass-shimmer text-xs">
              <PaperAirplaneIcon className="h-4 w-4 mr-2" />
              Send
            </button>
            <button className="glass-button glass-shimmer text-xs">
              <FolderIcon className="h-4 w-4 mr-2" />
              Move
            </button>
            <button className="glass-button glass-shimmer text-xs">
              <TagIcon className="h-4 w-4 mr-2" />
              Categorize
            </button>
            <button className="glass-button glass-shimmer text-xs">
              <ArchiveBoxIcon className="h-4 w-4 mr-2" />
              Archive
            </button>
            <button className="glass-button glass-shimmer text-xs">
              <TrashIcon className="h-4 w-4 mr-2" />
              Delete
            </button>
          </div>

          {/* Center section - Email actions */}
          <div className="flex items-center space-x-2">
            <button
              className={`glass-button glass-shimmer text-xs ${
                selectedEmail ? "" : "opacity-50 cursor-not-allowed"
              }`}
              disabled={!selectedEmail}
              onClick={() => selectedEmail && onReply?.(selectedEmail)}
            >
              <ArrowUturnLeftIcon className="h-4 w-4 mr-2" />
              Reply
            </button>
            <button
              className={`glass-button glass-shimmer text-xs ${
                selectedEmail ? "" : "opacity-50 cursor-not-allowed"
              }`}
              disabled={!selectedEmail}
              onClick={() => selectedEmail && onForward?.(selectedEmail)}
            >
              <ArrowUturnRightIcon className="h-4 w-4 mr-2" />
              Forward
            </button>
            <button
              className={`glass-button glass-shimmer text-xs ${
                selectedEmail ? "" : "opacity-50 cursor-not-allowed"
              }`}
              disabled={!selectedEmail}
            >
              <StarIcon className="h-4 w-4 mr-2" />
              Follow Up
            </button>
            <button
              className={`glass-button glass-shimmer text-xs ${
                selectedEmail ? "" : "opacity-50 cursor-not-allowed"
              }`}
              disabled={!selectedEmail}
            >
              <ClockIcon className="h-4 w-4 mr-2" />
              Snooze
            </button>
          </div>

          {/* Right section - Additional actions */}
          <div className="flex items-center space-x-2">
            <button
              className={`glass-button glass-shimmer text-xs ${
                selectedEmail ? "" : "opacity-50 cursor-not-allowed"
              }`}
              disabled={!selectedEmail}
            >
              <PrinterIcon className="h-4 w-4 mr-2" />
              Print
            </button>
            <button
              className={`glass-button glass-shimmer text-xs ${
                selectedEmail ? "" : "opacity-50 cursor-not-allowed"
              }`}
              disabled={!selectedEmail}
            >
              <EllipsisHorizontalIcon className="h-4 w-4 mr-2" />
              More
            </button>
          </div>
        </div>
      </div>

      {/* Glass Keyboard shortcuts help modal */}
      <KeyboardShortcutsHelp
        isOpen={shortcutsHelpOpen}
        onClose={() => setShortcutsHelpOpen(false)}
      />
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
