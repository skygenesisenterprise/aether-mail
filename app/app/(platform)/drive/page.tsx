"use client";

import * as React from "react";
import { AuthGuard } from "@/components/AuthGuard";
import { DriveView } from "@/components/drive";

export default function DrivePage() {
  return (
    <AuthGuard>
      <DriveView />
    </AuthGuard>
  );
}