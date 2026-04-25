'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Mail,
  CalendarDays,
  Users,
  HardDrive,
  ListTodo,
  MessageSquareMore,
  MessagesSquare,
  Rss,
  Workflow,
  MessageCircleCode,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/components/ui/use-mobile';

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { title: 'Mail', href: '/inbox', icon: Mail },
  { title: 'Calendar', href: '/calendar', icon: CalendarDays },
  { title: 'Todo', href: '/todo', icon: ListTodo },
  { title: 'Drive', href: '/drive', icon: HardDrive },
  { title: 'More', href: '/more', icon: MessageSquareMore },
];

interface MobileBottomNavProps extends React.HTMLAttributes<HTMLDivElement> {}

export function MobileBottomNav({ className, ...props }: MobileBottomNavProps) {
  const pathname = usePathname();
  const [moreMenuOpen, setMoreMenuOpen] = React.useState(false);

  const expandedItems: NavItem[] = [
    { title: 'Meet', href: '/meet', icon: MessagesSquare },
    { title: 'Contacts', href: '/contacts', icon: Users },
    { title: 'RSS', href: '/newsletter', icon: Rss },
    { title: 'Workflow', href: '/workflow', icon: Workflow },
    { title: 'Copilot', href: '/copilot', icon: MessageCircleCode },
  ];

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/');
  };

  const displayItems = navItems.map((item) => {
    if (item.title === 'More') {
      return {
        ...item,
        active: expandedItems.some((i) => isActive(i.href)),
      };
    }
    return {
      ...item,
      active: isActive(item.href),
    };
  });

  return (
    <div
      className={cn(
        'fixed bottom-0 left-0 right-0 bg-background border-t z-50 pb-safe',
        className
      )}
      {...props}
    >
      <nav className="flex items-center justify-around h-16">
        {displayItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center flex-1 h-full py-2 transition-colors',
                item.active
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs mt-1">{item.title}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}