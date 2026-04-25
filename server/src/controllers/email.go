package controllers

import (
	"fmt"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	"github.com/skygenesisenterprise/aether-mail/server/src/config"
	"github.com/skygenesisenterprise/aether-mail/server/src/models"
	"github.com/skygenesisenterprise/aether-mail/server/src/services"
)

type EmailController struct {
	stalwartService *services.StalwartService
	searchService   *services.SearchService
	tagService      *services.TagService
	mailConfig      *config.MailConfig
}

func NewEmailController(stalwart *services.StalwartService, mailConfig *config.MailConfig) *EmailController {
	return &EmailController{
		stalwartService: stalwart,
		searchService:   services.NewSearchService(stalwart),
		tagService:      services.NewTagService(stalwart),
		mailConfig:      mailConfig,
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

	limit, _ := strconv.Atoi(ctx.DefaultQuery("limit", "1000"))
	offset, _ := strconv.Atoi(ctx.DefaultQuery("offset", "0"))
	mailboxID := ctx.DefaultQuery("mailbox", "INBOX")
	isReadStr := ctx.Query("is_read")
	isStarredStr := ctx.Query("is_starred")

	if c.mailConfig != nil && c.mailConfig.DefaultProvider == "imap" {
		sessionManager := services.GetSessionManager()
		session, ok := sessionManager.GetSession(accountID)
		if !ok {
			ctx.JSON(http.StatusUnauthorized, models.EmailListResponse{
				Success: false,
				Error:   "Session not found",
			})
			return
		}

		imapService := services.NewIMAPEmailService(
			session.IMAPHost,
			session.IMAPPort,
			c.mailConfig.IMAP.UseTLS,
			session.Email,
			session.Password,
		)

		emailList, err := imapService.GetEmails(mailboxID, limit, offset)
		if err != nil {
			fmt.Printf("[email] IMAP GetEmails error: %v\n", err)
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
		return
	}

	query := &models.EmailQuery{
		AccountID: accountID,
		Limit:     limit,
		Offset:    offset,
		Sort: []models.SortOrder{
			{Property: "date", IsAscending: false},
		},
	}

	if mailboxID != "" {
		query.MailboxIDs = []string{mailboxID}
	}

	if isReadStr != "" {
		isRead := isReadStr == "true"
		query.IsRead = &isRead
	}

	if isStarredStr != "" {
		isStarred := isStarredStr == "true"
		query.IsStarred = &isStarred
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
	mailboxID := ctx.DefaultQuery("mailbox", "INBOX")

	if accountID == "" || emailID == "" {
		ctx.JSON(http.StatusBadRequest, models.EmailResponse{
			Success: false,
			Error:   "Account ID and Email ID are required",
		})
		return
	}

	if c.mailConfig != nil && c.mailConfig.DefaultProvider == "imap" {
		sessionManager := services.GetSessionManager()
		session, ok := sessionManager.GetSession(accountID)
		if !ok {
			ctx.JSON(http.StatusUnauthorized, models.EmailResponse{
				Success: false,
				Error:   "Session not found",
			})
			return
		}

		imapService := services.NewIMAPEmailService(
			session.IMAPHost,
			session.IMAPPort,
			c.mailConfig.IMAP.UseTLS,
			session.Email,
			session.Password,
		)

		uid, err := strconv.Atoi(emailID)
		if err != nil {
			ctx.JSON(http.StatusBadRequest, models.EmailResponse{
				Success: false,
				Error:   "Invalid email ID format",
			})
			return
		}

		email, err := imapService.GetEmail(mailboxID, uid)
		if err != nil {
			fmt.Printf("[email] IMAP GetEmail error: %v\n", err)
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

func (c *EmailController) GetEmailRaw(ctx *gin.Context) {
	accountID := ctx.Param("accountId")
	emailID := ctx.Param("emailId")

	if accountID == "" || emailID == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Account ID and Email ID are required",
		})
		return
	}

	rawEmail, err := c.stalwartService.GetEmailRaw(accountID, emailID)
	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"error":   "Email not found",
		})
		return
	}

	ctx.Data(http.StatusOK, "message/rfc822", []byte(rawEmail))
}

func (c *EmailController) GetThread(ctx *gin.Context) {
	accountID := ctx.Param("accountId")
	threadID := ctx.Param("threadId")

	if accountID == "" || threadID == "" {
		ctx.JSON(http.StatusBadRequest, models.ThreadResponse{
			Success: false,
			Error:   "Account ID and Thread ID are required",
		})
		return
	}

	thread, err := c.stalwartService.GetThread(accountID, threadID)
	if err != nil {
		ctx.JSON(http.StatusNotFound, models.ThreadResponse{
			Success: false,
			Error:   "Thread not found",
		})
		return
	}

	ctx.JSON(http.StatusOK, models.ThreadResponse{
		Success: true,
		Data:    thread,
	})
}

func (c *EmailController) SendEmail(ctx *gin.Context) {
	var req models.SendEmailRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, models.EmailResponse{
			Success: false,
			Error:   "Invalid request body: " + err.Error(),
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

	sentEmail, err := c.stalwartService.SendEmail(&req)
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
	var req models.SendEmailRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, models.EmailResponse{
			Success: false,
			Error:   "Invalid request body: " + err.Error(),
		})
		return
	}

	draft, err := c.stalwartService.CreateDraft(&req)
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

func (c *EmailController) UpdateDraft(ctx *gin.Context) {
	accountID := ctx.Param("accountId")
	draftID := ctx.Param("draftId")

	var req models.SendEmailRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, models.EmailResponse{
			Success: false,
			Error:   "Invalid request body",
		})
		return
	}

	draft, err := c.stalwartService.UpdateDraft(accountID, draftID, &req)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, models.EmailResponse{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, models.EmailResponse{
		Success: true,
		Data:    draft,
	})
}

func (c *EmailController) DeleteDraft(ctx *gin.Context) {
	accountID := ctx.Param("accountId")
	draftID := ctx.Param("draftId")

	err := c.stalwartService.DeleteDraft(accountID, draftID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Draft deleted successfully",
	})
}

func (c *EmailController) DeleteEmails(ctx *gin.Context) {
	var req models.EmailActionRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Invalid request body",
		})
		return
	}

	err := c.stalwartService.DeleteEmails(req.AccountID, req.EmailIDs)
	if err != nil {
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
	var req models.MoveEmailsRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Invalid request body",
		})
		return
	}

	err := c.stalwartService.MoveEmails(&req)
	if err != nil {
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

func (c *EmailController) MarkAsRead(ctx *gin.Context) {
	var req models.EmailActionRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Invalid request body: " + err.Error(),
		})
		return
	}

	if c.mailConfig != nil && c.mailConfig.DefaultProvider == "imap" {
		sessionManager := services.GetSessionManager()
		session, ok := sessionManager.GetSession(req.AccountID)
		if !ok {
			ctx.JSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"error":   "Session not found",
			})
			return
		}

		imapService := services.NewIMAPEmailService(
			session.IMAPHost,
			session.IMAPPort,
			c.mailConfig.IMAP.UseTLS,
			session.Email,
			session.Password,
		)

		err := imapService.MarkAsRead(req.EmailIDs)
		if err != nil {
			fmt.Printf("[email] IMAP MarkAsRead error: %v\n", err)
			ctx.JSON(http.StatusInternalServerError, gin.H{
				"success": false,
				"error":   err.Error(),
			})
			return
		}

		ctx.JSON(http.StatusOK, gin.H{
			"success": true,
			"message": "Emails marked as read",
		})
		return
	}

	err := c.stalwartService.MarkEmailsRead(req.AccountID, req.EmailIDs)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Emails marked as read",
	})
}

func (c *EmailController) MarkAsUnread(ctx *gin.Context) {
	var req models.EmailActionRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Invalid request body: " + err.Error(),
		})
		return
	}

	if c.mailConfig != nil && c.mailConfig.DefaultProvider == "imap" {
		sessionManager := services.GetSessionManager()
		session, ok := sessionManager.GetSession(req.AccountID)
		if !ok {
			ctx.JSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"error":   "Session not found",
			})
			return
		}

		imapService := services.NewIMAPEmailService(
			session.IMAPHost,
			session.IMAPPort,
			c.mailConfig.IMAP.UseTLS,
			session.Email,
			session.Password,
		)

		err := imapService.MarkAsUnread(req.EmailIDs)
		if err != nil {
			fmt.Printf("[email] IMAP MarkAsUnread error: %v\n", err)
			ctx.JSON(http.StatusInternalServerError, gin.H{
				"success": false,
				"error":   err.Error(),
			})
			return
		}

		ctx.JSON(http.StatusOK, gin.H{
			"success": true,
			"message": "Emails marked as unread",
		})
		return
	}

	err := c.stalwartService.MarkEmailsUnread(req.AccountID, req.EmailIDs)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Emails marked as unread",
	})
}

func (c *EmailController) StarEmails(ctx *gin.Context) {
	var req models.EmailActionRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Invalid request body",
		})
		return
	}

	err := c.stalwartService.StarEmails(req.AccountID, req.EmailIDs)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Emails starred",
	})
}

func (c *EmailController) UnstarEmails(ctx *gin.Context) {
	var req models.EmailActionRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Invalid request body",
		})
		return
	}

	err := c.stalwartService.UnstarEmails(req.AccountID, req.EmailIDs)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Emails unstarred",
	})
}

func (c *EmailController) ArchiveEmails(ctx *gin.Context) {
	var req models.EmailActionRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Invalid request body",
		})
		return
	}

	err := c.stalwartService.ArchiveEmails(req.AccountID, req.EmailIDs)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Emails archived",
	})
}

func (c *EmailController) Search(ctx *gin.Context) {
	var req models.SearchQuery
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, models.SearchResponse{
			Success: false,
			Error:   "Invalid request body",
		})
		return
	}

	result, err := c.searchService.Search(&req)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, models.SearchResponse{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, models.SearchResponse{
		Success: true,
		Data:    result,
	})
}

func (c *EmailController) QuickSearch(ctx *gin.Context) {
	accountID := ctx.Query("accountId")
	query := ctx.Query("q")
	limit, _ := strconv.Atoi(ctx.DefaultQuery("limit", "10"))

	if accountID == "" || query == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Account ID and query are required",
		})
		return
	}

	result, err := c.searchService.QuickSearch(accountID, query, limit)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    result,
	})
}
