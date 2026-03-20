import * as React from "react";
import { Video, Sun, Bell, Settings, User } from "lucide-react";
import { cn } from "@/lib/utils";

export function Header() {
  return (
    <header className="h-14 border-b bg-background flex items-center justify-between px-4">
      <div className="flex items-center gap-2">
        <h1 className="text-lg font-semibold text-foreground">Aether Mail</h1>
      </div>

      <div className="flex-1 max-w-md mx-8">
        <div className="relative">
          <input
            type="text"
            placeholder="Search..."
            className={cn(
              "w-full h-9 px-4 pl-10 rounded-md border bg-background text-sm",
              "text-foreground placeholder:text-muted-foreground",
              "focus:outline-none focus:ring-2 focus:ring-primary"
            )}
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          className={cn(
            "p-2 rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground",
            "transition-colors"
          )}
          title="Meet"
        >
          <Video className="h-5 w-5" />
        </button>
        <button
          className={cn(
            "p-2 rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground",
            "transition-colors"
          )}
          title="My Day"
        >
          <Sun className="h-5 w-5" />
        </button>
        <button
          className={cn(
            "p-2 rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground",
            "transition-colors"
          )}
          title="Notifications"
        >
          <Bell className="h-5 w-5" />
        </button>
        <button
          className={cn(
            "p-2 rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground",
            "transition-colors"
          )}
          title="Settings"
        >
          <Settings className="h-5 w-5" />
        </button>
        <button
          className={cn(
            "p-2 rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground",
            "transition-colors"
          )}
          title="Account"
        >
          <User className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
