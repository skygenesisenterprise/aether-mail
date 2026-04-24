"use client";

import { AuthGuard } from "@/components/AuthGuard";
import { Meet } from "@/components/meet/meet";
import { currentUser, conversations, messages } from "@/components/meet/data";

export default function MeetPage() {
  return (
    <AuthGuard>
      <Meet 
        currentUser={currentUser} 
        conversations={conversations} 
        messages={messages} 
      />
    </AuthGuard>
  );
}