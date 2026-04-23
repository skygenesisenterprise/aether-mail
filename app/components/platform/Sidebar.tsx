'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Mail,
  CalendarDays,
  Users,
  HardDrive,
  Settings,
  ListTodo,
  MessageSquareMore,
  Rss,
  Building2,
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
  { title: 'Mail', href: '/inbox', icon: Mail },
  { title: 'Calendar', href: '/calendar', icon: CalendarDays },
  { title: 'Copilot', href: '/copilot', icon: MessageSquareMore },
  { title: 'Contacts', href: '/contacts', icon: Users },
  { title: 'Todo', href: '/todo', icon: ListTodo },
  { title: 'Flux RSS', href: '/newsletter', icon: Rss },
  { title: 'Organization', href: '/organization', icon: Building2 },
  { title: 'Drive', href: '/drive', icon: HardDrive },
];

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className, ...props }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/');
  };

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
            const active = isActive(item.href);
            return (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                  <Button
                    variant={active ? 'secondary' : 'ghost'}
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