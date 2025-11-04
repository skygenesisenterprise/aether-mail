import type React from "react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import Avatar from "./Avatar";
import Button from "./Button";
import Card from "./Card";
import Input from "./Input";
import {
  UserCircleIcon,
  ShieldCheckIcon,
  BellIcon,
  GlobeAltIcon,
  KeyIcon,
  CameraIcon,
  CogIcon,
} from "@heroicons/react/24/outline";

const UserProfile: React.FC = () => {
  const { user } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username || "",
    email: user?.email || "",
    bio: "",
    location: "",
    website: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    // TODO: Implement save functionality
    console.log("Saving profile data:", formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      username: user?.username || "",
      email: user?.email || "",
      bio: "",
      location: "",
      website: "",
    });
    setIsEditing(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Profile Header */}
      <Card className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-6">
            {/* Avatar with upload button */}
            <div className="relative group">
              <Avatar
                src={user?.image}
                fallback={user?.username || "User"}
                size="xl"
                showStatus={true}
                status="online"
                animated={true}
              />
              <button className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-blue-700">
                <CameraIcon className="h-4 w-4 text-white" />
              </button>
            </div>

            <div className="flex-1">
              <h1 className="text-2xl font-bold text-primary mb-1">
                {user?.username || "User"}
              </h1>
              <p className="text-secondary mb-3">
                {user?.email || "user@example.com"}
              </p>
              <div className="flex items-center space-x-4 text-sm text-tertiary">
                <span className="flex items-center">
                  <ShieldCheckIcon className="h-4 w-4 mr-1 text-green-400" />
                  Verified Account
                </span>
                <span>•</span>
                <span>
                  Joined {new Date(user?.createdAt || "").toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          <div className="flex space-x-2">
            {isEditing ? (
              <>
                <Button variant="secondary" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>Save Changes</Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
            )}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Profile Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-primary mb-4 flex items-center">
              <UserCircleIcon className="h-5 w-5 mr-2 text-blue-400" />
              Basic Information
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary mb-2">
                  Username
                </label>
                <Input
                  value={formData.username}
                  onChange={(e) =>
                    handleInputChange("username", e.target.value)
                  }
                  disabled={!isEditing}
                  placeholder="Enter your username"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary mb-2">
                  Email
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  disabled={!isEditing}
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary mb-2">
                  Bio
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => handleInputChange("bio", e.target.value)}
                  disabled={!isEditing}
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-primary placeholder-tertiary focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed resize-none"
                  placeholder="Tell us about yourself"
                />
              </div>
            </div>
          </Card>

          {/* Additional Information */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-primary mb-4 flex items-center">
              <GlobeAltIcon className="h-5 w-5 mr-2 text-purple-400" />
              Additional Information
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary mb-2">
                  Location
                </label>
                <Input
                  value={formData.location}
                  onChange={(e) =>
                    handleInputChange("location", e.target.value)
                  }
                  disabled={!isEditing}
                  placeholder="City, Country"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary mb-2">
                  Website
                </label>
                <Input
                  type="url"
                  value={formData.website}
                  onChange={(e) => handleInputChange("website", e.target.value)}
                  disabled={!isEditing}
                  placeholder="https://yourwebsite.com"
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-primary mb-4">
              Statistics
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-secondary">Emails Sent</span>
                <span className="text-primary font-semibold">0</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-secondary">Emails Received</span>
                <span className="text-primary font-semibold">0</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-secondary">Storage Used</span>
                <span className="text-primary font-semibold">0 MB</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-secondary">Account Status</span>
                <span className="text-green-400 font-semibold">Active</span>
              </div>
            </div>
          </Card>

          {/* Quick Actions */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-primary mb-4">
              Quick Actions
            </h3>
            <div className="space-y-2">
              <Link
                to="/settings"
                className="flex items-center p-3 rounded-lg hover:bg-gray-800 transition-colors"
              >
                <CogIcon className="h-5 w-5 mr-3 text-tertiary" />
                <span className="text-secondary">Settings</span>
              </Link>
              <Link
                to="/security"
                className="flex items-center p-3 rounded-lg hover:bg-gray-800 transition-colors"
              >
                <KeyIcon className="h-5 w-5 mr-3 text-tertiary" />
                <span className="text-secondary">Security</span>
              </Link>
              <Link
                to="/notifications"
                className="flex items-center p-3 rounded-lg hover:bg-gray-800 transition-colors"
              >
                <BellIcon className="h-5 w-5 mr-3 text-tertiary" />
                <span className="text-secondary">Notifications</span>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
