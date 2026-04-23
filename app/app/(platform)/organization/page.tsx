"use client";

import * as React from "react";
import { AuthGuard } from "@/components/AuthGuard";
import { OrgExplorerView } from "@/components/organization";

export default function OrgExplorerPage() {
  return (
    <AuthGuard>
      <OrgExplorerView />
    </AuthGuard>
  );
}