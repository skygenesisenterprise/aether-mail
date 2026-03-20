package models

type Contact struct {
	ID             string   `json:"id"`
	AccountID      string   `json:"account_id"`
	Name           string   `json:"name"`
	FirstName      string   `json:"first_name,omitempty"`
	LastName       string   `json:"last_name,omitempty"`
	Email          string   `json:"email"`
	Nickname       string   `json:"nickname,omitempty"`
	Company        string   `json:"company,omitempty"`
	JobTitle       string   `json:"job_title,omitempty"`
	Department     string   `json:"department,omitempty"`
	Phone          string   `json:"phone,omitempty"`
	Mobile         string   `json:"mobile,omitempty"`
	WorkPhone      string   `json:"work_phone,omitempty"`
	HomePhone      string   `json:"home_phone,omitempty"`
	Address        string   `json:"address,omitempty"`
	Street         string   `json:"street,omitempty"`
	City           string   `json:"city,omitempty"`
	State          string   `json:"state,omitempty"`
	PostalCode     string   `json:"postal_code,omitempty"`
	Country        string   `json:"country,omitempty"`
	Website        string   `json:"website,omitempty"`
	Blog           string   `json:"blog,omitempty"`
	Birthday       string   `json:"birthday,omitempty"`
	Anniversary    string   `json:"anniversary,omitempty"`
	Notes          string   `json:"notes,omitempty"`
	Groups         []string `json:"groups,omitempty"`
	Tags           []string `json:"tags,omitempty"`
	AvatarURL      string   `json:"avatar_url,omitempty"`
	AvatarType     string   `json:"avatar_type,omitempty"` // gravatar, initials, uploaded
	Starred        bool     `json:"starred"`
	Frequency      int      `json:"frequency"` // contact frequency
	LastContacted  string   `json:"last_contacted,omitempty"`
	IsOrganization bool     `json:"is_organization"`
	OrganizationID string   `json:"organization_id,omitempty"`
	Permissions    string   `json:"permissions,omitempty"`
	CreatedAt      string   `json:"created_at"`
	UpdatedAt      string   `json:"updated_at"`
}

type ContactGroup struct {
	ID            string     `json:"id"`
	AccountID     string     `json:"account_id"`
	Name          string     `json:"name"`
	Description   string     `json:"description,omitempty"`
	ContactIDs    []string   `json:"contact_ids"`
	TotalContacts int        `json:"total_contacts"`
	Color         string     `json:"color,omitempty"`
	Icon          string     `json:"icon,omitempty"`
	IsSystem      bool       `json:"is_system"`
	Members       []*Contact `json:"members,omitempty"`
	CreatedAt     string     `json:"created_at"`
	UpdatedAt     string     `json:"updated_at"`
}

type ContactList struct {
	AccountID     string     `json:"account_id"`
	TotalContacts int64      `json:"total_contacts"`
	Contacts      []*Contact `json:"contacts"`
	HasMore       bool       `json:"has_more"`
	Offset        int        `json:"offset"`
	Limit         int        `json:"limit"`
}

type GroupList struct {
	AccountID string          `json:"account_id"`
	Groups    []*ContactGroup `json:"groups"`
	Total     int             `json:"total"`
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

type GroupResponse struct {
	Success bool          `json:"success"`
	Data    *ContactGroup `json:"data,omitempty"`
	Error   string        `json:"error,omitempty"`
}

type GroupListResponse struct {
	Success bool       `json:"success"`
	Data    *GroupList `json:"data,omitempty"`
	Error   string     `json:"error,omitempty"`
}

type CreateContactRequest struct {
	AccountID      string   `json:"account_id" binding:"required"`
	Name           string   `json:"name" binding:"required"`
	FirstName      string   `json:"first_name,omitempty"`
	LastName       string   `json:"last_name,omitempty"`
	Email          string   `json:"email" binding:"required,email"`
	Nickname       string   `json:"nickname,omitempty"`
	Company        string   `json:"company,omitempty"`
	JobTitle       string   `json:"job_title,omitempty"`
	Department     string   `json:"department,omitempty"`
	Phone          string   `json:"phone,omitempty"`
	Mobile         string   `json:"mobile,omitempty"`
	WorkPhone      string   `json:"work_phone,omitempty"`
	HomePhone      string   `json:"home_phone,omitempty"`
	Address        string   `json:"address,omitempty"`
	Street         string   `json:"street,omitempty"`
	City           string   `json:"city,omitempty"`
	State          string   `json:"state,omitempty"`
	PostalCode     string   `json:"postal_code,omitempty"`
	Country        string   `json:"country,omitempty"`
	Website        string   `json:"website,omitempty"`
	Blog           string   `json:"blog,omitempty"`
	Birthday       string   `json:"birthday,omitempty"`
	Anniversary    string   `json:"anniversary,omitempty"`
	Notes          string   `json:"notes,omitempty"`
	Groups         []string `json:"groups,omitempty"`
	Tags           []string `json:"tags,omitempty"`
	Starred        bool     `json:"starred"`
	IsOrganization bool     `json:"is_organization"`
}

type UpdateContactRequest struct {
	AccountID      string   `json:"account_id" binding:"required"`
	ID             string   `json:"id" binding:"required"`
	Name           string   `json:"name,omitempty"`
	FirstName      string   `json:"first_name,omitempty"`
	LastName       string   `json:"last_name,omitempty"`
	Email          string   `json:"email,omitempty"`
	Nickname       string   `json:"nickname,omitempty"`
	Company        string   `json:"company,omitempty"`
	JobTitle       string   `json:"job_title,omitempty"`
	Department     string   `json:"department,omitempty"`
	Phone          string   `json:"phone,omitempty"`
	Mobile         string   `json:"mobile,omitempty"`
	WorkPhone      string   `json:"work_phone,omitempty"`
	HomePhone      string   `json:"home_phone,omitempty"`
	Address        string   `json:"address,omitempty"`
	Street         string   `json:"street,omitempty"`
	City           string   `json:"city,omitempty"`
	State          string   `json:"state,omitempty"`
	PostalCode     string   `json:"postal_code,omitempty"`
	Country        string   `json:"country,omitempty"`
	Website        string   `json:"website,omitempty"`
	Blog           string   `json:"blog,omitempty"`
	Birthday       string   `json:"birthday,omitempty"`
	Anniversary    string   `json:"anniversary,omitempty"`
	Notes          string   `json:"notes,omitempty"`
	Groups         []string `json:"groups,omitempty"`
	Tags           []string `json:"tags,omitempty"`
	Starred        *bool    `json:"starred,omitempty"`
	IsOrganization *bool    `json:"is_organization,omitempty"`
}

type DeleteContactRequest struct {
	AccountID  string   `json:"account_id" binding:"required"`
	ContactIDs []string `json:"contact_ids" binding:"required"`
}

type CreateGroupRequest struct {
	AccountID   string   `json:"account_id" binding:"required"`
	Name        string   `json:"name" binding:"required"`
	Description string   `json:"description,omitempty"`
	Color       string   `json:"color,omitempty"`
	ContactIDs  []string `json:"contact_ids,omitempty"`
}

type UpdateGroupRequest struct {
	AccountID   string `json:"account_id" binding:"required"`
	ID          string `json:"id" binding:"required"`
	Name        string `json:"name,omitempty"`
	Description string `json:"description,omitempty"`
	Color       string `json:"color,omitempty"`
}

type AddContactsToGroupRequest struct {
	AccountID  string   `json:"account_id" binding:"required"`
	GroupID    string   `json:"group_id" binding:"required"`
	ContactIDs []string `json:"contact_ids" binding:"required"`
}

type RemoveContactsFromGroupRequest struct {
	AccountID  string   `json:"account_id" binding:"required"`
	GroupID    string   `json:"group_id" binding:"required"`
	ContactIDs []string `json:"contact_ids" binding:"required"`
}

type ImportContactsRequest struct {
	AccountID string `json:"account_id" binding:"required"`
	Format    string `json:"format" binding:"required"` // vcard, csv, vcf
	Data      string `json:"data" binding:"required"`   // base64 encoded
}

type ExportContactsRequest struct {
	AccountID  string   `json:"account_id" binding:"required"`
	Format     string   `json:"format" binding:"required"` // vcard, csv, vcf
	GroupID    string   `json:"group_id,omitempty"`
	ContactIDs []string `json:"contact_ids,omitempty"`
}
