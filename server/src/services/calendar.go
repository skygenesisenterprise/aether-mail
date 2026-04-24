package services

import (
	"time"

	"github.com/skygenesisenterprise/aether-mail/server/src/models"
)

type CalendarService struct {
	stalwart *StalwartService
}

func NewCalendarService(stalwart *StalwartService) *CalendarService {
	return &CalendarService{
		stalwart: stalwart,
	}
}

func (s *CalendarService) GetEvents(accountID, calendarID string, start, end time.Time) ([]*models.CalendarEvent, error) {
	return s.stalwart.GetCalendarEvents(accountID, calendarID, start, end)
}

func (s *CalendarService) GetUpcomingEvents(accountID string, days int) ([]*models.CalendarEvent, error) {
	start := time.Now()
	end := start.AddDate(0, 0, days)

	return s.stalwart.GetCalendarEvents(accountID, "", start, end)
}

func (s *CalendarService) GetEvent(accountID, eventID string) (*models.CalendarEvent, error) {
	events, err := s.stalwart.GetCalendarEvents(accountID, "", time.Time{}, time.Now().AddDate(1, 0, 0))
	if err != nil {
		return nil, err
	}

	for _, event := range events {
		if event.ID == eventID {
			return event, nil
		}
	}

	return nil, nil
}

func (s *CalendarService) CreateEvent(req *models.CreateEventRequest) (*models.CalendarEvent, error) {
	if req.Timezone == "" {
		req.Timezone = "UTC"
	}

	return s.stalwart.CreateCalendarEvent(req)
}

func (s *CalendarService) UpdateEvent(req *models.UpdateEventRequest) (*models.CalendarEvent, error) {
	return s.stalwart.UpdateCalendarEvent(req)
}

func (s *CalendarService) DeleteEvent(accountID, eventID string) error {
	return s.stalwart.DeleteCalendarEvent(accountID, eventID)
}

func (s *CalendarService) GetEventsByDateRange(accountID, calendarID string, start, end time.Time) ([]*models.CalendarEvent, error) {
	if calendarID == "" {
		return nil, nil
	}
	return s.stalwart.GetCalendarEvents(accountID, calendarID, start, end)
}

func (s *CalendarService) GetEventsForToday(accountID string) ([]*models.CalendarEvent, error) {
	now := time.Now()
	startOfDay := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())
	endOfDay := startOfDay.Add(24 * time.Hour)

	return s.stalwart.GetCalendarEvents(accountID, "", startOfDay, endOfDay)
}

func (s *CalendarService) GetEventsForWeek(accountID string) ([]*models.CalendarEvent, error) {
	now := time.Now()
	startOfWeek := now.AddDate(0, 0, -int(now.Weekday()))
	endOfWeek := startOfWeek.AddDate(0, 0, 7)

	return s.stalwart.GetCalendarEvents(accountID, "", startOfWeek, endOfWeek)
}

func (s *CalendarService) GetEventsForMonth(accountID string, year, month int) ([]*models.CalendarEvent, error) {
	startOfMonth := time.Date(year, time.Month(month), 1, 0, 0, 0, 0, time.UTC)
	endOfMonth := startOfMonth.AddDate(0, 1, 0)

	return s.stalwart.GetCalendarEvents(accountID, "", startOfMonth, endOfMonth)
}

func (s *CalendarService) IsEventConflict(accountID string, start, end time.Time, excludeEventID string) (bool, error) {
	events, err := s.stalwart.GetCalendarEvents(accountID, "", start, end)
	if err != nil {
		return false, err
	}

	for _, event := range events {
		if event.ID != excludeEventID {
			eventStart, _ := time.Parse(time.RFC3339, event.Start)
			eventEnd, _ := time.Parse(time.RFC3339, event.End)

			if (start.After(eventStart) || start.Equal(eventStart)) && start.Before(eventEnd) {
				return true, nil
			}
			if (end.After(eventStart)) && (end.Before(eventEnd) || end.Equal(eventEnd)) {
				return true, nil
			}
		}
	}

	return false, nil
}
