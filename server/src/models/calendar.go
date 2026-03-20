package models

type CalendarEvent struct {
	ID          string           `json:"id"`
	AccountID   string           `json:"account_id"`
	Title       string           `json:"title"`
	Description string           `json:"description,omitempty"`
	Start       string           `json:"start"`
	End         string           `json:"end"`
	AllDay      bool             `json:"all_day"`
	TimeZone    string           `json:"time_zone"`
	Location    string           `json:"location,omitempty"`
	Attendees   []*EventAttendee `json:"attendees,omitempty"`
	Reminder    *EventReminder   `json:"reminder,omitempty"`
	Recurrence  *Recurrence      `json:"recurrence,omitempty"`
	IsPrivate   bool             `json:"is_private"`
	ShowAs      string           `json:"show_as"` // free, tentative, busy
	Color       string           `json:"color,omitempty"`
	CreatedAt   string           `json:"created_at"`
	UpdatedAt   string           `json:"updated_at"`
}

type EventAttendee struct {
	Email string `json:"email"`
	Name  string `json:"name,omitempty"`
	RSVP  string `json:"rsvp"` // needs_action, accepted, declined, tentative
}

type EventReminder struct {
	Method  string `json:"method"` // popup, email
	Minutes int    `json:"minutes"`
}

type Recurrence struct {
	Frequency  string   `json:"frequency"` // daily, weekly, monthly, yearly
	Interval   int      `json:"interval"`
	Count      int      `json:"count,omitempty"`
	Until      string   `json:"until,omitempty"`
	ByDay      []string `json:"by_day,omitempty"`
	ByMonthDay []int    `json:"by_month_day,omitempty"`
}

type Calendar struct {
	ID          string `json:"id"`
	AccountID   string `json:"account_id"`
	Name        string `json:"name"`
	Description string `json:"description,omitempty"`
	Color       string `json:"color"`
	IsPrimary   bool   `json:"is_primary"`
	Permissions string `json:"permissions"`
}

type CalendarList struct {
	AccountID string      `json:"account_id"`
	Calendars []*Calendar `json:"calendars"`
}

type CalendarResponse struct {
	Success bool      `json:"success"`
	Data    *Calendar `json:"data,omitempty"`
	Error   string    `json:"error,omitempty"`
}

type CalendarListResponse struct {
	Success bool          `json:"success"`
	Data    *CalendarList `json:"data,omitempty"`
	Error   string        `json:"error,omitempty"`
}

type EventResponse struct {
	Success bool           `json:"success"`
	Data    *CalendarEvent `json:"data,omitempty"`
	Error   string         `json:"error,omitempty"`
}

type CreateEventRequest struct {
	AccountID   string           `json:"account_id" binding:"required"`
	CalendarID  string           `json:"calendar_id" binding:"required"`
	Title       string           `json:"title" binding:"required"`
	Description string           `json:"description,omitempty"`
	Start       string           `json:"start" binding:"required"`
	End         string           `json:"end" binding:"required"`
	AllDay      bool             `json:"all_day"`
	TimeZone    string           `json:"time_zone"`
	Location    string           `json:"location,omitempty"`
	Attendees   []*EventAttendee `json:"attendees,omitempty"`
	Reminder    *EventReminder   `json:"reminder,omitempty"`
	Recurrence  *Recurrence      `json:"recurrence,omitempty"`
	IsPrivate   bool             `json:"is_private"`
	ShowAs      string           `json:"show_as"`
	Color       string           `json:"color,omitempty"`
}

type UpdateEventRequest struct {
	AccountID   string           `json:"account_id" binding:"required"`
	EventID     string           `json:"event_id" binding:"required"`
	Title       string           `json:"title,omitempty"`
	Description string           `json:"description,omitempty"`
	Start       string           `json:"start,omitempty"`
	End         string           `json:"end,omitempty"`
	AllDay      *bool            `json:"all_day,omitempty"`
	TimeZone    string           `json:"time_zone,omitempty"`
	Location    string           `json:"location,omitempty"`
	Attendees   []*EventAttendee `json:"attendees,omitempty"`
	Reminder    *EventReminder   `json:"reminder,omitempty"`
	Recurrence  *Recurrence      `json:"recurrence,omitempty"`
	IsPrivate   *bool            `json:"is_private,omitempty"`
	ShowAs      string           `json:"show_as,omitempty"`
	Color       string           `json:"color,omitempty"`
}
