import type React from "react";
import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  InboxIcon,
  PaperAirplaneIcon,
  TrashIcon,
  ExclamationCircleIcon, // Importation de l'icône pour Junk
} from "@heroicons/react/24/outline";
import { cn } from "../../lib/utils";

type SidebarItemProps = {
  icon: React.ReactNode;
  label: string;
  to: string;
  count?: number;
  active?: boolean;
};

const SidebarItem = ({
  icon,
  label,
  to,
  count,
  active = false,
}: SidebarItemProps) => {
  return (
    <Link
      to={to}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all hover:bg-proton-dark-tertiary",
        active
          ? "bg-proton-primary/10 text-proton-primary font-medium border-r-2 border-proton-primary"
          : "text-proton-text-secondary hover:text-proton-text",
      )}
    >
      <div className="w-5 h-5 flex-shrink-0 text-proton-text-muted">{icon}</div>
      <span className="truncate">{label}</span>
      {count !== undefined && count > 0 && (
        <div className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-proton-primary px-1.5 text-xs font-medium text-white">
          {count}
        </div>
      )}
    </Link>
  );
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
        });
      } catch (error) {
        console.error("Erreur lors de la récupération du compte :", error);
      }
    };

    fetchCounts();
  }, []);

  const sidebarContent = (
    <div className="flex h-full flex-col bg-proton-dark border-r border-proton-border shadow-sm">
      {/* Navigation sections */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Favorites section */}
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-proton-text-muted uppercase tracking-wider mb-3 px-1">
            Favorites
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

        {/* All folders section */}
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-proton-text-muted uppercase tracking-wider mb-3 px-1">
            Folders
          </h3>
          <nav className="space-y-1">
            <SidebarItem
              icon={<PaperAirplaneIcon />}
              label="Sent"
              to="/sent"
              count={counts.sent}
              active={isRouteActive("/sent")}
            />
            <SidebarItem
              icon={<ExclamationCircleIcon />}
              label="Junk"
              to="/junk"
              count={counts.junk}
              active={isRouteActive("/junk")}
            />
            <SidebarItem
              icon={<TrashIcon />}
              label="Deleted Item"
              to="/deleted"
              count={counts.deleted}
              active={isRouteActive("/deleted")}
            />
          </nav>
        </div>
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
          className="fixed inset-y-0 left-0 z-50 w-64 bg-proton-dark shadow-xl border-r border-proton-border"
        >
          {sidebarContent}
        </motion.div>
      </>
    );
  }

  // Desktop view
  return (
    <div className="hidden w-64 flex-shrink-0 bg-white md:block">
      {sidebarContent}
    </div>
  );
};

export default Sidebar;
