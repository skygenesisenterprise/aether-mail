package models

type Tag struct {
	ID          string `json:"id"`
	AccountID   string `json:"account_id"`
	Name        string `json:"name"`
	Color       string `json:"color"`
	IMAPKeyword string `json:"imap_keyword,omitempty"`
	TotalEmails int64  `json:"total_emails"`
	CreatedAt   string `json:"created_at"`
	UpdatedAt   string `json:"updated_at"`
}

type TagList struct {
	AccountID string `json:"account_id"`
	Tags      []*Tag `json:"tags"`
}

type TagResponse struct {
	Success bool   `json:"success"`
	Data    *Tag   `json:"data,omitempty"`
	Error   string `json:"error,omitempty"`
}

type TagListResponse struct {
	Success bool     `json:"success"`
	Data    *TagList `json:"data,omitempty"`
	Error   string   `json:"error,omitempty"`
}

type CreateTagRequest struct {
	AccountID string `json:"account_id" binding:"required"`
	Name      string `json:"name" binding:"required"`
	Color     string `json:"color"`
}

type UpdateTagRequest struct {
	AccountID string `json:"account_id" binding:"required"`
	ID        string `json:"id" binding:"required"`
	Name      string `json:"name,omitempty"`
	Color     string `json:"color,omitempty"`
}
