package models

type Folder struct {
	ID           string   `json:"id"`
	AccountID    string   `json:"account_id"`
	Name         string   `json:"name"`
	ParentID     string   `json:"parent_id,omitempty"`
	Path         string   `json:"path"`
	SortOrder    int      `json:"sort_order"`
	TotalEmails  int64    `json:"total_emails"`
	UnreadEmails int64    `json:"unread_emails"`
	IsSubscribed bool     `json:"is_subscribed"`
	IsSelectable bool     `json:"is_selectable"`
	Rights       []string `json:"rights,omitempty"`
}

type FolderList struct {
	AccountID string    `json:"account_id"`
	Folders   []*Folder `json:"folders"`
}

type FolderResponse struct {
	Success bool    `json:"success"`
	Data    *Folder `json:"data,omitempty"`
	Error   string  `json:"error,omitempty"`
}

type FolderListResponse struct {
	Success bool        `json:"success"`
	Data    *FolderList `json:"data,omitempty"`
	Error   string      `json:"error,omitempty"`
}

type FolderAction struct {
	AccountID string      `json:"account_id" binding:"required"`
	MailboxID []string    `json:"mailbox_id" binding:"required"`
	Operation string      `json:"operation" binding:"required"` // markRead, markUnread, markStarred, move, delete
	Value     interface{} `json:"value,omitempty"`
}

type CreateFolderRequest struct {
	AccountID    string `json:"account_id" binding:"required"`
	Name         string `json:"name" binding:"required"`
	ParentID     string `json:"parent_id,omitempty"`
	IsSubscribed bool   `json:"is_subscribed"`
}

type RenameFolderRequest struct {
	AccountID string `json:"account_id" binding:"required"`
	MailboxID string `json:"mailbox_id" binding:"required"`
	Name      string `json:"name" binding:"required"`
}
