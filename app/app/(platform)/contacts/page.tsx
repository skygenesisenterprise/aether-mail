"use client";

import * as React from "react";
import { AuthGuard } from "@/components/AuthGuard";
import { Contacts } from "@/components/contacts/contacts";
import { accounts, contacts } from "@/components/email/data";

export default function ContactsPage() {
  return (
    <AuthGuard>
      <Contacts accounts={accounts} contacts={contacts} navCollapsedSize={4} />
    </AuthGuard>
  );
}