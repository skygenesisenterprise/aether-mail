package models

import "time"

type Email struct {
	ID             string            `json:"id"`
	Subject        string            `json:"subject"`
	Body           string            `json:"body"`
	BodyHTML       string            `json:"body_html,omitempty"`
	From           *EmailAddress     `json:"from"`
	To             []*EmailAddress   `json:"to"`
	Cc             []*EmailAddress   `json:"cc,omitempty"`
	Bcc            []*EmailAddress   `json:"bcc,omitempty"`
	ReplyTo        *EmailAddress     `json:"reply_to,omitempty"`
	Date           time.Time         `json:"date"`
	Size           int64             `json:"size"`
	Attachments    []*Attachment     `json:"attachments,omitempty"`
	Headers        map[string]string `json:"headers,omitempty"`
	IsRead         bool              `json:"is_read"`
	IsStarred      bool              `json:"is_starred"`
	IsDraft        bool              `json:"is_draft"`
	IsFlagged      bool              `json:"is_flagged"`
	Keywords       []string          `json:"keywords,omitempty"`
	Preview        string            `json:"preview"`
	HasAttachments bool              `json:"has_attachments"`
}

type EmailAddress struct {
	Name    string `json:"name,omitempty"`
	Email   string `json:"email"`
	Mailbox string `json:"mailbox,omitempty"`
	Host    string `json:"host,omitempty"`
}

type Attachment struct {
	ID          string `json:"id"`
	PartID      string `json:"part_id"`
	Filename    string `json:"filename"`
	MimeType    string `json:"mime_type"`
	Size        int64  `json:"size"`
	Disposition string `json:"disposition,omitempty"`
	CID         string `json:"cid,omitempty"`
	BlobID      string `json:"blob_id,omitempty"`
}

type EmailList struct {
	AccountID     string   `json:"account_id"`
	TotalEmails   int64    `json:"total_emails"`
	TotalThreads  int64    `json:"total_threads"`
	Position      int      `json:"position"`
	EmailsPerPage int      `json:"emails_per_page"`
	Emails        []*Email `json:"emails"`
}

type EmailQuery struct {
	AccountID     string      `json:"account_id"`
	MailboxID     string      `json:"mailbox_id"`
	InMailbox     []string    `json:"in_mailbox,omitempty"`
	NotInMailbox  []string    `json:"not_in_mailbox,omitempty"`
	From          string      `json:"from,omitempty"`
	To            string      `json:"to,omitempty"`
	Subject       string      `json:"subject,omitempty"`
	Body          string      `json:"body,omitempty"`
	HasKeyword    []string    `json:"has_keyword,omitempty"`
	NotKeyword    []string    `json:"not_keyword,omitempty"`
	HasAttachment bool        `json:"has_attachment,omitempty"`
	DateBefore    *time.Time  `json:"date_before,omitempty"`
	DateAfter     *time.Time  `json:"date_after,omitempty"`
	Sort          []SortOrder `json:"sort,omitempty"`
	Limit         int         `json:"limit,omitempty"`
	Offset        int         `json:"offset,omitempty"`
}

type SortOrder struct {
	IsAscending bool   `json:"is_ascending"`
	Property    string `json:"property"`
}

type EmailResponse struct {
	Success bool   `json:"success"`
	Data    *Email `json:"data,omitempty"`
	Error   string `json:"error,omitempty"`
}

type EmailListResponse struct {
	Success bool       `json:"success"`
	Data    *EmailList `json:"data,omitempty"`
	Error   string     `json:"error,omitempty"`
}
