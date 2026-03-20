package controllers

import (
	"net/http"

	"github.com/skygenesisenterprise/aether-mail/server/src/models"
	"github.com/skygenesisenterprise/aether-mail/server/src/services"

	"github.com/gin-gonic/gin"
)

type FolderController struct {
	stalwartService *services.StalwartService
}

func NewFolderController(stalwart *services.StalwartService) *FolderController {
	return &FolderController{
		stalwartService: stalwart,
	}
}

func (c *FolderController) GetFolders(ctx *gin.Context) {
	accountID := ctx.Param("accountId")
	if accountID == "" {
		ctx.JSON(http.StatusBadRequest, models.FolderListResponse{
			Success: false,
			Error:   "Account ID is required",
		})
		return
	}

	folders, err := c.stalwartService.GetFolders(accountID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, models.FolderListResponse{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, models.FolderListResponse{
		Success: true,
		Data:    folders,
	})
}

func (c *FolderController) CreateFolder(ctx *gin.Context) {
	var req models.CreateFolderRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, models.FolderResponse{
			Success: false,
			Error:   "Invalid request body",
		})
		return
	}

	folder, err := c.stalwartService.CreateFolder(&req)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, models.FolderResponse{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusCreated, models.FolderResponse{
		Success: true,
		Data:    folder,
	})
}

func (c *FolderController) RenameFolder(ctx *gin.Context) {
	var req models.RenameFolderRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, models.FolderResponse{
			Success: false,
			Error:   "Invalid request body",
		})
		return
	}

	folder, err := c.stalwartService.RenameFolder(&req)
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

func (c *FolderController) DeleteFolder(ctx *gin.Context) {
	accountID := ctx.Param("accountId")
	mailboxID := ctx.Param("mailboxId")

	if accountID == "" || mailboxID == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Account ID and Mailbox ID are required",
		})
		return
	}

	if err := c.stalwartService.DeleteFolder(accountID, mailboxID); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Folder deleted successfully",
	})
}

func (c *FolderController) GetFolder(ctx *gin.Context) {
	accountID := ctx.Param("accountId")
	mailboxID := ctx.Param("mailboxId")

	if accountID == "" || mailboxID == "" {
		ctx.JSON(http.StatusBadRequest, models.FolderResponse{
			Success: false,
			Error:   "Account ID and Mailbox ID are required",
		})
		return
	}

	folder, err := c.stalwartService.GetFolder(accountID, mailboxID)
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

func (c *FolderController) SubscribeFolder(ctx *gin.Context) {
	var req models.SubscribeFolderRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Invalid request body",
		})
		return
	}

	if err := c.stalwartService.SubscribeFolder(req.AccountID, req.MailboxID, req.Subscribe); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Folder subscription updated",
	})
}
