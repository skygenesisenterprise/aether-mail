export type ConversationType = "direct" | "channel" | "group";

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  status?: "online" | "away" | "busy" | "offline";
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  timestamp: string;
  isEdited?: boolean;
  attachments?: MessageAttachment[];
  reactions?: MessageReaction[];
  replyToId?: string;
}

export interface MessageAttachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
}

export interface MessageReaction {
  emoji: string;
  userId: string;
  userName: string;
}

export interface Conversation {
  id: string;
  type: ConversationType;
  name: string;
  description?: string;
  avatarUrl?: string;
  participants: User[];
  lastMessage?: Message;
  unreadCount: number;
  isMuted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Channel extends Conversation {
  type: "channel";
  isPrivate: boolean;
  memberCount: number;
  adminIds: string[];
}

export interface MeetResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}