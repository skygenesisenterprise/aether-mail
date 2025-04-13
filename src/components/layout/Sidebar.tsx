import type React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  InboxIcon,
  PaperAirplaneIcon,
  DocumentTextIcon,
  TrashIcon,
  Cog6ToothIcon,
  LockClosedIcon,
  ShieldCheckIcon,
  UserIcon
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
  // Active route is hardcoded for now, but would typically come from a router hook
  const activeRoute = '/inbox';

  // Function to check if a route is active
  const isRouteActive = (route: string): boolean => {
    return activeRoute === route;
  };

  // Animation variants for mobile sidebar
  const sidebarVariants = {
    open: { x: 0 },
    closed: { x: '-100%' },
  };

  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* Logo and branding */}
      <div className="flex items-center space-x-2 px-4 py-6">
        <div className="cosmic-gradient h-8 w-8 rounded-full" />
        <div className="font-space-grotesk text-xl font-bold text-aether-cosmic dark:text-white">
          Aether Mail
        </div>
      </div>

      {/* Compose button */}
      <button className="mx-3 my-4 flex items-center justify-center gap-2 rounded-lg bg-aether-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-aether-accent focus:outline-none focus:ring-2 focus:ring-aether-primary focus:ring-offset-2 dark:focus:ring-offset-gray-900">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        Compose
      </button>

      {/* Navigation */}
      <nav className="mt-2 flex flex-1 flex-col px-3">
        <div className="space-y-1">
          <SidebarItem
            icon={<InboxIcon />}
            label="Inbox"
            to="/inbox"
            count={24}
            active={isRouteActive('/inbox')}
          />
          <SidebarItem
            icon={<PaperAirplaneIcon />}
            label="Sent"
            to="/sent"
            active={isRouteActive('/sent')}
          />
          <SidebarItem
            icon={<DocumentTextIcon />}
            label="Drafts"
            to="/drafts"
            count={3}
            active={isRouteActive('/drafts')}
          />
          <SidebarItem
            icon={<TrashIcon />}
            label="Trash"
            to="/trash"
            active={isRouteActive('/trash')}
          />
        </div>

        <div className="mt-6">
          <h3 className="px-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Security
          </h3>
          <div className="mt-2 space-y-1">
            <SidebarItem
              icon={<LockClosedIcon />}
              label="Encrypted"
              to="/encrypted"
              active={isRouteActive('/encrypted')}
            />
            <SidebarItem
              icon={<ShieldCheckIcon />}
              label="Protected"
              to="/protected"
              active={isRouteActive('/protected')}
            />
          </div>
        </div>

        <div className="mt-auto mb-4 space-y-1">
          <SidebarItem
            icon={<Cog6ToothIcon />}
            label="Settings"
            to="/settings"
            active={isRouteActive('/settings')}
          />
          <SidebarItem
            icon={<UserIcon />}
            label="Profile"
            to="/profile"
            active={isRouteActive('/profile')}
          />
        </div>
      </nav>

      {/* Storage indicator */}
      <div className="border-t border-gray-200 px-4 py-4 dark:border-gray-700">
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Storage used</span>
            <span>42% of 15 GB</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
            <div className="h-full w-[42%] rounded-full cosmic-gradient" />
          </div>
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
