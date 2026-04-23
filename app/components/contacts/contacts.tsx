import * as React from "react";
import {
  Search,
  Users2,
  Contact as ContactIcon,
  Trash2,
  ArchiveX,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AccountSwitcher } from "@/components/email/account-switcher";
import { ContactDisplay } from "@/components/contacts/contact-display";
import { ContactList } from "@/components/contacts/contact-list";
import { Nav } from "@/components/email/nav";
import { Footer } from "@/components/email/Footer";
import { type Contact } from "@/components/email/data";
import { useContacts } from "@/components/contacts/use-contacts";

interface ContactsProps extends React.HTMLAttributes<HTMLDivElement> {
  accounts?: {
    label: string;
    email: string;
    icon: React.ReactNode;
  }[];
  contacts?: Contact[];
  defaultLayout?: number[];
  defaultCollapsed?: boolean;
  navCollapsedSize: number;
}

export function Contacts({
  accounts = [],
  contacts = [],
  defaultLayout = [20, 32, 48],
  defaultCollapsed = false,
  navCollapsedSize,
}: ContactsProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed);
  const [contactStore, setContact] = useContacts();
  const [activeFolder, setActiveFolder] = React.useState("all");

  const folderLabels: Record<string, string> = {
    all: "All Contacts",
    favorites: "Favorites",
    family: "Family",
    work: "Work",
    friends: "Friends",
  };

  return (
    <TooltipProvider delayDuration={0}>
      <ResizablePanelGroup
        orientation="horizontal"
        onLayoutChanged={(layout) => {
          document.cookie = `react-resizable-panels:layout:contacts=${JSON.stringify(layout)}`;
        }}
        className="h-full items-stretch"
      >
        <ResizablePanel
          defaultSize={`${defaultLayout[0]}%`}
          collapsedSize={`${navCollapsedSize}%`}
          collapsible={true}
          minSize="15%"
          maxSize="20%"
          onResize={(panelSize) => {
            const collapsed = panelSize.asPercentage <= navCollapsedSize;
            setIsCollapsed(collapsed);
            document.cookie = `react-resizable-panels:collapsed=${JSON.stringify(collapsed)}`;
          }}
          className={cn(isCollapsed && "min-w-12.5 transition-all duration-300 ease-in-out")}
        >
          <div
            className={cn(
              "flex items-center justify-center px-2 py-1.5",
              isCollapsed && "px-0"
            )}
          >
            <div className={cn("flex flex-col gap-2 w-full", isCollapsed && "items-center")}>
              <Button
                size="sm"
                className="w-full justify-start gap-2"
              >
                <Users2 className="h-4 w-4" />
                <span className={cn(isCollapsed && "hidden")}>New Contact</span>
              </Button>
              <AccountSwitcher isCollapsed={isCollapsed} accounts={accounts} />
            </div>
          </div>
          <Separator />
          <Nav
            isCollapsed={isCollapsed}
            links={[
              {
                title: "All Contacts",
                label: String(contacts.length),
                icon: ContactIcon,
                variant: activeFolder === "all" ? "default" : "ghost",
                onClick: () => setActiveFolder("all"),
              },
              {
                title: "Favorites",
                label: "",
                icon: ContactIcon,
                variant: activeFolder === "favorites" ? "default" : "ghost",
                onClick: () => setActiveFolder("favorites"),
              },
              {
                title: "Family",
                label: "",
                icon: ContactIcon,
                variant: activeFolder === "family" ? "default" : "ghost",
                onClick: () => setActiveFolder("family"),
              },
              {
                title: "Work",
                label: "",
                icon: ContactIcon,
                variant: activeFolder === "work" ? "default" : "ghost",
                onClick: () => setActiveFolder("work"),
              },
              {
                title: "Friends",
                label: "",
                icon: ContactIcon,
                variant: activeFolder === "friends" ? "default" : "ghost",
                onClick: () => setActiveFolder("friends"),
              },
            ]}
          />
          <Separator />
          <Nav
            isCollapsed={isCollapsed}
            links={[
              {
                title: "Archive",
                label: "",
                icon: ArchiveX,
                variant: activeFolder === "archive" ? "default" : "ghost",
                onClick: () => setActiveFolder("archive"),
              },
              {
                title: "Trash",
                label: "",
                icon: Trash2,
                variant: activeFolder === "trash" ? "default" : "ghost",
                onClick: () => setActiveFolder("trash"),
              },
            ]}
          />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={`${defaultLayout[1]}%`} minSize="30%">
          <Tabs defaultValue="all" className="flex h-full flex-col">
            <div className="flex items-center px-4 py-1.5">
              <h1 className="text-foreground text-xl font-bold">{folderLabels[activeFolder] || "All Contacts"}</h1>
              <TabsList className="ml-auto">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="favorites">Favorites</TabsTrigger>
              </TabsList>
            </div>
            <Separator />
            <div className="bg-background/95 supports-backdrop-filter:bg-background/60 p-4 backdrop-blur">
              <form>
                <div className="relative">
                  <Search className="text-muted-foreground absolute top-2.5 left-2 h-4 w-4" />
                  <Input placeholder="Search" className="pl-8" />
                </div>
              </form>
            </div>
            <TabsContent value="all" className="m-0 min-h-0 flex-1">
              <ContactList items={(contacts ?? [])} />
            </TabsContent>
            <TabsContent value="favorites" className="m-0 min-h-0 flex-1">
              <ContactList items={(contacts ?? []).slice(0, 5)} />
            </TabsContent>
          </Tabs>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={`${defaultLayout[2]}%`} minSize="30%">
          {contactStore.selected ? (
            <ContactDisplay 
              contact={(contacts ?? []).find((item) => item.email === contactStore.selected) || null}
              onClose={() => setContact({ ...contactStore, selected: null })}
            />
          ) : (
            <div className="flex flex-col h-full">
              <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
                <ContactIcon className="h-12 w-12 mb-4 opacity-50" />
                <p className="text-sm font-medium">Select a contact to view</p>
              </div>
              <Footer className="py-2 text-xs text-center text-muted-foreground" />
            </div>
          )}
        </ResizablePanel>
      </ResizablePanelGroup>
    </TooltipProvider>
  );
}