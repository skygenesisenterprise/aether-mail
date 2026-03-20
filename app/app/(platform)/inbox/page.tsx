"use client";

import { EmailFolder } from "@/components/email/EmailFolder";

export default function InboxPage() {
  return (
    <div className="flex h-full">
      <EmailFolder />
      <div className="flex-1 p-4">
        <h1 className="text-2xl font-bold mb-4">Inbox</h1>
        <p>Welcome to your inbox! Here you will find all your emails.</p>
      </div>
    </div>
  );
}
