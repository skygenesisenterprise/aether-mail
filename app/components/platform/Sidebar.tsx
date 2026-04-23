'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Inbox,
  Calendar,
  Users,
  File,
  Settings,
  CheckSquare,
  Bot,
  Rss,
  FolderTree,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { title: 'Inbox', href: '/inbox', icon: Inbox },
  { title: 'Calendar', href: '/calendar', icon: Calendar },
  { title: 'Contacts', href: '/contacts', icon: Users },
  { title: 'Todo', href: '/todo', icon: CheckSquare },
  { title: 'Drive', href: '/drive', icon: File },
  { title: 'Newsletter', href: '/newsletter', icon: Rss },
  { title: 'Copilot', href: '/copilot', icon: Bot },
  { title: 'Org Explorer', href: '/org-explorer', icon: FolderTree },
];

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className, ...props }: SidebarProps) {
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';

  return (
    <TooltipProvider delayDuration={0}>
      <div
        className={cn(
          'flex flex-col items-center w-16 bg-sidebar min-h-svh py-4',
          className
        )}
        {...props}
      >

        <nav className="flex flex-col items-center gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                  <Button
                    variant={isActive ? 'secondary' : 'ghost'}
                    size="icon"
                    asChild
                  >
                    <Link href={item.href}>
                      <Icon className="h-5 w-5" />
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">{item.title}</TooltipContent>
              </Tooltip>
            );
          })}
        </nav>

        <div className="flex-1" />

        <div className="mt-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" asChild>
                <Link href="/settings">
                  <Settings className="h-5 w-5" />
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Settings</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
}