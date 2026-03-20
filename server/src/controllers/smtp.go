package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"github.com/skygenesisenterprise/aether-mail/server/src/models"
	"github.com/skygenesisenterprise/aether-mail/server/src/services"
)

type SMTPController struct {
	smtpService *services.SMTPService
}

func NewSMTPController() *SMTPController {
	return &SMTPController{
		smtpService: services.NewSMTPService(),
	}
}

func (c *SMTPController) Connect(ctx *gin.Context) {
	var req struct {
		Host   string `json:"host" binding:"required"`
		Port   int    `json:"port" binding:"required"`
		UseTLS bool   `json:"use_tls"`
	}

	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Invalid request body",
		})
		return
	}

	if err := c.smtpService.Connect(req.Host, req.Port, req.UseTLS); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "Failed to connect: " + err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Connected successfully",
	})
}

func (c *SMTPController) Authenticate(ctx *gin.Context) {
	var req struct {
		Username string `json:"username" binding:"required"`
		Password string `json:"password" binding:"required"`
	}

	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Invalid request body",
		})
		return
	}

	if err := c.smtpService.Authenticate(req.Username, req.Password); err != nil {
		ctx.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"error":   "Authentication failed: " + err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Authenticated successfully",
	})
}

func (c *SMTPController) Disconnect(ctx *gin.Context) {
	if err := c.smtpService.Disconnect(); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "Failed to disconnect: " + err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Disconnected successfully",
	})
}

func (c *SMTPController) SendEmail(ctx *gin.Context) {
	var req models.SendEmailRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, models.EmailResponse{
			Success: false,
			Error:   "Invalid request body: " + err.Error(),
		})
		return
	}

	if req.From == nil {
		ctx.JSON(http.StatusBadRequest, models.EmailResponse{
			Success: false,
			Error:   "Sender is required",
		})
		return
	}

	if len(req.To) == 0 {
		ctx.JSON(http.StatusBadRequest, models.EmailResponse{
			Success: false,
			Error:   "At least one recipient is required",
		})
		return
	}

	messageID, err := c.smtpService.SendMail(req.From, req.To, &models.Email{
		Subject:  req.Subject,
		Body:     req.Body,
		BodyHTML: req.BodyHTML,
	})
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, models.EmailResponse{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"success":    true,
		"message_id": messageID,
	})
}

func (c *SMTPController) SendRawEmail(ctx *gin.Context) {
	var req struct {
		From string   `json:"from" binding:"required"`
		To   []string `json:"to" binding:"required"`
		Data string   `json:"data" binding:"required"`
	}

	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Invalid request body",
		})
		return
	}

	toAddrs := make([]*models.EmailAddress, len(req.To))
	for i, addr := range req.To {
		toAddrs[i] = &models.EmailAddress{Email: addr}
	}

	fromAddr := &models.EmailAddress{Email: req.From}

	messageID, err := c.smtpService.SendEmail(fromAddr, toAddrs, []byte(req.Data))
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"success":    true,
		"message_id": messageID,
	})
}

func (c *SMTPController) Reset(ctx *gin.Context) {
	if err := c.smtpService.Reset(); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "SMTP session reset",
	})
}

func (c *SMTPController) Quit(ctx *gin.Context) {
	if err := c.smtpService.Quit(); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "SMTP session ended",
	})
}

func (c *SMTPController) Noop(ctx *gin.Context) {
	if err := c.smtpService.Noop(); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "NOOP successful",
	})
}
