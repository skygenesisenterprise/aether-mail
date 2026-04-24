package interfaces

import (
	"time"

	"github.com/skygenesisenterprise/aether-mail/server/src/models"
)

type CalendarRepository interface {
	Create(calendar *models.Calendar) (*models.Calendar, error)
	Update(calendar *models.Calendar) (*models.Calendar, error)
	Delete(id string) error
	FindByID(id string) (*models.Calendar, error)
	FindByUserID(userID string) ([]*models.Calendar, error)
	SetDefault(id string, userID string) error
}

type CalendarEventRepository interface {
	Create(event *models.CalendarEvent) (*models.CalendarEvent, error)
	Update(event *models.CalendarEvent) (*models.CalendarEvent, error)
	Delete(id string) error
	FindByID(id string) (*models.CalendarEvent, error)
	FindByUserID(userID string, start, end time.Time) ([]*models.CalendarEvent, error)
	FindByCalendarID(calendarID string) ([]*models.CalendarEvent, error)
	FindUpcoming(userID string, days int) ([]*models.CalendarEvent, error)
	FindToday(userID string) ([]*models.CalendarEvent, error)
}

type CalendarSettingsRepository interface {
	Upsert(settings *models.UserSettings) (*models.UserSettings, error)
	FindByUserID(userID string) (*models.UserSettings, error)
}