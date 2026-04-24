package interfaces

import (
	"github.com/skygenesisenterprise/aether-mail/server/src/models"
)

type MeetingRepository interface {
	Create(meeting *models.Meeting) (*models.Meeting, error)
	Update(meeting *models.Meeting) (*models.Meeting, error)
	Delete(id string) error
	FindByID(id string) (*models.Meeting, error)
	FindByUserID(userID string, limit, offset int) ([]*models.Meeting, error)
	FindUpcoming(userID string, days int) ([]*models.Meeting, error)
}

type MeetingParticipantRepository interface {
	Create(participant *models.MeetingParticipant) (*models.MeetingParticipant, error)
	Update(participant *models.MeetingParticipant) (*models.MeetingParticipant, error)
	Delete(id string) error
	FindByMeetingID(meetingID string) ([]*models.MeetingParticipant, error)
	FindByUserID(userID string) ([]*models.MeetingParticipant, error)
	RemoveParticipant(meetingID, userID string) error
}

type MeetingConversationRepository interface {
	Create(conversation *models.MeetingConversation) (*models.MeetingConversation, error)
	Update(conversation *models.MeetingConversation) (*models.MeetingConversation, error)
	Delete(id string) error
	FindByID(id string) (*models.MeetingConversation, error)
	FindByUserID(userID string) ([]*models.MeetingConversation, error)
	FindByMeetingID(meetingID string) (*models.MeetingConversation, error)
}

type ConversationMessageRepository interface {
	Create(message *models.ConversationMessage) (*models.ConversationMessage, error)
	Delete(id string) error
	FindByConversationID(conversationID string) ([]*models.ConversationMessage, error)
	FindByID(id string) (*models.ConversationMessage, error)
}

type MeetingRecordingRepository interface {
	Create(recording *models.MeetingRecording) (*models.MeetingRecording, error)
	Update(recording *models.MeetingRecording) (*models.MeetingRecording, error)
	Delete(id string) error
	FindByMeetingID(meetingID string) ([]*models.MeetingRecording, error)
	FindByID(id string) (*models.MeetingRecording, error)
}

type MeetingSettingsRepository interface {
	Upsert(settings *models.MeetingSettings) (*models.MeetingSettings, error)
	FindByUserID(userID string) (*models.MeetingSettings, error)
}