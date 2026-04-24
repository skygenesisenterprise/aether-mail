"use client";

import { AuthGuard } from "@/components/AuthGuard";
import { Workflow } from "@/components/workflow/workflow";
import { workflows, templates } from "@/components/workflow/data";

export default function WorkflowPage() {
  return (
    <AuthGuard>
      <Workflow workflows={workflows} templates={templates} />
    </AuthGuard>
  );
}