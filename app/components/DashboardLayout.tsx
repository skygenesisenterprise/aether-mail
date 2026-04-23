"use client";

import { createContext, useContext, useState } from "react";
import { usePathname } from "next/navigation";
import { redirect } from "next/navigation";

interface Owner {
  type: "user" | "organization";
  username: string;
  name?: string;
  avatarUrl?: string;
  capabilities?: {
    teams?: boolean;
    people?: boolean;
    insights?: boolean;
    sponsoring?: boolean;
  };
}

interface DashboardLayoutProps {
  children: React.ReactNode;
}

interface OwnerHeaderContextType {
  owner: Owner | null;
  setOwner: (owner: Owner | null) => void;
}

const OwnerHeaderContext = createContext<OwnerHeaderContextType>({
  owner: null,
  setOwner: () => {},
});

export function useOwnerHeader() {
  return useContext(OwnerHeaderContext);
}

const publicRoutes = ["/login", "/register", "/forgot", "/oauth"];

const shouldShowSidebar = (pathname: string): boolean => {
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return false;
  }

  if (pathname === "/") {
    return false;
  }

  return true;
};

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const showSidebar = shouldShowSidebar(pathname);
  const [owner, setOwner] = useState<Owner | null>(null);

  if (!showSidebar) {
    return <div className="min-h-screen">{children}</div>;
  }

  return (
    <OwnerHeaderContext.Provider value={{ owner, setOwner }}>
      <div className="flex min-h-screen bg-slate-950">
        <div className="flex-1 flex flex-col">
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </OwnerHeaderContext.Provider>
  );
}
