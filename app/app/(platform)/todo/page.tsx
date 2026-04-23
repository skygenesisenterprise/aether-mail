"use client";

import * as React from "react";
import { AuthGuard } from "@/components/AuthGuard";
import { TodoView } from "@/components/todo";

export default function TodoPage() {
  return (
    <AuthGuard>
      <TodoView />
    </AuthGuard>
  );
}