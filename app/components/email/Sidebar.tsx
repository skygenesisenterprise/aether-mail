import * as React from "react";
import {
  Inbox,
  Calendar,
  Bot,
  Users,
  CheckSquare,
  FileText,
  Network,
  HardDrive,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
}

const sidebarItems: SidebarItem[] = [
  { icon: Inbox, label: "Inbox", href: "/inbox" },
  { icon: Calendar, label: "Calendar", href: "/calendar" },
  { icon: Bot, label: "CoPilot", href: "/copilot" },
  { icon: Users, label: "Contacts", href: "/contacts" },
  { icon: CheckSquare, label: "ToDo", href: "/todo" },
  { icon: FileText, label: "Newsletter", href: "/newsletter" },
  { icon: Network, label: "Org Explorer", href: "/org-explorer" },
  { icon: HardDrive, label: "Drive", href: "/drive" },
];

export function Sidebar() {
  return (
    <aside className="w-16 border-r bg-background h-full">
      <nav className="flex flex-col items-center py-4 gap-4">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          return (
            <a
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center justify-center w-10 h-10 rounded-md text-sm font-medium transition-colors",
                "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
              title={item.label}
            >
              <Icon className="h-5 w-5" />
            </a>
          );
        })}
      </nav>
    </aside>
  );
}
