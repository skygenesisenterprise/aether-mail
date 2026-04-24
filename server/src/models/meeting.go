package models

type Meeting struct {
	ID          string `json:"id"`
	UserID     string `json:"user_id"`
	Title      string `json:"title"`
	Description string `json:"description,omitempty"`
	StartDate  string `json:"start_date"`
	EndDate    string `json:"end_date,omitempty"`
	Timezone   string `json:"timezone,omitempty"`
	Recurring  string `json:"recurring,omitempty"`
	Password   string `json:"password,omitempty"`
	Settings   string `json:"settings,omitempty"`
	HostURL    string `json:"host_url,omitempty"`
	JoinURL    string `json:"join_url,omitempty"`
	Status     string `json:"status"`
	CreatedAt  string `json:"created_at"`
	UpdatedAt  string `json:"updated_at"`
}

type MeetingParticipant struct {
	ID        string `json:"id"`
	MeetingID string `json:"meeting_id"`
	UserID   string `json:"user_id,omitempty"`
	Email    string `json:"email,omitempty"`
	Name     string `json:"name,omitempty"`
	Role     string `json:"role"`
	Status   string `json:"status"`
	JoinedAt string `json:"joined_at,omitempty"`
}

type MeetingConversation struct {
	ID       string `json:"id"`
	UserID  string `json:"user_id"`
	Type    string `json:"type"`
	Status string `json:"status"`
}

type ConversationMessage struct {
	ID              string `json:"id"`
	ConversationID string `json:"conversation_id"`
	SenderID       string `json:"sender_id,omitempty"`
	Content        string `json:"content"`
	Type           string `json:"type"`
	CreatedAt      string `json:"created_at"`
}

type MeetingSettings struct {
	ID                  string `json:"id"`
	UserID              string `json:"user_id"`
	DefaultDuration     int    `json:"default_duration"`
	DefaultTimezone     string `json:"default_timezone"`
	WaitingRoomEnabled  bool   `json:"waiting_room_enabled"`
	ChatEnabled        bool   `json:"chat_enabled"`
	ScreenShareEnabled bool   `json:"screen_share_enabled"`
	RecordingEnabled  bool   `json:"recording_enabled"`
}

type MeetingRecording struct {
	ID        string `json:"id"`
	MeetingID string `json:"meeting_id"`
	URL      string `json:"url"`
	Duration int    `json:"duration,omitempty"`
	Size     int    `json:"size,omitempty"`
	Status   string `json:"status"`
}

type CreateMeetingRequest struct {
	Title       string `json:"title" binding:"required"`
	Description string `json:"description"`
	StartDate  string `json:"start_date" binding:"required"`
	EndDate   string `json:"end_date"`
	Timezone  string `json:"timezone"`
	Recurring string `json:"recurring"`
	Password string `json:"password"`
}

type UpdateMeetingRequest struct {
	Title       string `json:"title"`
	Description string `json:"description"`
	StartDate  string `json:"start_date"`
	EndDate   string `json:"end_date"`
	Timezone  string `json:"timezone"`
	Recurring string `json:"recurring"`
	Password string `json:"password"`
}

type JoinMeetingRequest struct {
	Password string `json:"password,omitempty"`
}

type InviteParticipantRequest struct {
	Email string `json:"email" binding:"required"`
	Name  string `json:"name"`
}