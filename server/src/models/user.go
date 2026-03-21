package models

type User struct {
	ID        string `json:"id"`
	Email     string `json:"email"`
	Name      string `json:"name"`
	AvatarURL string `json:"avatar_url,omitempty"`
	Active    bool   `json:"active"`
	Quota     *Quota `json:"quota,omitempty"`
	CreatedAt string `json:"created_at,omitempty"`
	UpdatedAt string `json:"updated_at,omitempty"`
}

type Quota struct {
	Used  int64 `json:"used"`
	Limit int64 `json:"limit"`
	Files int   `json:"files"`
}

type Account struct {
	ID          string      `json:"id"`
	Email       string      `json:"email"`
	Name        string      `json:"name"`
	Provider    string      `json:"provider"`
	IMAPHost    string      `json:"imap_host"`
	IMAPPort    int         `json:"imap_port"`
	SMTPHost    string      `json:"smtp_host"`
	SMTPPort    int         `json:"smtp_port"`
	UseTLS      bool        `json:"use_tls"`
	UseStartTLS bool        `json:"use_starttls"`
	IsPrimary   bool        `json:"is_primary"`
	Signature   string      `json:"signature,omitempty"`
	Identities  []*Identity `json:"identities,omitempty"`
}

type Identity struct {
	ID           string `json:"id"`
	AccountID    string `json:"account_id"`
	Name         string `json:"name"`
	Email        string `json:"email"`
	ReplyTo      string `json:"reply_to,omitempty"`
	BCC          string `json:"bcc,omitempty"`
	Signature    string `json:"signature,omitempty"`
	SignatureSet bool   `json:"signature_set"`
}

type Credentials struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type TokenResponse struct {
	AccessToken  string   `json:"accessToken"`
	RefreshToken string   `json:"refreshToken,omitempty"`
	TokenType    string   `json:"tokenType"`
	ExpiresIn    int64    `json:"expiresIn"`
	User         *User    `json:"user,omitempty"`
	Account      *Account `json:"account,omitempty"`
}

type AuthResponse struct {
	Success bool           `json:"success"`
	Message string         `json:"message,omitempty"`
	Data    *TokenResponse `json:"data,omitempty"`
	Error   string         `json:"error,omitempty"`
}

type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
	Remember bool   `json:"remember"`
}

type RegisterRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=8"`
	Name     string `json:"name" binding:"required"`
	Domain   string `json:"domain,omitempty"`
}

type ChangePasswordRequest struct {
	OldPassword string `json:"old_password" binding:"required"`
	NewPassword string `json:"new_password" binding:"required,min=8"`
}

type ResetPasswordRequest struct {
	Email string `json:"email" binding:"required,email"`
}

type SetPasswordRequest struct {
	Token    string `json:"token" binding:"required"`
	Password string `json:"password" binding:"required,min=8"`
}

type RefreshTokenRequest struct {
	RefreshToken string `json:"refresh_token" binding:"required"`
}
