import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Play, Pause, Copy, Trash2, Edit, Clock, Activity, Mail, Calendar, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Workflow, WorkflowStatus } from "@/lib/api/workflow-types";

interface WorkflowCardProps {
  workflow: Workflow;
  onEdit?: (workflow: Workflow) => void;
  onDelete?: (workflow: Workflow) => void;
  onDuplicate?: (workflow: Workflow) => void;
  onToggle?: (workflow: Workflow, active: boolean) => void;
  onExecute?: (workflow: Workflow) => void;
}

const statusColors: Record<WorkflowStatus, string> = {
  active: "bg-green-500",
  inactive: "bg-gray-400",
  draft: "bg-yellow-500",
  error: "bg-red-500",
};

const statusLabels: Record<WorkflowStatus, string> = {
  active: "Active",
  inactive: "Inactive",
  draft: "Draft",
  error: "Error",
};

const triggerIcons: Record<string, React.ReactNode> = {
  email: <Mail className="h-5 w-5 text-blue-500" />,
  calendar: <Calendar className="h-5 w-5 text-green-500" />,
  task: <Zap className="h-5 w-5 text-purple-500" />,
  schedule: <Clock className="h-5 w-5 text-orange-500" />,
  manual: <Play className="h-5 w-5 text-red-500" />,
  webhook: <Zap className="h-5 w-5 text-cyan-500" />,
};

function formatDate(dateString: string): string {
  const date = new Date(dateString);
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

export function WorkflowCard({
  workflow,
  onEdit,
  onDelete,
  onDuplicate,
  onToggle,
  onExecute,
}: WorkflowCardProps) {
  const successRate = workflow.executionCount > 0 
    ? Math.round((workflow.successCount / workflow.executionCount) * 100) 
    : 0;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {triggerIcons[workflow.trigger?.type] || <Zap className="h-5 w-5" />}
            <div>
              <CardTitle className="text-base">{workflow.name}</CardTitle>
              {workflow.description && (
                <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">
                  {workflow.description}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant={workflow.status === "active" ? "default" : "secondary"}>
              <span className={cn("w-2 h-2 rounded-full mr-1.5", statusColors[workflow.status])} />
              {statusLabels[workflow.status]}
            </Badge>
            
            <Switch 
              checked={workflow.status === "active"}
              onCheckedChange={(checked) => onToggle?.(workflow, checked)}
            />
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit?.(workflow)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onExecute?.(workflow)}>
                  <Play className="mr-2 h-4 w-4" />
                  Run now
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDuplicate?.(workflow)}>
                  <Copy className="mr-2 h-4 w-4" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onDelete?.(workflow)} className="text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Activity className="h-4 w-4" />
              <span>{workflow.executionCount} runs</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{workflow.lastExecutedAt ? formatDate(workflow.lastExecutedAt) : "Never"}</span>
            </div>
          </div>
        </div>
        
        {workflow.executionCount > 0 && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Success rate</span>
              <span className="font-medium">{successRate}%</span>
            </div>
            <Progress value={successRate} className="h-2" />
          </div>
        )}
        
        {workflow.status === "error" && (
          <div className="p-2 bg-red-50 dark:bg-red-950/20 rounded-md">
            <p className="text-sm text-red-600 dark:text-red-400">
              Workflow encountered an error. Check the execution logs.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}