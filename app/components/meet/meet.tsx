import * as React from "react";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { TooltipProvider } from "@/components/ui/tooltip";
import { MeetNav } from "./meet-nav";
import { ChatDisplay } from "./chat-display";
import type { Conversation, Message, User } from "@/lib/api/meet-types";

interface MeetProps extends React.HTMLAttributes<HTMLDivElement> {
  currentUser: User;
  conversations: Conversation[];
  messages: Record<string, Message[]>;
  defaultLayout?: number[];
  navCollapsedSize?: number;
}

export function Meet({
  currentUser,
  conversations,
  messages,
  defaultLayout = [30, 70],
  navCollapsedSize = 4,
  className,
  ...props
}: MeetProps) {
  const [activeConversationId, setActiveConversationId] = React.useState<string | null>(
    conversations[0]?.id || null
  );
  const [localMessages, setLocalMessages] = React.useState<Record<string, Message[]>>(messages);

  const activeConversation = conversations.find(c => c.id === activeConversationId);
  const activeMessages = activeConversationId ? (localMessages[activeConversationId] || []) : [];
  const totalUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0);

  const handleSendMessage = (content: string, attachments?: any[]) => {
    if (!activeConversationId) return;
    
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      conversationId: activeConversationId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      content,
      timestamp: new Date().toISOString(),
    };
    
    setLocalMessages(prev => ({
      ...prev,
      [activeConversationId]: [...(prev[activeConversationId] || []), newMessage],
    }));
  };

  return (
    <TooltipProvider delayDuration={0}>
      <ResizablePanelGroup
        orientation="horizontal"
        onLayoutChanged={(layout) => {
          document.cookie = `react-resizable-panels:layout:meet=${JSON.stringify(layout)}`;
        }}
        className="h-full items-stretch"
        {...props}
      >
        <ResizablePanel
          defaultSize={`${defaultLayout[0]}%`}
          minSize={`${defaultLayout[0]}%`}
          maxSize={`${defaultLayout[0]}%`}
        >
          <MeetNav
            conversations={conversations}
            activeConversationId={activeConversationId}
            onSelectConversation={setActiveConversationId}
            totalUnread={totalUnread}
          />
        </ResizablePanel>

        <ResizableHandle />

        <ResizablePanel defaultSize={`${defaultLayout[1]}%`}>
          <ChatDisplay
            conversation={activeConversation}
            messages={activeMessages}
            currentUserId={currentUser.id}
            onSendMessage={handleSendMessage}
            onStartCall={(type) => console.log(`Starting ${type} call`)}
            onOpenSettings={() => console.log("Opening settings")}
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </TooltipProvider>
  );
}