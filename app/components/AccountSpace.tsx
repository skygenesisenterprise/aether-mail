import React from "react";
import { X } from "lucide-react";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  status: "online" | "offline" | "away";
  role: string;
  department: string;
  location: string;
  joinDate: string;
  lastLogin: string;
}

interface AccountSpaceProps {
  userProfile: UserProfile;
  onProfileUpdate: (profile: UserProfile) => void;
  onLogout: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function AccountSpace({
  userProfile,
  onProfileUpdate,
  onLogout,
  isOpen,
  onClose,
}: AccountSpaceProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground">
              Espace compte
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <X size={20} className="text-muted-foreground" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-primary-foreground">
                {userProfile.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                {userProfile.name}
              </h3>
              <p className="text-sm text-muted-foreground">
                {userProfile.email}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <div
                  className={`w-2 h-2 rounded-full ${
                    userProfile.status === "online"
                      ? "bg-green-500"
                      : userProfile.status === "away"
                        ? "bg-yellow-500"
                        : "bg-gray-500"
                  }`}
                />
                <span className="text-xs text-muted-foreground capitalize">
                  {userProfile.status}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Rôle
              </label>
              <p className="text-foreground">{userProfile.role}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Département
              </label>
              <p className="text-foreground">{userProfile.department}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Localisation
              </label>
              <p className="text-foreground">{userProfile.location}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Date d'arrivée
              </label>
              <p className="text-foreground">{userProfile.joinDate}</p>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-sm text-muted-foreground mb-4">
              Dernière connexion: {userProfile.lastLogin}
            </p>
            <button
              onClick={onLogout}
              className="w-full bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-lg px-4 py-2 transition-colors"
            >
              Se déconnecter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
