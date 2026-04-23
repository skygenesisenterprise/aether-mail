"use client";

import { AuthProvider } from "@/context/AuthContext";
import { LicenseProvider } from "@/context/LicenseContext";
import { ThemeProvider } from "@/components/theme-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <LicenseProvider>
        <AuthProvider>{children}</AuthProvider>
      </LicenseProvider>
    </ThemeProvider>
  );
}
