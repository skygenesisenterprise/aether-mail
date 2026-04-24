package models

type Signature struct {
	ID        string `json:"id"`
	UserID   string `json:"user_id"`
	Name     string `json:"name"`
	Content  string `json:"content"`
	HTML     string `json:"html,omitempty"`
	IsDefault bool `json:"is_default"`
	CreatedAt string `json:"created_at"`
	UpdatedAt string `json:"updated_at"`
}

type CreateSignatureRequest struct {
	AccountID string `json:"account_id"`
	Name      string `json:"name" binding:"required"`
	Content   string `json:"content" binding:"required"`
	HTML      string `json:"html"`
	IsDefault bool   `json:"is_default"`
}

type UpdateSignatureRequest struct {
	ID        string `json:"id"`
	SignatureID string `json:"signature_id"`
	Name      string `json:"name"`
	Content  string `json:"content"`
	HTML     string `json:"html"`
	IsDefault bool   `json:"is_default"`
}