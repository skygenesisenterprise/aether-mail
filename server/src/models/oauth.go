package models

type OAuthProvider string

const (
	OAuthProviderGoogle    OAuthProvider = "google"
	OAuthProviderMicrosoft OAuthProvider = "microsoft"
	OAuthProviderProton    OAuthProvider = "proton"
)

type OAuthToken struct {
	AccessToken  string `json:"access_token"`
	TokenType    string `json:"token_type"`
	RefreshToken string `json:"refresh_token,omitempty"`
	ExpiresIn    int64  `json:"expires_in"`
	Scope        string `json:"scope,omitempty"`
}

type OAuthUserInfo struct {
	ID        string `json:"id"`
	Email     string `json:"email"`
	Name      string `json:"name"`
	Picture   string `json:"picture,omitempty"`
	Provider  string `json:"provider"`
}

type OAuthState struct {
	State       string `json:"state"`
	Provider    string `json:"provider"`
	RedirectURI string `json:"redirect_uri,omitempty"`
}

type OAuthLoginRequest struct {
	Provider    string `json:"provider" binding:"required,oneof=google microsoft proton"`
	Code        string `json:"code" binding:"required"`
	RedirectURI string `json:"redirect_uri,omitempty"`
}

type OAuthInitiateResponse struct {
	AuthURL string `json:"auth_url"`
	State   string `json:"state"`
}
