"use client";

import * as React from "react";
import { AuthGuard } from "@/components/AuthGuard";
import { CopilotView } from "@/components/copilot";

export default function CopilotPage() {
  return (
    <AuthGuard>
      <CopilotView />
    </AuthGuard>
  );
}