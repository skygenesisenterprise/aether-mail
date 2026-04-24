package models

type Newsletter struct {
	ID           string `json:"id"`
	UserID       string `json:"user_id"`
	Name        string `json:"name"`
	Description string `json:"description,omitempty"`
	SenderEmail string `json:"sender_email"`
	SenderName  string `json:"sender_name,omitempty"`
	ListsURL    string `json:"lists_url,omitempty"`
	Subscribers int    `json:"subscribers"`
	IsActive    bool   `json:"is_active"`
	CreatedAt   string `json:"created_at"`
	UpdatedAt  string `json:"updated_at"`
}

type CreateNewsletterRequest struct {
	Name        string `json:"name" binding:"required"`
	Description string `json:"description"`
	SenderEmail string `json:"sender_email" binding:"required"`
	SenderName  string `json:"sender_name"`
	ListsURL   string `json:"lists_url"`
}

type UpdateNewsletterRequest struct {
	Name        string `json:"name"`
	Description string `json:"description"`
	SenderEmail string `json:"sender_email"`
	SenderName  string `json:"sender_name"`
	ListsURL    string `json:"lists_url"`
	IsActive    bool   `json:"is_active"`
}

type SubscribeNewsletterRequest struct {
	Email string `json:"email" binding:"required"`
}

type UnsubscribeNewsletterRequest struct {
	Email string `json:"email" binding:"required"`
}