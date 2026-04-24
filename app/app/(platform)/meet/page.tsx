"use client";

import * as React from "react";
import { AuthGuard } from "@/components/AuthGuard";
import { Meet } from "@/components/meet/meet";
import { meetApi } from "@/lib/api/meet";
import type { Conversation, Message, MeetUser, ApiResponse, ListResponse } from "@/lib/api/meet-types";

interface CurrentUser {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

interface ExtendedConversation extends Conversation {
  userId?: string;
}

export default function MeetPage() {
  const currentUser = React.useRef<CurrentUser>({
    id: "current-user",
    name: "Current User",
    email: "user@example.com",
  });

  const [conversations, setConversations] = React.useState<ExtendedConversation[]>([]);
  const [messages, setMessages] = React.useState<Record<string, Message[]>>({});
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const convResponse = await meetApi.getConversations();
      if (convResponse.success && convResponse.data) {
        setConversations(convResponse.data as ExtendedConversation[]);
      }
    } catch (error) {
      console.error("Failed to load conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartCall = async (conversationId: string, callType: "audio" | "video") => {
    try {
      const response = await meetApi.startCall(conversationId);
      if (response.success && response.data) {
        console.log(`${callType} call started for conversation:`, conversationId);
      }
    } catch (error) {
      console.error("Failed to start call:", error);
    }
  };

  const handleAcceptCall = async (conversationId: string) => {
    try {
      const response = await meetApi.acceptCall(conversationId);
      if (response.success) {
        console.log("Call accepted for conversation:", conversationId);
      }
    } catch (error) {
      console.error("Failed to accept call:", error);
    }
  };

  const handleDeclineCall = async (conversationId: string) => {
    try {
      const response = await meetApi.declineCall(conversationId);
      if (response.success) {
        console.log("Call declined for conversation:", conversationId);
      }
    } catch (error) {
      console.error("Failed to decline call:", error);
    }
  };

  const handleSendMessage = async (conversationId: string, content: string) => {
    try {
      const response = await meetApi.sendMessage(conversationId, content);
      if (response.success && response.data) {
        setMessages(prev => ({
          ...prev,
          [conversationId]: [...(prev[conversationId] || []), response.data as Message],
        }));
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      const newMessage: Message = {
        id: `msg-${Date.now()}`,
        conversationId,
        senderId: currentUser.current.id,
        senderName: currentUser.current.name,
        content,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => ({
        ...prev,
        [conversationId]: [...(prev[conversationId] || []), newMessage],
      }));
    }
  };

  const handleNewConversation = async (type: "direct" | "group" | "channel", name: string, participantIds?: string[]) => {
    try {
      const response = await meetApi.createConversation({
        type: type as "direct" | "group" | "channel",
        name: name,
        participantIds: participantIds || [],
      });
      if (response.success && response.data) {
        setConversations(prev => [...prev, response.data as ExtendedConversation]);
      }
    } catch (error) {
      console.error("Failed to create conversation:", error);
    }
  };

  if (loading) {
    return (
      <AuthGuard>
        <div className="flex items-center justify-center h-full">
          <p>Loading conversations...</p>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <Meet
        currentUser={currentUser.current as unknown as MeetUser}
        conversations={conversations}
        messages={messages}
        onStartCall={handleStartCall}
        onAcceptCall={handleAcceptCall}
        onDeclineCall={handleDeclineCall}
        onSendMessage={handleSendMessage}
        onNewConversation={handleNewConversation}
      />
    </AuthGuard>
  );
}