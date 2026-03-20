"use client";

import * as React from "react";
import { HardDrive } from "lucide-react";

export default function DrivePage() {
  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      <div className="flex flex-1 flex-col items-center justify-center bg-background">
        <div className="flex flex-col items-center text-muted-foreground">
          <HardDrive className="h-12 w-12 mb-4 opacity-50" />
          <p className="text-sm font-medium">Coming Soon</p>
          <p className="text-xs">The drive feature is under development</p>
        </div>
      </div>
    </div>
  );
}
