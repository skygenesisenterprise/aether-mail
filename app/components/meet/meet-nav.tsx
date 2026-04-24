import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Hash, Plus, Search, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Conversation } from "@/lib/api/meet-types";

const statusColors: Record<string, string> = {
  online: "bg-green-500",
  away: "bg-yellow-500",
  busy: "bg-red-500",
  offline: "bg-gray-400",
};

function formatMessageTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  
  if (isToday) {
    return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  }
  
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  }
  
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

interface MeetNavProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  totalUnread: number;
  onNewConversation?: () => void;
}

export function MeetNav({
  isCollapsed = false,
  conversations,
  activeConversationId,
  onSelectConversation,
  totalUnread,
  onNewConversation,
}: MeetNavProps) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [activeTab, setActiveTab] = React.useState("chats");

  const filteredConversations = React.useMemo(() => {
    let filtered = conversations;
    
    if (activeTab === "chats") {
      filtered = filtered.filter(c => c.type === "direct" || c.type === "group");
    } else if (activeTab === "channels") {
      filtered = filtered.filter(c => c.type === "channel");
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(c => 
        c.name.toLowerCase().includes(query) ||
        c.description?.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }, [conversations, activeTab, searchQuery]);

  return (
    <div className="flex flex-col h-full border-r bg-background">
      <div className="p-3 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="px-3 pt-3">
          <TabsList className="w-full">
            <TabsTrigger value="chats" className="flex-1">
              <MessageSquare className="h-4 w-4 mr-2" />
              Chats
              {totalUnread > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 px-1.5">
                  {totalUnread}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="channels" className="flex-1">
              <Hash className="h-4 w-4 mr-2" />
              Channels
            </TabsTrigger>
          </TabsList>
        </div>
        
        <ScrollArea className="flex-1 px-2">
          <TabsContent value="chats" className="m-0 mt-2">
            <div className="space-y-1">
              {filteredConversations.map((conversation) => (
                <ConversationItem
                  key={conversation.id}
                  conversation={conversation}
                  isActive={conversation.id === activeConversationId}
                  onClick={() => onSelectConversation(conversation.id)}
                />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="channels" className="m-0 mt-2">
            <div className="space-y-1">
              {filteredConversations.map((conversation) => (
                <ConversationItem
                  key={conversation.id}
                  conversation={conversation}
                  isActive={conversation.id === activeConversationId}
                  onClick={() => onSelectConversation(conversation.id)}
                />
              ))}
            </div>
          </TabsContent>
        </ScrollArea>
      </Tabs>
      
      <Separator />
      
      <div className="p-3 border-t">
        <Button variant="outline" className="w-full justify-start" onClick={onNewConversation}>
          <Plus className="h-4 w-4 mr-2" />
          New conversation
        </Button>
      </div>
    </div>
  );
}

interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  onClick: () => void;
}

function ConversationItem({ conversation, isActive, onClick }: ConversationItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left",
        isActive ? "bg-accent" : "hover:bg-muted/50"
      )}
    >
      <div className="relative flex-shrink-0">
        <Avatar className="h-10 w-10">
          <AvatarFallback>
            {conversation.type === "channel" ? (
              <Hash className="h-4 w-4" />
            ) : (
              conversation.name.charAt(0).toUpperCase()
            )}
          </AvatarFallback>
        </Avatar>
        {conversation.type === "direct" && conversation.participants[0]?.status && (
          <span 
            className={cn(
              "absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background",
              statusColors[conversation.participants[0].status]
            )}
          />
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className={cn(
            "font-medium truncate",
            conversation.unreadCount > 0 && "font-semibold"
          )}>
            {conversation.type === "channel" ? "# " : ""}{conversation.name}
          </span>
          {conversation.lastMessage && (
            <span className="text-xs text-muted-foreground">
              {formatMessageTime(conversation.lastMessage.timestamp)}
            </span>
          )}
        </div>
        
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground truncate">
            {conversation.lastMessage ? (
              `${conversation.lastMessage.senderName === "You" ? "You" : conversation.lastMessage.senderName}: ${conversation.lastMessage.content}`
            ) : (
              conversation.description || "No messages yet"
            )}
          </p>
          
          {conversation.unreadCount > 0 && (
            <Badge variant="default" className="ml-2 h-5 min-w-5 justify-center">
              {conversation.unreadCount}
            </Badge>
          )}
        </div>
      </div>
    </button>
  );
}