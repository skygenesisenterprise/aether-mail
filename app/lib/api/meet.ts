import type { 
  Conversation, 
  Message, 
  MeetUser,
  Meeting,
  MeetingParticipant,
  MeetingRecording,
  MeetingSettings,
  ApiResponse,
  ListResponse,
  ConversationType 
} from "./meet-types";

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

  async getMeetings(limit = 50, offset = 0): Promise<ListResponse<Meeting>> {
    return this.request(`/api/v1/meetings?limit=${limit}&offset=${offset}`);
  }

  async getMeeting(meetingId: string): Promise<ApiResponse<Meeting>> {
    return this.request(`/api/v1/meetings/${meetingId}`);
  }

  async createMeeting(data: {
    title: string;
    description?: string;
    startDate: string;
    endDate?: string;
    timezone?: string;
    recurring?: string;
    password?: string;
  }): Promise<ApiResponse<Meeting>> {
    return this.request("/api/v1/meetings", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateMeeting(meetingId: string, data: {
    title?: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    timezone?: string;
    recurring?: string;
    password?: string;
  }): Promise<ApiResponse<Meeting>> {
    return this.request(`/api/v1/meetings/${meetingId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteMeeting(meetingId: string): Promise<ApiResponse<{ success: boolean }>> {
    return this.request(`/api/v1/meetings/${meetingId}`, {
      method: "DELETE",
    });
  }

  async joinMeeting(meetingId: string, password?: string): Promise<ApiResponse<Meeting>> {
    return this.request(`/api/v1/meetings/${meetingId}/join`, {
      method: "POST",
      body: JSON.stringify({ password }),
    });
  }

  async startMeeting(meetingId: string): Promise<ApiResponse<Meeting>> {
    return this.request(`/api/v1/meetings/${meetingId}/start`, {
      method: "POST",
    });
  }

  async endMeeting(meetingId: string): Promise<ApiResponse<Meeting>> {
    return this.request(`/api/v1/meetings/${meetingId}/end`, {
      method: "POST",
    });
  }

  async leaveMeeting(meetingId: string): Promise<ApiResponse<{ success: boolean }>> {
    return this.request(`/api/v1/meetings/${meetingId}/leave`, {
      method: "POST",
    });
  }

  async getParticipants(meetingId: string): Promise<ListResponse<MeetingParticipant>> {
    return this.request(`/api/v1/meetings/${meetingId}/participants`);
  }

  async inviteParticipants(meetingId: string, email: string, name?: string): Promise<ApiResponse<{ success: boolean }>> {
    return this.request(`/api/v1/meetings/${meetingId}/invite`, {
      method: "POST",
      body: JSON.stringify({ email, name }),
    });
  }

  async removeParticipant(meetingId: string, userId: string): Promise<ApiResponse<{ success: boolean }>> {
    return this.request(`/api/v1/meetings/${meetingId}/participants/${userId}/remove`, {
      method: "POST",
    });
  }

  async muteParticipant(meetingId: string, userId: string): Promise<ApiResponse<{ success: boolean }>> {
    return this.request(`/api/v1/meetings/${meetingId}/participants/${userId}/mute`, {
      method: "POST",
    });
  }

  async removeFromCall(meetingId: string, userId: string): Promise<ApiResponse<{ success: boolean }>> {
    return this.request(`/api/v1/meetings/${meetingId}/participants/${userId}/remove-from-call`, {
      method: "POST",
    });
  }

  async getRecordings(meetingId: string): Promise<ListResponse<MeetingRecording>> {
    return this.request(`/api/v1/meetings/${meetingId}/recordings`);
  }

  async getRecording(meetingId: string, recordingId: string): Promise<ApiResponse<MeetingRecording>> {
    return this.request(`/api/v1/meetings/${meetingId}/recordings/${recordingId}`);
  }

  async startRecording(meetingId: string): Promise<ApiResponse<MeetingRecording>> {
    return this.request(`/api/v1/meetings/${meetingId}/recordings/start`, {
      method: "POST",
    });
  }

  async stopRecording(meetingId: string): Promise<ApiResponse<MeetingRecording>> {
    return this.request(`/api/v1/meetings/${meetingId}/recordings/stop`, {
      method: "POST",
    });
  }

  async deleteRecording(meetingId: string, recordingId: string): Promise<ApiResponse<{ success: boolean }>> {
    return this.request(`/api/v1/meetings/${meetingId}/recordings/${recordingId}`, {
      method: "DELETE",
    });
  }

  async getMeetingSettings(): Promise<ApiResponse<MeetingSettings>> {
    return this.request("/api/v1/meetings/settings");
  }

  async updateMeetingSettings(settings: Partial<MeetingSettings>): Promise<ApiResponse<MeetingSettings>> {
    return this.request("/api/v1/meetings/settings", {
      method: "PUT",
      body: JSON.stringify(settings),
    });
  }

  async getConversations(): Promise<ListResponse<Conversation>> {
    return this.request("/api/v1/meetings/conversations");
  }

  async getConversation(conversationId: string): Promise<ApiResponse<Conversation>> {
    return this.request(`/api/v1/meetings/conversations/${conversationId}`);
  }

  async startCall(conversationId: string): Promise<ApiResponse<Conversation>> {
    return this.request(`/api/v1/meetings/conversations/${conversationId}/start`, {
      method: "POST",
    });
  }

  async acceptCall(conversationId: string): Promise<ApiResponse<{ success: boolean }>> {
    return this.request(`/api/v1/meetings/conversations/${conversationId}/accept`, {
      method: "POST",
    });
  }

  async declineCall(conversationId: string): Promise<ApiResponse<{ success: boolean }>> {
    return this.request(`/api/v1/meetings/conversations/${conversationId}/decline`, {
      method: "POST",
    });
  }

  async holdCall(conversationId: string): Promise<ApiResponse<{ success: boolean }>> {
    return this.request(`/api/v1/meetings/conversations/${conversationId}/hold`, {
      method: "POST",
    });
  }

  async resumeCall(conversationId: string): Promise<ApiResponse<{ success: boolean }>> {
    return this.request(`/api/v1/meetings/conversations/${conversationId}/resume`, {
      method: "POST",
    });
  }

  async mute(conversationId: string): Promise<ApiResponse<{ success: boolean }>> {
    return this.request(`/api/v1/meetings/conversations/${conversationId}/mute`, {
      method: "POST",
    });
  }

  async unmute(conversationId: string): Promise<ApiResponse<{ success: boolean }>> {
    return this.request(`/api/v1/meetings/conversations/${conversationId}/unmute`, {
      method: "POST",
    });
  }

  async videoOn(conversationId: string): Promise<ApiResponse<{ success: boolean }>> {
    return this.request(`/api/v1/meetings/conversations/${conversationId}/video-on`, {
      method: "POST",
    });
  }

  async videoOff(conversationId: string): Promise<ApiResponse<{ success: boolean }>> {
    return this.request(`/api/v1/meetings/conversations/${conversationId}/video-off`, {
      method: "POST",
    });
  }

  async screenShare(conversationId: string): Promise<ApiResponse<{ success: boolean }>> {
    return this.request(`/api/v1/meetings/conversations/${conversationId}/screenshare`, {
      method: "POST",
    });
  }

  async stopScreenShare(conversationId: string): Promise<ApiResponse<{ success: boolean }>> {
    return this.request(`/api/v1/meetings/conversations/${conversationId}/screenshare-stop`, {
      method: "POST",
    });
  }

  async getConversationMessages(conversationId: string): Promise<ListResponse<Message>> {
    return this.request(`/api/v1/meetings/conversations/${conversationId}/messages`);
  }

  async sendMessage(conversationId: string, content: string): Promise<ApiResponse<Message>> {
    return this.request(`/api/v1/meetings/conversations/${conversationId}/messages`, {
      method: "POST",
      body: JSON.stringify({ content }),
    });
  }

  async deleteMessage(conversationId: string, messageId: string): Promise<ApiResponse<{ success: boolean }>> {
    return this.request(`/api/v1/meetings/conversations/${conversationId}/messages/${messageId}`, {
      method: "DELETE",
    });
  }

  async createConversation(data: {
    type: "direct" | "group" | "channel";
    name?: string;
    participantIds?: string[];
    description?: string;
  }): Promise<ApiResponse<Conversation>> {
    return this.request("/api/v1/meetings/conversations", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }
}

export const meetApi = new MeetApiService();