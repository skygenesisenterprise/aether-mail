package models

type Notification struct {
	ID        string `json:"id"`
	UserID   string `json:"user_id"`
	Type     string `json:"type"`
	Title    string `json:"title"`
	Message  string `json:"message,omitempty"`
	Data     string `json:"data,omitempty"`
	Read     bool   `json:"read"`
	ReadAt   string `json:"read_at,omitempty"`
	CreatedAt string `json:"created_at"`
}

type MarkNotificationsReadRequest struct {
	NotificationIDs []string `json:"notification_ids" binding:"required"`
}

type MarkNotificationReadRequest struct {
	AccountID        string   `json:"account_id"`
	NotificationIDs []string `json:"notification_ids" binding:"required"`
}