package services

import (
	"fmt"

	"github.com/skygenesisenterprise/aether-mail/server/src/models"
)

type NotificationService struct {
	stalwart *StalwartService
}

func NewNotificationService(stalwart *StalwartService) *NotificationService {
	return &NotificationService{
		stalwart: stalwart,
	}
}

func (s *NotificationService) GetNotifications(userID string, limit, offset int) ([]*models.Notification, error) {
	return nil, fmt.Errorf("not implemented")
}

func (s *NotificationService) GetNotification(notificationID string) (*models.Notification, error) {
	return nil, fmt.Errorf("not implemented")
}

func (s *NotificationService) MarkAsRead(notificationIDs []string) error {
	return fmt.Errorf("not implemented")
}

func (s *NotificationService) MarkAllAsRead(userID string) error {
	return fmt.Errorf("not implemented")
}

func (s *NotificationService) Dismiss(notificationID string) error {
	return fmt.Errorf("not implemented")
}

func (s *NotificationService) CreateNotification(userID, ntype, title, message string) (*models.Notification, error) {
	return nil, fmt.Errorf("not implemented")
}