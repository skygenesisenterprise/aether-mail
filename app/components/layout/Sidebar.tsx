import type React from "react";
import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  InboxIcon,
  PaperAirplaneIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  FolderIcon,
  CalendarIcon,
  TagIcon,
  ArchiveBoxIcon,
  DocumentTextIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import { cn } from "../../lib/utils";

type SidebarItemProps = {
  icon: React.ReactNode;
  label: string;
  to?: string;
  count?: number;
  active?: boolean;
  hasSubfolders?: boolean;
  isExpanded?: boolean;
  onToggle?: () => void;
  children?: React.ReactNode;
};

const SidebarItem = ({
  icon,
  label,
  to,
  count,
  active = false,
  hasSubfolders = false,
  isExpanded = false,
  onToggle,
  children,
}: SidebarItemProps) => {
  const content = (
    <>
      <div
        className={cn(
          "flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-all duration-200 cursor-pointer",
          "hover:bg-gray-800",
          active
            ? "bg-gray-800 text-blue-400 border-l-2 border-blue-500"
            : "text-secondary",
        )}
      >
        {hasSubfolders && (
          <button
            onClick={onToggle}
            className="w-4 h-4 flex-shrink-0 text-tertiary hover:text-secondary transition-colors"
          >
            {isExpanded ? (
              <ChevronDownIcon className="w-4 h-4" />
            ) : (
              <ChevronRightIcon className="w-4 h-4" />
            )}
          </button>
        )}
        {!hasSubfolders && <div className="w-4 h-4 flex-shrink-0" />}
        <div className="w-5 h-5 flex-shrink-0">{icon}</div>
        <span className="truncate font-medium">{label}</span>
        {count !== undefined && count > 0 && (
          <div className="ml-auto flex h-6 min-w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
            {count}
          </div>
        )}
      </div>
      {hasSubfolders && isExpanded && children && (
        <div className="ml-4 mt-2 space-y-1">{children}</div>
      )}
    </>
  );

  if (to) {
    return (
      <Link to={to} className="block transition-colors">
        {content}
      </Link>
    );
  }

  return <div className="block transition-colors">{content}</div>;
};

const Sidebar = ({
  isMobile,
  isOpen,
  onClose,
}: {
  isMobile?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
}) => {
  const { folder } = useParams<{ folder: string }>();
  const [counts, setCounts] = useState({
    inbox: 0,
    sent: 0,
    junk: 0,
    deleted: 0,
    drafts: 0,
    archive: 0,
  });
  const [expandedFolders, setExpandedFolders] = useState({
    folders: true,
    categories: true,
  });

  // Fonction pour vérifier si une route est active
  const isRouteActive = (route: string): boolean => {
    return `/${folder}` === route;
  };

  // Variants pour les animations avec framer-motion
  const sidebarVariants = {
    open: { x: 0 },
    closed: { x: "-100%" },
  };

  // Récupérer les comptes
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const response = await fetch("/api/v1/emails/stats");
        const data = await response.json();
        setCounts({
          inbox: data.folders?.inbox?.unread || 0,
          sent: data.folders?.sent?.unread || 0,
          junk: data.folders?.trash?.unread || 0, // Using trash as junk for now
          deleted: data.folders?.trash?.unread || 0,
          drafts: data.folders?.drafts?.unread || 0,
          archive: data.folders?.archive?.unread || 0,
        });
      } catch (error) {
        console.error("Erreur lors de la récupération du compte :", error);
      }
    };

    fetchCounts();
  }, []);

  const toggleFolder = (folder: keyof typeof expandedFolders) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [folder]: !prev[folder],
    }));
  };

  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <svg
              className="w-6 h-6 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-bold text-primary">Aether Mail</h2>
            <p className="text-xs text-tertiary">Secure Email Client</p>
          </div>
        </div>
      </div>

      {/* Navigation sections */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Quick Access */}
        <div>
          <h3 className="text-xs font-semibold text-tertiary uppercase tracking-wider mb-4">
            Quick Access
          </h3>
          <nav className="space-y-1">
            <SidebarItem
              icon={<InboxIcon />}
              label="Inbox"
              to="/inbox"
              count={counts.inbox}
              active={isRouteActive("/inbox")}
            />
          </nav>
        </div>

        {/* Folders */}
        <div>
          <SidebarItem
            icon={<FolderIcon />}
            label="Folders"
            hasSubfolders={true}
            isExpanded={expandedFolders.folders}
            onToggle={() => toggleFolder("folders")}
            active={false}
          />
          {expandedFolders.folders && (
            <div className="ml-6 mt-2 space-y-1">
              <SidebarItem
                icon={<InboxIcon />}
                label="Inbox"
                to="/inbox"
                count={counts.inbox}
                active={isRouteActive("/inbox")}
              />
              <SidebarItem
                icon={<DocumentTextIcon />}
                label="Drafts"
                to="/drafts"
                count={counts.drafts}
                active={isRouteActive("/drafts")}
              />
              <SidebarItem
                icon={<PaperAirplaneIcon />}
                label="Sent Items"
                to="/sent"
                count={counts.sent}
                active={isRouteActive("/sent")}
              />
              <SidebarItem
                icon={<ArchiveBoxIcon />}
                label="Archive"
                to="/archive"
                count={counts.archive}
                active={isRouteActive("/archive")}
              />
              <SidebarItem
                icon={<ExclamationTriangleIcon />}
                label="Junk Email"
                to="/junk"
                count={counts.junk}
                active={isRouteActive("/junk")}
              />
              <SidebarItem
                icon={<TrashIcon />}
                label="Deleted Items"
                to="/deleted"
                count={counts.deleted}
                active={isRouteActive("/deleted")}
              />
            </div>
          )}
        </div>

        {/* Categories */}
        <div>
          <SidebarItem
            icon={<TagIcon />}
            label="Categories"
            hasSubfolders={true}
            isExpanded={expandedFolders.categories}
            onToggle={() => toggleFolder("categories")}
            active={false}
          />
          {expandedFolders.categories && (
            <div className="ml-6 mt-2 space-y-1">
              <SidebarItem
                icon={<div className="w-3 h-3 rounded-full bg-red-500" />}
                label="Important"
                to="/category/important"
                active={isRouteActive("/category/important")}
              />
              <SidebarItem
                icon={<div className="w-3 h-3 rounded-full bg-blue-500" />}
                label="Work"
                to="/category/work"
                active={isRouteActive("/category/work")}
              />
              <SidebarItem
                icon={<div className="w-3 h-3 rounded-full bg-green-500" />}
                label="Personal"
                to="/category/personal"
                active={isRouteActive("/category/personal")}
              />
              <SidebarItem
                icon={<div className="w-3 h-3 rounded-full bg-purple-500" />}
                label="Projects"
                to="/category/projects"
                active={isRouteActive("/category/projects")}
              />
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-800">
        <button className="btn-secondary w-full text-sm">
          <svg
            className="w-4 h-4 inline mr-2"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
          </svg>
          New Folder
        </button>
      </div>
    </div>
  );

  // For mobile view, wrap in a motion div for animations
  if (isMobile) {
    return (
      <>
        {/* Backdrop for mobile */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black"
            onClick={onClose}
          />
        )}

        {/* Mobile sidebar */}
        <motion.div
          initial="closed"
          animate={isOpen ? "open" : "closed"}
          variants={sidebarVariants}
          transition={{ type: "spring", bounce: 0, duration: 0.4 }}
          className="fixed inset-y-0 left-0 z-50 w-64 surface-primary border-r border-gray-800 shadow-xl"
        >
          {sidebarContent}
        </motion.div>
      </>
    );
  }

  // Desktop view
  return (
    <div className="hidden w-72 flex-shrink-0 surface-primary border-r border-gray-800 md:block">
      {sidebarContent}
    </div>
  );
};

export default Sidebar;
