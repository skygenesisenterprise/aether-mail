import React, { useState } from "react";
import {
  User,
  Settings,
  Shield,
  Bell,
  HelpCircle,
  LogOut,
  Mail,
  Calendar,
  Clock,
  Star,
  Archive,
  Trash2,
  FileText,
  Send,
  ChevronRight,
  Edit,
  Camera,
  Smartphone,
  Monitor,
  Moon,
  Sun,
  Globe,
  Lock,
  Download,
  Upload,
  RefreshCw,
  Check,
  X,
  Info,
  AlertTriangle,
  Zap,
  Users,
  Database,
  Volume2,
  Wifi,
  HardDrive,
} from "lucide-react";
import ProfilePhotoManager from "./ProfilePhotoManager";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  status: "online" | "away" | "busy" | "offline";
  role: string;
  department?: string;
  location?: string;
  joinDate: string;
  lastLogin: string;
}

interface AccountStats {
  totalEmails: number;
  unreadEmails: number;
  sentEmails: number;
  draftsCount: number;
  storageUsed: number;
  storageLimit: number;
  connectedAccounts: number;
}

interface NotificationSettings {
  email: boolean;
  desktop: boolean;
  sound: boolean;
  mobile: boolean;
  frequency: "instant" | "hourly" | "daily" | "weekly";
}

interface SecuritySettings {
  twoFactorAuth: boolean;
  loginAlerts: boolean;
  sessionTimeout: number;
  encryptedEmails: boolean;
  privacyMode: "standard" | "enhanced" | "maximum";
}

interface AccountSpaceProps {
  userProfile: UserProfile;
  onProfileUpdate?: (profile: Partial<UserProfile>) => void;
  onLogout?: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function AccountSpace({
  userProfile,
  onProfileUpdate,
  onLogout,
  isOpen = false,
  onClose,
}: AccountSpaceProps) {
  const [activeTab, setActiveTab] = useState<
    "profile" | "account" | "security" | "notifications" | "storage" | "photo"
  >("profile");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editedProfile, setEditedProfile] = useState<UserProfile>(userProfile);
  const [notificationSettings, setNotificationSettings] =
    useState<NotificationSettings>({
      email: true,
      desktop: true,
      sound: false,
      mobile: true,
      frequency: "instant",
    });
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    twoFactorAuth: false,
    loginAlerts: true,
    sessionTimeout: 30,
    encryptedEmails: true,
    privacyMode: "standard",
  });

  // Statistiques simulées
  const [stats] = useState<AccountStats>({
    totalEmails: 1247,
    unreadEmails: 23,
    sentEmails: 892,
    draftsCount: 5,
    storageUsed: 2.3,
    storageLimit: 15,
    connectedAccounts: 3,
  });

  // Sauvegarder les changements du profil
  const saveProfile = () => {
    onProfileUpdate?.(editedProfile);
    setIsEditingProfile(false);
  };

  // Annuler l'édition du profil
  const cancelEdit = () => {
    setEditedProfile(userProfile);
    setIsEditingProfile(false);
  };

  // Obtenir la couleur de statut
  const getStatusColor = (status: UserProfile["status"]) => {
    switch (status) {
      case "online":
        return "bg-green-500";
      case "away":
        return "bg-yellow-500";
      case "busy":
        return "bg-red-500";
      case "offline":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card w-full max-w-6xl h-[90vh] max-h-[800px] rounded-xl shadow-2xl flex overflow-hidden">
        {/* Sidebar de navigation */}
        <div className="w-80 bg-muted/30 border-r border-border flex flex-col">
          {/* En-tête avec profil */}
          <div className="p-6 border-b border-border">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center text-2xl font-bold text-primary-foreground shadow-lg">
                  {userProfile.name.charAt(0).toUpperCase()}
                </div>
                <div
                  className={`absolute bottom-0 right-0 w-4 h-4 ${getStatusColor(userProfile.status)} rounded-full border-2 border-card`}
                ></div>
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-card-foreground">
                  {userProfile.name}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {userProfile.email}
                </p>
                <p className="text-xs text-muted-foreground">
                  {userProfile.role}
                  {userProfile.department && ` • ${userProfile.department}`}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation des tabs */}
          <nav className="flex-1 p-4">
            <div className="space-y-1">
              {[
                { id: "profile", name: "Profil", icon: <User size={18} /> },
                { id: "account", name: "Compte", icon: <Settings size={18} /> },
                {
                  id: "security",
                  name: "Sécurité",
                  icon: <Shield size={18} />,
                },
                {
                  id: "notifications",
                  name: "Notifications",
                  icon: <Bell size={18} />,
                },
                {
                  id: "storage",
                  name: "Stockage",
                  icon: <HardDrive size={18} />,
                },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-card-foreground"
                  }`}
                >
                  {tab.icon}
                  <span className="font-medium">{tab.name}</span>
                </button>
              ))}
            </div>
          </nav>

          {/* Actions rapides */}
          <div className="p-4 border-t border-border space-y-2">
            <button className="w-full flex items-center gap-3 px-4 py-3 text-muted-foreground hover:bg-muted hover:text-card-foreground rounded-lg transition-colors">
              <HelpCircle size={18} />
              <span className="font-medium">Aide</span>
            </button>
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-destructive hover:bg-destructive/20 hover:text-destructive-foreground rounded-lg transition-colors"
            >
              <LogOut size={18} />
              <span className="font-medium">Déconnexion</span>
            </button>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* En-tête du contenu */}
          <div className="flex items-center justify-between p-6 border-b border-border bg-muted/20">
            <h1 className="text-xl font-semibold text-card-foreground">
              {activeTab === "profile" && "Profil utilisateur"}
              {activeTab === "account" && "Paramètres du compte"}
              {activeTab === "security" && "Sécurité et confidentialité"}
              {activeTab === "notifications" && "Préférences de notification"}
              {activeTab === "storage" && "Gestion du stockage"}
            </h1>
            <button
              onClick={onClose}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <X size={20} className="text-muted-foreground" />
            </button>
          </div>

          {/* Contenu scrollable */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Tab Profil */}
            {activeTab === "profile" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-card-foreground">
                    Informations personnelles
                  </h3>
                  {!isEditingProfile ? (
                    <button
                      onClick={() => setIsEditingProfile(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors"
                    >
                      <Edit size={16} />
                      <span>Modifier</span>
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={saveProfile}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                      >
                        <Check size={16} />
                        <span>Enregistrer</span>
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 text-card-foreground rounded-lg transition-colors"
                      >
                        <X size={16} />
                        <span>Annuler</span>
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-2">
                        Nom complet
                      </label>
                      <input
                        type="text"
                        value={
                          isEditingProfile
                            ? editedProfile.name
                            : userProfile.name
                        }
                        onChange={(e) =>
                          setEditedProfile((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        disabled={!isEditingProfile}
                        className="w-full bg-background border border-border rounded-lg px-4 py-3 text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={userProfile.email}
                        disabled
                        className="w-full bg-muted/50 border border-border rounded-lg px-4 py-3 text-muted-foreground"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-2">
                        Rôle
                      </label>
                      <input
                        type="text"
                        value={
                          isEditingProfile
                            ? editedProfile.role
                            : userProfile.role
                        }
                        onChange={(e) =>
                          setEditedProfile((prev) => ({
                            ...prev,
                            role: e.target.value,
                          }))
                        }
                        disabled={!isEditingProfile}
                        className="w-full bg-background border border-border rounded-lg px-4 py-3 text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-2">
                        Département
                      </label>
                      <input
                        type="text"
                        value={
                          isEditingProfile
                            ? editedProfile.department
                            : userProfile.department
                        }
                        onChange={(e) =>
                          setEditedProfile((prev) => ({
                            ...prev,
                            department: e.target.value,
                          }))
                        }
                        disabled={!isEditingProfile}
                        className="w-full bg-background border border-border rounded-lg px-4 py-3 text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-2">
                        Localisation
                      </label>
                      <input
                        type="text"
                        value={
                          isEditingProfile
                            ? editedProfile.location
                            : userProfile.location
                        }
                        onChange={(e) =>
                          setEditedProfile((prev) => ({
                            ...prev,
                            location: e.target.value,
                          }))
                        }
                        disabled={!isEditingProfile}
                        className="w-full bg-background border border-border rounded-lg px-4 py-3 text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-2">
                        Photo de profil
                      </label>
                      <div className="flex items-center gap-4">
                        <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center">
                          {userProfile.avatar ? (
                            <img
                              src={userProfile.avatar}
                              alt="Profile"
                              className="w-full h-full rounded-lg object-cover"
                            />
                          ) : (
                            <Camera
                              size={24}
                              className="text-muted-foreground"
                            />
                          )}
                        </div>
                        <button
                          onClick={() => setActiveTab("photo")}
                          className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors"
                        >
                          <Upload size={16} />
                          <span>Gérer la photo</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-border pt-6">
                  <h4 className="text-sm font-medium text-muted-foreground mb-4">
                    Informations système
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-muted-foreground" />
                      <span className="text-card-foreground">
                        Date d'inscription: {userProfile.joinDate}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-muted-foreground" />
                      <span className="text-card-foreground">
                        Dernière connexion: {userProfile.lastLogin}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab Compte */}
            {activeTab === "account" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-card-foreground">
                      Préférences
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">
                          Langue
                        </label>
                        <select className="w-full bg-background border border-border rounded-lg px-4 py-3 text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary">
                          <option>Français</option>
                          <option>English</option>
                          <option>Español</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">
                          Fuseau horaire
                        </label>
                        <select className="w-full bg-background border border-border rounded-lg px-4 py-3 text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary">
                          <option>UTC+1 (Paris)</option>
                          <option>UTC+0 (Londres)</option>
                          <option>UTC-5 (New York)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">
                          Format de date
                        </label>
                        <select className="w-full bg-background border border-border rounded-lg px-4 py-3 text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary">
                          <option>DD/MM/YYYY</option>
                          <option>MM/DD/YYYY</option>
                          <option>YYYY-MM-DD</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-card-foreground">
                      Apparence
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">
                          Thème
                        </label>
                        <select className="w-full bg-background border border-border rounded-lg px-4 py-3 text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary">
                          <option value="light">Clair</option>
                          <option value="dark">Sombre</option>
                          <option value="system">Automatique</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">
                          Densité de l'interface
                        </label>
                        <select className="w-full bg-background border border-border rounded-lg px-4 py-3 text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary">
                          <option>Confortable</option>
                          <option>Compact</option>
                          <option>Adaptatif</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab Sécurité */}
            {activeTab === "security" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-card-foreground">
                      Authentification
                    </h3>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-card-foreground">
                            Authentification à deux facteurs
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            Ajoutez une couche de sécurité supplémentaire
                          </p>
                        </div>
                        <button
                          onClick={() =>
                            setSecuritySettings((prev) => ({
                              ...prev,
                              twoFactorAuth: !prev.twoFactorAuth,
                            }))
                          }
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            securitySettings.twoFactorAuth
                              ? "bg-primary"
                              : "bg-muted"
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              securitySettings.twoFactorAuth
                                ? "translate-x-6"
                                : "translate-x-1"
                            }`}
                          />
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-card-foreground">
                            Alertes de connexion
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            Soyez notifié des nouvelles connexions
                          </p>
                        </div>
                        <button
                          onClick={() =>
                            setSecuritySettings((prev) => ({
                              ...prev,
                              loginAlerts: !prev.loginAlerts,
                            }))
                          }
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            securitySettings.loginAlerts
                              ? "bg-primary"
                              : "bg-muted"
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              securitySettings.loginAlerts
                                ? "translate-x-6"
                                : "translate-x-1"
                            }`}
                          />
                        </button>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">
                          Délai d'expiration de session
                        </label>
                        <select
                          value={securitySettings.sessionTimeout}
                          onChange={(e) =>
                            setSecuritySettings((prev) => ({
                              ...prev,
                              sessionTimeout: parseInt(e.target.value),
                            }))
                          }
                          className="w-full bg-background border border-border rounded-lg px-4 py-3 text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option value={15}>15 minutes</option>
                          <option value={30}>30 minutes</option>
                          <option value={60}>1 heure</option>
                          <option value={120}>2 heures</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-card-foreground">
                      Confidentialité
                    </h3>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-card-foreground">
                            Emails chiffrés
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            Chiffrer automatiquement les emails sortants
                          </p>
                        </div>
                        <button
                          onClick={() =>
                            setSecuritySettings((prev) => ({
                              ...prev,
                              encryptedEmails: !prev.encryptedEmails,
                            }))
                          }
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            securitySettings.encryptedEmails
                              ? "bg-primary"
                              : "bg-muted"
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              securitySettings.encryptedEmails
                                ? "translate-x-6"
                                : "translate-x-1"
                            }`}
                          />
                        </button>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">
                          Mode de confidentialité
                        </label>
                        <select
                          value={securitySettings.privacyMode}
                          onChange={(e) =>
                            setSecuritySettings((prev) => ({
                              ...prev,
                              privacyMode: e.target.value as any,
                            }))
                          }
                          className="w-full bg-background border border-border rounded-lg px-4 py-3 text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option value="standard">Standard</option>
                          <option value="enhanced">Amélioré</option>
                          <option value="maximum">Maximum</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-border pt-6">
                  <div className="flex items-center gap-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                    <AlertTriangle size={20} className="text-yellow-600" />
                    <div>
                      <h4 className="text-sm font-medium text-yellow-800">
                        Sessions actives
                      </h4>
                      <p className="text-xs text-yellow-700">
                        3 sessions actives sur cet appareil
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab Notifications */}
            {activeTab === "notifications" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-card-foreground">
                      Canaux de notification
                    </h3>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Mail size={16} className="text-muted-foreground" />
                          <span className="text-sm font-medium text-card-foreground">
                            Email
                          </span>
                        </div>
                        <button
                          onClick={() =>
                            setNotificationSettings((prev) => ({
                              ...prev,
                              email: !prev.email,
                            }))
                          }
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            notificationSettings.email
                              ? "bg-primary"
                              : "bg-muted"
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              notificationSettings.email
                                ? "translate-x-6"
                                : "translate-x-1"
                            }`}
                          />
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Monitor
                            size={16}
                            className="text-muted-foreground"
                          />
                          <span className="text-sm font-medium text-card-foreground">
                            Bureau
                          </span>
                        </div>
                        <button
                          onClick={() =>
                            setNotificationSettings((prev) => ({
                              ...prev,
                              desktop: !prev.desktop,
                            }))
                          }
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            notificationSettings.desktop
                              ? "bg-primary"
                              : "bg-muted"
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              notificationSettings.desktop
                                ? "translate-x-6"
                                : "translate-x-1"
                            }`}
                          />
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Smartphone
                            size={16}
                            className="text-muted-foreground"
                          />
                          <span className="text-sm font-medium text-card-foreground">
                            Mobile
                          </span>
                        </div>
                        <button
                          onClick={() =>
                            setNotificationSettings((prev) => ({
                              ...prev,
                              mobile: !prev.mobile,
                            }))
                          }
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            notificationSettings.mobile
                              ? "bg-primary"
                              : "bg-muted"
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              notificationSettings.mobile
                                ? "translate-x-6"
                                : "translate-x-1"
                            }`}
                          />
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Volume2
                            size={16}
                            className="text-muted-foreground"
                          />
                          <span className="text-sm font-medium text-card-foreground">
                            Son
                          </span>
                        </div>
                        <button
                          onClick={() =>
                            setNotificationSettings((prev) => ({
                              ...prev,
                              sound: !prev.sound,
                            }))
                          }
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            notificationSettings.sound
                              ? "bg-primary"
                              : "bg-muted"
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              notificationSettings.sound
                                ? "translate-x-6"
                                : "translate-x-1"
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-card-foreground">
                      Fréquence
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">
                          Fréquence des notifications
                        </label>
                        <select
                          value={notificationSettings.frequency}
                          onChange={(e) =>
                            setNotificationSettings((prev) => ({
                              ...prev,
                              frequency: e.target.value as any,
                            }))
                          }
                          className="w-full bg-background border border-border rounded-lg px-4 py-3 text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option value="instant">Immédiate</option>
                          <option value="hourly">Toutes les heures</option>
                          <option value="daily">Quotidienne</option>
                          <option value="weekly">Hebdomadaire</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab Stockage */}
            {activeTab === "storage" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl text-white">
                    <Mail size={24} className="mb-2" />
                    <div className="text-2xl font-bold">
                      {stats.totalEmails}
                    </div>
                    <div className="text-sm opacity-90">Emails totaux</div>
                  </div>

                  <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl text-white">
                    <Send size={24} className="mb-2" />
                    <div className="text-2xl font-bold">{stats.sentEmails}</div>
                    <div className="text-sm opacity-90">Emails envoyés</div>
                  </div>

                  <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 p-6 rounded-xl text-white">
                    <FileText size={24} className="mb-2" />
                    <div className="text-2xl font-bold">
                      {stats.draftsCount}
                    </div>
                    <div className="text-sm opacity-90">Brouillons</div>
                  </div>
                </div>

                <div className="bg-muted/30 rounded-xl p-6">
                  <h3 className="text-lg font-medium text-card-foreground mb-4">
                    Utilisation du stockage
                  </h3>

                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">
                        {stats.storageUsed} GB utilisés sur {stats.storageLimit}{" "}
                        GB
                      </span>
                      <span className="text-sm font-medium text-card-foreground">
                        {Math.round(
                          (stats.storageUsed / stats.storageLimit) * 100,
                        )}
                        %
                      </span>
                    </div>

                    <div className="w-full bg-muted rounded-full h-4 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-500"
                        style={{
                          width: `${(stats.storageUsed / stats.storageLimit) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button className="flex items-center gap-3 p-4 bg-background border border-border rounded-lg hover:bg-muted transition-colors">
                      <Database size={20} className="text-muted-foreground" />
                      <div className="text-left">
                        <div className="text-sm font-medium text-card-foreground">
                          Gérer le stockage
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Nettoyer et optimiser
                        </div>
                      </div>
                    </button>

                    <button className="flex items-center gap-3 p-4 bg-background border border-border rounded-lg hover:bg-muted transition-colors">
                      <RefreshCw size={20} className="text-muted-foreground" />
                      <div className="text-left">
                        <div className="text-sm font-medium text-card-foreground">
                          Importer/Exporter
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Sauvegarder vos données
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                <div className="border-t border-border pt-6">
                  <h4 className="text-sm font-medium text-muted-foreground mb-4">
                    Comptes connectés
                  </h4>
                  <div className="space-y-3">
                    {[
                      { name: "Gmail", email: "user@gmail.com", type: "gmail" },
                      {
                        name: "Outlook",
                        email: "user@outlook.com",
                        type: "outlook",
                      },
                      { name: "Pro", email: "user@icloud.com", type: "apple" },
                    ].map((account, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-background border border-border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                            <Globe
                              size={16}
                              className="text-muted-foreground"
                            />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-card-foreground">
                              {account.name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {account.email}
                            </div>
                          </div>
                        </div>
                        <button className="p-2 hover:bg-muted rounded transition-colors">
                          <Settings
                            size={14}
                            className="text-muted-foreground"
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
