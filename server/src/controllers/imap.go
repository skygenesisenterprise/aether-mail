package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"github.com/skygenesisenterprise/aether-mail/server/src/models"
	"github.com/skygenesisenterprise/aether-mail/server/src/services"
)

type IMAPController struct {
	imapService *services.IMAPService
	stalwart    *services.StalwartService
}

func NewIMAPController(stalwart *services.StalwartService) *IMAPController {
	return &IMAPController{
		imapService: services.NewIMAPService(),
		stalwart:    stalwart,
	}
}

func (c *IMAPController) Connect(ctx *gin.Context) {
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

	if err := c.imapService.Connect(req.Host, req.Port, req.UseTLS); err != nil {
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

func (c *IMAPController) Login(ctx *gin.Context) {
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

	if err := c.imapService.Authenticate(req.Username, req.Password); err != nil {
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

func (c *IMAPController) Disconnect(ctx *gin.Context) {
	if err := c.imapService.Disconnect(); err != nil {
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

func (c *IMAPController) ListMailboxes(ctx *gin.Context) {
	reference := ctx.DefaultQuery("reference", "")
	mailbox := ctx.DefaultQuery("mailbox", "*")

	folders, err := c.imapService.ListMailboxes(reference, mailbox)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, models.FolderListResponse{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, models.FolderListResponse{
		Success: true,
		Data: &models.FolderList{
			Folders: folders,
		},
	})
}

func (c *IMAPController) GetMailboxStatus(ctx *gin.Context) {
	mailbox := ctx.Param("mailbox")

	folder, err := c.imapService.GetMailboxStatus(mailbox)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, models.FolderResponse{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, models.FolderResponse{
		Success: true,
		Data:    folder,
	})
}

func (c *IMAPController) SelectMailbox(ctx *gin.Context) {
	mailbox := ctx.Param("mailbox")

	if err := c.imapService.SelectMailbox(mailbox); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Mailbox selected",
	})
}

func (c *IMAPController) FetchMessages(ctx *gin.Context) {
	sequence := ctx.DefaultQuery("sequence", "1:*")
	items := []string{"ENVELOPE", "FLAGS", "BODY.PEEK[TEXT]"}

	messages, err := c.imapService.ListMessages(sequence, items)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, models.EmailListResponse{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, models.EmailListResponse{
		Success: true,
		Data: &models.EmailList{
			Emails: messages,
		},
	})
}

func (c *IMAPController) SearchMessages(ctx *gin.Context) {
	var req struct {
		Criteria string `json:"criteria" binding:"required"`
	}

	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Invalid request body",
		})
		return
	}

	ids, err := c.imapService.SearchMessages(req.Criteria)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    ids,
	})
}

func (c *IMAPController) MoveMessages(ctx *gin.Context) {
	var req struct {
		Sequence string `json:"sequence" binding:"required"`
		Mailbox  string `json:"mailbox" binding:"required"`
	}

	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Invalid request body",
		})
		return
	}

	if err := c.imapService.MoveMessages(req.Sequence, req.Mailbox); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Messages moved",
	})
}

func (c *IMAPController) DeleteMessages(ctx *gin.Context) {
	var req struct {
		Sequence string `json:"sequence" binding:"required"`
	}

	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Invalid request body",
		})
		return
	}

	if err := c.imapService.DeleteMessages(req.Sequence); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Messages deleted",
	})
}

func (c *IMAPController) CreateMailbox(ctx *gin.Context) {
	var req struct {
		Name string `json:"name" binding:"required"`
	}

	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Invalid request body",
		})
		return
	}

	if err := c.imapService.CreateMailbox(req.Name); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusCreated, gin.H{
		"success": true,
		"message": "Mailbox created",
	})
}

func (c *IMAPController) RenameMailbox(ctx *gin.Context) {
	var req struct {
		OldName string `json:"old_name" binding:"required"`
		NewName string `json:"new_name" binding:"required"`
	}

	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Invalid request body",
		})
		return
	}

	if err := c.imapService.RenameMailbox(req.OldName, req.NewName); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Mailbox renamed",
	})
}

func (c *IMAPController) DeleteMailbox(ctx *gin.Context) {
	mailbox := ctx.Param("mailbox")

	if err := c.imapService.DeleteMailbox(mailbox); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Mailbox deleted",
	})
}

func (c *IMAPController) Noop(ctx *gin.Context) {
	if err := c.imapService.Noop(); err != nil {
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

func (c *IMAPController) Expunge(ctx *gin.Context) {
	if err := c.imapService.Expunge(); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Expunge successful",
	})
}
