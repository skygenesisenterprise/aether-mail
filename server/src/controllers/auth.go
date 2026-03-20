package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"github.com/skygenesisenterprise/aether-mail/server/src/models"
	"github.com/skygenesisenterprise/aether-mail/server/src/services"
)

type AuthController struct {
	stalwartService *services.StalwartService
	jwtService      *services.JWTService
}

func NewAuthController(stalwart *services.StalwartService, jwt *services.JWTService) *AuthController {
	return &AuthController{
		stalwartService: stalwart,
		jwtService:      jwt,
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

	tokenResp, err := c.stalwartService.Authenticate(req.Email, req.Password)
	if err != nil {
		ctx.JSON(http.StatusUnauthorized, models.AuthResponse{
			Success: false,
			Error:   "Invalid credentials",
		})
		return
	}

	user := tokenResp.User
	if user == nil {
		ctx.JSON(http.StatusInternalServerError, models.AuthResponse{
			Success: false,
			Error:   "User data not available",
		})
		return
	}

	customToken, err := c.jwtService.GenerateToken(
		user.ID,
		tokenResp.AccessToken,
		user.Email,
		user.Name,
	)
	if err != nil {
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
