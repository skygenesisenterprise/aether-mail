package models

import "time"

type SearchQuery struct {
	AccountID       string      `json:"account_id"`
	Query           string      `json:"query"`
	MailboxIDs      []string    `json:"mailbox_ids,omitempty"`
	From            string      `json:"from,omitempty"`
	To              string      `json:"to,omitempty"`
	CC              string      `json:"cc,omitempty"`
	BCC             string      `json:"bcc,omitempty"`
	Subject         string      `json:"subject,omitempty"`
	Body            string      `json:"body,omitempty"`
	HasAttachment   *bool       `json:"has_attachment,omitempty"`
	DateBefore      *time.Time  `json:"date_before,omitempty"`
	DateAfter       *time.Time  `json:"date_after,omitempty"`
	SizeBefore      *int64      `json:"size_before,omitempty"`
	SizeAfter       *int64      `json:"size_after,omitempty"`
	IsRead          *bool       `json:"is_read,omitempty"`
	IsStarred       *bool       `json:"is_starred,omitempty"`
	HasKeywords     []string    `json:"has_keywords,omitempty"`
	ExcludeKeywords []string    `json:"exclude_keywords,omitempty"`
	Limit           int         `json:"limit,omitempty"`
	Offset          int         `json:"offset,omitempty"`
	Sort            []SortOrder `json:"sort,omitempty"`
}

type SearchResult struct {
	Emails       []*Email `json:"emails"`
	TotalResults int64    `json:"total_results"`
	QueryTime    int64    `json:"query_time_ms"`
}

type SearchResponse struct {
	Success bool          `json:"success"`
	Data    *SearchResult `json:"data,omitempty"`
	Error   string        `json:"error,omitempty"`
}

type QuickSearch struct {
	AccountID string `json:"account_id"`
	Query     string `json:"query" binding:"required"`
	Limit     int    `json:"limit,omitempty"`
}

type QuickSearchResult struct {
	Emails   []*Email   `json:"emails,omitempty"`
	Contacts []*Contact `json:"contacts,omitempty"`
}
