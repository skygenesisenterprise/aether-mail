package models

type Organization struct {
	ID       string `json:"id"`
	Name     string `json:"name"`
	Domain   string `json:"domain,omitempty"`
	LogoURL  string `json:"logo_url,omitempty"`
	CreatedAt string `json:"created_at"`
	UpdatedAt string `json:"updated_at"`
}

type OrganizationMember struct {
	ID        string `json:"id"`
	OrganizationID string `json:"organization_id"`
	UserID    string `json:"user_id"`
	Role     string `json:"role"`
	Status   string `json:"status"`
	InvitedAt string `json:"invited_at,omitempty"`
	JoinedAt string `json:"joined_at,omitempty"`
}

type OrganizationDomain struct {
	ID        string `json:"id"`
	Domain    string `json:"domain"`
	Verified bool   `json:"verified"`
}

type CreateOrganizationRequest struct {
	Name   string `json:"name" binding:"required"`
	Domain string `json:"domain"`
	LogoURL string `json:"logo_url"`
}

type UpdateOrganizationRequest struct {
	Name    string `json:"name"`
	Domain  string `json:"domain"`
	LogoURL string `json:"logo_url"`
}

type InviteMemberRequest struct {
	Email string `json:"email" binding:"required"`
	Role  string `json:"role"`
}