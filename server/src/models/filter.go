package models

type VacationResponder struct {
	AccountID    string `json:"account_id"`
	Enabled      bool   `json:"enabled"`
	Subject      string `json:"subject"`
	Body         string `json:"body"`
	StartDate    string `json:"start_date,omitempty"`
	EndDate      string `json:"end_date,omitempty"`
	ContactsOnly bool   `json:"contacts_only"`
	IgnoreLists  bool   `json:"ignore_lists"`
}

type VacationResponderResponse struct {
	Success bool               `json:"success"`
	Data    *VacationResponder `json:"data,omitempty"`
	Error   string             `json:"error,omitempty"`
}

type UpdateVacationResponderRequest struct {
	AccountID    string `json:"account_id" binding:"required"`
	Enabled      *bool  `json:"enabled,omitempty"`
	Subject      string `json:"subject,omitempty"`
	Body         string `json:"body,omitempty"`
	StartDate    string `json:"start_date,omitempty"`
	EndDate      string `json:"end_date,omitempty"`
	ContactsOnly *bool  `json:"contacts_only,omitempty"`
	IgnoreLists  *bool  `json:"ignore_lists,omitempty"`
}

type AutoReply struct {
	AccountID     string `json:"account_id"`
	Enabled       bool   `json:"enabled"`
	AccountWide   bool   `json:"account_wide"`
	Subject       string `json:"subject"`
	Body          string `json:"body"`
	StartDateTime string `json:"start_date_time,omitempty"`
	EndDateTime   string `json:"end_date_time,omitempty"`
}

type FilterRule struct {
	ID             string      `json:"id"`
	AccountID      string      `json:"account_id"`
	Name           string      `json:"name"`
	Priority       int         `json:"priority"`
	Conditions     []Condition `json:"conditions"`
	Actions        []Action    `json:"actions"`
	Enabled        bool        `json:"enabled"`
	StopProcessing bool        `json:"stop_processing"`
}

type Condition struct {
	Field    string `json:"field"`    // from, to, subject, body, header, size, date
	Operator string `json:"operator"` // contains, not_contains, equals, not_equals, starts_with, ends_with, greater_than, less_than, is_in, not_in
	Value    string `json:"value"`
	Header   string `json:"header,omitempty"`
}

type Action struct {
	Method    string `json:"method"` // move_to, copy_to, label, star, mark_read, mark_unread, forward, delete, discard, keep
	Parameter string `json:"parameter,omitempty"`
}

type FilterRuleList struct {
	AccountID string        `json:"account_id"`
	Rules     []*FilterRule `json:"rules"`
}

type FilterResponse struct {
	Success bool        `json:"success"`
	Data    interface{} `json:"data,omitempty"`
	Error   string      `json:"error,omitempty"`
}

type CreateFilterRuleRequest struct {
	AccountID      string      `json:"account_id" binding:"required"`
	Name           string      `json:"name" binding:"required"`
	Priority       int         `json:"priority"`
	Conditions     []Condition `json:"conditions" binding:"required"`
	Actions        []Action    `json:"actions" binding:"required"`
	Enabled        bool        `json:"enabled"`
	StopProcessing bool        `json:"stop_processing"`
}

type UpdateFilterRuleRequest struct {
	AccountID      string      `json:"account_id" binding:"required"`
	ID             string      `json:"id" binding:"required"`
	Name           string      `json:"name,omitempty"`
	Priority       *int        `json:"priority,omitempty"`
	Conditions     []Condition `json:"conditions,omitempty"`
	Actions        []Action    `json:"actions,omitempty"`
	Enabled        *bool       `json:"enabled,omitempty"`
	StopProcessing *bool       `json:"stop_processing,omitempty"`
}
