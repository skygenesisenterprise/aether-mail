package models

type Settings struct {
	ID                    string `json:"id"`
	UserID                string `json:"user_id"`
	Theme                 string `json:"theme"`
	Language              string `json:"language"`
	EmailView             string `json:"email_view"`
	EmailSort             string `json:"email_sort"`
	ContactsSort          string `json:"contacts_sort"`
	CalendarView         string `json:"calendar_view"`
	TodoView              string `json:"todo_view"`
	SidebarCollapsed      bool   `json:"sidebar_collapsed"`
	DesktopNotifications bool   `json:"desktop_notifications"`
	EmailNotifications   bool   `json:"email_notifications"`
	CalendarNotifications bool `json:"calendar_notifications"`
}

type UpdateSettingsRequest struct {
	AccountID string `json:"account_id"`
	Theme                 string `json:"theme"`
	Language              string `json:"language"`
	EmailView             string `json:"email_view"`
	EmailSort             string `json:"email_sort"`
	ContactsSort         string `json:"contacts_sort"`
	CalendarView         string `json:"calendar_view"`
	TodoView              string `json:"todo_view"`
	SidebarCollapsed      bool   `json:"sidebar_collapsed"`
	DesktopNotifications bool   `json:"desktop_notifications"`
	EmailNotifications   bool   `json:"email_notifications"`
	CalendarNotifications bool `json:"calendar_notifications"`
	EmailSettings        *EmailSettings     `json:"email_settings"`
	DisplaySettings     *DisplaySettings  `json:"display_settings"`
	NotificationSettings *NotificationSettings `json:"notification_settings"`
	ComposeSettings    *ComposeSettings  `json:"compose_settings"`
	PrivacySettings    *PrivacySettings  `json:"privacy_settings"`
}

type UserSettings struct {
	ID                    string             `json:"id"`
	AccountID            string             `json:"account_id"`
	Theme                 string            `json:"theme"`
	Language              string            `json:"language"`
	EmailSettings        *EmailSettings     `json:"email_settings"`
	DisplaySettings     *DisplaySettings  `json:"display_settings"`
	NotificationSettings *NotificationSettings `json:"notification_settings"`
	ComposeSettings    *ComposeSettings  `json:"compose_settings"`
	PrivacySettings    *PrivacySettings  `json:"privacy_settings"`
}

type EmailSettings struct {
	Alias                string `json:"alias"`
	ReplyTo              string `json:"reply_to"`
	 BCC                 string `json:"bcc"`
	Signature           string `json:"signature"`
	SignatureID         string `json:"signature_id"`
	IncludeOriginal    bool   `json:"include_original"`
	ReadReceipt        bool   `json:"read_receipt"`
	DeliveryReceipt    bool   `json:"delivery_receipt"`
}

type DisplaySettings struct {
	Theme                string `json:"theme"`
	Language            string  `json:"language"`
	EmailView           string  `json:"email_view"`
	EmailSort           string  `json:"email_sort"`
	ContactsSort       string  `json:"contacts_sort"`
	CalendarView       string  `json:"calendar_view"`
	TodoView           string  `json:"todo_view"`
	SidebarCollapsed   bool    `json:"sidebar_collapsed"`
}

type NotificationSettings struct {
	DesktopNotifications bool `json:"desktop_notifications"`
	EmailNotifications   bool `json:"email_notifications"`
	CalendarNotifications bool `json:"calendar_notifications"`
	PushNotifications   bool `json:"push_notifications"`
	SoundEnabled        bool `json:"sound_enabled"`
}

type ComposeSettings struct {
	FontFamily             string `json:"font_family"`
	FontSize               string `json:"font_size"`
	AutoSave              bool   `json:"auto_save"`
	AutoSaveInterval      int    `json:"auto_save_interval"`
	DefaultFormat         string `json:"default_format"`
	EnterKeySends        bool   `json:"enter_key_sends"`
}

type PrivacySettings struct {
	ReadReceipts         bool `json:"read_receipts"`
	DeliveryReceipts     bool `json:"delivery_receipts"`
	TrackingEnabled      bool `json:"tracking_enabled"`
	ImageProxy         bool `json:"image_proxy"`
}

type VacationResponder struct {
	ID           string `json:"id"`
	UserID      string `json:"user_id"`
	Enabled    bool   `json:"enabled"`
	Subject    string `json:"subject,omitempty"`
	Message   string `json:"message"`
	StartDate  string `json:"start_date,omitempty"`
	EndDate    string `json:"end_date,omitempty"`
	ContactsOnly bool `json:"contacts_only"`
	CreatedAt  string `json:"created_at"`
	UpdatedAt  string `json:"updated_at"`
}

type UpdateVacationRequest struct {
	Enabled    bool   `json:"enabled"`
	Subject    string `json:"subject"`
	Message   string `json:"message"`
	StartDate  string `json:"start_date"`
	EndDate    string `json:"end_date"`
	ContactsOnly bool `json:"contacts_only"`
}

type UpdateVacationResponderRequest struct {
	AccountID    string `json:"account_id"`
	Enabled    bool   `json:"enabled"`
	Subject    string `json:"subject"`
	Message   string `json:"message"`
	StartDate  string `json:"start_date"`
	EndDate    string `json:"end_date"`
	ContactsOnly bool `json:"contacts_only"`
}

type FilterRule struct {
	ID          string `json:"id"`
	AccountID  string `json:"account_id"`
	Name      string `json:"name"`
	Conditions string `json:"conditions"`
	Actions   string `json:"actions"`
	Enabled  bool   `json:"enabled"`
	Priority int    `json:"priority"`
	CreatedAt string `json:"created_at"`
	UpdatedAt string `json:"updated_at"`
}

type FilterRuleList struct {
	AccountID string        `json:"account_id"`
	Total     int           `json:"total"`
	Rules    []*FilterRule  `json:"rules"`
}

type CreateFilterRuleRequest struct {
	AccountID   string `json:"account_id"`
	Name      string `json:"name"`
	Conditions string `json:"conditions"`
	Actions  string `json:"actions"`
}

type UpdateFilterRuleRequest struct {
	RuleID      string `json:"rule_id"`
	ID         string `json:"id"`
	Name       string `json:"name"`
	Conditions string `json:"conditions"`
	Actions    string `json:"actions"`
	Enabled   bool   `json:"enabled"`
	Priority  int    `json:"priority"`
}