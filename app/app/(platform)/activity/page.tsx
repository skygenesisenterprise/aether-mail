"use client";

import * as React from "react";
import { AuthGuard } from "@/components/AuthGuard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { Activity, ActivityPriority, ActivitySourceModule } from "@/lib/api/activity-types";

const mockActivities: Activity[] = [
  {
    id: "1",
    type: "email_received",
    title: "New email from Sarah Chen",
    description: "Re: Q4 Budget Review - Please review the attached documents",
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    sourceModule: "inbox",
    priority: "high",
    relatedEntities: [
      { id: "email-123", type: "email", name: "Q4 Budget Review" }
    ],
    isRead: false,
  },
  {
    id: "2",
    type: "meeting_scheduled",
    title: "Team standup in 30 minutes",
    description: "Daily sync - Conference Room A",
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    sourceModule: "calendar",
    priority: "high",
    relatedEntities: [
      { id: "event-456", type: "event", name: "Team Standup" }
    ],
    isRead: false,
  },
  {
    id: "3",
    type: "task_completed",
    title: "Task completed: Prepare presentation",
    description: "Q4 Review presentation ready for review",
    timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    sourceModule: "todo",
    priority: "medium",
    relatedEntities: [
      { id: "task-789", type: "task", name: "Prepare Q4 presentation" }
    ],
    isRead: true,
  },
  {
    id: "4",
    type: "copilot_action",
    title: "AI summarized 5 emails",
    description: "Generated a concise summary of your unread emails from today",
    timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    sourceModule: "copilot",
    priority: "low",
    isRead: true,
  },
  {
    id: "5",
    type: "file_shared",
    title: "John Doe shared a file",
    description: "Project_Proposal_v2.pdf - View only",
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    sourceModule: "drive",
    priority: "medium",
    relatedEntities: [
      { id: "file-101", type: "file", name: "Project_Proposal_v2.pdf" }
    ],
    isRead: true,
  },
  {
    id: "6",
    type: "automation_triggered",
    title: "Email routing automation executed",
    description: "3 emails automatically labeled and sorted",
    timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    sourceModule: "automation",
    priority: "low",
    isRead: true,
  },
  {
    id: "7",
    type: "member_joined",
    title: "New team member joined",
    description: "alex.rivera@company.com joined the Engineering team",
    timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    sourceModule: "organization",
    priority: "medium",
    relatedEntities: [
      { id: "user-202", type: "user", name: "Alex Rivera" }
    ],
    isRead: true,
  },
  {
    id: "8",
    type: "copilot_suggestion",
    title: "AI suggested a reply",
    description: "Tap to review the suggested reply for the email from marketing@...",
    timestamp: new Date(Date.now() - 1000 * 60 * 200).toISOString(),
    sourceModule: "copilot",
    priority: "medium",
    isRead: false,
  },
];

const priorityColors: Record<ActivityPriority, string> = {
  urgent: "bg-red-500",
  high: "bg-orange-500",
  medium: "bg-blue-500",
  low: "bg-gray-400",
};

const sourceModuleIcons: Record<ActivitySourceModule, string> = {
  inbox: "📧",
  calendar: "📅",
  chat: "💬",
  meet: "📹",
  todo: "✅",
  drive: "📁",
  automation: "⚙️",
  organization: "🏢",
  copilot: "🤖",
};

const sourceModuleLabels: Record<ActivitySourceModule, string> = {
  inbox: "Email",
  calendar: "Calendar",
  chat: "Chat",
  meet: "Meet",
  todo: "Tasks",
  drive: "Drive",
  automation: "Automation",
  organization: "Organization",
  copilot: "AI",
};

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function ActivityItem({ activity }: { activity: Activity }) {
  return (
    <div
      className={cn(
        "flex gap-3 p-3 rounded-lg transition-colors hover:bg-muted/50 cursor-pointer",
        !activity.isRead && "bg-muted"
      )}
    >
      <div className="relative shrink-0">
        <Avatar className="h-8 w-8">
          <AvatarFallback className="text-sm">
            {sourceModuleIcons[activity.sourceModule]}
          </AvatarFallback>
        </Avatar>
        {!activity.isRead && (
          <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-blue-500 border-2 border-background" />
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">{sourceModuleIcons[activity.sourceModule]}</span>
            <span className={cn(
              "w-2 h-2 rounded-full shrink-0 mt-1.5",
              priorityColors[activity.priority]
            )} />
          </div>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {formatTimestamp(activity.timestamp)}
          </span>
        </div>
        
        <h4 className={cn(
          "text-sm font-medium truncate",
          !activity.isRead && "font-semibold"
        )}>
          {activity.title}
        </h4>
        
        {activity.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">
            {activity.description}
          </p>
        )}
        
        <div className="flex items-center gap-2 mt-2">
          <Badge variant="outline" className="text-xs">
            {sourceModuleLabels[activity.sourceModule]}
          </Badge>
          {activity.relatedEntities?.slice(0, 2).map((entity) => (
            <Badge key={entity.id} variant="secondary" className="text-xs">
              {entity.type}: {entity.name}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}

function ActivityGroup({ 
  title, 
  activities 
}: { 
  title: string; 
  activities: Activity[] 
}) {
  return (
    <div className="mb-4">
      <h3 className="text-sm font-semibold text-muted-foreground mb-2 px-1">
        {title}
      </h3>
      <div className="space-y-1">
        {activities.map((activity) => (
          <ActivityItem key={activity.id} activity={activity} />
        ))}
      </div>
    </div>
  );
}

function CopilotSection({ activities }: { activities: Activity[] }) {
  if (activities.length === 0) return null;

  return (
    <Card className="mb-4 border-purple-200 bg-purple-50/50 dark:bg-purple-950/20 dark:border-purple-800">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">🤖</span>
          <CardTitle className="text-base">AI Activity</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-1">
        {activities.slice(0, 3).map((activity) => (
          <ActivityItem key={activity.id} activity={activity} />
        ))}
      </CardContent>
    </Card>
  );
}

export default function ActivityPage() {
  const [activities] = React.useState<Activity[]>(mockActivities);
  const [filterModule, setFilterModule] = React.useState<string>("all");
  const [filterPriority, setFilterPriority] = React.useState<string>("all");

  const copilotActions = React.useMemo(() => 
    activities.filter(a => a.sourceModule === "copilot" || a.type.startsWith("copilot_")),
    [activities]
  );

  const regularActivities = React.useMemo(() => 
    activities.filter(a => a.sourceModule !== "copilot" && !a.type.startsWith("copilot_")),
    [activities]
  );

  const filteredActivities = React.useMemo(() => {
    let filtered = regularActivities;
    
    if (filterModule !== "all") {
      filtered = filtered.filter(a => a.sourceModule === filterModule);
    }
    
    if (filterPriority !== "all") {
      filtered = filtered.filter(a => a.priority === filterPriority);
    }
    
    return filtered;
  }, [regularActivities, filterModule, filterPriority]);

  const groupedActivities = React.useMemo(() => {
    const groups = new Map<string, Activity[]>();
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);

    const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };

    const sorted = [...filteredActivities].sort((a, b) => {
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });

    sorted.forEach((activity) => {
      const activityDate = new Date(activity.timestamp);
      let dateKey: string;

      if (activityDate >= today) {
        dateKey = "Today";
      } else if (activityDate >= yesterday) {
        dateKey = "Yesterday";
      } else if (activityDate >= lastWeek) {
        dateKey = "This Week";
      } else {
        dateKey = "Earlier";
      }

      if (!groups.has(dateKey)) {
        groups.set(dateKey, []);
      }
      groups.get(dateKey)!.push(activity);
    });

    return groups;
  }, [filteredActivities]);

  const unreadCount = activities.filter(a => !a.isRead).length;

  return (
    <AuthGuard>
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h1 className="text-2xl font-bold">Activity</h1>
            <p className="text-sm text-muted-foreground">
              {unreadCount > 0 ? `${unreadCount} unread updates` : "All caught up!"}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Select value={filterModule} onValueChange={setFilterModule}>
              <SelectTrigger className="w-35">
                <SelectValue placeholder="All modules" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All modules</SelectItem>
                <SelectItem value="inbox">Email</SelectItem>
                <SelectItem value="calendar">Calendar</SelectItem>
                <SelectItem value="todo">Tasks</SelectItem>
                <SelectItem value="drive">Drive</SelectItem>
                <SelectItem value="organization">Organization</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-35">
                <SelectValue placeholder="All priorities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All priorities</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" size="sm">
              Mark all read
            </Button>
          </div>
        </div>

        <ScrollArea className="flex-1 p-4">
          <CopilotSection activities={copilotActions} />
          
          {copilotActions.length > 0 && <Separator className="my-4" />}
          
          {Array.from(groupedActivities.entries()).map(([dateKey, dateActivities]) => (
            <ActivityGroup 
              key={dateKey} 
              title={dateKey} 
              activities={dateActivities} 
            />
          ))}
          
          {filteredActivities.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-lg mb-2">No activity yet</p>
              <p className="text-sm">Activity from your workspace will appear here</p>
            </div>
          )}
        </ScrollArea>
      </div>
    </AuthGuard>
  );
}