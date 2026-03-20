package models

type Signature struct {
	ID           string `json:"id"`
	AccountID    string `json:"account_id"`
	Name         string `json:"name"`
	Content      string `json:"content"`
	Type         string `json:"type"` // plain, html
	IsDefault    bool   `json:"is_default"`
	ForNewEmails bool   `json:"for_new_emails"`
	ForReplies   bool   `json:"for_replies"`
	CreatedAt    string `json:"created_at"`
	UpdatedAt    string `json:"updated_at"`
}

type SignatureList struct {
	AccountID  string       `json:"account_id"`
	Signatures []*Signature `json:"signatures"`
}

type SignatureResponse struct {
	Success bool       `json:"success"`
	Data    *Signature `json:"data,omitempty"`
	Error   string     `json:"error,omitempty"`
}

type SignatureListResponse struct {
	Success bool           `json:"success"`
	Data    *SignatureList `json:"data,omitempty"`
	Error   string         `json:"error,omitempty"`
}

type CreateSignatureRequest struct {
	AccountID    string `json:"account_id" binding:"required"`
	Name         string `json:"name" binding:"required"`
	Content      string `json:"content" binding:"required"`
	Type         string `json:"type"`
	IsDefault    bool   `json:"is_default"`
	ForNewEmails bool   `json:"for_new_emails"`
	ForReplies   bool   `json:"for_replies"`
}

type UpdateSignatureRequest struct {
	AccountID    string `json:"account_id" binding:"required"`
	ID           string `json:"id" binding:"required"`
	Name         string `json:"name,omitempty"`
	Content      string `json:"content,omitempty"`
	Type         string `json:"type,omitempty"`
	IsDefault    *bool  `json:"is_default,omitempty"`
	ForNewEmails *bool  `json:"for_new_emails,omitempty"`
	ForReplies   *bool  `json:"for_replies,omitempty"`
}
