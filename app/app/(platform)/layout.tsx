import type { Metadata } from "next";
import { Header } from "./_components/Header";
import { Sidebar } from "./_components/Sidebar";

export const metadata: Metadata = {
  title: "Aether Mail | The Ultimate Email Client for Aether Office",
  description:
    "Aether Mail - A lightweight, open-source email client built for privacy, speed, and seamless integration within the Aether Office ecosystem.",
};

export default function PlatformLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col h-screen">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <div className="flex-1 overflow-auto">{children}</div>
      </div>
    </div>
  );
}
