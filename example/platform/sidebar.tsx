"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  AppWindow,
  Key,
  Users,
  ScrollText,
  Activity,
  Shield,
  Globe,
  Smartphone,
  ChevronRight,
  Database,
  Mail,
  Fingerprint,
  Lock,
  ExternalLink,
  Bot,
  Zap,
  AlertTriangle,
  FormInput,
  Library,
  Bell,
  KeyRound,
  UsersRound,
  Orbit,
  Layout,
  Link2,
  Network,
  Palette,
  Cpu,
  BarChart3,
  FileText,
  Siren,
  Gauge,
  Code2,
  Webhook,
  Clapperboard,
  PlugZap,
  Package,
  Puzzle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
  items?: NavItem[];
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Activity",
    href: "/dashboard/activity",
    icon: Gauge,
  },
  {
    title: "Agents",
    href: "/dashboard/agents",
    icon: Bot,
  },
  {
    title: "Applications",
    href: "/dashboard/applications",
    icon: AppWindow,
    items: [
      { title: "Applications", href: "/dashboard/applications", icon: Layout },
      { title: "APIs", href: "/dashboard/applications/apis", icon: Code2 },
      {
        title: "SSO Integrations",
        href: "/dashboard/applications/externalapps",
        icon: ExternalLink,
      },
    ],
  },
  {
    title: "Connections",
    href: "/dashboard/connection/database",
    icon: Link2,
    items: [
      { title: "Database", href: "/dashboard/connection/database", icon: Database },
      { title: "Social", href: "/dashboard/connection/social", icon: Fingerprint },
      { title: "Enterprise (SAML)", href: "/dashboard/connection/enterprise", icon: Lock },
      { title: "Passwordless", href: "/dashboard/connection/passwordless", icon: Mail },
      {
        title: "Auth Profiles",
        href: "/dashboard/connection/authentication-profiles",
        icon: KeyRound,
      },
    ],
  },
  {
    title: "Organizations",
    href: "/dashboard/organizations",
    icon: Network,
  },
  {
    title: "User Management",
    href: "/dashboard/users",
    icon: Users,
    items: [
      { title: "Users", href: "/dashboard/users", icon: UsersRound },
      { title: "Roles", href: "/dashboard/users/roles", icon: Shield },
    ],
  },
  {
    title: "Branding",
    href: "/dashboard/branding/universal-login",
    icon: Palette,
    items: [
      { title: "Universal Login", href: "/dashboard/branding/universal-login", icon: Globe },
      { title: "Custom Domain", href: "/dashboard/branding/custom-domain", icon: Network },
      { title: "Templates", href: "/dashboard/branding/templates", icon: Smartphone },
      { title: "Custom Login", href: "/dashboard/branding/custom-login", icon: Layout },
    ],
  },
  {
    title: "Security",
    href: "/dashboard/security/monitoring",
    icon: Siren,
    items: [
      { title: "Monitoring", href: "/dashboard/security/monitoring", icon: Activity },
      { title: "MFA", href: "/dashboard/security/mfa", icon: KeyRound },
      {
        title: "Attack Protection",
        href: "/dashboard/security/attack-protection",
        icon: AlertTriangle,
      },
      { title: "Analytics", href: "/dashboard/security/analytics", icon: BarChart3 },
    ],
  },
  {
    title: "Actions",
    href: "/dashboard/actions/library",
    icon: Zap,
    items: [
      { title: "Library", href: "/dashboard/actions/library", icon: Library },
      { title: "Triggers", href: "/dashboard/actions/triggers", icon: Webhook },
      { title: "Forms", href: "/dashboard/actions/forms", icon: FormInput },
    ],
  },
  {
    title: "Event Streams",
    href: "/dashboard/event",
    icon: PlugZap,
    badge: "Early",
  },
  {
    title: "Monitoring",
    href: "/dashboard/monitoring/logs",
    icon: FileText,
    items: [
      { title: "Logs", href: "/dashboard/monitoring/logs", icon: ScrollText },
      { title: "Action Logs", href: "/dashboard/monitoring/action-logs", icon: Clapperboard },
      { title: "Logs Stream", href: "/dashboard/monitoring/logs-stream", icon: Bell },
    ],
  },
  {
    title: "Marketplace",
    href: "/dashboard/marketplace",
    icon: Package,
  },
  {
    title: "Extensions",
    href: "/dashboard/extension",
    icon: Puzzle,
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Cpu,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" variant="sidebar">
      <SidebarHeader className="py-4">
        <Link href="/dashboard" className="flex items-center gap-2 px-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Shield className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">Aether Identity </span>
            <span className="text-xs text-muted-foreground">Sky Genesis Enterprise</span>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                {item.items && item.items.length > 0 ? (
                  <CollapsibleMenuItem item={item} pathname={pathname} />
                ) : (
                  <SidebarMenuButton asChild isActive={isActiveGroup(pathname, item.href)}>
                    <Link href={item.href} className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        <item.icon
                          className={cn("h-4 w-4", isActive(pathname, item.href) && "text-primary")}
                        />
                        <span
                          className={cn(
                            isActive(pathname, item.href) && "font-medium text-primary"
                          )}
                        >
                          {item.title}
                        </span>
                      </div>
                      {item.badge && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  </SidebarMenuButton>
                )}
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

function CollapsibleMenuItem({ item, pathname }: { item: NavItem; pathname: string }) {
  const isGroupActive = isActiveGroup(pathname, item.href);
  const [isOpen, setIsOpen] = React.useState(false);

  const hasActiveChild = React.useMemo(() => {
    if (!item.items) return false;
    return item.items.some((subItem) => isActive(pathname, subItem.href));
  }, [item.items, pathname]);

  React.useEffect(() => {
    if (isGroupActive || hasActiveChild) {
      setIsOpen(true);
    }
  }, [isGroupActive, hasActiveChild]);

  const hasSubItems = item.items && item.items.length > 0;

  return (
    <>
      {hasSubItems ? (
        <SidebarMenuButton asChild isActive={isGroupActive}>
          <button
            type="button"
            className="flex w-full items-center justify-between"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsOpen(!isOpen);
            }}
          >
            <div className="flex items-center gap-2">
              <item.icon className={cn("h-4 w-4", isGroupActive && "text-primary")} />
              <span className={cn(isGroupActive && "font-medium text-primary")}>{item.title}</span>
            </div>
            <motion.div
              animate={{ rotate: isOpen ? 90 : 0 }}
              transition={{ duration: 0.2 }}
              className="h-4 w-4"
            >
              <ChevronRight className="h-4 w-4" />
            </motion.div>
          </button>
        </SidebarMenuButton>
      ) : (
        <SidebarMenuButton asChild isActive={isGroupActive}>
          <Link href={item.href} className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <item.icon
                className={cn("h-4 w-4", isActive(pathname, item.href) && "text-primary")}
              />
              <span className={cn(isActive(pathname, item.href) && "font-medium text-primary")}>
                {item.title}
              </span>
            </div>
            {item.badge && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">
                {item.badge}
              </span>
            )}
          </Link>
        </SidebarMenuButton>
      )}
      <AnimatePresence>
        {isOpen && item.items && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <SidebarMenuSub>
              {item.items.map((subItem) => (
                <SidebarMenuSubItem key={subItem.href}>
                  <SidebarMenuSubButton asChild isActive={isActive(pathname, subItem.href)}>
                    <Link href={subItem.href} className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        <subItem.icon
                          className={cn(
                            "h-4 w-4",
                            isActive(pathname, subItem.href) && "text-primary"
                          )}
                        />
                        <span
                          className={cn(
                            isActive(pathname, subItem.href) && "text-primary font-medium"
                          )}
                        >
                          {subItem.title}
                        </span>
                      </div>
                      {subItem.badge && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">
                          {subItem.badge}
                        </span>
                      )}
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              ))}
            </SidebarMenuSub>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function isActive(pathname: string, href: string): boolean {
  return pathname === href;
}

function isActiveGroup(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}
