package controllers

import (
	"net/http"
	"strconv"

	"github.com/skygenesisenterprise/aether-mail/server/src/models"
	"github.com/skygenesisenterprise/aether-mail/server/src/services"

	"github.com/gin-gonic/gin"
)

type EmailController struct {
	stalwartService *services.StalwartService
}

func NewEmailController(stalwart *services.StalwartService) *EmailController {
	return &EmailController{
		stalwartService: stalwart,
	}
}

func (c *EmailController) GetEmails(ctx *gin.Context) {
	accountID := ctx.Param("accountId")
	if accountID == "" {
		ctx.JSON(http.StatusBadRequest, models.EmailListResponse{
			Success: false,
			Error:   "Account ID is required",
		})
		return
	}

	limit, _ := strconv.Atoi(ctx.DefaultQuery("limit", "50"))
	offset, _ := strconv.Atoi(ctx.DefaultQuery("offset", "0"))
	mailboxID := ctx.Query("mailbox")

	query := &models.EmailQuery{
		AccountID: accountID,
		Limit:     limit,
		Offset:    offset,
	}

	if mailboxID != "" {
		query.InMailbox = []string{mailboxID}
	}

	emailList, err := c.stalwartService.GetEmails(query)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, models.EmailListResponse{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, models.EmailListResponse{
		Success: true,
		Data:    emailList,
	})
}

func (c *EmailController) GetEmail(ctx *gin.Context) {
	accountID := ctx.Param("accountId")
	emailID := ctx.Param("emailId")

	if accountID == "" || emailID == "" {
		ctx.JSON(http.StatusBadRequest, models.EmailResponse{
			Success: false,
			Error:   "Account ID and Email ID are required",
		})
		return
	}

	email, err := c.stalwartService.GetEmail(accountID, emailID)
	if err != nil {
		ctx.JSON(http.StatusNotFound, models.EmailResponse{
			Success: false,
			Error:   "Email not found",
		})
		return
	}

	ctx.JSON(http.StatusOK, models.EmailResponse{
		Success: true,
		Data:    email,
	})
}

func (c *EmailController) SendEmail(ctx *gin.Context) {
	var email models.Email
	if err := ctx.ShouldBindJSON(&email); err != nil {
		ctx.JSON(http.StatusBadRequest, models.EmailResponse{
			Success: false,
			Error:   "Invalid request body",
		})
		return
	}

	sentEmail, err := c.stalwartService.SendEmail(&email)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, models.EmailResponse{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, models.EmailResponse{
		Success: true,
		Data:    sentEmail,
	})
}

func (c *EmailController) CreateDraft(ctx *gin.Context) {
	var email models.Email
	if err := ctx.ShouldBindJSON(&email); err != nil {
		ctx.JSON(http.StatusBadRequest, models.EmailResponse{
			Success: false,
			Error:   "Invalid request body",
		})
		return
	}

	draft, err := c.stalwartService.CreateDraft(&email)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, models.EmailResponse{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusCreated, models.EmailResponse{
		Success: true,
		Data:    draft,
	})
}

func (c *EmailController) DeleteEmails(ctx *gin.Context) {
	var req models.FolderAction
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Invalid request body",
		})
		return
	}

	if err := c.stalwartService.DeleteEmails(&req); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Emails deleted successfully",
	})
}

func (c *EmailController) MoveEmails(ctx *gin.Context) {
	var req models.FolderAction
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Invalid request body",
		})
		return
	}

	if err := c.stalwartService.MoveEmails(&req); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Emails moved successfully",
	})
}
