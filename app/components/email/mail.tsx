import * as React from "react";
import {
  AlertCircle,
  Archive,
  ArchiveX,
  File,
  Inbox,
  MessagesSquare,
  PenSquare,
  Search,
  Send,
  ShoppingCart,
  Trash2,
  Users2,
  Mail as MailIcon,
  History,
  FolderSearch,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AccountSwitcher } from "@/components/email/account-switcher";
import { MailDisplay } from "@/components/email/mail-display";
import { MailList } from "@/components/email/mail-list";
import { Nav } from "@/components/email/nav";
import { EmailEditor } from "@/components/email/EmailEditor";
import { Footer } from "@/components/email/Footer";

import { useMail } from "@/components/email/use-mail";

interface MailItem {
  id: string;
  name: string;
  email: string;
  subject: string;
  text: string;
  html?: string;
  date: string;
  read: boolean;
  starred?: boolean;
  labels: string[];
  folderId?: string;
}

interface MailProps extends React.HTMLAttributes<HTMLDivElement> {
  accounts?: {
    label: string;
    email: string;
    icon: React.ReactNode;
  }[];
  mails?: MailItem[];
  defaultLayout?: number[];
  defaultCollapsed?: boolean;
  navCollapsedSize: number;
  isLoading?: boolean;
}

export function Mail({
  accounts = [],
  mails = [],
  defaultLayout = [20, 32, 48],
  defaultCollapsed = false,
  navCollapsedSize,
  isLoading = false,
}: MailProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed);
  const [mailStore, setMail] = useMail();
  const [isWriting, setIsWriting] = React.useState(false);
  const [activeFolder, setActiveFolder] = React.useState("inbox");
  const [isClientLoading, setIsClientLoading] = React.useState(isLoading);

  React.useEffect(() => {
    if (mails.length > 0 || !isLoading) {
      setIsClientLoading(false);
    }
  }, [mails, isLoading]);

  const folderLabels: Record<string, string> = {
    inbox: "Inbox",
    drafts: "Drafts",
    sent: "Sent",
    junk: "Junk",
    trash: "Trash",
    archive: "Archive",
    social: "Social",
    updates: "Updates",
    forums: "Forums",
    shopping: "Shopping",
    promotions: "Promotions",
  };

  const folderMap: Record<string, string[]> = {
    inbox: ["INBOX", "inbox"],
    drafts: ["Drafts", "drafts", "draft"],
    sent: ["Sent", "sent", "Sent Items"],
    junk: ["Junk", "Spam", "junk", "spam"],
    trash: ["Trash", "Deleted", "trash", "deleted"],
    archive: ["Archive", "All Mail", "archive", "all"],
    social: ["Social", "social"],
    updates: ["Updates", "updates"],
    forums: ["Forums", "forums"],
    shopping: ["Shopping", "promotions", "shopping"],
    promotions: ["Promotions", "promotions"],
  };

  const getFolderCount = (folder: string): number => {
    const folderNames = folderMap[folder] || [folder];
    return mails.filter(mail => {
      const mailFolder = (mail as any).folderId || "INBOX";
      return folderNames.some(f => 
        mailFolder.toLowerCase() === f.toLowerCase() ||
        mailFolder.toLowerCase().includes(f.toLowerCase())
      );
    }).length;
  };

  const getUnreadCount = (folder: string): number => {
    const folderNames = folderMap[folder] || [folder];
    return mails.filter(mail => {
      const mailFolder = (mail as any).folderId || "INBOX";
      return !mail.read && folderNames.some(f => 
        mailFolder.toLowerCase() === f.toLowerCase() ||
        mailFolder.toLowerCase().includes(f.toLowerCase())
      );
    }).length;
  };

  const filteredMails = React.useMemo(() => {
    const folderNames = folderMap[activeFolder] || [activeFolder];
    return mails.filter(mail => {
      const mailFolder = (mail as any).folderId || "INBOX";
      return folderNames.some(f => 
        mailFolder.toLowerCase() === f.toLowerCase() ||
        mailFolder.toLowerCase().includes(f.toLowerCase())
      );
    });
  }, [mails, activeFolder]);

  return (
    <TooltipProvider delayDuration={0}>
      {isClientLoading ? (
        <div className="flex items-center justify-center h-full">
          <div className="flex flex-col items-center gap-2">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">Loading emails...</p>
          </div>
        </div>
      ) : (
      <ResizablePanelGroup
        orientation="horizontal"
        onLayoutChanged={(layout) => {
          document.cookie = `react-resizable-panels:layout:mail=${JSON.stringify(layout)}`;
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
                onClick={() => setIsWriting(true)}
              >
                <PenSquare className="h-4 w-4" />
                <span className={cn(isCollapsed && "hidden")}>New Email</span>
              </Button>
              <div className="border-t border-border" />
              <AccountSwitcher isCollapsed={isCollapsed} accounts={accounts} />
            </div>
          </div>
          <Separator />
          <Nav
            isCollapsed={isCollapsed}
            links={[
              {
                title: "Inbox",
                label: String(getUnreadCount("inbox") || ""),
                icon: Inbox,
                variant: activeFolder === "inbox" ? "default" : "ghost",
                onClick: () => setActiveFolder("inbox"),
              },
              {
                title: "Drafts",
                label: String(getFolderCount("drafts") || ""),
                icon: File,
                variant: activeFolder === "drafts" ? "default" : "ghost",
                onClick: () => setActiveFolder("drafts"),
              },
              {
                title: "Sent",
                label: String(getFolderCount("sent") || ""),
                icon: Send,
                variant: activeFolder === "sent" ? "default" : "ghost",
                onClick: () => setActiveFolder("sent"),
              },
              {
                title: "Junk",
                label: String(getUnreadCount("junk") || ""),
                icon: ArchiveX,
                variant: activeFolder === "junk" ? "default" : "ghost",
                onClick: () => setActiveFolder("junk"),
              },
              {
                title: "Trash",
                label: String(getFolderCount("trash") || ""),
                icon: Trash2,
                variant: activeFolder === "trash" ? "default" : "ghost",
                onClick: () => setActiveFolder("trash"),
              },
              {
                title: "Archive",
                label: String(getFolderCount("archive") || ""),
                icon: Archive,
                variant: activeFolder === "archive" ? "default" : "ghost",
                onClick: () => setActiveFolder("archive"),
              },
              {
                title: "Conversation history",
                label: "25",
                icon: History,
                variant: activeFolder === "history" ? "default" : "ghost",
                onClick: () => setActiveFolder("history"),
              },
              {
                title: "Research file",
                label: "",
                icon: FolderSearch,
                variant: activeFolder === "all" ? "default" : "ghost",
                onClick: () => setActiveFolder("all"),
              },
            ]}
          />
          <Separator />
          <Nav
            isCollapsed={isCollapsed}
            links={[
              {
                title: "Social",
                label: "972",
                icon: Users2,
                variant: activeFolder === "social" ? "default" : "ghost",
                onClick: () => setActiveFolder("social"),
              },
              {
                title: "Updates",
                label: "342",
                icon: AlertCircle,
                variant: activeFolder === "updates" ? "default" : "ghost",
                onClick: () => setActiveFolder("updates"),
              },
              {
                title: "Forums",
                label: "128",
                icon: MessagesSquare,
                variant: activeFolder === "forums" ? "default" : "ghost",
                onClick: () => setActiveFolder("forums"),
              },
              {
                title: "Shopping",
                label: "8",
                icon: ShoppingCart,
                variant: activeFolder === "shopping" ? "default" : "ghost",
                onClick: () => setActiveFolder("shopping"),
              },
              {
                title: "Promotions",
                label: "21",
                icon: Archive,
                variant: activeFolder === "promotions" ? "default" : "ghost",
                onClick: () => setActiveFolder("promotions"),
              },
            ]}
          />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={`${defaultLayout[1]}%`} minSize="30%">
          <Tabs defaultValue="all" className="flex h-full flex-col">
            <div className="flex items-center px-4 py-1.5">
              <h1 className="text-foreground text-xl font-bold">{folderLabels[activeFolder] || "Inbox"}</h1>
              <TabsList className="ml-auto">
                <TabsTrigger value="all">All mail</TabsTrigger>
                <TabsTrigger value="unread">Unread</TabsTrigger>
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
              <MailList items={filteredMails} />
            </TabsContent>
            <TabsContent value="unread" className="m-0 min-h-0 flex-1">
              <MailList items={filteredMails.filter((item) => !item.read)} />
            </TabsContent>
          </Tabs>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={`${defaultLayout[2]}%`} minSize="30%">
          {isWriting ? (
            <EmailEditor onClose={() => setIsWriting(false)} />
          ) : mailStore.selected ? (
            <MailDisplay 
              mail={(mails ?? []).find((item) => item.id === mailStore.selected) || null} 
              onClose={() => setMail({ ...mailStore, selected: null })}
            />
          ) : (
            <div className="flex flex-col h-full">
              <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
                <MailIcon className="h-12 w-12 mb-4 opacity-50" />
                <p className="text-sm font-medium">Select an item to read</p>
              </div>
              <Footer className="py-2 text-xs text-center text-muted-foreground" />
            </div>
          )}
        </ResizablePanel>
      </ResizablePanelGroup>
      )}
    </TooltipProvider>
  );
}
