package controllers

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"

	"github.com/skygenesisenterprise/aether-mail/server/src/config"
	"github.com/skygenesisenterprise/aether-mail/server/src/models"
	"github.com/skygenesisenterprise/aether-mail/server/src/services"
)

type AuthController struct {
	stalwartService *services.StalwartService
	jwtService      *services.JWTService
	imapService     *services.IMAPService
	oauthService    *services.OAuthService
	mailConfig      *config.MailConfig
}

func NewAuthController(stalwart *services.StalwartService, jwt *services.JWTService, oauth *services.OAuthService, mailConfig *config.MailConfig) *AuthController {
	return &AuthController{
		stalwartService: stalwart,
		jwtService:      jwt,
		imapService:     services.NewIMAPService(),
		oauthService:    oauth,
		mailConfig:      mailConfig,
	}
}

func (c *AuthController) Login(ctx *gin.Context) {
	var req models.LoginRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, models.AuthResponse{
			Success: false,
			Error:   "Invalid request body: " + err.Error(),
		})
		return
	}

	// If a provider is explicitly set in the request, route to OAuth login
	if req.Provider != "" {
		c.handleOAuthLogin(ctx, req.Provider, req.Code, req.RedirectURI)
		return
	}

	// If MAIL_PROVIDER is an OAuth provider, route accordingly
	authMethod := c.mailConfig.DefaultProvider
	if authMethod == "google" || authMethod == "microsoft" || authMethod == "proton" {
		ctx.JSON(http.StatusBadRequest, models.AuthResponse{
			Success: false,
			Error:   "OAuth provider requires authorization code. Use /api/v1/auth/oauth/" + authMethod + " to initiate flow or provide 'provider' and 'code' in the request body",
		})
		return
	}

	var user *models.User
	var accessToken string

	switch authMethod {
	case "imap":
		fmt.Printf("[auth] Attempting IMAP connection to %s:%d with TLS=%v\n", c.mailConfig.IMAP.Host, c.mailConfig.IMAP.Port, c.mailConfig.IMAP.UseTLS)
		if err := c.imapService.Connect(c.mailConfig.IMAP.Host, c.mailConfig.IMAP.Port, c.mailConfig.IMAP.UseTLS); err != nil {
			fmt.Printf("[auth] IMAP connection failed: %v\n", err)
			ctx.JSON(http.StatusInternalServerError, models.AuthResponse{
				Success: false,
				Error:   fmt.Sprintf("Failed to connect to mail server: %s", err.Error()),
			})
			return
		}
		defer c.imapService.Disconnect()

		fmt.Printf("[auth] IMAP connection successful, attempting authentication for: %s\n", req.Email)
		if err := c.imapService.Authenticate(req.Email, req.Password); err != nil {
			fmt.Printf("[auth] IMAP authentication failed: %v\n", err)
			ctx.JSON(http.StatusUnauthorized, models.AuthResponse{
				Success: false,
				Error:   "Invalid credentials",
			})
			return
		}

		user = &models.User{
			ID:    req.Email,
			Email: req.Email,
			Name:  extractNameFromEmail(req.Email),
		}
		accessToken = "imap-auth"

		sessionManager := services.GetSessionManager()
		sessionManager.SetSession(user.ID, &services.Session{
			UserID:   user.ID,
			Email:    user.Email,
			Password: req.Password,
			IMAPHost: c.mailConfig.IMAP.Host,
			IMAPPort: c.mailConfig.IMAP.Port,
			SMTPHost: c.mailConfig.SMTP.Host,
			SMTPPort: c.mailConfig.SMTP.Port,
		})

		fmt.Printf("[auth] IMAP authentication successful for user: %s at %s:%d\n", user.Email, c.mailConfig.IMAP.Host, c.mailConfig.IMAP.Port)

	default:
		tokenResp, err := c.stalwartService.Authenticate(req.Email, req.Password)
		if err != nil {
			fmt.Printf("[auth] Authentication error: %v\n", err)
			ctx.JSON(http.StatusUnauthorized, models.AuthResponse{
				Success: false,
				Error:   "Invalid credentials",
			})
			return
		}

		user = tokenResp.User
		if user == nil {
			ctx.JSON(http.StatusInternalServerError, models.AuthResponse{
				Success: false,
				Error:   "User data not available",
			})
			return
		}
		accessToken = tokenResp.AccessToken
	}

	customToken, err := c.jwtService.GenerateToken(
		user.ID,
		accessToken,
		user.Email,
		user.Name,
	)
	if err != nil {
		fmt.Printf("[auth] Token generation error: %v\n", err)
		ctx.JSON(http.StatusInternalServerError, models.AuthResponse{
			Success: false,
			Error:   "Failed to generate token",
		})
		return
	}

	fmt.Printf("[auth] Generated token: %s...\n", customToken[:50])

	refreshToken, err := c.jwtService.GenerateRefreshToken(user.ID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, models.AuthResponse{
			Success: false,
			Error:   "Failed to generate refresh token",
		})
		return
	}

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

	fmt.Printf("[auth] Returning token length: %d\n", len(customToken))
	if len(customToken) > 50 {
		fmt.Printf("[auth] Returning token: %s...\n", customToken[:50])
	} else {
		fmt.Printf("[auth] Returning token: %s\n", customToken)
	}
}

func (c *AuthController) handleOAuthLogin(ctx *gin.Context, providerName, code, redirectURI string) {
	provider, ok := c.oauthService.GetProvider(providerName)
	if !ok {
		ctx.JSON(http.StatusBadRequest, models.AuthResponse{
			Success: false,
			Error:   "Unsupported OAuth provider: " + providerName,
		})
		return
	}

	if code == "" {
		ctx.JSON(http.StatusBadRequest, models.AuthResponse{
			Success: false,
			Error:   "Authorization code is required for OAuth login",
		})
		return
	}

	token, err := provider.ExchangeCode(code, redirectURI)
	if err != nil {
		fmt.Printf("[auth] OAuth token exchange error for %s: %v\n", providerName, err)
		ctx.JSON(http.StatusInternalServerError, models.AuthResponse{
			Success: false,
			Error:   "Failed to exchange authorization code",
		})
		return
	}

	userInfo, err := provider.GetUserInfo(token)
	if err != nil {
		fmt.Printf("[auth] OAuth userinfo error for %s: %v\n", providerName, err)
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
		fmt.Printf("[auth] Token generation error: %v\n", err)
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
		Provider:          providerName,
		OAuthAccessToken:  token.AccessToken,
		OAuthRefreshToken: token.RefreshToken,
		OAuthExpiry:       token.ExpiresIn,
	})

	fmt.Printf("[auth] OAuth login successful for user: %s via %s\n", user.Email, providerName)

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

func extractNameFromEmail(email string) string {
	parts := splitEmail(email)
	if len(parts) > 0 {
		name := parts[0]
		name = replaceUnderscoreHyphen(name)
		return capitalizeWords(name)
	}
	return email
}

func splitEmail(email string) []string {
	atIndex := -1
	for i, c := range email {
		if c == '@' {
			atIndex = i
			break
		}
	}
	if atIndex == -1 {
		return nil
	}
	return []string{email[:atIndex], email[atIndex+1:]}
}

func replaceUnderscoreHyphen(s string) string {
	result := make([]byte, len(s))
	for i := 0; i < len(s); i++ {
		if s[i] == '_' || s[i] == '-' {
			result[i] = ' '
		} else {
			result[i] = s[i]
		}
	}
	return string(result)
}

func capitalizeWords(s string) string {
	words := make([]string, 0, len(s))
	currentWord := ""

	for _, c := range s {
		if c == ' ' {
			if currentWord != "" {
				words = append(words, currentWord)
				currentWord = ""
			}
		} else {
			currentWord += string(c)
		}
	}
	if currentWord != "" {
		words = append(words, currentWord)
	}

	for i, word := range words {
		runes := []rune(word)
		if len(runes) > 0 {
			runes[0] = toUpper(runes[0])
			for j := 1; j < len(runes); j++ {
				runes[j] = toLower(runes[j])
			}
			words[i] = string(runes)
		}
	}

	result := ""
	for i, word := range words {
		if i > 0 {
			result += " "
		}
		result += word
	}
	return result
}

func toUpper(r rune) rune {
	if r >= 'a' && r <= 'z' {
		return r - 32
	}
	return r
}

func toLower(r rune) rune {
	if r >= 'A' && r <= 'Z' {
		return r + 32
	}
	return r
}

func (c *AuthController) Logout(ctx *gin.Context) {
	ctx.JSON(http.StatusOK, models.AuthResponse{
		Success: true,
		Message: "Logged out successfully",
	})
}

func (c *AuthController) GetAccount(ctx *gin.Context) {
	userID, exists := ctx.Get("userID")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, models.AuthResponse{
			Success: false,
			Error:   "User not authenticated",
		})
		return
	}

	user, err := c.stalwartService.GetAccount(userID.(string))
	if err != nil {
		ctx.JSON(http.StatusNotFound, models.AuthResponse{
			Success: false,
			Error:   "Account not found",
		})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    user,
	})
}

func (c *AuthController) RefreshToken(ctx *gin.Context) {
	var req models.RefreshTokenRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, models.AuthResponse{
			Success: false,
			Error:   "Invalid request body",
		})
		return
	}

	userID, err := c.jwtService.ValidateRefreshToken(req.RefreshToken)
	if err != nil {
		ctx.JSON(http.StatusUnauthorized, models.AuthResponse{
			Success: false,
			Error:   "Invalid refresh token",
		})
		return
	}

	user, err := c.stalwartService.GetAccount(userID)
	if err != nil {
		ctx.JSON(http.StatusUnauthorized, models.AuthResponse{
			Success: false,
			Error:   "User not found",
		})
		return
	}

	newToken, err := c.jwtService.GenerateToken(user.ID, "", user.Email, user.Name)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, models.AuthResponse{
			Success: false,
			Error:   "Failed to generate new token",
		})
		return
	}

	refreshToken, _ := c.jwtService.GenerateRefreshToken(user.ID)

	ctx.JSON(http.StatusOK, models.AuthResponse{
		Success: true,
		Data: &models.TokenResponse{
			AccessToken:  newToken,
			RefreshToken: refreshToken,
			TokenType:    "Bearer",
			ExpiresIn:    c.jwtService.GetExpirySeconds(),
			User:         user,
		},
	})
}

func (c *AuthController) GetAccounts(ctx *gin.Context) {
	accounts, err := c.stalwartService.GetAccounts()
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "Failed to get accounts: " + err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    accounts,
	})
}

func (c *AuthController) ChangePassword(ctx *gin.Context) {
	var req models.ChangePasswordRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Invalid request body",
		})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Password changed successfully",
	})
}

func (c *AuthController) ResetPassword(ctx *gin.Context) {
	var req models.ResetPasswordRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Invalid request body",
		})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Password reset email sent",
	})
}

func (c *AuthController) SetPassword(ctx *gin.Context) {
	var req models.SetPasswordRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Invalid request body",
		})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Password set successfully",
	})
}
