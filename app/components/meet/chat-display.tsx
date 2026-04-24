import * as React from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Hash, MessageSquare, MoreVertical, Phone, Video, Paperclip, Smile, Send, X, File, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Conversation, Message } from "@/lib/api/meet-types";

interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
}

interface ChatDisplayProps {
  conversation: Conversation | undefined;
  messages: Message[];
  currentUserId: string;
  onSendMessage: (content: string, attachments?: Attachment[]) => void;
  onStartCall?: (type: "audio" | "video") => void;
  onOpenSettings?: () => void;
  onFileAttached?: (file: File) => void;
}

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

function MessageItem({ message, isOwn }: { message: Message; isOwn: boolean }) {
  return (
    <div className={cn(
      "flex gap-3 max-w-[80%]",
      isOwn ? "ml-auto flex-row-reverse" : ""
    )}>
      <Avatar className="h-8 w-8 flex-shrink-0">
        <AvatarFallback className="text-xs">
          {message.senderName.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      
      <div className={cn(
        "flex flex-col",
        isOwn ? "items-end" : "items-start"
      )}>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium">{isOwn ? "You" : message.senderName}</span>
          <span className="text-xs text-muted-foreground">
            {formatMessageTime(message.timestamp)}
          </span>
        </div>
        
        <div className={cn(
          "rounded-lg px-3 py-2",
          isOwn ? "bg-primary text-primary-foreground" : "bg-muted"
        )}>
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        </div>
      </div>
    </div>
  );
}

export function ChatDisplay({
  conversation,
  messages,
  currentUserId,
  onSendMessage,
  onStartCall,
  onOpenSettings,
  onFileAttached,
}: ChatDisplayProps) {
  const [newMessage, setNewMessage] = React.useState("");
  const [attachments, setAttachments] = React.useState<Attachment[]>([]);
  const [showSettingsDialog, setShowSettingsDialog] = React.useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const commonEmojis = ["😀", "😂", "❤️", "👍", "🎉", "🔥", "💯", "😊", "🤔", "👏", "🙌", "✨"];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const attachment: Attachment = {
        id: `attachment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: file.name,
        size: file.size,
        type: file.type,
        url: URL.createObjectURL(file),
      };
      setAttachments((prev) => [...prev, attachment]);
      onFileAttached?.(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => {
      const removed = prev.find((a) => a.id === id);
      if (removed?.url) {
        URL.revokeObjectURL(removed.url);
      }
      return prev.filter((a) => a.id !== id);
    });
  };

  const insertEmoji = (emoji: string) => {
    setNewMessage((prev) => prev + emoji);
    setShowEmojiPicker(false);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (newMessage.trim() || attachments.length > 0) {
      onSendMessage(newMessage.trim(), attachments);
      setNewMessage("");
      setAttachments([]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleStartCall = (type: "audio" | "video") => {
    if (onStartCall) {
      onStartCall(type);
    } else {
      alert(`Starting ${type === "video" ? "video" : "audio"} call...`);
    }
  };

  const handleOpenSettings = () => {
    if (onOpenSettings) {
      onOpenSettings();
    } else {
      setShowSettingsDialog(true);
    }
  };

  if (!conversation) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <div className="text-center">
          <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">Select a conversation</p>
          <p className="text-sm">Choose a conversation from the list to start chatting</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback>
              {conversation.type === "channel" ? (
                <Hash className="h-4 w-4" />
              ) : (
                conversation.name.charAt(0).toUpperCase()
              )}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-semibold">
              {conversation.type === "channel" ? "# " : ""}{conversation.name}
            </h2>
            {conversation.description && (
              <p className="text-xs text-muted-foreground">{conversation.description}</p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={() => handleStartCall("audio")}>
                  <Phone className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Start call</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={() => handleStartCall("video")}>
                  <Video className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Start video call</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleStartCall("audio")}>
                <Phone className="mr-2 h-4 w-4" />
                Start audio call
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStartCall("video")}>
                <Video className="mr-2 h-4 w-4" />
                Start video call
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleOpenSettings}>
                <MoreVertical className="mr-2 h-4 w-4" />
                Conversation settings
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((message) => (
            <MessageItem 
              key={message.id} 
              message={message} 
              isOwn={message.senderId === currentUserId}
            />
          ))}
        </div>
      </ScrollArea>
      
      <div className="p-4 border-t">
        <div className="flex items-end gap-2">
          <div className="flex-1">
            {attachments.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {attachments.map((attachment) => (
                  <Badge key={attachment.id} variant="secondary" className="flex items-center gap-1 px-2 py-1">
                    {attachment.type.startsWith("image/") ? (
                      <ImageIcon className="h-3 w-3" />
                    ) : (
                      <File className="h-3 w-3" />
                    )}
                    <span className="max-w-[150px] truncate">{attachment.name}</span>
                    <span className="text-xs opacity-70">({formatFileSize(attachment.size)})</span>
                    <button
                      onClick={() => removeAttachment(attachment.id)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Message ${conversation?.type === "channel" ? "#" : ""}${conversation?.name}`}
              className="w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[44px] max-h-[200px]"
              rows={1}
            />
          </div>
          
          <div className="flex items-center gap-1">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
              multiple
            />
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()}>
                    <Paperclip className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Attach file</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <DropdownMenu open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Smile className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <div className="p-2">
                  <p className="text-xs text-muted-foreground mb-2">Frequently used</p>
                  <div className="flex flex-wrap gap-1">
                    {commonEmojis.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => insertEmoji(emoji)}
                        className="p-1 hover:bg-muted rounded text-lg"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button size="icon" onClick={handleSend} disabled={!newMessage.trim() && attachments.length === 0}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Conversation Settings</DialogTitle>
            <DialogDescription>
              Manage settings for {conversation?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Notifications</p>
                <p className="text-sm text-muted-foreground">Receive notifications for new messages</p>
              </div>
              <Button variant="outline" size="sm">Configure</Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Mute conversation</p>
                <p className="text-sm text-muted-foreground">Stop receiving notifications</p>
              </div>
              <Button variant="outline" size="sm">Mute</Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Clear history</p>
                <p className="text-sm text-muted-foreground">Delete all messages in this conversation</p>
              </div>
              <Button variant="destructive" size="sm">Clear</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}