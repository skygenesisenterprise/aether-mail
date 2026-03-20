package models

import "time"

type Email struct {
	ID             string            `json:"id"`
	AccountID      string            `json:"account_id"`
	ThreadID       string            `json:"thread_id,omitempty"`
	MailboxID      string            `json:"mailbox_id"`
	Subject        string            `json:"subject"`
	Preview        string            `json:"preview"`
	Body           string            `json:"body,omitempty"`
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
	IsDeleted      bool              `json:"is_deleted"`
	HasAttachments bool              `json:"has_attachments"`
	Keywords       []string          `json:"keywords,omitempty"`
	Labels         []string          `json:"labels,omitempty"`
	Metadata       map[string]string `json:"metadata,omitempty"`
}

type EmailAddress struct {
	Name    string `json:"name,omitempty"`
	Email   string `json:"email"`
	Mailbox string `json:"mailbox,omitempty"`
	Host    string `json:"host,omitempty"`
}

func (e *EmailAddress) Parse(emailStr string) {
	if emailStr == "" {
		return
	}

	atIndex := -1
	for i := 0; i < len(emailStr); i++ {
		if emailStr[i] == '@' {
			atIndex = i
			break
		}
	}

	if atIndex > 0 {
		e.Mailbox = emailStr[:atIndex]
		e.Host = emailStr[atIndex+1:]
	}
	e.Email = emailStr
}

type Attachment struct {
	ID          string `json:"id"`
	EmailID     string `json:"email_id"`
	PartID      string `json:"part_id"`
	Filename    string `json:"filename"`
	MimeType    string `json:"mime_type"`
	Size        int64  `json:"size"`
	Disposition string `json:"disposition,omitempty"`
	CID         string `json:"cid,omitempty"`
	BlobID      string `json:"blob_id,omitempty"`
	Inline      bool   `json:"inline"`
	Downloads   int    `json:"downloads"`
	Checksum    string `json:"checksum,omitempty"`
}

type EmailList struct {
	AccountID     string    `json:"account_id"`
	MailboxID     string    `json:"mailbox_id,omitempty"`
	TotalEmails   int64     `json:"total_emails"`
	TotalThreads  int64     `json:"total_threads"`
	UnreadEmails  int64     `json:"unread_emails"`
	Position      int       `json:"position"`
	EmailsPerPage int       `json:"emails_per_page"`
	Emails        []*Email  `json:"emails"`
	Threads       []*Thread `json:"threads,omitempty"`
	HasMore       bool      `json:"has_more"`
}

type Thread struct {
	ID              string          `json:"id"`
	AccountID       string          `json:"account_id"`
	Subject         string          `json:"subject"`
	Emails          []*Email        `json:"emails"`
	TotalEmails     int             `json:"total_emails"`
	HasAttachments  bool            `json:"has_attachments"`
	IsRead          bool            `json:"is_read"`
	IsStarred       bool            `json:"is_starred"`
	Labels          []string        `json:"labels,omitempty"`
	LastMessageDate time.Time       `json:"last_message_date"`
	Participants    []*EmailAddress `json:"participants"`
}

type EmailQuery struct {
	AccountID     string      `json:"account_id"`
	MailboxIDs    []string    `json:"mailbox_ids,omitempty"`
	InMailbox     []string    `json:"in_mailbox,omitempty"`
	NotInMailbox  []string    `json:"not_in_mailbox,omitempty"`
	ThreadID      string      `json:"thread_id,omitempty"`
	From          string      `json:"from,omitempty"`
	To            string      `json:"to,omitempty"`
	CC            string      `json:"cc,omitempty"`
	BCC           string      `json:"bcc,omitempty"`
	Subject       string      `json:"subject,omitempty"`
	Body          string      `json:"body,omitempty"`
	HasKeyword    []string    `json:"has_keyword,omitempty"`
	NotKeyword    []string    `json:"not_keyword,omitempty"`
	HasAttachment *bool       `json:"has_attachment,omitempty"`
	DateBefore    *time.Time  `json:"date_before,omitempty"`
	DateAfter     *time.Time  `json:"date_after,omitempty"`
	SizeBefore    *int64      `json:"size_before,omitempty"`
	SizeAfter     *int64      `json:"size_after,omitempty"`
	IsRead        *bool       `json:"is_read,omitempty"`
	IsStarred     *bool       `json:"is_starred,omitempty"`
	IsFlagged     *bool       `json:"is_flagged,omitempty"`
	IsDraft       *bool       `json:"is_draft,omitempty"`
	Labels        []string    `json:"labels,omitempty"`
	Sort          []SortOrder `json:"sort,omitempty"`
	Limit         int         `json:"limit,omitempty"`
	Offset        int         `json:"offset,omitempty"`
	Paginate      bool        `json:"paginate"`
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

type ThreadResponse struct {
	Success bool    `json:"success"`
	Data    *Thread `json:"data,omitempty"`
	Error   string  `json:"error,omitempty"`
}

type SendEmailRequest struct {
	From        *EmailAddress     `json:"from"`
	To          []*EmailAddress   `json:"to" binding:"required"`
	Cc          []*EmailAddress   `json:"cc,omitempty"`
	Bcc         []*EmailAddress   `json:"bcc,omitempty"`
	ReplyTo     *EmailAddress     `json:"reply_to,omitempty"`
	Subject     string            `json:"subject" binding:"required"`
	Body        string            `json:"body,omitempty"`
	BodyHTML    string            `json:"body_html,omitempty"`
	IsDraft     bool              `json:"is_draft"`
	Attachments []SendAttachment  `json:"attachments,omitempty"`
	Keywords    []string          `json:"keywords,omitempty"`
	Headers     map[string]string `json:"headers,omitempty"`
}

type SendAttachment struct {
	Filename string `json:"filename" binding:"required"`
	MimeType string `json:"mime_type"`
	Content  string `json:"content"` // base64 encoded
}

type EmailActionRequest struct {
	AccountID string   `json:"account_id" binding:"required"`
	EmailIDs  []string `json:"email_ids" binding:"required"`
	MailboxID string   `json:"mailbox_id,omitempty"`
	Operation string   `json:"operation" binding:"required"` // markRead, markUnread, markStarred, unstar, flag, unflag, move, delete, archive
}

type MoveEmailsRequest struct {
	AccountID     string   `json:"account_id" binding:"required"`
	EmailIDs      []string `json:"email_ids" binding:"required"`
	DestMailboxID string   `json:"dest_mailbox_id" binding:"required"`
}

type SetLabelsRequest struct {
	AccountID string   `json:"account_id" binding:"required"`
	EmailIDs  []string `json:"email_ids" binding:"required"`
	Labels    []string `json:"labels"`
}
