import type { Metadata } from "next";
import "@/styles/globals.css";
import { Providers } from "@/context/Providers";
import { DashboardLayout } from "@/components/DashboardLayout";

export const metadata: Metadata = {
  title: "Aether Mail | The Ultimate Email Client for Aether Office",
  description:
    "Aether Mail - A lightweight, open-source email client built for privacy, speed, and seamless integration within the Aether Office ecosystem.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <Providers>
          <DashboardLayout>{children}</DashboardLayout>
        </Providers>
      </body>
    </html>
  );
}
