"use client";

import * as React from "react";
import { AuthGuard } from "@/components/AuthGuard";
import { CalendarView } from "@/components/calendar";

export default function CalendarPage() {
  return (
    <AuthGuard>
      <CalendarView />
    </AuthGuard>
  );
}