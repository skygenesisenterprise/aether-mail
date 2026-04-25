 export type ConversationType = "direct" | "channel" | "group";

export interface MeetUser {
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
  type?: "text" | "image" | "file";
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
  userId?: string;
  meetingId?: string;
  type: ConversationType;
  name: string;
  description?: string;
  avatarUrl?: string;
  participants: MeetUser[];
  lastMessage?: Message;
  unreadCount: number;
  isMuted: boolean;
  status?: "waiting" | "active" | "ended";
  createdAt: string;
  updatedAt?: string;
}

export interface Channel extends Conversation {
  type: "channel";
  isPrivate: boolean;
  memberCount: number;
  adminIds: string[];
}

export interface Meeting {
  id: string;
  userId?: string;
  title: string;
  description?: string;
  startDate: string;
  endDate?: string;
  timezone?: string;
  recurring?: string;
  password?: string;
  settings?: string;
  hostUrl?: string;
  joinUrl?: string;
  status: "scheduled" | "active" | "ended";
  createdAt: string;
  updatedAt?: string;
}

export interface MeetingParticipant {
  id: string;
  meetingId: string;
  userId?: string;
  email?: string;
  name?: string;
  role: "host" | "participant";
  status: "pending" | "accepted" | "declined";
  joinedAt?: string;
}

export interface MeetingRecording {
  id: string;
  meetingId: string;
  url: string;
  duration?: number;
  size?: number;
  status: "processing" | "ready" | "failed";
}

export interface MeetingSettings {
  id: string;
  userId: string;
  defaultDuration: number;
  defaultTimezone: string;
  waitingRoomEnabled: boolean;
  chatEnabled: boolean;
  screenShareEnabled: boolean;
  recordingEnabled: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ListResponse<T> {
  success: boolean;
  data?: T[];
  total?: number;
  error?: string;
}