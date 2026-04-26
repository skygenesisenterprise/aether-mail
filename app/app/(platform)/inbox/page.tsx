"use client";

import * as React from "react";
import { AuthGuard } from "@/components/AuthGuard";
import { Mail as MailComponent } from "@/components/email/mail";
import { emailApi } from "@/lib/api/email";
import { authApi } from "@/lib/api/auth";
import type { Email } from "@/lib/api/email-types";

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

export default function InboxPage() {
  const [accounts, setAccounts] = React.useState<{ label: string; email: string; icon: React.ReactNode }[]>([]);
  const [mails, setMails] = React.useState<MailItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const user = authApi.getStoredUser();
    if (user) {
      setAccounts([{
        label: user.name || user.email.split('@')[0],
        email: user.email,
        icon: null,
      }]);
      loadEmails(user.email);
    } else {
      setIsLoading(false);
    }
  }, []);

  const loadEmails = async (accountId: string) => {
    try {
      const emailResponse = await emailApi.getEmails(accountId);
      if (emailResponse.success && emailResponse.data) {
        const formattedEmails: MailItem[] = (emailResponse.data.emails || []).map((email: Email): MailItem => {
          let fromEmail = '';
          let fromName = '';
          
          if (email.from) {
            fromEmail = email.from.email || '';
            fromName = email.from.name || fromEmail.split('@')[0] || 'Unknown';
          }
          
          const textContent = email.body || email.preview || '';
          const cleanedText = textContent
            .replace(/^From:.*$/gm, '')
            .replace(/^To:.*$/gm, '')
            .replace(/^Subject:.*$/gm, '')
            .replace(/^Date:.*$/gm, '')
            .replace(/^Delivered-To:.*$/gm, '')
            .replace(/^X-.*$/gm, '')
            .replace(/^Received:.*$/gm, '')
            .replace(/^DKIM-.*$/gm, '')
            .replace(/^Reply-To:.*$/gm, '')
            .replace(/^MIME-Version:.*$/gm, '')
            .replace(/^Content-.*$/gm, '')
            .replace(/^\s*$/g, '')
            .trim();
          
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
        setMails(formattedEmails);
      }
    } catch (emailError) {
      console.error("Failed to load emails:", emailError);
      if (emailError instanceof Error && emailError.message.includes("Session not found")) {
        authApi.clearTokens();
        authApi.clearUser();
        window.location.href = "/login";
        return;
      }
    } finally {
      setIsLoading(false);
    }
  };

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