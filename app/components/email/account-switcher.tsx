import * as React from "react";
import { Mail } from "lucide-react";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const providerIcons: Record<string, React.ReactNode> = {
  gmail: (
    <svg role="img" viewBox="0 0 24 24" className="h-4 w-4">
      <path
        d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"
        fill="currentColor"
      />
    </svg>
  ),
  vercel: (
    <svg role="img" viewBox="0 0 24 24" className="h-4 w-4">
      <path d="M24 22.525H0l12-21.05 12 21.05z" fill="currentColor" />
    </svg>
  ),
  icloud: (
    <svg role="img" viewBox="0 0 24 24" className="h-4 w-4">
      <path
        d="M13.762 4.29a6.51 6.51 0 0 0-5.669 3.332 3.571 3.571 0 0 0-1.558-.36 3.571 3.571 0 0 0-3.516 3A4.918 4.918 0 0 0 0 14.796a4.918 4.918 0 0 0 4.92 4.914 4.93 4.93 0 0 0 .617-.045h14.42c2.305-.272 4.041-2.258 4.043-4.589v-.009a4.594 4.594 0 0 0-3.727-4.508 6.51 6.51 0 0 0-6.511-6.27z"
        fill="currentColor"
      />
    </svg>
  ),
  outlook: (
    <svg role="img" viewBox="0 0 24 24" className="h-4 w-4">
      <path
        d="M24 8.761v6.478a1.5 1.5 0 0 1-.871 1.363l-12 7.636a1.5 1.5 0 0 1-1.742 0L0 16.602v-6.04l8.297 4.523a1.5 1.5 0 0 0 1.742 0L24 8.761z"
        fill="currentColor"
      />
    </svg>
  ),
  protonmail: (
    <svg role="img" viewBox="0 0 24 24" className="h-4 w-4">
      <path
        d="M21.75 8.375v7.625a1.75 1.75 0 0 1-1.75 1.75H4a1.75 1.75 0 0 1-1.75-1.75V8.375L12 22l9.75-13.625zM12 2.5L2.375 9.75h19.25L12 2.5z"
        fill="currentColor"
      />
    </svg>
  ),
  default: (
    <Mail className="h-4 w-4" />
  ),
};

const getProviderIcon = (email: string): React.ReactNode => {
  const domain = email.split("@")[1]?.toLowerCase() || "";
  
  if (domain.includes("gmail") || domain.includes("google")) {
    return providerIcons.gmail;
  }
  if (domain.includes("icloud") || domain.includes("me.com") || domain.includes("mac.com")) {
    return providerIcons.icloud;
  }
  if (domain.includes("outlook") || domain.includes("hotmail") || domain.includes("live") || domain.includes("msn")) {
    return providerIcons.outlook;
  }
  if (domain.includes("protonmail") || domain.includes("proton.me")) {
    return providerIcons.protonmail;
  }
  if (domain.includes("vercel") || domain.includes("now.sh")) {
    return providerIcons.vercel;
  }
  
  return providerIcons.default;
};

const getProviderFromEmail = (email: string): string => {
  const domain = email.split("@")[1]?.toLowerCase() || "";
  
  if (domain.includes("gmail") || domain.includes("google")) return "Gmail";
  if (domain.includes("icloud") || domain.includes("me.com") || domain.includes("mac.com")) return "iCloud";
  if (domain.includes("outlook") || domain.includes("hotmail") || domain.includes("live") || domain.includes("msn")) return "Outlook";
  if (domain.includes("protonmail") || domain.includes("proton.me")) return "Proton Mail";
  if (domain.includes("vercel") || domain.includes("now.sh")) return "Vercel";
  
  return "Email";
};

interface AccountSwitcherProps {
  isCollapsed: boolean;
  accounts?: {
    label: string;
    email: string;
    icon?: React.ReactNode;
  }[];
}

export function AccountSwitcher({ isCollapsed, accounts = [] }: AccountSwitcherProps) {
  const [selectedAccount, setSelectedAccount] = React.useState<string>(
    accounts[0]?.email || ""
  );

  const selected = accounts.find((account) => account.email === selectedAccount);

  const displayIcon = selected?.icon || getProviderIcon(selectedAccount);

  return (
    <Select defaultValue={selectedAccount} onValueChange={setSelectedAccount}>
      <SelectTrigger
        className={cn(
          "flex w-full items-center gap-2 [&>span]:line-clamp-1 [&>span]:flex [&>span]:w-full [&>span]:items-center [&>span]:gap-1 [&>span]:truncate [&_svg]:h-4 [&_svg]:w-4 [&_svg]:shrink-0",
          isCollapsed &&
            "flex h-9 w-9 shrink-0 items-center justify-center p-0 [&>span]:w-auto [&>svg]:hidden"
        )}
        aria-label="Select account"
      >
        <SelectValue placeholder="Select an account">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15 }}
            className="flex items-center gap-2"
          >
            {displayIcon}
            <span className={cn("ml-2", isCollapsed && "hidden")}>
              {selected?.label}
            </span>
          </motion.div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {accounts.map((account) => (
            <SelectItem key={account.email} value={account.email}>
              <motion.div
                whileHover={{ scale: 1.02, x: 4 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-3 [&_svg]:h-4 [&_svg]:w-4 [&_svg]:shrink-0 [&_svg]:text-foreground"
              >
                {account.icon || getProviderIcon(account.email)}
                <span>{account.email}</span>
              </motion.div>
            </SelectItem>
          ))}
        </motion.div>
      </SelectContent>
    </Select>
  );
}
