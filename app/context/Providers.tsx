"use client";

import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/components/theme-provider";
import { LicenseProvider } from "@/context/LicenseContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <LicenseProvider>
        <AuthProvider>{children}</AuthProvider>
      </LicenseProvider>
    </ThemeProvider>
  );
}
