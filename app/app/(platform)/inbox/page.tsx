"use client";

import * as React from "react";
import { AuthGuard } from "@/components/AuthGuard";
import { Mail } from "@/components/email/mail";
import { accounts, mails } from "@/components/email/data";

export default function InboxPage() {
  return (
    <AuthGuard>
      <Mail accounts={accounts} mails={mails} navCollapsedSize={4} />
    </AuthGuard>
  );
}
