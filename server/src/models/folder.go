package models

type Folder struct {
	ID            string    `json:"id"`
	AccountID     string    `json:"account_id"`
	Name          string    `json:"name"`
	ParentID      string    `json:"parent_id,omitempty"`
	Path          string    `json:"path"`
	SortOrder     int       `json:"sort_order"`
	TotalEmails   int64     `json:"total_emails"`
	UnreadEmails  int64     `json:"unread_emails"`
	TotalThreads  int64     `json:"total_threads"`
	UnreadThreads int64     `json:"unread_threads"`
	IsSubscribed  bool      `json:"is_subscribed"`
	IsSelectable  bool      `json:"is_selectable"`
	IsSystem      bool      `json:"is_system"`
	Rights        []string  `json:"rights,omitempty"`
	Type          string    `json:"type"` // inbox, sent, drafts, trash, spam, archive, starred, all, custom
	Icon          string    `json:"icon,omitempty"`
	Color         string    `json:"color,omitempty"`
	UnreadCount   int       `json:"unread_count"`
	HasChildren   bool      `json:"has_children"`
	Children      []*Folder `json:"children,omitempty"`
}

type FolderList struct {
	AccountID string    `json:"account_id"`
	Folders   []*Folder `json:"folders"`
	Total     int       `json:"total"`
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

type CreateFolderRequest struct {
	AccountID  string `json:"account_id" binding:"required"`
	Name       string `json:"name" binding:"required"`
	ParentID   string `json:"parent_id,omitempty"`
	Subscribe  bool   `json:"subscribe"`
	FolderType string `json:"folder_type,omitempty"`
}

type RenameFolderRequest struct {
	AccountID string `json:"account_id" binding:"required"`
	MailboxID string `json:"mailbox_id" binding:"required"`
	Name      string `json:"name" binding:"required"`
}

type DeleteFolderRequest struct {
	AccountID   string `json:"account_id" binding:"required"`
	MailboxID   string `json:"mailbox_id" binding:"required"`
	MoveToTrash bool   `json:"move_to_trash"`
}

type SubscribeFolderRequest struct {
	AccountID string `json:"account_id" binding:"required"`
	MailboxID string `json:"mailbox_id" binding:"required"`
	Subscribe bool   `json:"subscribe"`
}

type EmptyFolderRequest struct {
	AccountID string `json:"account_id" binding:"required"`
	MailboxID string `json:"mailbox_id" binding:"required"`
}

type FolderStats struct {
	AccountID    string                      `json:"account_id"`
	TotalEmails  int64                       `json:"total_emails"`
	TotalSize    int64                       `json:"total_size"`
	UnreadEmails int64                       `json:"unread_emails"`
	FolderStats  map[string]*FolderStatEntry `json:"folder_stats,omitempty"`
}

type FolderStatEntry struct {
	TotalEmails  int64 `json:"total_emails"`
	UnreadEmails int64 `json:"unread_emails"`
	TotalSize    int64 `json:"total_size"`
}
