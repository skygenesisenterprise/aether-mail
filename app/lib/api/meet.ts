import type { Conversation, Message, User, MeetResponse, ConversationType } from "./meet-types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

class MeetApiService {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private getToken(): string | null {
    if (typeof window === "undefined") return null;
    const token = localStorage.getItem("accessToken");
    if (!token || token === "undefined" || token === "null") {
      return null;
    }
    return token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const token = this.getToken();

    if (!token) {
      throw new Error("Not authenticated");
    }

    const config: RequestInit = {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    };

    const response = await fetch(url, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Request failed" }));
      throw new Error(errorData.error || `Request failed with status ${response.status}`);
    }

    return response.json();
  }

  async getConversations(): Promise<MeetResponse<Conversation[]>> {
    return this.request("/api/v1/conversations");
  }

  async getConversation(conversationId: string): Promise<MeetResponse<Conversation>> {
    return this.request(`/api/v1/conversations/${conversationId}`);
  }

  async createConversation(data: {
    type: ConversationType;
    name?: string;
    participantIds: string[];
  }): Promise<MeetResponse<Conversation>> {
    return this.request("/api/v1/conversations", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateConversation(conversationId: string, data: {
    name?: string;
    description?: string;
  }): Promise<MeetResponse<Conversation>> {
    return this.request(`/api/v1/conversations/${conversationId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async deleteConversation(conversationId: string): Promise<MeetResponse<{ success: boolean }>> {
    return this.request(`/api/v1/conversations/${conversationId}`, {
      method: "DELETE",
    });
  }

  async getMessages(conversationId: string, limit: number = 50, before?: string): Promise<MeetResponse<Message[]>> {
    const params = new URLSearchParams();
    params.set("limit", limit.toString());
    if (before) params.set("before", before);
    
    return this.request(`/api/v1/conversations/${conversationId}/messages?${params}`);
  }

  async sendMessage(conversationId: string, content: string, replyToId?: string): Promise<MeetResponse<Message>> {
    return this.request(`/api/v1/conversations/${conversationId}/messages`, {
      method: "POST",
      body: JSON.stringify({ content, replyToId }),
    });
  }

  async editMessage(conversationId: string, messageId: string, content: string): Promise<MeetResponse<Message>> {
    return this.request(`/api/v1/conversations/${conversationId}/messages/${messageId}`, {
      method: "PATCH",
      body: JSON.stringify({ content }),
    });
  }

  async deleteMessage(conversationId: string, messageId: string): Promise<MeetResponse<{ success: boolean }>> {
    return this.request(`/api/v1/conversations/${conversationId}/messages/${messageId}`, {
      method: "DELETE",
    });
  }

  async addReaction(conversationId: string, messageId: string, emoji: string): Promise<MeetResponse<{ success: boolean }>> {
    return this.request(`/api/v1/conversations/${conversationId}/messages/${messageId}/reactions`, {
      method: "POST",
      body: JSON.stringify({ emoji }),
    });
  }

  async removeReaction(conversationId: string, messageId: string, emoji: string): Promise<MeetResponse<{ success: boolean }>> {
    return this.request(`/api/v1/conversations/${conversationId}/messages/${messageId}/reactions`, {
      method: "DELETE",
      body: JSON.stringify({ emoji }),
    });
  }

  async markAsRead(conversationId: string): Promise<MeetResponse<{ success: boolean }>> {
    return this.request(`/api/v1/conversations/${conversationId}/read`, {
      method: "POST",
    });
  }

  async muteConversation(conversationId: string, muted: boolean): Promise<MeetResponse<{ success: boolean }>> {
    return this.request(`/api/v1/conversations/${conversationId}/mute`, {
      method: "POST",
      body: JSON.stringify({ muted }),
    });
  }

  async getChannels(): Promise<MeetResponse<Conversation[]>> {
    return this.request("/api/v1/channels");
  }

  async createChannel(data: {
    name: string;
    description?: string;
    isPrivate?: boolean;
    memberIds?: string[];
  }): Promise<MeetResponse<Conversation>> {
    return this.request("/api/v1/channels", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async joinChannel(channelId: string): Promise<MeetResponse<{ success: boolean }>> {
    return this.request(`/api/v1/channels/${channelId}/join`, {
      method: "POST",
    });
  }

  async leaveChannel(channelId: string): Promise<MeetResponse<{ success: boolean }>> {
    return this.request(`/api/v1/channels/${channelId}/leave`, {
      method: "POST",
    });
  }

  async searchMessages(query: string, conversationId?: string): Promise<MeetResponse<Message[]>> {
    const params = new URLSearchParams({ query });
    if (conversationId) params.set("conversationId", conversationId);
    return this.request(`/api/v1/messages/search?${params}`);
  }

  async getUnreadCount(): Promise<MeetResponse<{ total: number; byConversation: Record<string, number> }>> {
    return this.request("/api/v1/conversations/unread-count");
  }
}

export const meetApi = new MeetApiService();