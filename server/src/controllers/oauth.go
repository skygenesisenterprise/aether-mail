package controllers

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"

	"github.com/skygenesisenterprise/aether-mail/server/src/config"
	"github.com/skygenesisenterprise/aether-mail/server/src/models"
	"github.com/skygenesisenterprise/aether-mail/server/src/services"
)

type OAuthController struct {
	oauthService *services.OAuthService
	jwtService   *services.JWTService
	mailConfig   *config.MailConfig
}

func NewOAuthController(oauth *services.OAuthService, jwt *services.JWTService, mailConfig *config.MailConfig) *OAuthController {
	return &OAuthController{
		oauthService: oauth,
		jwtService:   jwt,
		mailConfig:   mailConfig,
	}
}

// GetAuthURL returns the authorization URL for a provider (frontend-initiated PKCE flow)
func (c *OAuthController) GetAuthURL(ctx *gin.Context) {
	providerName := ctx.Param("provider")
	provider, ok := c.oauthService.GetProvider(providerName)
	if !ok {
		ctx.JSON(http.StatusBadRequest, models.AuthResponse{
			Success: false,
			Error:   "Unsupported OAuth provider: " + providerName,
		})
		return
	}

	redirectURI := ctx.Query("redirect_uri")
	state := c.oauthService.GenerateState(providerName, redirectURI)
	authURL := provider.GetAuthURL(state.State, redirectURI)

	ctx.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": models.OAuthInitiateResponse{
			AuthURL: authURL,
			State:   state.State,
		},
	})
}

// InitiateOAuth redirects the user to the provider authorization page
func (c *OAuthController) InitiateOAuth(ctx *gin.Context) {
	providerName := ctx.Param("provider")
	provider, ok := c.oauthService.GetProvider(providerName)
	if !ok {
		ctx.JSON(http.StatusBadRequest, models.AuthResponse{
			Success: false,
			Error:   "Unsupported OAuth provider: " + providerName,
		})
		return
	}

	redirectURI := ctx.Query("redirect_uri")
	state := c.oauthService.GenerateState(providerName, redirectURI)
	authURL := provider.GetAuthURL(state.State, redirectURI)

	ctx.Redirect(http.StatusFound, authURL)
}

// HandleCallback handles the OAuth callback from the provider
func (c *OAuthController) HandleCallback(ctx *gin.Context) {
	providerName := ctx.Param("provider")
	code := ctx.Query("code")
	stateStr := ctx.Query("state")
	errorStr := ctx.Query("error")

	if errorStr != "" {
		ctx.JSON(http.StatusBadRequest, models.AuthResponse{
			Success: false,
			Error:   "OAuth error: " + errorStr,
		})
		return
	}

	if code == "" {
		ctx.JSON(http.StatusBadRequest, models.AuthResponse{
			Success: false,
			Error:   "Missing authorization code",
		})
		return
	}

	state, ok := c.oauthService.ValidateState(stateStr)
	if !ok {
		ctx.JSON(http.StatusBadRequest, models.AuthResponse{
			Success: false,
			Error:   "Invalid or expired state",
		})
		return
	}

	if state.Provider != providerName {
		ctx.JSON(http.StatusBadRequest, models.AuthResponse{
			Success: false,
			Error:   "Provider mismatch",
		})
		return
	}

	provider, ok := c.oauthService.GetProvider(providerName)
	if !ok {
		ctx.JSON(http.StatusBadRequest, models.AuthResponse{
			Success: false,
			Error:   "Unsupported OAuth provider: " + providerName,
		})
		return
	}

	token, err := provider.ExchangeCode(code, state.RedirectURI)
	if err != nil {
		fmt.Printf("[oauth] Token exchange error for %s: %v\n", providerName, err)
		ctx.JSON(http.StatusInternalServerError, models.AuthResponse{
			Success: false,
			Error:   "Failed to exchange authorization code",
		})
		return
	}

	userInfo, err := provider.GetUserInfo(token)
	if err != nil {
		fmt.Printf("[oauth] Userinfo error for %s: %v\n", providerName, err)
		ctx.JSON(http.StatusInternalServerError, models.AuthResponse{
			Success: false,
			Error:   "Failed to retrieve user information",
		})
		return
	}

	user := &models.User{
		ID:        userInfo.ID,
		Email:     userInfo.Email,
		Name:      userInfo.Name,
		AvatarURL: userInfo.Picture,
		Active:    true,
	}

	if user.ID == "" {
		user.ID = userInfo.Email
	}
	if user.Name == "" {
		user.Name = extractNameFromEmail(userInfo.Email)
	}

	customToken, err := c.jwtService.GenerateToken(
		user.ID,
		token.AccessToken,
		user.Email,
		user.Name,
	)
	if err != nil {
		fmt.Printf("[oauth] Token generation error: %v\n", err)
		ctx.JSON(http.StatusInternalServerError, models.AuthResponse{
			Success: false,
			Error:   "Failed to generate token",
		})
		return
	}

	refreshToken, err := c.jwtService.GenerateRefreshToken(user.ID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, models.AuthResponse{
			Success: false,
			Error:   "Failed to generate refresh token",
		})
		return
	}

	// Store session with OAuth token for IMAP/SMTP XOAuth2 usage
	sessionManager := services.GetSessionManager()
	sessionManager.SetSession(user.ID, &services.Session{
		UserID:            user.ID,
		Email:             user.Email,
		Provider:          providerName,
		OAuthAccessToken:  token.AccessToken,
		OAuthRefreshToken: token.RefreshToken,
		OAuthExpiry:       token.ExpiresIn,
	})

	fmt.Printf("[oauth] Authentication successful for user: %s via %s\n", user.Email, providerName)

	ctx.JSON(http.StatusOK, models.AuthResponse{
		Success: true,
		Data: &models.TokenResponse{
			AccessToken:  customToken,
			RefreshToken: refreshToken,
			TokenType:    "Bearer",
			ExpiresIn:    c.jwtService.GetExpirySeconds(),
			User:         user,
		},
	})
}

// OAuthLogin handles login with an OAuth authorization code (frontend-initiated flow)
func (c *OAuthController) OAuthLogin(ctx *gin.Context) {
	var req models.OAuthLoginRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, models.AuthResponse{
			Success: false,
			Error:   "Invalid request body: " + err.Error(),
		})
		return
	}

	provider, ok := c.oauthService.GetProvider(req.Provider)
	if !ok {
		ctx.JSON(http.StatusBadRequest, models.AuthResponse{
			Success: false,
			Error:   "Unsupported OAuth provider: " + req.Provider,
		})
		return
	}

	token, err := provider.ExchangeCode(req.Code, req.RedirectURI)
	if err != nil {
		fmt.Printf("[oauth] Token exchange error for %s: %v\n", req.Provider, err)
		ctx.JSON(http.StatusInternalServerError, models.AuthResponse{
			Success: false,
			Error:   "Failed to exchange authorization code",
		})
		return
	}

	userInfo, err := provider.GetUserInfo(token)
	if err != nil {
		fmt.Printf("[oauth] Userinfo error for %s: %v\n", req.Provider, err)
		ctx.JSON(http.StatusInternalServerError, models.AuthResponse{
			Success: false,
			Error:   "Failed to retrieve user information",
		})
		return
	}

	user := &models.User{
		ID:        userInfo.ID,
		Email:     userInfo.Email,
		Name:      userInfo.Name,
		AvatarURL: userInfo.Picture,
		Active:    true,
	}

	if user.ID == "" {
		user.ID = userInfo.Email
	}
	if user.Name == "" {
		user.Name = extractNameFromEmail(userInfo.Email)
	}

	customToken, err := c.jwtService.GenerateToken(
		user.ID,
		token.AccessToken,
		user.Email,
		user.Name,
	)
	if err != nil {
		fmt.Printf("[oauth] Token generation error: %v\n", err)
		ctx.JSON(http.StatusInternalServerError, models.AuthResponse{
			Success: false,
			Error:   "Failed to generate token",
		})
		return
	}

	refreshToken, err := c.jwtService.GenerateRefreshToken(user.ID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, models.AuthResponse{
			Success: false,
			Error:   "Failed to generate refresh token",
		})
		return
	}

	sessionManager := services.GetSessionManager()
	sessionManager.SetSession(user.ID, &services.Session{
		UserID:            user.ID,
		Email:             user.Email,
		Provider:          req.Provider,
		OAuthAccessToken:  token.AccessToken,
		OAuthRefreshToken: token.RefreshToken,
		OAuthExpiry:       token.ExpiresIn,
	})

	fmt.Printf("[oauth] Login successful for user: %s via %s\n", user.Email, req.Provider)

	ctx.JSON(http.StatusOK, models.AuthResponse{
		Success: true,
		Data: &models.TokenResponse{
			AccessToken:  customToken,
			RefreshToken: refreshToken,
			TokenType:    "Bearer",
			ExpiresIn:    c.jwtService.GetExpirySeconds(),
			User:         user,
		},
	})
}
