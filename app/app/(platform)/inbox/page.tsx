"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { AuthGuard } from "@/components/AuthGuard";
import { emailApi } from "@/lib/api/email";
import { authApi } from "@/lib/api/auth";
import type { Email } from "@/lib/api/email-types";
import { cleanEmailText } from "@/lib/email-text-cleaner";

const MailComponent = dynamic(() => import("@/components/email/mail").then((mod) => mod.Mail), {
  ssr: false,
});

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
  const emailResponse = await emailApi.getEmails(accountId);
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

export default function InboxPage() {
  const [accounts, setAccounts] = React.useState<{ label: string; email: string; icon: React.ReactNode }[]>([]);

  React.useEffect(() => {
    const user = authApi.getStoredUser();
    if (user) {
      setAccounts([{
        label: user.name || user.email.split("@")[0],
        email: user.email,
        icon: null,
      }]);
    }
  }, []);

  const accountEmail = accounts[0]?.email;

  const { data: mails = [], isLoading } = useQuery({
    queryKey: ["emails", accountEmail],
    queryFn: () => fetchEmails(accountEmail!),
    enabled: !!accountEmail,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
  });

  return (
    <AuthGuard>
      <MailComponent
        accounts={accounts}
        mails={mails}
        isLoading={isLoading}
        navCollapsedSize={4}
      />
    </AuthGuard>
  );
}
