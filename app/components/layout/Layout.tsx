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
    <div className="layout-container flex h-screen">
      {/* Sidebar - mobile and desktop versions */}
      <Sidebar isMobile={true} isOpen={sidebarOpen} onClose={closeSidebar} />
      <Sidebar />

      {/* Main content area */}
      <div className="main-content flex flex-col">
        <Header
          toggleSidebar={toggleSidebar}
          toggleTheme={toggleTheme}
          isDarkMode={theme === "dark"}
          selectedEmail={selectedEmail}
          onReply={onReply}
          onForward={onForward}
          onDelete={onDelete}
        />

        <main className="flex-1 overflow-hidden">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
