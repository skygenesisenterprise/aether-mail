package controllers

import (
	"net/http"
	"strconv"

	"github.com/skygenesisenterprise/aether-mail/server/src/models"
	"github.com/skygenesisenterprise/aether-mail/server/src/services"

	"github.com/gin-gonic/gin"
)

type ContactController struct {
	stalwartService *services.StalwartService
}

func NewContactController(stalwart *services.StalwartService) *ContactController {
	return &ContactController{
		stalwartService: stalwart,
	}
}

func (c *ContactController) GetContacts(ctx *gin.Context) {
	accountID := ctx.Param("accountId")
	if accountID == "" {
		ctx.JSON(http.StatusBadRequest, models.ContactListResponse{
			Success: false,
			Error:   "Account ID is required",
		})
		return
	}

	limit, _ := strconv.Atoi(ctx.DefaultQuery("limit", "50"))
	offset, _ := strconv.Atoi(ctx.DefaultQuery("offset", "0"))

	contacts, err := c.stalwartService.GetContacts(accountID, limit, offset)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, models.ContactListResponse{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, models.ContactListResponse{
		Success: true,
		Data:    contacts,
	})
}

func (c *ContactController) CreateContact(ctx *gin.Context) {
	var req models.CreateContactRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, models.ContactResponse{
			Success: false,
			Error:   "Invalid request body",
		})
		return
	}

	contact, err := c.stalwartService.CreateContact(&req)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, models.ContactResponse{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusCreated, models.ContactResponse{
		Success: true,
		Data:    contact,
	})
}

func (c *ContactController) UpdateContact(ctx *gin.Context) {
	var req models.UpdateContactRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, models.ContactResponse{
			Success: false,
			Error:   "Invalid request body",
		})
		return
	}

	contact, err := c.stalwartService.UpdateContact(&req)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, models.ContactResponse{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, models.ContactResponse{
		Success: true,
		Data:    contact,
	})
}

func (c *ContactController) DeleteContact(ctx *gin.Context) {
	accountID := ctx.Param("accountId")
	contactID := ctx.Param("contactId")

	if accountID == "" || contactID == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Account ID and Contact ID are required",
		})
		return
	}

	if err := c.stalwartService.DeleteContact(accountID, contactID); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Contact deleted successfully",
	})
}

func (c *ContactController) SearchContacts(ctx *gin.Context) {
	accountID := ctx.Query("accountId")
	query := ctx.Query("q")

	if accountID == "" || query == "" {
		ctx.JSON(http.StatusBadRequest, models.ContactListResponse{
			Success: false,
			Error:   "Account ID and query are required",
		})
		return
	}

	contacts, err := c.stalwartService.SearchContacts(accountID, query)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, models.ContactListResponse{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, models.ContactListResponse{
		Success: true,
		Data:    contacts,
	})
}
