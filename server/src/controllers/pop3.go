package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"github.com/skygenesisenterprise/aether-mail/server/src/models"
	"github.com/skygenesisenterprise/aether-mail/server/src/services"
)

type POP3Controller struct {
	pop3Service *services.POP3Service
}

func NewPOP3Controller() *POP3Controller {
	return &POP3Controller{
		pop3Service: services.NewPOP3Service(),
	}
}

func (c *POP3Controller) Connect(ctx *gin.Context) {
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

	var err error
	if req.UseTLS {
		err = c.pop3Service.ConnectTLS(req.Host, req.Port)
	} else {
		err = c.pop3Service.Connect(req.Host, req.Port)
	}

	if err != nil {
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

func (c *POP3Controller) Authenticate(ctx *gin.Context) {
	var req struct {
		Username string `json:"username" binding:"required"`
		Password string `json:"password" binding:"required"`
		UseAPOP  bool   `json:"use_apop"`
	}

	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Invalid request body",
		})
		return
	}

	var err error
	if req.UseAPOP {
		err = c.pop3Service.AuthenticateAPOP(req.Username, req.Password)
	} else {
		err = c.pop3Service.Authenticate(req.Username, req.Password)
	}

	if err != nil {
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

func (c *POP3Controller) Disconnect(ctx *gin.Context) {
	if err := c.pop3Service.Disconnect(); err != nil {
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

func (c *POP3Controller) Stat(ctx *gin.Context) {
	stat, err := c.pop3Service.Stat()
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"success":  true,
		"messages": stat.Messages,
		"octets":   stat.Octets,
	})
}

func (c *POP3Controller) ListMessages(ctx *gin.Context) {
	messages, err := c.pop3Service.List()
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	var result []gin.H
	for _, msg := range messages {
		result = append(result, gin.H{
			"number":    msg.MessageNum,
			"size":      msg.Size,
			"unique_id": msg.UniqueID,
		})
	}

	ctx.JSON(http.StatusOK, gin.H{
		"success":  true,
		"messages": result,
	})
}

func (c *POP3Controller) Uidl(ctx *gin.Context) {
	uids, err := c.pop3Service.Uidl()
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	var result []gin.H
	for _, uid := range uids {
		result = append(result, gin.H{
			"number":    uid.MessageNum,
			"unique_id": uid.UniqueID,
		})
	}

	ctx.JSON(http.StatusOK, gin.H{
		"success": true,
		"uids":    result,
	})
}

func (c *POP3Controller) Retr(ctx *gin.Context) {
	messageNumStr := ctx.Param("number")
	messageNum := 0

	for _, c := range messageNumStr {
		if c >= '0' && c <= '9' {
			messageNum = messageNum*10 + int(c-'0')
		} else {
			ctx.JSON(http.StatusBadRequest, gin.H{
				"success": false,
				"error":   "Invalid message number",
			})
			return
		}
	}

	email, err := c.pop3Service.Retr(messageNum)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, models.EmailResponse{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, models.EmailResponse{
		Success: true,
		Data:    email,
	})
}

func (c *POP3Controller) Top(ctx *gin.Context) {
	messageNumStr := ctx.Param("number")
	messageNum := 0

	for _, c := range messageNumStr {
		if c >= '0' && c <= '9' {
			messageNum = messageNum*10 + int(c-'0')
		} else {
			ctx.JSON(http.StatusBadRequest, gin.H{
				"success": false,
				"error":   "Invalid message number",
			})
			return
		}
	}

	lines := 0
	if linesStr := ctx.Query("lines"); linesStr != "" {
		for _, c := range linesStr {
			if c >= '0' && c <= '9' {
				lines = lines*10 + int(c-'0')
			}
		}
	}

	if lines == 0 {
		lines = 10
	}

	body, err := c.pop3Service.Top(messageNum, lines)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"success": true,
		"body":    string(body),
	})
}

func (c *POP3Controller) Dele(ctx *gin.Context) {
	messageNumStr := ctx.Param("number")
	messageNum := 0

	for _, c := range messageNumStr {
		if c >= '0' && c <= '9' {
			messageNum = messageNum*10 + int(c-'0')
		} else {
			ctx.JSON(http.StatusBadRequest, gin.H{
				"success": false,
				"error":   "Invalid message number",
			})
			return
		}
	}

	if err := c.pop3Service.Dele(messageNum); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Message marked for deletion",
	})
}

func (c *POP3Controller) Reset(ctx *gin.Context) {
	if err := c.pop3Service.Reset(); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Session reset",
	})
}

func (c *POP3Controller) Noop(ctx *gin.Context) {
	if err := c.pop3Service.Noop(); err != nil {
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

func (c *POP3Controller) Quit(ctx *gin.Context) {
	if err := c.pop3Service.Quit(); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Session ended",
	})
}
