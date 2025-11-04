import type React from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import KeyboardShortcutsHelp from "../ui/KeyboardShortcutsHelp";
import Avatar from "../ui/Avatar";
import Button from "../ui/Button";
import {
  MoonIcon,
  SunIcon,
  Bars3Icon,
  BellIcon,
  ChevronDownIcon,
  CogIcon,
  MagnifyingGlassIcon,
  ArchiveBoxIcon,
  TrashIcon,
  ClockIcon,
  ArrowUturnLeftIcon,
  ArrowUturnRightIcon,
  PlusIcon,
  AdjustmentsHorizontalIcon,
  BookmarkIcon,
  ShareIcon,
  FlagIcon,
  InboxIcon,
  TagIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  DocumentTextIcon,
  ChartBarIcon,
  UserGroupIcon,
  QuestionMarkCircleIcon,
  ArrowRightStartOnRectangleIcon,
} from "@heroicons/react/24/outline";

interface HeaderProps {
  toggleSidebar: () => void;
  toggleTheme: () => void;
  isDarkMode: boolean;
  selectedEmail?: any;
  onReply?: (email: any) => void;
  onForward?: (email: any) => void;
  onDelete?: (email: any) => void;
  onCompose?: () => void;
  onSearch?: (query: string) => void;
}

const Header: React.FC<HeaderProps> = ({
  toggleSidebar,
  toggleTheme,
  isDarkMode,
  selectedEmail,
  onReply,
  onForward,
  onDelete,
  onCompose,
  onSearch,
}) => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [shortcutsHelpOpen, setShortcutsHelpOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() && onSearch) {
      onSearch(searchQuery.trim());
    }
  };

  const handleNewEmail = () => {
    if (onCompose) {
      onCompose();
    } else {
      navigate("/compose");
    }
  };

  return (
    <>
      <header className="header">
        <div className="flex items-center justify-between h-16 px-6">
          {/* Left section - Mobile menu toggle only */}
          <div className="flex items-center space-x-4">
            {/* Mobile menu toggle */}
            <button
              onClick={toggleSidebar}
              className="lg:hidden btn-ghost p-2 rounded-lg"
            >
              <Bars3Icon className="h-5 w-5 text-secondary" />
            </button>
          </div>

          {/* Right section - All Actions and User */}
          <div className="flex items-center space-x-2 ml-auto">
            {/* Compose Button - Now on the right */}
            <div className="hidden md:flex items-center space-x-1">
              <Button
                variant="primary"
                size="sm"
                onClick={handleNewEmail}
                className="flex items-center space-x-1"
              >
                <PlusIcon className="h-4 w-4" />
                <span>Compose</span>
              </Button>
            </div>

            <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

            {/* Email Actions (when email is selected) */}
            {selectedEmail && (
              <div className="hidden lg:flex items-center space-x-1 mr-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onReply?.(selectedEmail)}
                  title="Reply"
                >
                  <ArrowUturnLeftIcon className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onForward?.(selectedEmail)}
                  title="Forward"
                >
                  <ArrowUturnRightIcon className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete?.(selectedEmail)}
                  className="text-red-400 hover:text-red-300"
                  title="Delete"
                >
                  <TrashIcon className="h-4 w-4" />
                </Button>
                <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
                <Button variant="ghost" size="sm" title="Archive">
                  <ArchiveBoxIcon className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" title="Mark as unread">
                  <ClockIcon className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" title="Bookmark">
                  <BookmarkIcon className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" title="Share">
                  <ShareIcon className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" title="Flag">
                  <FlagIcon className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Quick Actions */}
            <div className="hidden md:flex items-center space-x-1">
              <Button variant="ghost" size="sm" title="Inbox">
                <InboxIcon className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" title="Labels">
                <TagIcon className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" title="Filter">
                <FunnelIcon className="h-4 w-4" />
              </Button>
            </div>

            {/* Tools Menu */}
            <div className="hidden sm:flex items-center space-x-1">
              <Button variant="ghost" size="sm" title="Export">
                <ArrowDownTrayIcon className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" title="Reports">
                <ChartBarIcon className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" title="Templates">
                <DocumentTextIcon className="h-4 w-4" />
              </Button>
            </div>

            <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              title="Toggle theme"
            >
              {isDarkMode ? (
                <SunIcon className="h-4 w-4" />
              ) : (
                <MoonIcon className="h-4 w-4" />
              )}
            </Button>

            {/* Notifications */}
            <Button
              variant="ghost"
              size="sm"
              className="relative"
              title="Notifications"
            >
              <BellIcon className="h-4 w-4" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </Button>

            {/* Settings */}
            <Button variant="ghost" size="sm" title="Settings">
              <CogIcon className="h-4 w-4" />
            </Button>

            {/* Help */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShortcutsHelpOpen(true)}
              title="Help & shortcuts"
            >
              <QuestionMarkCircleIcon className="h-4 w-4" />
            </Button>

            {/* User Account */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center space-x-2 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 group"
              >
                <Avatar
                  src={user?.image}
                  fallback={user?.username || "User"}
                  size="sm"
                  showStatus={true}
                  status="online"
                  animated={true}
                />

                {/* User info - Desktop only */}
                <div className="hidden lg:block text-left">
                  <p className="text-sm font-medium text-primary">
                    {user?.username || "User"}
                  </p>
                  <p className="text-xs text-tertiary">
                    {user?.email || "user@example.com"}
                  </p>
                </div>

                {/* Chevron icon */}
                <ChevronDownIcon
                  className={`h-4 w-4 text-tertiary transition-transform duration-200 ${
                    userMenuOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Enhanced User Profile Card */}
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-50">
                  {/* User Info Header */}
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-3">
                      <Avatar
                        src={user?.image}
                        fallback={user?.username || "User"}
                        size="lg"
                        showStatus={true}
                        status="online"
                        animated={true}
                      />
                      <div className="flex-1">
                        <p className="font-medium text-primary">
                          {user?.username || "User"}
                        </p>
                        <p className="text-sm text-tertiary">
                          {user?.email || "user@example.com"}
                        </p>
                        <p className="text-xs text-blue-500 mt-1">
                          Premium Account
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="p-2">
                    <button className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                      <UserGroupIcon className="h-5 w-5 text-tertiary" />
                      <span className="text-sm">Manage Team</span>
                    </button>
                    <button className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                      <AdjustmentsHorizontalIcon className="h-5 w-5 text-tertiary" />
                      <span className="text-sm">Account Settings</span>
                    </button>
                    <button className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                      <ChartBarIcon className="h-5 w-5 text-tertiary" />
                      <span className="text-sm">Usage Statistics</span>
                    </button>
                  </div>

                  {/* Footer Actions */}
                  <div className="p-2 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-red-600 dark:text-red-400"
                    >
                      <ArrowRightStartOnRectangleIcon className="h-5 w-5" />
                      <span className="text-sm">Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Email Actions Bar (Mobile) */}
        {selectedEmail && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-700 px-4 py-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onReply?.(selectedEmail)}
                  title="Reply"
                >
                  <ArrowUturnLeftIcon className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onForward?.(selectedEmail)}
                  title="Forward"
                >
                  <ArrowUturnRightIcon className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete?.(selectedEmail)}
                  className="text-red-400 hover:text-red-300"
                  title="Delete"
                >
                  <TrashIcon className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" title="Archive">
                  <ArchiveBoxIcon className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" title="Bookmark">
                  <BookmarkIcon className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" title="Share">
                  <ShareIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Keyboard Shortcuts Help Modal */}
      {shortcutsHelpOpen && (
        <KeyboardShortcutsHelp
          isOpen={shortcutsHelpOpen}
          onClose={() => setShortcutsHelpOpen(false)}
        />
      )}
    </>
  );
};

export default Header;
