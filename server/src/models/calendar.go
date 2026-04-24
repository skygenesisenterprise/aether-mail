package models

type Calendar struct {
	ID          string `json:"id"`
	UserID     string `json:"user_id"`
	Name       string `json:"name"`
	Color      string `json:"color,omitempty"`
	Description string `json:"description,omitempty"`
	IsDefault  bool   `json:"is_default"`
	CreatedAt  string `json:"created_at"`
	UpdatedAt  string `json:"updated_at"`
}

type CalendarEvent struct {
	ID           string `json:"id"`
	UserID      string `json:"user_id"`
	CalendarID  string `json:"calendar_id,omitempty"`
	Title       string `json:"title"`
	Description string `json:"description,omitempty"`
	Location    string `json:"location,omitempty"`
	Start       string `json:"start"`
	End         string `json:"end,omitempty"`
	StartDate   string `json:"start_date"`
	EndDate     string `json:"end_date,omitempty"`
	AllDay      bool    `json:"all_day"`
	Recurring   string `json:"recurring,omitempty"`
	Color       string `json:"color,omitempty"`
	Reminders   string `json:"reminders,omitempty"`
	Attendees   string `json:"attendees,omitempty"`
	CreatedAt   string `json:"created_at"`
	UpdatedAt   string `json:"updated_at"`
}

type CreateCalendarRequest struct {
	Name        string `json:"name" binding:"required"`
	Color      string `json:"color"`
	Description string `json:"description"`
	IsDefault  bool   `json:"is_default"`
}

type UpdateCalendarRequest struct {
	Name        string `json:"name"`
	Color      string `json:"color"`
	Description string `json:"description"`
	IsDefault  bool   `json:"is_default"`
}

type CreateEventRequest struct {
	CalendarID  string `json:"calendar_id"`
	Title       string `json:"title" binding:"required"`
	Description string `json:"description"`
	Location    string `json:"location"`
	StartDate   string `json:"start_date" binding:"required"`
	EndDate     string `json:"end_date"`
	Timezone   string `json:"timezone"`
	AllDay      bool   `json:"all_day"`
	Recurring   string `json:"recurring"`
	Color       string `json:"color"`
	Reminders   string `json:"reminders"`
	Attendees   string `json:"attendees"`
}

type UpdateEventRequest struct {
	EventID       string `json:"event_id"`
	CalendarID  string `json:"calendar_id"`
	Title       string `json:"title"`
	Description string `json:"description"`
	Location    string `json:"location"`
	StartDate   string `json:"start_date"`
	EndDate     string `json:"end_date"`
	Timezone   string `json:"timezone"`
	AllDay      bool   `json:"all_day"`
	Recurring   string `json:"recurring"`
	Color       string `json:"color"`
	Reminders   string `json:"reminders"`
	Attendees   string `json:"attendees"`
}

type NotificationList struct {
	AccountID      string           `json:"account_id"`
	Total        int              `json:"total"`
	Notifications []*Notification  `json:"notifications"`
}