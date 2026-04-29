"use client";

import * as React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { AuthGuard } from "@/components/AuthGuard";
import { emailApi } from "@/lib/api/email";
import { useAuth } from "@/context/AuthContext";
import type { Email, FolderListResponse } from "@/lib/api/email";
import { cleanEmailText } from "@/lib/email-text-cleaner";
import { toast } from "sonner";
import { MailPlus, RefreshCw } from "lucide-react";

const MailComponent = dynamic(
  () => import("@/components/email/mail").then((mod) => mod.Mail),
  {
    ssr: false,
  }
);

interface MailItem {
  id: string;
  name: string;
  email: string;
  subject: string;
  text: string;
  html?: string;
  date: string;
  read: boolean;
  starred?: boolean;
  labels: string[];
  folderId?: string;
}

async function fetchEmails(accountId: string): Promise<MailItem[]> {
  const emailResponse = await emailApi.getEmails(accountId, { limit: 1000 });
  if (!emailResponse.success || !emailResponse.data) {
    throw new Error(emailResponse.error || "Failed to load emails");
  }

  return (emailResponse.data.emails || []).map((email: Email): MailItem => {
    let fromEmail = "";
    let fromName = "";

    if (email.from) {
      fromEmail = email.from.email || "";
      fromName = email.from.name || fromEmail.split("@")[0] || "Unknown";
    }

    const textContent = email.body || email.preview || "";
    const cleanedText = cleanEmailText(textContent);

    return {
      id: email.id,
      name: fromName,
      email: fromEmail,
      subject: email.subject || "(No subject)",
      text: cleanedText,
      html: email.body_html,
      date: email.date || new Date().toISOString(),
      read: email.isRead ?? false,
      starred: email.isFlagged ?? false,
      labels: [],
      folderId: email.folderId,
    };
  });
}

async function fetchFolderStatus(accountId: string): Promise<FolderListResponse> {
  const response = await emailApi.getFolders(accountId);
  if (!response.success || !response.data) {
    throw new Error(response.error || "Failed to load folders");
  }
  return response;
}

export default function InboxPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const previousTotalRef = React.useRef<number>(0);
  const [isSyncing, setIsSyncing] = React.useState(false);
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const accounts = React.useMemo(() => {
    if (!user) return [];
    return [
      {
        label: user.name || user.email.split("@")[0],
        email: user.email,
        icon: null,
      },
    ];
  }, [user]);

  const accountId = user?.id || "";
  const accountEmail = accounts[0]?.email;

  // Heartbeat: poll folder status every 10 seconds to detect changes quickly
  const { data: folderStatus } = useQuery({
    queryKey: ["folder-status", accountId],
    queryFn: () => fetchFolderStatus(accountId),
    enabled: !!accountId,
    staleTime: 0,
    refetchInterval: 10 * 1000, // 10 seconds heartbeat
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
  });

  // Main emails query
  const {
    data: mails = [],
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["emails", accountId],
    queryFn: () => fetchEmails(accountId),
    enabled: !!accountId,
    staleTime: 0,
    refetchInterval: 60 * 1000, // Full refresh every 60 seconds as backup
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  // Detect changes from heartbeat and trigger immediate email refresh
  React.useEffect(() => {
    if (!folderStatus?.data?.folders) return;

    const inboxFolder = folderStatus.data.folders.find(
      (f: { name?: string }) => f.name?.toUpperCase() === "INBOX"
    );
    if (!inboxFolder) return;

    const currentTotal = inboxFolder.totalEmails || 0;
    const previousTotal = previousTotalRef.current;

    if (previousTotal > 0 && currentTotal > previousTotal) {
      const newCount = currentTotal - previousTotal;
      // New emails detected! Trigger immediate refresh
      setIsSyncing(true);
      queryClient.invalidateQueries({ queryKey: ["emails", accountId] });
      refetch().then(() => {
        setIsSyncing(false);
      });

      toast.info(
        <div className="flex flex-col gap-0.5">
          <span className="font-semibold text-sm">
            {newCount === 1 ? "Nouvel email" : `${newCount} nouveaux emails`}
          </span>
          <span className="text-xs text-muted-foreground">
            Boîte de réception synchronisée
          </span>
        </div>,
        {
          icon: <MailPlus className="h-4 w-4" />,
          duration: 5000,
        }
      );
    } else if (previousTotal === 0) {
      // First heartbeat, just store the value
      previousTotalRef.current = currentTotal;
    }
  }, [folderStatus, accountId, queryClient, refetch]);

  // Update previous total when mails change
  React.useEffect(() => {
    if (!folderStatus?.data?.folders) return;
    const inboxFolder = folderStatus.data.folders.find(
      (f: { name?: string }) => f.name?.toUpperCase() === "INBOX"
    );
    if (inboxFolder) {
      previousTotalRef.current = inboxFolder.totalEmails || 0;
    }
  }, [mails, folderStatus]);

  // Handle visibility change - immediate sync when user returns to tab
  React.useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && accountId) {
        queryClient.invalidateQueries({ queryKey: ["folder-status", accountId] });
        queryClient.invalidateQueries({ queryKey: ["emails", accountId] });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [accountId, queryClient]);

  // Online/offline handling
  React.useEffect(() => {
    const handleOnline = () => {
      if (accountId) {
        queryClient.invalidateQueries({ queryKey: ["emails", accountId] });
      }
    };

    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, [accountId, queryClient]);

  return (
    <AuthGuard>
      <div className="h-full relative">
        {isClient && (isFetching || isSyncing) && (
          <div className="absolute top-2 right-4 z-50 flex items-center gap-2 bg-background/80 backdrop-blur-sm px-3 py-1.5 rounded-full border shadow-sm">
            <RefreshCw className="h-3 w-3 animate-spin text-blue-600" />
            <span className="text-xs font-medium text-muted-foreground">
              Synchronisation...
            </span>
          </div>
        )}
        <MailComponent
          accounts={accounts}
          mails={mails}
          isLoading={isLoading}
          navCollapsedSize={4}
        />
      </div>
    </AuthGuard>
  );
}
