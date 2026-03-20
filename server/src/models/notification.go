package models

import "time"

type Notification struct {
	ID          string    `json:"id"`
	AccountID   string    `json:"account_id"`
	Type        string    `json:"type"` // new_email, mention, reply, system
	Title       string    `json:"title"`
	Body        string    `json:"body"`
	EmailID     string    `json:"email_id,omitempty"`
	SenderEmail string    `json:"sender_email,omitempty"`
	IsRead      bool      `json:"is_read"`
	IsDismissed bool      `json:"is_dismissed"`
	CreatedAt   time.Time `json:"created_at"`
}

type NotificationList struct {
	AccountID     string          `json:"account_id"`
	TotalUnread   int64           `json:"total_unread"`
	Notifications []*Notification `json:"notifications"`
}

type NotificationResponse struct {
	Success bool          `json:"success"`
	Data    *Notification `json:"data,omitempty"`
	Error   string        `json:"error,omitempty"`
}

type NotificationListResponse struct {
	Success bool              `json:"success"`
	Data    *NotificationList `json:"data,omitempty"`
	Error   string            `json:"error,omitempty"`
}

type MarkNotificationReadRequest struct {
	AccountID       string   `json:"account_id" binding:"required"`
	NotificationIDs []string `json:"notification_ids" binding:"required"`
}

type WebhookPayload struct {
	Type      string      `json:"type"`
	AccountID string      `json:"account_id"`
	Data      interface{} `json:"data"`
}
