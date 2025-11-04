import type React from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import Avatar from "./Avatar";
import {
  UserCircleIcon,
  CogIcon,
  ArrowRightStartOnRectangleIcon,
  ChartBarIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";

interface UserProfileCardProps {
  isOpen: boolean;
  onClose: () => void;
}

const UserProfileCard: React.FC<UserProfileCardProps> = ({
  isOpen,
  onClose,
}) => {
  const { user, logout } = useAuthStore();

  if (!isOpen) return null;

  const handleLogout = () => {
    logout();
    onClose();
  };

  return (
    <div className="absolute right-0 mt-3 w-80 surface-primary border border-gray-800 rounded-2xl shadow-2xl z-50 overflow-hidden backdrop-blur-xl">
      {/* User Profile Header */}
      <div className="relative bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20 p-6 border-b border-gray-800">
        <div className="flex items-center space-x-4">
          <Avatar
            src={user?.image}
            fallback={user?.username || "User"}
            size="lg"
            showStatus={true}
            status="online"
            animated={true}
          />
          <div className="flex-1">
            <h3 className="text-lg font-bold text-primary">
              {user?.username || "User"}
            </h3>
            <p className="text-sm text-tertiary truncate">
              {user?.email || "user@example.com"}
            </p>
            <div className="flex items-center mt-2 space-x-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1.5 animate-pulse"></div>
                Active now
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">
                Pro Account
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-4 p-6 border-b border-gray-800">
        <div className="text-center">
          <p className="text-xl font-bold text-primary">0</p>
          <p className="text-xs text-tertiary">Unread</p>
        </div>
        <div className="text-center">
          <p className="text-xl font-bold text-primary">0</p>
          <p className="text-xs text-tertiary">Sent</p>
        </div>
        <div className="text-center">
          <p className="text-xl font-bold text-primary">0</p>
          <p className="text-xs text-tertiary">Drafts</p>
        </div>
        <div className="text-center">
          <p className="text-xl font-bold text-primary">∞</p>
          <p className="text-xs text-tertiary">Storage</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-2">
        <Link
          to="/profile"
          onClick={onClose}
          className="flex items-center w-full p-3 rounded-xl text-sm text-secondary hover:bg-gray-800/50 hover:text-primary transition-all duration-200 group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 flex items-center justify-center mr-3 group-hover:from-blue-500/30 group-hover:to-blue-600/30 transition-all duration-200">
            <UserCircleIcon className="h-5 w-5 text-blue-400" />
          </div>
          <div className="flex-1 text-left">
            <p className="font-medium">Profile</p>
            <p className="text-xs text-tertiary">
              Manage your account information
            </p>
          </div>
        </Link>

        <Link
          to="/analytics"
          onClick={onClose}
          className="flex items-center w-full p-3 rounded-xl text-sm text-secondary hover:bg-gray-800/50 hover:text-primary transition-all duration-200 group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/20 flex items-center justify-center mr-3 group-hover:from-purple-500/30 group-hover:to-purple-600/30 transition-all duration-200">
            <ChartBarIcon className="h-5 w-5 text-purple-400" />
          </div>
          <div className="flex-1 text-left">
            <p className="font-medium">Analytics</p>
            <p className="text-xs text-tertiary">View your email statistics</p>
          </div>
        </Link>

        <Link
          to="/settings"
          onClick={onClose}
          className="flex items-center w-full p-3 rounded-xl text-sm text-secondary hover:bg-gray-800/50 hover:text-primary transition-all duration-200 group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/20 flex items-center justify-center mr-3 group-hover:from-amber-500/30 group-hover:to-amber-600/30 transition-all duration-200">
            <CogIcon className="h-5 w-5 text-amber-400" />
          </div>
          <div className="flex-1 text-left">
            <p className="font-medium">Settings</p>
            <p className="text-xs text-tertiary">
              Preferences, privacy & security
            </p>
          </div>
        </Link>

        <Link
          to="/security"
          onClick={onClose}
          className="flex items-center w-full p-3 rounded-xl text-sm text-secondary hover:bg-gray-800/50 hover:text-primary transition-all duration-200 group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500/20 to-green-600/20 flex items-center justify-center mr-3 group-hover:from-green-500/30 group-hover:to-green-600/30 transition-all duration-200">
            <ShieldCheckIcon className="h-5 w-5 text-green-400" />
          </div>
          <div className="flex-1 text-left">
            <p className="font-medium">Security</p>
            <p className="text-xs text-tertiary">2FA, passwords & sessions</p>
          </div>
        </Link>

        <div className="border-t border-gray-800 my-2"></div>

        <button
          onClick={handleLogout}
          className="flex items-center w-full p-3 rounded-xl text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200 group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500/20 to-red-600/20 flex items-center justify-center mr-3 group-hover:from-red-500/30 group-hover:to-red-600/30 transition-all duration-200">
            <ArrowRightStartOnRectangleIcon className="h-5 w-5 text-red-400" />
          </div>
          <div className="flex-1 text-left">
            <p className="font-medium">Logout</p>
            <p className="text-xs text-red-300/70">Sign out of your account</p>
          </div>
        </button>
      </div>
    </div>
  );
};

export default UserProfileCard;
