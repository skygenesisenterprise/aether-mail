import type React from "react";
import { useRouter, usePathname } from "next/navigation";
import { cn } from "../lib/utils";
import { Button } from "./ui/button";
import {
  Mail,
  Calendar,
  Users,
  FileText,
  CheckSquare,
  HardDrive,
} from "lucide-react";

interface AppItem {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  isActive?: boolean;
}

interface SidebarNavProps {
  className?: string;
  orientation?: "horizontal" | "vertical";
}

export default function SidebarNav({
  className,
  orientation = "vertical",
}: SidebarNavProps) {
  const router = useRouter();
  const pathname = usePathname();

  const apps: AppItem[] = [
    {
      id: "mail",
      name: "Mail",
      icon: Mail,
      path: "/",
      isActive: pathname === "/" || pathname.startsWith("/mail"),
    },
    {
      id: "calendar",
      name: "Calendar",
      icon: Calendar,
      path: "/calendar",
      isActive: pathname === "/calendar",
    },
    {
      id: "contacts",
      name: "Contacts",
      icon: Users,
      path: "/contacts",
      isActive: pathname === "/contacts",
    },
    {
      id: "notes",
      name: "Notes",
      icon: FileText,
      path: "/notes",
      isActive: pathname === "/notes",
    },
    {
      id: "tasks",
      name: "Tasks",
      icon: CheckSquare,
      path: "/tasks",
      isActive: pathname === "/tasks",
    },
    {
      id: "drive",
      name: "Drive",
      icon: HardDrive,
      path: "/drive",
      isActive: pathname === "/drive",
    },
  ];

  const handleAppClick = (app: AppItem) => {
    router.push(app.path);
  };

  const baseClasses = cn(
    "flex",
    orientation === "vertical"
      ? "flex-col space-y-2 p-2"
      : "flex-row space-x-1 p-1",
  );

  return (
    <div
      className={cn("bg-card border-r border-border", baseClasses, className)}
    >
      {apps.map((app) => {
        const Icon = app.icon;
        const isActive = app.isActive;

        return (
          <Button
            key={app.id}
            variant={isActive ? "secondary" : "ghost"}
            size={orientation === "vertical" ? "icon" : "icon-sm"}
            onClick={() => handleAppClick(app)}
            className={cn(
              "relative group transition-all duration-200",
              isActive &&
                "bg-primary/10 text-primary border-l-2 border-primary",
              !isActive && "hover:bg-muted hover:text-foreground",
              orientation === "vertical"
                ? "w-full justify-start"
                : "justify-center",
            )}
            title={app.name}
          >
            <Icon className="size-5" />

            {/* Tooltip */}
            <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-sm rounded-md shadow-md border border-border opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
              {app.name}
            </div>
          </Button>
        );
      })}
    </div>
  );
}
