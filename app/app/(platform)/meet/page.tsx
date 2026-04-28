"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { AuthGuard } from "@/components/AuthGuard";
import { meetApi } from "@/lib/api/meet";
import { authApi } from "@/lib/api/auth";
import { contactsApi } from "@/lib/api/contacts";
import type { Conversation, Message, MeetUser, ConversationType } from "@/lib/api/meet-types";

const Meet = dynamic(() => import("@/components/meet/meet").then((mod) => mod.Meet), {
  ssr: false,
});

interface CurrentUser {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

interface ExtendedConversation extends Conversation {
  userId?: string;
}

interface ContactItem {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

function isBackendUnavailable(error: unknown): boolean {
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    return (
      msg.includes("not implemented") ||
      msg.includes("request failed") ||
      msg.includes("404")
    );
  }
  return false;
}

function isSessionError(error: unknown): boolean {
  if (error instanceof Error) {
    return error.message.includes("Session not found");
  }
  return false;
}

async function fetchContacts(accountEmail: string): Promise<ContactItem[]> {
  const response = await contactsApi.getContacts(accountEmail);
  if (!response.success || !response.data) {
    throw new Error(response.error || "Failed to load contacts");
  }
  const contactsData = response.data;
  if (!contactsData.contacts || !Array.isArray(contactsData.contacts)) {
    return [];
  }
  return contactsData.contacts.map((c: any) => ({
    id: c.id || c.email,
    name: c.name || c.first_name || c.email.split("@")[0] || "Unknown",
    email: c.email,
    avatarUrl: c.avatar_url,
  }));
}

async function fetchConversations(): Promise<ExtendedConversation[]> {
  const response = await meetApi.getConversations();
  if (response.success && response.data && response.data.length > 0) {
    return response.data as ExtendedConversation[];
  }
  return [];
}

function buildContactConversations(
  user: CurrentUser,
  contactList: ContactItem[]
): ExtendedConversation[] {
  return contactList.map((contact) => ({
    id: `direct-${contact.email}`,
    type: "direct" as ConversationType,
    name: contact.name,
    description: contact.email,
    participants: [
      {
        id: contact.id,
        name: contact.name,
        email: contact.email,
        avatarUrl: contact.avatarUrl,
        status: "offline",
      },
    ],
    unreadCount: 0,
    isMuted: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));
}

export default function MeetPage() {
  const queryClient = useQueryClient();
  const [currentUser, setCurrentUser] = React.useState<CurrentUser | null>(null);
  const [messages, setMessages] = React.useState<Record<string, Message[]>>({});

  React.useEffect(() => {
    const user = authApi.getStoredUser();
    if (user) {
      setCurrentUser({
        id: user.id || user.email,
        name: user.name || user.email.split("@")[0],
        email: user.email,
        avatarUrl: user.avatarUrl,
      });
    }
  }, []);

  const accountEmail = currentUser?.email;

  const {
    data: contacts = [],
    isLoading: contactsLoading,
  } = useQuery({
    queryKey: ["contacts", accountEmail],
    queryFn: () => fetchContacts(accountEmail!),
    enabled: !!accountEmail,
    staleTime: 5 * 60 * 1000,
  });

  const {
    data: serverConversations = [],
    isLoading: conversationsLoading,
  } = useQuery({
    queryKey: ["conversations"],
    queryFn: fetchConversations,
    enabled: !!accountEmail,
    staleTime: 2 * 60 * 1000,
  });

  const conversations = React.useMemo<ExtendedConversation[]>(() => {
    if (serverConversations.length > 0) {
      return serverConversations;
    }
    if (currentUser) {
      return buildContactConversations(currentUser, contacts);
    }
    return [];
  }, [serverConversations, currentUser, contacts]);

  const handleAuthError = (error: unknown) => {
    if (isSessionError(error)) {
      authApi.clearTokens();
      authApi.clearUser();
      window.location.href = "/login";
      return true;
    }
    return false;
  };

  const sendMessageMutation = useMutation({
    mutationFn: async ({ conversationId, content }: { conversationId: string; content: string }) => {
      const response = await meetApi.sendMessage(conversationId, content);
      if (response.success && response.data) {
        return response.data as Message;
      }
      throw new Error("Failed to send message");
    },
    onError: (error) => {
      if (!handleAuthError(error) && !isBackendUnavailable(error)) {
        console.error("Failed to send message:", error);
      }
    },
  });

  const createConversationMutation = useMutation({
    mutationFn: async ({
      type,
      name,
      participantIds,
    }: {
      type: "direct" | "group" | "channel";
      name: string;
      participantIds?: string[];
    }) => {
      const response = await meetApi.createConversation({
        type,
        name,
        participantIds: participantIds || [],
      });
      if (response.success && response.data) {
        return response.data as ExtendedConversation;
      }
      throw new Error("Failed to create conversation");
    },
    onSuccess: (data) => {
      queryClient.setQueryData<ExtendedConversation[]>(["conversations"], (old) =>
        old ? [...old, data] : [data]
      );
    },
    onError: (error, variables) => {
      if (handleAuthError(error)) return;
      if (!isBackendUnavailable(error)) {
        console.error("Failed to create conversation:", error);
        return;
      }

      // Fallback local si backend non disponible
      const participants: import("@/lib/api/meet-types").MeetUser[] =
        variables.participantIds
          ?.flatMap((pid) => {
            const contact = contacts.find((c) => c.id === pid || c.email === pid);
            if (!contact) return [];
            return [
              {
                id: contact.id,
                name: contact.name,
                email: contact.email,
                avatarUrl: contact.avatarUrl,
                status: "offline" as const,
              },
            ];
          }) || [];

      const newConversation: ExtendedConversation = {
        id: `${variables.type}-${Date.now()}`,
        type: variables.type,
        name:
          variables.type === "direct"
            ? participants[0]?.name || variables.name
            : variables.name,
        description:
          variables.type === "direct" ? participants[0]?.email || "" : "",
        participants,
        unreadCount: 0,
        isMuted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      queryClient.setQueryData<ExtendedConversation[]>(["conversations"], (old) =>
        old ? [...old, newConversation] : [newConversation]
      );
    },
  });

  const handleSelectConversation = async (conversationId: string) => {
    if (messages[conversationId]) return;
    try {
      const response = await meetApi.getConversationMessages(conversationId);
      if (response.success && response.data) {
        setMessages((prev) => ({
          ...prev,
          [conversationId]: response.data as Message[],
        }));
      }
    } catch (error) {
      if (handleAuthError(error)) return;
      if (!isBackendUnavailable(error)) {
        console.error("Failed to load messages:", error);
      }
    }
  };

  const handleStartCall = async (conversationId: string, callType: "audio" | "video") => {
    try {
      const response = await meetApi.startCall(conversationId);
      if (response.success && response.data) {
        console.log(`${callType} call started for conversation:`, conversationId);
      }
    } catch (error) {
      if (handleAuthError(error)) return;
      if (!isBackendUnavailable(error)) {
        console.error("Failed to start call:", error);
      }
    }
  };

  const handleAcceptCall = async (conversationId: string) => {
    try {
      const response = await meetApi.acceptCall(conversationId);
      if (response.success) {
        console.log("Call accepted for conversation:", conversationId);
      }
    } catch (error) {
      if (handleAuthError(error)) return;
      if (!isBackendUnavailable(error)) {
        console.error("Failed to accept call:", error);
      }
    }
  };

  const handleDeclineCall = async (conversationId: string) => {
    try {
      const response = await meetApi.declineCall(conversationId);
      if (response.success) {
        console.log("Call declined for conversation:", conversationId);
      }
    } catch (error) {
      if (handleAuthError(error)) return;
      if (!isBackendUnavailable(error)) {
        console.error("Failed to decline call:", error);
      }
    }
  };

  const handleSendMessage = async (conversationId: string, content: string) => {
    if (!currentUser) return;

    // Optimistic update
    const optimisticId = `optimistic-${Date.now()}`;
    const optimisticMessage: Message = {
      id: optimisticId,
      conversationId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      content,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => ({
      ...prev,
      [conversationId]: [...(prev[conversationId] || []), optimisticMessage],
    }));

    try {
      const data = await sendMessageMutation.mutateAsync({ conversationId, content });
      setMessages((prev) => ({
        ...prev,
        [conversationId]: prev[conversationId].map((m) =>
          m.id === optimisticId ? data : m
        ),
      }));
    } catch {
      setMessages((prev) => ({
        ...prev,
        [conversationId]: prev[conversationId].filter(
          (m) => m.id !== optimisticId
        ),
      }));
    }
  };

  const handleNewConversation = async (
    type: "direct" | "group" | "channel",
    name: string,
    participantIds?: string[]
  ) => {
    createConversationMutation.mutate({ type, name, participantIds });
  };

  const loading = !currentUser || contactsLoading || conversationsLoading;

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
        currentUser={currentUser as unknown as MeetUser}
        conversations={conversations}
        messages={messages}
        contacts={contacts}
        onSelectConversation={handleSelectConversation}
        onStartCall={handleStartCall}
        onAcceptCall={handleAcceptCall}
        onDeclineCall={handleDeclineCall}
        onSendMessage={handleSendMessage}
        onNewConversation={handleNewConversation}
      />
    </AuthGuard>
  );
}
