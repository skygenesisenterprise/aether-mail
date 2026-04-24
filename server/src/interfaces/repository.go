package interfaces

import (
	"github.com/skygenesisenterprise/aether-mail/server/src/models"
)

type NotificationRepository interface {
	Create(notification *models.Notification) (*models.Notification, error)
	Delete(id string) error
	FindByID(id string) (*models.Notification, error)
	FindByUserID(userID string, limit, offset int) ([]*models.Notification, error)
	MarkAsRead(ids []string) error
	MarkAllAsRead(userID string) error
	Dismiss(id string) error
	UnreadCount(userID string) (int, error)
}

type ContactGroupRepository interface {
	Create(group *models.ContactGroup) (*models.ContactGroup, error)
	Update(group *models.ContactGroup) (*models.ContactGroup, error)
	Delete(id string) error
	FindByID(id string) (*models.ContactGroup, error)
	FindByUserID(userID string) ([]*models.ContactGroup, error)
}

type FilterRepository interface {
	Create(filter *models.Filter) (*models.Filter, error)
	Update(filter *models.Filter) (*models.Filter, error)
	Delete(id string) error
	FindByID(id string) (*models.Filter, error)
	FindByUserID(userID string) ([]*models.Filter, error)
	Enable(id string) error
	Disable(id string) error
}

type LabelRepository interface {
	Create(label *models.Label) (*models.Label, error)
	Update(label *models.Label) (*models.Label, error)
	Delete(id string) error
	FindByID(id string) (*models.Label, error)
	FindByUserID(userID string) ([]*models.Label, error)
	FindByParentID(parentID string) ([]*models.Label, error)
}

type SignatureRepository interface {
	Create(signature *models.Signature) (*models.Signature, error)
	Update(signature *models.Signature) (*models.Signature, error)
	Delete(id string) error
	FindByID(id string) (*models.Signature, error)
	FindByUserID(userID string) ([]*models.Signature, error)
	SetDefault(id string, userID string) error
}

type VacationResponderRepository interface {
	Upsert(vacation *models.VacationResponder) (*models.VacationResponder, error)
	FindByUserID(userID string) (*models.VacationResponder, error)
	Delete(userID string) error
}