'use client';

import * as React from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Bell,
  User,
  Settings,
  Moon,
  Sun,
  LayoutDashboard,
  Inbox,
  Calendar,
  Users,
  CheckSquare,
  File,
  Bot,
  Rss,
  FolderTree,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface AppItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const apps: AppItem[] = [
  { title: 'Inbox', href: '/inbox', icon: Inbox },
  { title: 'Calendar', href: '/calendar', icon: Calendar },
  { title: 'Contacts', href: '/contacts', icon: Users },
  { title: 'Todo', href: '/todo', icon: CheckSquare },
  { title: 'Drive', href: '/drive', icon: File },
  { title: 'Newsletter', href: '/newsletter', icon: Rss },
  { title: 'Copilot', href: '/copilot', icon: Bot },
  { title: 'Org Explorer', href: '/org-explorer', icon: FolderTree },
];

interface HeaderProps extends React.HTMLAttributes<HTMLElement> {}

export function Header({ className, ...props }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [mounted, setMounted] = React.useState(false);
  const [appsMenuOpen, setAppsMenuOpen] = React.useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const isDark = mounted && theme === 'dark';

  return (
    <header
      className={cn(
        'flex items-center justify-between h-14 px-4 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 w-full',
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-2 w-48">
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setAppsMenuOpen(!appsMenuOpen)}
          >
            <LayoutDashboard className="h-5 w-5" />
          </Button>

          <AnimatePresence>
            {appsMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute top-full left-0 mt-2 w-64 bg-background border rounded-md shadow-lg z-50"
              >
                <div className="p-2">
                  <div className="text-sm font-semibold px-3 py-2 text-muted-foreground">
                    Applications
                  </div>
                  {apps.map((app) => {
                    const Icon = app.icon;
                    return (
                      <Link
                        key={app.href}
                        href={app.href}
                        target="_blank"
                        onClick={() => setAppsMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                      >
                        <Icon className="h-4 w-4" />
                        <span>{app.title}</span>
                      </Link>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <h1 className="text-lg font-semibold">Aether Mail</h1>
      </div>

      <div className="flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search... (Cmd+K)"
            className="pl-9 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="flex items-center gap-2 w-48 justify-end">
        <Button variant="ghost" size="icon" onClick={toggleTheme}>
          {mounted && isDark ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </Button>

        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
        </Button>

        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={() => setAccountMenuOpen(!accountMenuOpen)}
          >
            <Avatar className="h-8 w-8">
              <AvatarImage src="/avatars/1.png" alt="User" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
          </Button>

          <AnimatePresence>
            {accountMenuOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-56 bg-background border rounded-md shadow-lg z-50"
              >
                <div className="p-2">
                  <div className="font-semibold px-3 py-2">My Account</div>
                  <div className="border-t my-2" />
                  <Link
                    href="/profile"
                    onClick={() => setAccountMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-md text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                  >
                    <User className="h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                  <Link
                    href="/settings"
                    onClick={() => setAccountMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-md text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                  >
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                  <div className="border-t my-2" />
                  <button
                    onClick={() => setAccountMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-red-600 hover:bg-accent transition-colors w-full"
                  >
                    <span>Log out</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {accountMenuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setAccountMenuOpen(false)}
        />
      )}

      {appsMenuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setAppsMenuOpen(false)}
        />
      )}
    </header>
  );
}