package controllers

import (
	"net/http"

	"github.com/skygenesisenterprise/aether-mail/server/src/models"
	"github.com/skygenesisenterprise/aether-mail/server/src/services"

	"github.com/gin-gonic/gin"
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
	var creds models.Credentials
	if err := ctx.ShouldBindJSON(&creds); err != nil {
		ctx.JSON(http.StatusBadRequest, models.AuthResponse{
			Success: false,
			Error:   "Invalid request body",
		})
		return
	}

	tokenResp, err := c.stalwartService.Authenticate(creds.Username, creds.Password)
	if err != nil {
		ctx.JSON(http.StatusUnauthorized, models.AuthResponse{
			Success: false,
			Error:   "Invalid credentials",
		})
		return
	}

	customToken, err := c.jwtService.GenerateToken(tokenResp.User.ID, tokenResp.User.Email, creds.Username)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, models.AuthResponse{
			Success: false,
			Error:   "Failed to generate token",
		})
		return
	}

	ctx.JSON(http.StatusOK, models.AuthResponse{
		Success: true,
		Data: &models.TokenResponse{
			AccessToken: customToken,
			TokenType:   "Bearer",
			ExpiresIn:   86400,
			User:        tokenResp.User,
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
