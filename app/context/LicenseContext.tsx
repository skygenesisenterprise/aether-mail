"use client";

import { createContext, useContext, useEffect, useState } from "react";

type LicenseType = "self-hosted" | "enterprise" | "premium" | "free" | "trial";

type LicenseStatus = "active" | "expired" | "invalid" | "grace_period";

interface LicenseFeatures {
  maxUsers: number;
  maxWorkspaces: number;
  advancedSecurity: boolean;
  auditLogs: boolean;
  apiAccess: boolean;
  sso: boolean;
  customBranding: boolean;
  prioritySupport: boolean;
  analytics: boolean;
  backup: boolean;
}

interface LicenseContextType {
  licenseType: LicenseType;
  licenseStatus: LicenseStatus;
  licenseKey: string | null;
  expirationDate: Date | null;
  features: LicenseFeatures;
  isValid: boolean;
  isExpired: boolean;
  isEnterprise: boolean;
  isSelfHosted: boolean;
  updateLicense: (licenseKey: string) => Promise<boolean>;
  validateLicense: () => Promise<boolean>;
  getFeatureStatus: (feature: keyof LicenseFeatures) => boolean;
}

const LicenseContext = createContext<LicenseContextType | undefined>(undefined);

export function LicenseProvider({ children }: { children: React.ReactNode }) {
  const [licenseType, setLicenseType] = useState<LicenseType>("self-hosted");
  const [licenseStatus, setLicenseStatus] = useState<LicenseStatus>("active");
  const [licenseKey, setLicenseKey] = useState<string | null>(null);
  const [expirationDate, setExpirationDate] = useState<Date | null>(null);
  const [features, setFeatures] = useState<LicenseFeatures>({
    maxUsers: 10,
    maxWorkspaces: 5,
    advancedSecurity: false,
    auditLogs: false,
    apiAccess: false,
    sso: false,
    customBranding: false,
    prioritySupport: false,
    analytics: false,
    backup: false,
  });

  // Charger la configuration depuis les variables d'environnement
  useEffect(() => {
    const envLicenseType = process.env.NEXT_PUBLIC_LICENSE_TYPE as LicenseType;
    const envLicenseKey = process.env.NEXT_PUBLIC_LICENSE_KEY;
    const envExpiration = process.env.NEXT_PUBLIC_LICENSE_EXPIRATION;

    if (envLicenseType) {
      setLicenseType(envLicenseType);
    }

    if (envLicenseKey) {
      setLicenseKey(envLicenseKey);
      validateLicenseKey(envLicenseKey);
    }

    if (envExpiration) {
      try {
        setExpirationDate(new Date(envExpiration));
      } catch (error) {
        console.error("Invalid expiration date format");
      }
    }
  }, []);

  // Valider une clé de licence
  const validateLicenseKey = (key: string): boolean => {
    // Logique de validation simplifiée - à remplacer par un appel API réel
    if (!key) {
      setLicenseStatus("invalid");
      return false;
    }

    // Simulation de validation
    if (key.startsWith("ENTERPRISE-")) {
      setLicenseType("enterprise");
      setFeatures({
        maxUsers: 1000,
        maxWorkspaces: 50,
        advancedSecurity: true,
        auditLogs: true,
        apiAccess: true,
        sso: true,
        customBranding: true,
        prioritySupport: true,
        analytics: true,
        backup: true,
      });
      setLicenseStatus("active");
      return true;
    } else if (key.startsWith("PREMIUM-")) {
      setLicenseType("premium");
      setFeatures({
        maxUsers: 100,
        maxWorkspaces: 10,
        advancedSecurity: true,
        auditLogs: true,
        apiAccess: true,
        sso: true,
        customBranding: false,
        prioritySupport: true,
        analytics: true,
        backup: true,
      });
      setLicenseStatus("active");
      return true;
    } else if (key.startsWith("SELF-")) {
      setLicenseType("self-hosted");
      setFeatures({
        maxUsers: 50,
        maxWorkspaces: 5,
        advancedSecurity: true,
        auditLogs: true,
        apiAccess: true,
        sso: false,
        customBranding: false,
        prioritySupport: false,
        analytics: false,
        backup: true,
      });
      setLicenseStatus("active");
      return true;
    } else if (key.startsWith("FREE-")) {
      setLicenseType("free");
      setFeatures({
        maxUsers: 5,
        maxWorkspaces: 1,
        advancedSecurity: false,
        auditLogs: false,
        apiAccess: false,
        sso: false,
        customBranding: false,
        prioritySupport: false,
        analytics: false,
        backup: false,
      });
      setLicenseStatus("active");
      return true;
    } else if (key.startsWith("TRIAL-")) {
      setLicenseType("trial");
      setFeatures({
        maxUsers: 20,
        maxWorkspaces: 3,
        advancedSecurity: true,
        auditLogs: true,
        apiAccess: true,
        sso: false,
        customBranding: false,
        prioritySupport: false,
        analytics: true,
        backup: true,
      });
      setLicenseStatus("active");
      return true;
    } else {
      setLicenseStatus("invalid");
      return false;
    }
  };

  const updateLicense = async (key: string): Promise<boolean> => {
    setLicenseKey(key);
    return validateLicenseKey(key);
  };

  const validateLicense = async (): Promise<boolean> => {
    if (!licenseKey) {
      setLicenseStatus("invalid");
      return false;
    }
    return validateLicenseKey(licenseKey);
  };

  const getFeatureStatus = (feature: keyof LicenseFeatures): boolean => {
    return !!features[feature];
  };

  // Vérifier si la licence est expirée
  useEffect(() => {
    if (expirationDate && new Date() > expirationDate) {
      setLicenseStatus("expired");
    }
  }, [expirationDate]);

  const isValid = licenseStatus === "active";
  const isExpired = licenseStatus === "expired";
  const isEnterprise = licenseType === "enterprise";
  const isSelfHosted = licenseType === "self-hosted";

  return (
    <LicenseContext.Provider
      value={{
        licenseType,
        licenseStatus,
        licenseKey,
        expirationDate,
        features,
        isValid,
        isExpired,
        isEnterprise,
        isSelfHosted,
        updateLicense,
        validateLicense,
        getFeatureStatus,
      }}
    >
      {children}
    </LicenseContext.Provider>
  );
}

export function useLicense() {
  const context = useContext(LicenseContext);
  if (context === undefined) {
    throw new Error("useLicense must be used within a LicenseProvider");
  }
  return context;
}
