"use client";

import * as React from "react";
import { Bot } from "lucide-react";

export default function CopilotPage() {
  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      <div className="flex flex-1 flex-col items-center justify-center bg-background">
        <div className="flex flex-col items-center text-muted-foreground">
          <Bot className="h-12 w-12 mb-4 opacity-50" />
          <p className="text-sm font-medium">Coming Soon</p>
          <p className="text-xs">The AI assistant feature is under development</p>
        </div>
      </div>
    </div>
  );
}
