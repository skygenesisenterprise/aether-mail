package models

type UserSettings struct {
	AccountID            string                `json:"account_id"`
	EmailSettings        *EmailSettings        `json:"email_settings"`
	DisplaySettings      *DisplaySettings      `json:"display_settings"`
	NotificationSettings *NotificationSettings `json:"notification_settings"`
	ComposeSettings      *ComposeSettings      `json:"compose_settings"`
	PrivacySettings      *PrivacySettings      `json:"privacy_settings"`
}

type EmailSettings struct {
	ConversationView       bool   `json:"conversation_view"`
	ConversationSort       string `json:"conversation_sort"` // newest, oldest
	AlwaysRequestCC        bool   `json:"always_request_cc"`
	AlwaysRequestBCC       bool   `json:"always_request_bcc"`
	AutoSaveDrafts         bool   `json:"auto_save_drafts"`
	AutoSaveDraftsInterval int    `json:"auto_save_drafts_interval"` // in seconds
	SentTracking           bool   `json:"sent_tracking"`
	SendDelay              int    `json:"send_delay"` // in seconds
}

type DisplaySettings struct {
	Theme          string `json:"theme"` // light, dark, system
	FontSize       int    `json:"font_size"`
	FontFamily     string `json:"font_family"`
	Density        string `json:"density"` // comfortable, compact, spacious
	ShowPreviews   bool   `json:"show_previews"`
	PreviewLines   int    `json:"preview_lines"`
	DateFormat     string `json:"date_format"`
	TimeFormat     string `json:"time_format"`       // 12h, 24h
	FirstDayOfWeek int    `json:"first_day_of_week"` // 0 = Sunday, 1 = Monday
	ShowTimeInList bool   `json:"show_time_in_list"`
	ShowFullDates  bool   `json:"show_full_dates"`
}

type NotificationSettings struct {
	EnableDesktopNotifications bool   `json:"enable_desktop_notifications"`
	EnableSoundNotifications   bool   `json:"enable_sound_notifications"`
	NotifyOnAllFolders         bool   `json:"notify_on_all_folders"`
	NotifyOnlyMentions         bool   `json:"notify_only_mentions"`
	MuteDuringHours            bool   `json:"mute_during_hours"`
	MuteStart                  string `json:"mute_start"` // HH:mm
	MuteEnd                    string `json:"mute_end"`   // HH:mm
}

type ComposeSettings struct {
	DefaultComposeSize string `json:"default_compose_size"` // full, large, medium, small
	SpellCheckEnabled  bool   `json:"spell_check_enabled"`
	AutoCorrectEnabled bool   `json:"auto_correct_enabled"`
	FormatBarEnabled   bool   `json:"format_bar_enabled"`
	PlainTextDefault   bool   `json:"plain_text_default"`
	AllowDraftAutofill bool   `json:"allow_draft_autofill"`
	SignatureID        string `json:"signature_id"`
}

type PrivacySettings struct {
	ExternalImagesBlocked   bool `json:"external_images_blocked"`
	ReadReceiptsBlocked     bool `json:"read_receipts_blocked"`
	DeliveryReceiptsBlocked bool `json:"delivery_receipts_blocked"`
	TrackOpensBlocked       bool `json:"track_opens_blocked"`
}

type SettingsResponse struct {
	Success bool          `json:"success"`
	Data    *UserSettings `json:"data,omitempty"`
	Error   string        `json:"error,omitempty"`
}

type UpdateSettingsRequest struct {
	AccountID            string                `json:"account_id" binding:"required"`
	EmailSettings        *EmailSettings        `json:"email_settings,omitempty"`
	DisplaySettings      *DisplaySettings      `json:"display_settings,omitempty"`
	NotificationSettings *NotificationSettings `json:"notification_settings,omitempty"`
	ComposeSettings      *ComposeSettings      `json:"compose_settings,omitempty"`
	PrivacySettings      *PrivacySettings      `json:"privacy_settings,omitempty"`
}
