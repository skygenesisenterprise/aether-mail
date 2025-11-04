import type React from "react";
import { useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import Sidebar from "./Sidebar";
import Header from "./Header";

interface LayoutProps {
  children: React.ReactNode;
  selectedEmail?: any;
  onReply?: (email: any) => void;
  onForward?: (email: any) => void;
  onDelete?: (email: any) => void;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  selectedEmail,
  onReply,
  onForward,
  onDelete,
}) => {
  const { theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="flex h-screen relative overflow-hidden">
      {/* Multi-layer animated background */}
      <div className="absolute inset-0">
        {/* Base gradient layer */}
        <div className="absolute inset-0 bg-gradient-to-br from-glass-primary/10 via-glass-secondary/20 to-glass-accent/10 animate-gradient-shift" />

        {/* Parallax layer 1 - slow */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 -left-1/4 w-1/2 h-1/2 bg-glass-primary/20 rounded-full blur-3xl animate-float-slow" />
          <div className="absolute bottom-0 -right-1/4 w-1/2 h-1/2 bg-glass-secondary/20 rounded-full blur-3xl animate-float-slow-reverse" />
        </div>

        {/* Parallax layer 2 - medium */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 -right-1/3 w-1/3 h-1/3 bg-glass-accent/15 rounded-full blur-2xl animate-float-medium" />
          <div className="absolute bottom-1/4 -left-1/3 w-1/3 h-1/3 bg-glass-primary/15 rounded-full blur-2xl animate-float-medium-reverse" />
        </div>

        {/* Animated grid overlay */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5 animate-pulse-slow" />
      </div>

      {/* Glass overlay for depth */}
      <div className="absolute inset-0 glass-backdrop" />

      {/* Sidebar - mobile and desktop versions */}
      <Sidebar isMobile={true} isOpen={sidebarOpen} onClose={closeSidebar} />
      <Sidebar />

      {/* Main content area with glass container */}
      <div className="relative flex flex-1 flex-col overflow-hidden">
        <Header
          toggleSidebar={toggleSidebar}
          toggleTheme={toggleTheme}
          isDarkMode={theme === "dark"}
          selectedEmail={selectedEmail}
          onReply={onReply}
          onForward={onForward}
          onDelete={onDelete}
        />

        <main className="flex-1 overflow-hidden relative">
          {/* Glass content wrapper */}
          <div className="absolute inset-0 glass-content-wrapper">
            {children}
          </div>
        </main>
      </div>

      {/* Ambient light effects */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-glass-primary/10 rounded-full blur-3xl animate-pulse-glow pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-glass-secondary/10 rounded-full blur-3xl animate-pulse-glow pointer-events-none animation-delay-2000" />
    </div>
  );
};

export default Layout;
