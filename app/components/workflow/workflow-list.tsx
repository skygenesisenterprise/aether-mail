import * as React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Search, Filter, LayoutGrid, List } from "lucide-react";
import { WorkflowCard } from "./workflow-card";
import type { Workflow, WorkflowStatus, WorkflowFilters } from "@/lib/api/workflow-types";

interface WorkflowListProps {
  workflows: Workflow[];
  onCreateNew: () => void;
  onEdit: (workflow: Workflow) => void;
  onDelete: (workflow: Workflow) => void;
  onDuplicate: (workflow: Workflow) => void;
  onToggle: (workflow: Workflow, active: boolean) => void;
  onExecute: (workflow: Workflow) => void;
  onViewTemplate?: () => void;
  isLoading?: boolean;
}

export function WorkflowList({
  workflows,
  onCreateNew,
  onEdit,
  onDelete,
  onDuplicate,
  onToggle,
  onExecute,
  onViewTemplate,
  isLoading = false,
}: WorkflowListProps) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid");

  const filteredWorkflows = React.useMemo(() => {
    let filtered = workflows;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (w) =>
          w.name.toLowerCase().includes(query) ||
          w.description?.toLowerCase().includes(query)
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((w) => w.status === statusFilter);
    }

    return filtered;
  }, [workflows, searchQuery, statusFilter]);

  const activeWorkflows = filteredWorkflows.filter((w) => w.status === "active");
  const inactiveWorkflows = filteredWorkflows.filter((w) => w.status === "inactive");
  const errorWorkflows = filteredWorkflows.filter((w) => w.status === "error");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search workflows..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="error">Error</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center border rounded-md">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="icon"
              className="h-8 w-8 rounded-r-none"
              onClick={() => setViewMode("grid")}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="icon"
              className="h-8 w-8 rounded-l-none"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          
          <Button onClick={onViewTemplate}>
            <LayoutGrid className="h-4 w-4 mr-2" />
            Templates
          </Button>
          
          <Button onClick={onCreateNew}>
            <Plus className="h-4 w-4 mr-2" />
            New Workflow
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">
            All
            <Badge variant="secondary" className="ml-2">
              {filteredWorkflows.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="active">
            Active
            <Badge variant="secondary" className="ml-2">
              {activeWorkflows.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="inactive">
            Inactive
            <Badge variant="secondary" className="ml-2">
              {inactiveWorkflows.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="errors">
            Errors
            <Badge variant="destructive" className="ml-2">
              {errorWorkflows.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          {filteredWorkflows.length === 0 ? (
            <EmptyState onCreateNew={onCreateNew} />
          ) : (
            <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-2"}>
              {filteredWorkflows.map((workflow) => (
                <WorkflowCard
                  key={workflow.id}
                  workflow={workflow}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onDuplicate={onDuplicate}
                  onToggle={onToggle}
                  onExecute={onExecute}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="active" className="mt-4">
          {activeWorkflows.length === 0 ? (
            <EmptyState message="No active workflows" onCreateNew={onCreateNew} />
          ) : (
            <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-2"}>
              {activeWorkflows.map((workflow) => (
                <WorkflowCard
                  key={workflow.id}
                  workflow={workflow}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onDuplicate={onDuplicate}
                  onToggle={onToggle}
                  onExecute={onExecute}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="inactive" className="mt-4">
          {inactiveWorkflows.length === 0 ? (
            <EmptyState message="No inactive workflows" onCreateNew={onCreateNew} />
          ) : (
            <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-2"}>
              {inactiveWorkflows.map((workflow) => (
                <WorkflowCard
                  key={workflow.id}
                  workflow={workflow}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onDuplicate={onDuplicate}
                  onToggle={onToggle}
                  onExecute={onExecute}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="errors" className="mt-4">
          {errorWorkflows.length === 0 ? (
            <EmptyState message="No workflows with errors" />
          ) : (
            <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-2"}>
              {errorWorkflows.map((workflow) => (
                <WorkflowCard
                  key={workflow.id}
                  workflow={workflow}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onDuplicate={onDuplicate}
                  onToggle={onToggle}
                  onExecute={onExecute}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function EmptyState({ 
  message = "No workflows yet", 
  onCreateNew 
}: { 
  message?: string; 
  onCreateNew?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <Filter className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium mb-2">{message}</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Create your first workflow to automate tasks
      </p>
      {onCreateNew && (
        <Button onClick={onCreateNew}>
          <Plus className="h-4 w-4 mr-2" />
          Create Workflow
        </Button>
      )}
    </div>
  );
}