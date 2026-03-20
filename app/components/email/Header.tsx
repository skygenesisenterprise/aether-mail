"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  File,
  Home,
  Monitor,
  HelpCircle,
  ChevronDown,
  Plus,
  Upload,
  FolderSync,
  Settings,
  Search,
  Bell,
  User,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface HeaderProps {
  className?: string;
}

interface MenuItem {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  shortcut?: string;
  divider?: boolean;
  onClick?: () => void;
}

interface MenuSection {
  id: string;
  label: string;
  items: MenuItem[];
}

const fileMenu: MenuSection = {
  id: "file",
  label: "File",
  items: [
    { label: "New Email", icon: Plus, shortcut: "Ctrl+N", onClick: () => console.log("New Email") },
    { label: "New Folder", onClick: () => console.log("New Folder") },
    { label: "Open", shortcut: "Ctrl+O", onClick: () => console.log("Open") },
    { divider: true, label: "" },
    { label: "Import", icon: Upload, onClick: () => console.log("Import") },
    { label: "Export", onClick: () => console.log("Export") },
    { divider: true, label: "" },
    { label: "Settings", icon: Settings, onClick: () => console.log("Settings") },
    { divider: true, label: "" },
    { label: "Sign Out", icon: LogOut, onClick: () => console.log("Sign Out") },
  ],
};

const homeMenu: MenuSection = {
  id: "home",
  label: "Home",
  items: [
    { label: "New Email", icon: Plus, shortcut: "Ctrl+N" },
    { label: "Sync Folder", icon: FolderSync },
    { divider: true, label: "" },
    { label: "Search", icon: Search, shortcut: "Ctrl+Shift+F" },
  ],
};

const displayMenu: MenuSection = {
  id: "display",
  label: "Display",
  items: [
    { label: "Compact View" },
    { label: "Comfortable View" },
    { label: "Single View" },
    { divider: true, label: "" },
    { label: "Reading Pane", shortcut: "Ctrl+Shift+P" },
    { label: "Conversations" },
  ],
};

const helpMenu: MenuSection = {
  id: "help",
  label: "Help",
  items: [
    { label: "Help Center", icon: HelpCircle },
    { label: "Keyboard Shortcuts" },
    { divider: true, label: "" },
    { label: "About Aether Mail" },
    { label: "Check for Updates" },
  ],
};

const menus: MenuSection[] = [fileMenu, homeMenu, displayMenu, helpMenu];

export function Header({ className }: HeaderProps) {
  const [activeMenu, setActiveMenu] = React.useState<string | null>(null);

  const handleMenuClick = (menuId: string) => {
    setActiveMenu(activeMenu === menuId ? null : menuId);
  };

  const handleItemClick = (item: MenuItem) => {
    item.onClick?.();
    setActiveMenu(null);
  };

  const handleClickOutside = () => {
    setActiveMenu(null);
  };

  return (
    <div
      className={cn(
        "flex items-center justify-between border-b bg-background px-4 py-2",
        className
      )}
    >
      <div className="flex items-center gap-1" onClick={handleClickOutside}>
        {menus.map((menu) => (
          <div key={menu.id} className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleMenuClick(menu.id);
              }}
              className={cn(
                "flex items-center gap-1 px-3 py-1.5 rounded-md text-sm transition-colors",
                activeMenu === menu.id
                  ? "bg-accent text-accent-foreground font-medium"
                  : "hover:bg-accent/50"
              )}
            >
              <span>{menu.label}</span>
              <ChevronDown className="h-3 w-3" />
            </button>

            <AnimatePresence>
              {activeMenu === menu.id && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full left-0 mt-1 min-w-[200px] bg-background border rounded-md shadow-lg py-1 z-50"
                  onClick={(e) => e.stopPropagation()}
                >
                  {menu.items.map((item, index) =>
                    item.divider ? (
                      <div key={`divider-${index}`} className="h-px bg-border my-1" />
                    ) : (
                      <button
                        key={item.label}
                        onClick={() => handleItemClick(item)}
                        className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-accent/50 transition-colors text-left"
                      >
                        <span className="flex items-center gap-2">
                          {item.icon && <item.icon className="h-4 w-4 text-muted-foreground" />}
                          {item.label}
                        </span>
                        {item.shortcut && (
                          <span className="text-xs text-muted-foreground">{item.shortcut}</span>
                        )}
                      </button>
                    )
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search..."
            className="h-8 w-64 pl-9 pr-3 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        <button className="p-2 rounded-md hover:bg-accent/50 transition-colors relative">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
        </button>

        <button className="p-2 rounded-md hover:bg-accent/50 transition-colors">
          <User className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
