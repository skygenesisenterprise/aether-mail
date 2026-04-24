import * as React from "react";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  History,
  Play,
  Plus,
  Settings,
  TrendingUp,
  Workflow as WorkflowIcon,
  X,
} from "lucide-react";
import { WorkflowList } from "./workflow-list";
import { WorkflowBuilder } from "./workflow-builder";
import { WorkflowCard } from "./workflow-card";
import type { Workflow, WorkflowExecution, WorkflowTemplate, WorkflowStatus } from "@/lib/api/workflow-types";
import { workflowApi } from "@/lib/api/workflow";
import { TRIGGER_TYPES, ACTION_TYPES } from "@/lib/api/workflow-types";

interface WorkflowStats {
  totalWorkflows: number;
  activeWorkflows: number;
  totalExecutions: number;
  successRate: number;
  recentExecutions: WorkflowExecution[];
}

interface WorkflowProps extends React.HTMLAttributes<HTMLDivElement> {
  workflows?: Workflow[];
  templates?: WorkflowTemplate[];
}

export function Workflow({
  workflows: initialWorkflows = [],
  templates: initialTemplates = [],
  className,
  ...props
}: WorkflowProps) {
  const [workflows, setWorkflows] = React.useState<Workflow[]>(initialWorkflows);
  const [templates] = React.useState<WorkflowTemplate[]>(initialTemplates);
  const [selectedWorkflow, setSelectedWorkflow] = React.useState<Workflow | null>(null);
  const [isBuilderOpen, setIsBuilderOpen] = React.useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = React.useState(false);
  const [isTemplatesOpen, setIsTemplatesOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState("list");
  const [stats, setStats] = React.useState<WorkflowStats | null>(null);

  React.useEffect(() => {
    if (workflows.length > 0) {
      setStats({
        totalWorkflows: workflows.length,
        activeWorkflows: workflows.filter((w) => w.status === "active").length,
        totalExecutions: workflows.reduce((sum, w) => sum + w.executionCount, 0),
        successRate: workflows.length > 0
          ? Math.round(
              workflows.reduce((sum, w) => sum + (w.executionCount > 0 ? (w.successCount / w.executionCount) * 100 : 0), 0) /
              workflows.filter((w) => w.executionCount > 0).length
            ) || 0
          : 0,
        recentExecutions: [],
      });
    }
  }, [workflows]);

  const handleCreateNew = () => {
    setSelectedWorkflow(null);
    setIsBuilderOpen(true);
  };

  const handleEdit = (workflow: Workflow) => {
    setSelectedWorkflow(workflow);
    setIsBuilderOpen(true);
  };

  const handleDelete = async (workflow: Workflow) => {
    if (confirm(`Are you sure you want to delete "${workflow.name}"?`)) {
      setWorkflows((prev) => prev.filter((w) => w.id !== workflow.id));
    }
  };

  const handleDuplicate = (workflow: Workflow) => {
    const duplicated: Workflow = {
      ...workflow,
      id: `workflow-${Date.now()}`,
      name: `${workflow.name} (Copy)`,
      status: "draft",
      executionCount: 0,
      successCount: 0,
      failureCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setWorkflows((prev) => [...prev, duplicated]);
  };

  const handleToggle = async (workflow: Workflow, active: boolean) => {
    setWorkflows((prev) =>
      prev.map((w) =>
        w.id === workflow.id
          ? { ...w, status: active ? "active" : "inactive" }
          : w
      )
    );
  };

  const handleExecute = async (workflow: Workflow) => {
    console.log("Executing workflow:", workflow.id);
  };

  const handleSaveWorkflow = (workflowData: Partial<Workflow>) => {
    if (selectedWorkflow) {
      setWorkflows((prev) =>
        prev.map((w) =>
          w.id === selectedWorkflow.id
            ? { ...w, ...workflowData, updatedAt: new Date().toISOString() }
            : w
        )
      );
    } else {
      const newWorkflow: Workflow = {
        id: `workflow-${Date.now()}`,
        name: workflowData.name || "Untitled",
        description: workflowData.description,
        status: workflowData.status || "draft",
        trigger: workflowData.trigger!,
        actions: workflowData.actions || [],
        nodes: [],
        connections: [],
        executionCount: 0,
        successCount: 0,
        failureCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setWorkflows((prev) => [...prev, newWorkflow]);
    }
    setIsBuilderOpen(false);
  };

  const handleViewDetails = (workflow: Workflow) => {
    setSelectedWorkflow(workflow);
    setIsDetailsOpen(true);
  };

  const handleCreateFromTemplate = (template: WorkflowTemplate) => {
    const newWorkflow: Workflow = {
      id: `workflow-${Date.now()}`,
      name: `${template.name} (Custom)`,
      description: template.description,
      status: "draft",
      trigger: template.workflow.trigger,
      actions: template.workflow.actions,
      nodes: template.workflow.nodes,
      connections: template.workflow.connections,
      executionCount: 0,
      successCount: 0,
      failureCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setWorkflows((prev) => [...prev, newWorkflow]);
    setIsTemplatesOpen(false);
  };

  return (
    <div className={className} {...props}>
      <div className="flex items-center justify-between p-4 border-b">
        <div>
          <h1 className="text-2xl font-bold">Workflows</h1>
          <p className="text-sm text-muted-foreground">
            Automate tasks with triggered actions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setIsTemplatesOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Templates
          </Button>
          <Button onClick={handleCreateNew}>
            <Plus className="h-4 w-4 mr-2" />
            New Workflow
          </Button>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-4 gap-4 p-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Workflows
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalWorkflows}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeWorkflows}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Executions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalExecutions}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Success Rate
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-2xl font-bold">{stats.successRate}%</div>
              <Progress value={stats.successRate} className="h-2" />
            </CardContent>
          </Card>
        </div>
      )}

      <div className="p-4 pt-0">
        <WorkflowList
          workflows={workflows}
          onCreateNew={handleCreateNew}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onDuplicate={handleDuplicate}
          onToggle={handleToggle}
          onExecute={handleExecute}
          onViewTemplate={() => setIsTemplatesOpen(true)}
        />
      </div>

      <WorkflowBuilder
        workflow={selectedWorkflow || undefined}
        onSave={handleSaveWorkflow}
        onCancel={() => setIsBuilderOpen(false)}
        isOpen={isBuilderOpen}
        onOpenChange={setIsBuilderOpen}
      />

      <Dialog open={isTemplatesOpen} onOpenChange={setIsTemplatesOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Workflow Templates</DialogTitle>
            <DialogDescription>
              Start with a pre-built template
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="grid grid-cols-2 gap-4 p-1">
              {templateExamples.map((template) => (
                <Card
                  key={template.id}
                  className="cursor-pointer hover:border-primary transition-colors"
                  onClick={() => handleCreateFromTemplate(template)}
                >
                  <CardHeader>
                    <CardTitle className="text-base">{template.name}</CardTitle>
                    <CardDescription>{template.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Badge variant="secondary">
                        {TRIGGER_TYPES.find((t) => t.type === template.workflow.trigger.type)?.name}
                      </Badge>
                      <span>→</span>
                      <Badge variant="secondary">
                        {template.workflow.actions.length} action(s)
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl">
          {selectedWorkflow && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedWorkflow.name}</DialogTitle>
                <DialogDescription>
                  {selectedWorkflow.description || "No description"}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Badge variant={selectedWorkflow.status === "active" ? "default" : "secondary"}>
                    {selectedWorkflow.status}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Created {new Date(selectedWorkflow.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <Separator />
                <div>
                  <h4 className="font-medium mb-2">Trigger</h4>
                  <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                    <span className="text-2xl">
                      {TRIGGER_TYPES.find((t) => t.type === selectedWorkflow.trigger.type)?.icon}
                    </span>
                    <span>{selectedWorkflow.trigger.name}</span>
                  </div>
                </div>
                {selectedWorkflow.actions.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Actions</h4>
                    <div className="space-y-2">
                      {selectedWorkflow.actions.map((action, index) => (
                        <div key={action.id} className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                          <span className="text-muted-foreground">{index + 1}.</span>
                          <span className="text-2xl">
                            {ACTION_TYPES.find((a) => a.type === action.type)?.icon}
                          </span>
                          <span>{action.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <Separator />
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold">{selectedWorkflow.executionCount}</p>
                    <p className="text-sm text-muted-foreground">Executions</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600">
                      {selectedWorkflow.successCount}
                    </p>
                    <p className="text-sm text-muted-foreground">Success</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-red-600">
                      {selectedWorkflow.failureCount}
                    </p>
                    <p className="text-sm text-muted-foreground">Failed</p>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>
                  Close
                </Button>
                <Button onClick={() => {
                  setIsDetailsOpen(false);
                  handleEdit(selectedWorkflow);
                }}>
                  Edit Workflow
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

const templateExamples: WorkflowTemplate[] = [
  {
    id: "template-1",
    name: "Auto Reply to Emails",
    description: "Automatically send a reply when you receive an email",
    category: "Email",
    workflow: {
      name: "Auto Reply",
      status: "draft",
      trigger: {
        id: "trigger-1",
        type: "email",
        name: "Email",
        description: "When a new email is received",
        config: {},
      },
      actions: [
        {
          id: "action-1",
          type: "auto_reply",
          name: "Auto Reply",
          description: "Send an automatic reply",
          config: { message: "Thank you for your email. I'll respond shortly." },
        },
      ],
      nodes: [],
      connections: [],
    },
  },
  {
    id: "template-2",
    name: "Task Reminder",
    description: "Create a task when a calendar event starts",
    category: "Productivity",
    workflow: {
      name: "Task Reminder",
      status: "draft",
      trigger: {
        id: "trigger-2",
        type: "calendar",
        name: "Calendar",
        description: "When an event starts",
        config: {},
      },
      actions: [
        {
          id: "action-2",
          type: "create_task",
          name: "Create Task",
          description: "Create a new task",
          config: {},
        },
        {
          id: "action-3",
          type: "send_notification",
          name: "Send Notification",
          description: "Send a notification",
          config: {},
        },
      ],
      nodes: [],
      connections: [],
    },
  },
  {
    id: "template-3",
    name: "Email to Task",
    description: "Convert important emails into tasks",
    category: "Email",
    workflow: {
      name: "Email to Task",
      status: "draft",
      trigger: {
        id: "trigger-3",
        type: "email",
        name: "Email",
        description: "When a starred email is received",
        config: { filter: "starred" },
      },
      actions: [
        {
          id: "action-4",
          type: "create_task",
          name: "Create Task",
          description: "Create a task from email",
          config: {},
        },
        {
          id: "action-5",
          type: "add_label",
          name: "Add Label",
          description: "Label the email",
          config: {},
        },
      ],
      nodes: [],
      connections: [],
    },
  },
  {
    id: "template-4",
    name: "Daily Digest",
    description: "Get a daily summary of your activity",
    category: "Reports",
    workflow: {
      name: "Daily Digest",
      status: "draft",
      trigger: {
        id: "trigger-4",
        type: "schedule",
        name: "Schedule",
        description: "Run daily at 9 AM",
        config: { cron: "0 9 * * *" },
      },
      actions: [
        {
          id: "action-6",
          type: "send_email",
          name: "Send Email",
          description: "Send daily digest",
          config: {},
        },
      ],
      nodes: [],
      connections: [],
    },
  },
];