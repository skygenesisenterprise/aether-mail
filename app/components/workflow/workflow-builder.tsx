import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowRight,
  Play,
  Plus,
  Settings,
  Trash2,
  Zap,
  Clock,
  GitBranch,
  Mail,
  Bell,
  Globe,
  CheckCircle,
  CheckSquare,
  Calendar,
  CalendarPlus,
  Send,
  Forward,
  Bot,
  ListTodo,
  Tag,
  FolderInput,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { 
  Workflow, 
  WorkflowTrigger, 
  WorkflowAction, 
  WorkflowNode,
  TriggerType,
  ActionType 
} from "@/lib/api/workflow-types";
import { TRIGGER_TYPES, ACTION_TYPES } from "@/lib/api/workflow-types";

interface WorkflowBuilderProps {
  workflow?: Workflow;
  onSave: (workflow: Partial<Workflow>) => void;
  onCancel: () => void;
  onTest?: (workflow: Workflow) => void;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const triggerIcons: Record<TriggerType, React.ReactNode> = {
  email: <Mail className="h-5 w-5 text-blue-500" />,
  calendar: <Calendar className="h-5 w-5 text-green-500" />,
  task: <CheckSquare className="h-5 w-5 text-purple-500" />,
  schedule: <Clock className="h-5 w-5 text-orange-500" />,
  manual: <Play className="h-5 w-5 text-red-500" />,
  webhook: <Globe className="h-5 w-5 text-cyan-500" />,
};

const actionIcons: Record<ActionType, React.ReactNode> = {
  send_email: <Send className="h-5 w-5 text-blue-500" />,
  forward_email: <Forward className="h-5 w-5 text-blue-500" />,
  auto_reply: <Bot className="h-5 w-5 text-purple-500" />,
  create_task: <ListTodo className="h-5 w-5 text-green-500" />,
  create_event: <CalendarPlus className="h-5 w-5 text-green-500" />,
  send_notification: <Bell className="h-5 w-5 text-yellow-500" />,
  webhook_call: <Globe className="h-5 w-5 text-cyan-500" />,
  add_label: <Tag className="h-5 w-5 text-pink-500" />,
  move_email: <FolderInput className="h-5 w-5 text-gray-500" />,
};

export function WorkflowBuilder({
  workflow,
  onSave,
  onCancel,
  onTest,
  isOpen = true,
  onOpenChange,
}: WorkflowBuilderProps) {
  const [name, setName] = React.useState(workflow?.name || "");
  const [description, setDescription] = React.useState(workflow?.description || "");
  const [selectedTrigger, setSelectedTrigger] = React.useState<TriggerType>(workflow?.trigger?.type || "email");
  const [triggerConfig, setTriggerConfig] = React.useState<Record<string, unknown>>(
    workflow?.trigger?.config || {}
  );
  const [actions, setActions] = React.useState<Array<{ type: ActionType; config: Record<string, unknown> }>>(
    workflow?.actions?.map((a) => ({ type: a.type, config: a.config })) || []
  );
  const [showTriggerDialog, setShowTriggerDialog] = React.useState(false);
  const [showActionDialog, setShowActionDialog] = React.useState(false);

  const handleSave = () => {
    const trigger: WorkflowTrigger = {
      id: workflow?.trigger?.id || `trigger-${Date.now()}`,
      type: selectedTrigger,
      name: TRIGGER_TYPES.find((t) => t.type === selectedTrigger)?.name || selectedTrigger,
      description: TRIGGER_TYPES.find((t) => t.type === selectedTrigger)?.description || "",
      config: triggerConfig,
    };

    const workflowActions: WorkflowAction[] = actions.map((a, index) => ({
      id: `action-${Date.now()}-${index}`,
      type: a.type,
      name: ACTION_TYPES.find((at) => at.type === a.type)?.name || a.type,
      description: ACTION_TYPES.find((at) => at.type === a.type)?.description || "",
      config: a.config,
    }));

    onSave({
      name,
      description,
      trigger,
      actions: workflowActions,
      status: "draft",
    });
  };

  const addAction = (type: ActionType) => {
    setActions([...actions, { type, config: {} }]);
    setShowActionDialog(false);
  };

  const removeAction = (index: number) => {
    setActions(actions.filter((_, i) => i !== index));
  };

  const updateActionConfig = (index: number, config: Record<string, unknown>) => {
    setActions(
      actions.map((a, i) => (i === index ? { ...a, config } : a))
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {workflow?.id ? "Edit Workflow" : "Create Workflow"}
          </DialogTitle>
          <DialogDescription>
            Build automated workflows with triggers and actions
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex gap-4">
          <div className="w-64 border-r pr-4">
            <Tabs defaultValue="settings" className="h-full">
              <TabsList className="w-full">
                <TabsTrigger value="settings" className="flex-1">Settings</TabsTrigger>
                <TabsTrigger value="triggers" className="flex-1">Triggers</TabsTrigger>
                <TabsTrigger value="actions" className="flex-1">Actions</TabsTrigger>
              </TabsList>

              <TabsContent value="settings" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Workflow Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="My workflow"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What does this workflow do?"
                    rows={3}
                  />
                </div>
              </TabsContent>

              <TabsContent value="triggers" className="mt-4">
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground mb-2">
                      Choose what starts your workflow
                    </p>
                    {TRIGGER_TYPES.map((trigger) => (
                      <button
                        key={trigger.type}
                        onClick={() => {
                          setSelectedTrigger(trigger.type);
                          setShowTriggerDialog(true);
                        }}
                        className={cn(
                          "w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-colors",
                          selectedTrigger === trigger.type
                            ? "border-primary bg-primary/5"
                            : "hover:bg-muted"
                        )}
                      >
                        <span className="text-2xl">{trigger.icon}</span>
                        <div>
                          <p className="font-medium">{trigger.name}</p>
                          <p className="text-xs text-muted-foreground">{trigger.description}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="actions" className="mt-4">
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground mb-2">
                      Add actions to your workflow
                    </p>
                    {ACTION_TYPES.map((action) => (
                      <button
                        key={action.type}
                        onClick={() => addAction(action.type)}
                        className="w-full flex items-center gap-3 p-3 rounded-lg border hover:bg-muted transition-colors text-left"
                      >
                        <span className="text-2xl">{action.icon}</span>
                        <div>
                          <p className="font-medium">{action.name}</p>
                          <p className="text-xs text-muted-foreground">{action.description}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>

          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Workflow Preview</h3>
              <Button variant="outline" size="sm" onClick={() => onTest?.({
                ...workflow!,
                name,
                description,
                trigger: {
                  id: `trigger-${Date.now()}`,
                  type: selectedTrigger,
                  name: TRIGGER_TYPES.find((t) => t.type === selectedTrigger)?.name || selectedTrigger,
                  description: "",
                  config: triggerConfig,
                },
                actions: actions.map((a, i) => ({
                  id: `action-${Date.now()}-${i}`,
                  type: a.type,
                  name: ACTION_TYPES.find((at) => at.type === a.type)?.name || a.type,
                  description: "",
                  config: a.config,
                })),
              })}>
                <Play className="h-4 w-4 mr-2" />
                Test
              </Button>
            </div>

            <ScrollArea className="flex-1 border rounded-lg p-4 bg-muted/50">
              <div className="space-y-4 min-w-[300px]">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700 px-4 py-2">
                    <Zap className="h-4 w-4 mr-2 text-blue-600" />
                    {TRIGGER_TYPES.find((t) => t.type === selectedTrigger)?.name}
                  </Badge>
                </div>

                {actions.length > 0 && (
                  <>
                    <div className="flex justify-center">
                      <ArrowRight className="h-6 w-6 text-muted-foreground rotate-90" />
                    </div>
                    <div className="flex flex-col gap-2">
                      {actions.map((action, index) => (
                        <React.Fragment key={index}>
                          <Badge 
                            variant="outline" 
                            className="px-4 py-2 justify-start cursor-pointer"
                            onClick={() => removeAction(index)}
                          >
                            <XCircle className="h-4 w-4 mr-2 text-muted-foreground" />
                            {actionIcons[action.type]}
                            <span className="ml-2">{ACTION_TYPES.find((a) => a.type === action.type)?.name}</span>
                          </Badge>
                          {index < actions.length - 1 && (
                            <div className="flex justify-center">
                              <ArrowRight className="h-6 w-6 text-muted-foreground rotate-90" />
                            </div>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </>
                )}

                {actions.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <GitBranch className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No actions added yet</p>
                    <p className="text-xs">Select actions from the panel on the left</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!name || !selectedTrigger}>
            {workflow?.id ? "Update" : "Create"} Workflow
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}