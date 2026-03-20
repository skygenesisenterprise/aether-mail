package models

type User struct {
	ID        string `json:"id"`
	Email     string `json:"email"`
	Name      string `json:"name"`
	AvatarURL string `json:"avatar_url,omitempty"`
	Active    bool   `json:"active"`
}

type Credentials struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type TokenResponse struct {
	AccessToken string `json:"access_token"`
	TokenType   string `json:"token_type"`
	ExpiresIn   int64  `json:"expires_in"`
	User        *User  `json:"user,omitempty"`
}

type AuthResponse struct {
	Success bool           `json:"success"`
	Message string         `json:"message,omitempty"`
	Data    *TokenResponse `json:"data,omitempty"`
	Error   string         `json:"error,omitempty"`
}
