package controllers

import (
	"net/http"
	"strconv"

	"github.com/skygenesisenterprise/aether-mail/server/src/models"
	"github.com/skygenesisenterprise/aether-mail/server/src/services"

	"github.com/gin-gonic/gin"
)

type NotificationController struct {
	notificationService *services.NotificationService
}

func NewNotificationController(notificationService *services.NotificationService) *NotificationController {
	return &NotificationController{
		notificationService: notificationService,
	}
}

func (c *NotificationController) GetNotifications(ctx *gin.Context) {
	userID := ctx.GetString("userId")
	if userID == "" {
		ctx.JSON(http.StatusUnauthorized, models.ListResponse{
			Success: false,
			Error:   "Unauthorized",
		})
		return
	}

	limit, _ := strconv.Atoi(ctx.DefaultQuery("limit", "50"))
	offset, _ := strconv.Atoi(ctx.DefaultQuery("offset", "0"))

	notifications, err := c.notificationService.GetNotifications(userID, limit, offset)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, models.ListResponse{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, models.ListResponse{
		Success: true,
		Data:    notifications,
	})
}

func (c *NotificationController) GetNotification(ctx *gin.Context) {
	notificationID := ctx.Param("notificationId")
	if notificationID == "" {
		ctx.JSON(http.StatusBadRequest, models.Response{
			Success: false,
			Error:   "Notification ID is required",
		})
		return
	}

	notification, err := c.notificationService.GetNotification(notificationID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, models.Response{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, models.Response{
		Success: true,
		Data:    notification,
	})
}

func (c *NotificationController) MarkRead(ctx *gin.Context) {
	var req models.MarkNotificationsReadRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, models.Response{
			Success: false,
			Error:   "Notification IDs are required",
		})
		return
	}

	if err := c.notificationService.MarkAsRead(req.NotificationIDs); err != nil {
		ctx.JSON(http.StatusInternalServerError, models.Response{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, models.Response{
		Success: true,
		Message: "Notifications marked as read",
	})
}

func (c *NotificationController) Dismiss(ctx *gin.Context) {
	notificationID := ctx.Param("notificationId")
	if notificationID == "" {
		ctx.JSON(http.StatusBadRequest, models.Response{
			Success: false,
			Error:   "Notification ID is required",
		})
		return
	}

	if err := c.notificationService.Dismiss(notificationID); err != nil {
		ctx.JSON(http.StatusInternalServerError, models.Response{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, models.Response{
		Success: true,
		Message: "Notification dismissed",
	})
}