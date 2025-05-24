import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  InboxIcon,
  PaperAirplaneIcon,
  DocumentTextIcon,
  TrashIcon,
  FolderIcon,
  ExclamationCircleIcon // Importation de l'icône pour Spam
} from '@heroicons/react/24/outline';
import { cn } from '../../lib/utils';

type SidebarItemProps = {
  icon: React.ReactNode;
  label: string;
  to: string;
  count?: number;
  active?: boolean;
};

const SidebarItem = ({ icon, label, to, count, active = false }: SidebarItemProps) => {
  return (
    <Link
      to={to}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all",
        active
          ? "bg-aether-subtle text-aether-cosmic"
          : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
      )}
    >
      <div className="w-5 h-5">{icon}</div>
      <span>{label}</span>
      {count !== undefined && (
        <div className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-aether-primary px-1.5 text-xs font-medium text-white">
          {count}
        </div>
      )}
    </Link>
  );
};

const Sidebar = ({ isMobile, isOpen, onClose }: { isMobile?: boolean; isOpen?: boolean; onClose?: () => void }) => {
  const [folders, setFolders] = useState<string[]>([]); // État pour les dossiers dynamiques
  const [counts, setCounts] = useState({
    inbox: 0,
    sent: 0,
    drafts: 0,
    spam: 0,
    trash: 0,
  });

  // Fonction pour vérifier si une route est active
  const isRouteActive = (route: string): boolean => {
    return window.location.pathname === route;
  };

  // Variants pour les animations avec framer-motion
  const sidebarVariants = {
    open: { x: 0 },
    closed: { x: '-100%' },
  };

  // Récupérer les comptes dynamiques
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const response = await fetch('/api/v1/email-counts');
        const data = await response.json();
        setCounts({
          inbox: data.inbox,
          sent: data.sent,
          drafts: data.drafts,
          spam: data.spam,
          trash: data.trash,
        });
      } catch (error) {
        console.error("Erreur lors de la récupération du compte :", error);
      }
    };

    fetchCounts();
  }, []);

  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* Logo and branding */}
      <div className="flex items-center space-x-2 px-4 py-6">
        <div className="font-space-grotesk text-xl font-bold text-aether-cosmic dark:text-white">
          Aether Mail
        </div>
      </div>

      {/* Navigation items */}
      <nav className="flex-1 space-y-1 px-2">
        <SidebarItem
          icon={<InboxIcon />}
          label="Inbox"
          to="/inbox"
          count={counts.inbox} 
          active={isRouteActive('/inbox')}
        />
        <SidebarItem
          icon={<DocumentTextIcon />}
          label="Drafts"
          to="/drafts"
          count={counts.drafts} 
          active={isRouteActive('/drafts')}
        />
        <SidebarItem
          icon={<PaperAirplaneIcon />}
          label="Sent"
          to="/sent"
          count={counts.sent} 
          active={isRouteActive('/sent')}
        />
        <SidebarItem
          icon={<ExclamationCircleIcon />} 
          label="Spam"
          to="/spam"
          count={counts.spam}
          active={isRouteActive('/spam')}
        />
        <SidebarItem
          icon={<TrashIcon />}
          label="Trash"
          to="/trash"
          count={counts.trash} 
          active={isRouteActive('/trash')}
        />

        {/* Dynamic folders */}
        {folders.map((folder, index) => (
          <SidebarItem
            key={index}
            icon={<FolderIcon />}
            label={folder}
            to={`/${folder}`}
            active={isRouteActive(`/${folder}`)}
          />
        ))}
      </nav>
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
          className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg dark:bg-gray-900"
        >
          {sidebarContent}
        </motion.div>
      </>
    );
  }

  // Desktop view
  return (
    <div className="hidden w-64 flex-shrink-0 border-r border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900 md:block">
      {sidebarContent}
    </div>
  );
};

export default Sidebar;
