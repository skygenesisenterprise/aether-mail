"use client";

import { AuthProvider } from "@/context/AuthContext";
import { LicenseProvider } from "@/context/LicenseContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LicenseProvider>
      <AuthProvider>{children}</AuthProvider>
    </LicenseProvider>
  );
}
