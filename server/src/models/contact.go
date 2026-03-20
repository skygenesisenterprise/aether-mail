package models

type Contact struct {
	ID        string   `json:"id"`
	AccountID string   `json:"account_id"`
	Name      string   `json:"name"`
	Email     string   `json:"email"`
	Nickname  string   `json:"nickname,omitempty"`
	Company   string   `json:"company,omitempty"`
	JobTitle  string   `json:"job_title,omitempty"`
	Phone     string   `json:"phone,omitempty"`
	Address   string   `json:"address,omitempty"`
	Website   string   `json:"website,omitempty"`
	Notes     string   `json:"notes,omitempty"`
	Groups    []string `json:"groups,omitempty"`
	AvatarURL string   `json:"avatar_url,omitempty"`
	Starred   bool     `json:"starred"`
	CreatedAt string   `json:"created_at"`
	UpdatedAt string   `json:"updated_at"`
}

type ContactGroup struct {
	ID            string   `json:"id"`
	AccountID     string   `json:"account_id"`
	Name          string   `json:"name"`
	Description   string   `json:"description,omitempty"`
	ContactIDs    []string `json:"contact_ids"`
	TotalContacts int      `json:"total_contacts"`
}

type ContactList struct {
	AccountID     string     `json:"account_id"`
	TotalContacts int64      `json:"total_contacts"`
	Contacts      []*Contact `json:"contacts"`
}

type ContactResponse struct {
	Success bool     `json:"success"`
	Data    *Contact `json:"data,omitempty"`
	Error   string   `json:"error,omitempty"`
}

type ContactListResponse struct {
	Success bool         `json:"success"`
	Data    *ContactList `json:"data,omitempty"`
	Error   string       `json:"error,omitempty"`
}

type CreateContactRequest struct {
	AccountID string   `json:"account_id" binding:"required"`
	Name      string   `json:"name" binding:"required"`
	Email     string   `json:"email" binding:"required,email"`
	Nickname  string   `json:"nickname,omitempty"`
	Company   string   `json:"company,omitempty"`
	JobTitle  string   `json:"job_title,omitempty"`
	Phone     string   `json:"phone,omitempty"`
	Address   string   `json:"address,omitempty"`
	Website   string   `json:"website,omitempty"`
	Notes     string   `json:"notes,omitempty"`
	Groups    []string `json:"groups,omitempty"`
}

type UpdateContactRequest struct {
	AccountID string   `json:"account_id" binding:"required"`
	ID        string   `json:"id" binding:"required"`
	Name      string   `json:"name,omitempty"`
	Email     string   `json:"email,omitempty"`
	Nickname  string   `json:"nickname,omitempty"`
	Company   string   `json:"company,omitempty"`
	JobTitle  string   `json:"job_title,omitempty"`
	Phone     string   `json:"phone,omitempty"`
	Address   string   `json:"address,omitempty"`
	Website   string   `json:"website,omitempty"`
	Notes     string   `json:"notes,omitempty"`
	Groups    []string `json:"groups,omitempty"`
	Starred   *bool    `json:"starred,omitempty"`
}
