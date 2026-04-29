package services

import (
	"crypto/rand"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"
	"sync"
	"time"

	"github.com/skygenesisenterprise/aether-mail/server/src/config"
	"github.com/skygenesisenterprise/aether-mail/server/src/models"
)

// Provider defines the interface for OAuth2 providers
type OAuthProviderInterface interface {
	Name() string
	GetAuthURL(state, redirectURI string) string
	ExchangeCode(code, redirectURI string) (*models.OAuthToken, error)
	GetUserInfo(token *models.OAuthToken) (*models.OAuthUserInfo, error)
}

// googleProvider implements OAuth2 for Google
type googleProvider struct {
	clientID     string
	clientSecret string
	redirectURL  string
}

func newGoogleProvider(cfg config.OAuthProviderConfig) *googleProvider {
	return &googleProvider{
		clientID:     cfg.ClientID,
		clientSecret: cfg.ClientSecret,
		redirectURL:  cfg.RedirectURL,
	}
}

func (p *googleProvider) Name() string { return "google" }

func (p *googleProvider) GetAuthURL(state, redirectURI string) string {
	u, _ := url.Parse("https://accounts.google.com/o/oauth2/v2/auth")
	q := u.Query()
	q.Set("client_id", p.clientID)
	q.Set("redirect_uri", firstNonEmpty(redirectURI, p.redirectURL))
	q.Set("response_type", "code")
	q.Set("scope", "openid email profile https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send")
	q.Set("state", state)
	q.Set("access_type", "offline")
	q.Set("prompt", "consent")
	u.RawQuery = q.Encode()
	return u.String()
}

func (p *googleProvider) ExchangeCode(code, redirectURI string) (*models.OAuthToken, error) {
	data := url.Values{}
	data.Set("grant_type", "authorization_code")
	data.Set("code", code)
	data.Set("redirect_uri", firstNonEmpty(redirectURI, p.redirectURL))
	data.Set("client_id", p.clientID)
	data.Set("client_secret", p.clientSecret)

	resp, err := http.Post("https://oauth2.googleapis.com/token", "application/x-www-form-urlencoded", strings.NewReader(data.Encode()))
	if err != nil {
		return nil, fmt.Errorf("failed to exchange code: %w", err)
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("token exchange failed (%d): %s", resp.StatusCode, string(body))
	}

	var token models.OAuthToken
	if err := json.Unmarshal(body, &token); err != nil {
		return nil, fmt.Errorf("failed to parse token response: %w", err)
	}
	return &token, nil
}

func (p *googleProvider) GetUserInfo(token *models.OAuthToken) (*models.OAuthUserInfo, error) {
	req, _ := http.NewRequest("GET", "https://www.googleapis.com/oauth2/v2/userinfo", nil)
	req.Header.Set("Authorization", "Bearer "+token.AccessToken)

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to get user info: %w", err)
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("userinfo failed (%d): %s", resp.StatusCode, string(body))
	}

	var result struct {
		ID      string `json:"id"`
		Email   string `json:"email"`
		Name    string `json:"name"`
		Picture string `json:"picture"`
	}
	if err := json.Unmarshal(body, &result); err != nil {
		return nil, fmt.Errorf("failed to parse userinfo: %w", err)
	}

	return &models.OAuthUserInfo{
		ID:       result.ID,
		Email:    result.Email,
		Name:     result.Name,
		Picture:  result.Picture,
		Provider: p.Name(),
	}, nil
}

// microsoftProvider implements OAuth2 for Microsoft
type microsoftProvider struct {
	clientID     string
	clientSecret string
	redirectURL  string
	tenant       string
}

func newMicrosoftProvider(cfg config.OAuthProviderConfig) *microsoftProvider {
	return &microsoftProvider{
		clientID:     cfg.ClientID,
		clientSecret: cfg.ClientSecret,
		redirectURL:  cfg.RedirectURL,
		tenant:       cfg.Tenant,
	}
}

func (p *microsoftProvider) Name() string { return "microsoft" }

func (p *microsoftProvider) GetAuthURL(state, redirectURI string) string {
	u, _ := url.Parse(fmt.Sprintf("https://login.microsoftonline.com/%s/oauth2/v2.0/authorize", p.tenant))
	q := u.Query()
	q.Set("client_id", p.clientID)
	q.Set("redirect_uri", firstNonEmpty(redirectURI, p.redirectURL))
	q.Set("response_type", "code")
	q.Set("scope", "openid email profile offline_access https://outlook.office.com/IMAP.AccessAsUser.All https://outlook.office.com/SMTP.Send")
	q.Set("state", state)
	q.Set("response_mode", "query")
	u.RawQuery = q.Encode()
	return u.String()
}

func (p *microsoftProvider) ExchangeCode(code, redirectURI string) (*models.OAuthToken, error) {
	data := url.Values{}
	data.Set("grant_type", "authorization_code")
	data.Set("code", code)
	data.Set("redirect_uri", firstNonEmpty(redirectURI, p.redirectURL))
	data.Set("client_id", p.clientID)
	data.Set("client_secret", p.clientSecret)

	resp, err := http.Post(fmt.Sprintf("https://login.microsoftonline.com/%s/oauth2/v2.0/token", p.tenant), "application/x-www-form-urlencoded", strings.NewReader(data.Encode()))
	if err != nil {
		return nil, fmt.Errorf("failed to exchange code: %w", err)
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("token exchange failed (%d): %s", resp.StatusCode, string(body))
	}

	var token models.OAuthToken
	if err := json.Unmarshal(body, &token); err != nil {
		return nil, fmt.Errorf("failed to parse token response: %w", err)
	}
	return &token, nil
}

func (p *microsoftProvider) GetUserInfo(token *models.OAuthToken) (*models.OAuthUserInfo, error) {
	req, _ := http.NewRequest("GET", "https://graph.microsoft.com/v1.0/me", nil)
	req.Header.Set("Authorization", "Bearer "+token.AccessToken)

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to get user info: %w", err)
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("userinfo failed (%d): %s", resp.StatusCode, string(body))
	}

	var result struct {
		ID                string `json:"id"`
		Mail              string `json:"mail"`
		UserPrincipalName string `json:"userPrincipalName"`
		DisplayName       string `json:"displayName"`
	}
	if err := json.Unmarshal(body, &result); err != nil {
		return nil, fmt.Errorf("failed to parse userinfo: %w", err)
	}

	email := result.Mail
	if email == "" {
		email = result.UserPrincipalName
	}

	return &models.OAuthUserInfo{
		ID:       result.ID,
		Email:    email,
		Name:     result.DisplayName,
		Provider: p.Name(),
	}, nil
}

// protonProvider implements OAuth2 for Proton Mail
type protonProvider struct {
	clientID     string
	clientSecret string
	redirectURL  string
}

func newProtonProvider(cfg config.OAuthProviderConfig) *protonProvider {
	return &protonProvider{
		clientID:     cfg.ClientID,
		clientSecret: cfg.ClientSecret,
		redirectURL:  cfg.RedirectURL,
	}
}

func (p *protonProvider) Name() string { return "proton" }

func (p *protonProvider) GetAuthURL(state, redirectURI string) string {
	u, _ := url.Parse("https://account.proton.me/oauth/authorize")
	q := u.Query()
	q.Set("client_id", p.clientID)
	q.Set("redirect_uri", firstNonEmpty(redirectURI, p.redirectURL))
	q.Set("response_type", "code")
	q.Set("scope", "email mail")
	q.Set("state", state)
	u.RawQuery = q.Encode()
	return u.String()
}

func (p *protonProvider) ExchangeCode(code, redirectURI string) (*models.OAuthToken, error) {
	data := url.Values{}
	data.Set("grant_type", "authorization_code")
	data.Set("code", code)
	data.Set("redirect_uri", firstNonEmpty(redirectURI, p.redirectURL))
	data.Set("client_id", p.clientID)
	data.Set("client_secret", p.clientSecret)

	resp, err := http.Post("https://account.proton.me/oauth/token", "application/x-www-form-urlencoded", strings.NewReader(data.Encode()))
	if err != nil {
		return nil, fmt.Errorf("failed to exchange code: %w", err)
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("token exchange failed (%d): %s", resp.StatusCode, string(body))
	}

	var token models.OAuthToken
	if err := json.Unmarshal(body, &token); err != nil {
		return nil, fmt.Errorf("failed to parse token response: %w", err)
	}
	return &token, nil
}

func (p *protonProvider) GetUserInfo(token *models.OAuthToken) (*models.OAuthUserInfo, error) {
	req, _ := http.NewRequest("GET", "https://account.proton.me/oauth/userinfo", nil)
	req.Header.Set("Authorization", "Bearer "+token.AccessToken)

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to get user info: %w", err)
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	if resp.StatusCode != http.StatusOK {
		// Fallback: Proton does not always expose a userinfo endpoint in the same way.
		// We return a minimal struct and rely on the email being passed separately if needed.
		return &models.OAuthUserInfo{
			ID:       "",
			Email:    "",
			Name:     "",
			Provider: p.Name(),
		}, nil
	}

	var result struct {
		ID      string `json:"id,omitempty"`
		Email   string `json:"email,omitempty"`
		Name    string `json:"name,omitempty"`
		Picture string `json:"picture,omitempty"`
	}
	if err := json.Unmarshal(body, &result); err != nil {
		return nil, fmt.Errorf("failed to parse userinfo: %w", err)
	}

	return &models.OAuthUserInfo{
		ID:       result.ID,
		Email:    result.Email,
		Name:     result.Name,
		Picture:  result.Picture,
		Provider: p.Name(),
	}, nil
}

// OAuthService manages OAuth providers and state
type OAuthService struct {
	providers map[string]OAuthProviderInterface
	states    map[string]*models.OAuthState
	mu        sync.RWMutex
}

func NewOAuthService(cfg config.OAuthConfig) *OAuthService {
	s := &OAuthService{
		providers: make(map[string]OAuthProviderInterface),
		states:    make(map[string]*models.OAuthState),
	}

	if cfg.Google.ClientID != "" && cfg.Google.ClientSecret != "" {
		s.providers["google"] = newGoogleProvider(cfg.Google)
	}
	if cfg.Microsoft.ClientID != "" && cfg.Microsoft.ClientSecret != "" {
		s.providers["microsoft"] = newMicrosoftProvider(cfg.Microsoft)
	}
	if cfg.Proton.ClientID != "" && cfg.Proton.ClientSecret != "" {
		s.providers["proton"] = newProtonProvider(cfg.Proton)
	}

	return s
}

func (s *OAuthService) GetProvider(name string) (OAuthProviderInterface, bool) {
	p, ok := s.providers[name]
	return p, ok
}

func (s *OAuthService) IsConfigured(name string) bool {
	_, ok := s.providers[name]
	return ok
}

func (s *OAuthService) GenerateState(provider, redirectURI string) *models.OAuthState {
	b := make([]byte, 32)
	rand.Read(b)
	state := &models.OAuthState{
		State:       base64.URLEncoding.EncodeToString(b),
		Provider:    provider,
		RedirectURI: redirectURI,
	}

	s.mu.Lock()
	s.states[state.State] = state
	s.mu.Unlock()

	// Clean up state after 10 minutes
	go func() {
		time.Sleep(10 * time.Minute)
		s.mu.Lock()
		delete(s.states, state.State)
		s.mu.Unlock()
	}()

	return state
}

func (s *OAuthService) ValidateState(state string) (*models.OAuthState, bool) {
	s.mu.Lock()
	defer s.mu.Unlock()
	st, ok := s.states[state]
	if ok {
		delete(s.states, state)
	}
	return st, ok
}

func firstNonEmpty(a, b string) string {
	if a != "" {
		return a
	}
	return b
}
