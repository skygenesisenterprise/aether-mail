package services

import (
	"encoding/base64"
	"fmt"

	"github.com/skygenesisenterprise/aether-mail/server/src/models"
)

type AttachmentService struct {
	stalwart *StalwartService
}

func NewAttachmentService(stalwart *StalwartService) *AttachmentService {
	return &AttachmentService{
		stalwart: stalwart,
	}
}

func (s *AttachmentService) GetAttachments(accountID, emailID string) ([]*models.Attachment, error) {
	return s.stalwart.GetAttachments(accountID, emailID)
}

func (s *AttachmentService) GetAttachment(accountID, emailID, attachmentID string) (*models.Attachment, error) {
	attachments, err := s.GetAttachments(accountID, emailID)
	if err != nil {
		return nil, err
	}

	for _, att := range attachments {
		if att.ID == attachmentID {
			return att, nil
		}
	}

	return nil, nil
}

func (s *AttachmentService) GetAttachmentContent(accountID, emailID, attachmentID string) ([]byte, string, error) {
	return s.stalwart.GetAttachmentContent(accountID, emailID, attachmentID)
}

func (s *AttachmentService) DownloadAttachment(accountID, emailID, attachmentID string) error {
	return s.stalwart.DownloadAttachment(accountID, emailID, attachmentID)
}

func (s *AttachmentService) GetInlineAttachments(emailID string, attachments []*models.Attachment) []*models.Attachment {
	var inline []*models.Attachment
	for _, att := range attachments {
		if att.Inline {
			inline = append(inline, att)
		}
	}
	return inline
}

func (s *AttachmentService) GetRegularAttachments(emailID string, attachments []*models.Attachment) []*models.Attachment {
	var regular []*models.Attachment
	for _, att := range attachments {
		if !att.Inline {
			regular = append(regular, att)
		}
	}
	return regular
}

type AttachmentUpload struct {
	Filename string `json:"filename"`
	MimeType string `json:"mime_type"`
	Content  []byte `json:"content"`
}

func (s *AttachmentService) ValidateAttachment(att *AttachmentUpload) error {
	if att.Filename == "" {
		return fmt.Errorf("filename is required")
	}

	if att.MimeType == "" {
		return fmt.Errorf("mime type is required")
	}

	if len(att.Content) == 0 {
		return fmt.Errorf("attachment content is empty")
	}

	maxSize := int64(25 * 1024 * 1024)
	if int64(len(att.Content)) > maxSize {
		return fmt.Errorf("attachment size exceeds maximum allowed size of 25MB")
	}

	allowedTypes := []string{
		"image/", "application/pdf", "application/msword",
		"application/vnd.openxmlformats-officedocument.",
		"text/", "application/zip", "application/x-zip",
	}

	validType := false
	for _, allowed := range allowedTypes {
		if len(att.MimeType) >= len(allowed) && att.MimeType[:len(allowed)] == allowed {
			validType = true
			break
		}
	}

	if !validType {
		return fmt.Errorf("attachment type %s is not allowed", att.MimeType)
	}

	return nil
}

func (s *AttachmentService) GetAttachmentSize(att *models.Attachment) string {
	size := att.Size
	switch {
	case size < 1024:
		return fmt.Sprintf("%d B", size)
	case size < 1024*1024:
		return fmt.Sprintf("%.1f KB", float64(size)/1024)
	case size < 1024*1024*1024:
		return fmt.Sprintf("%.1f MB", float64(size)/(1024*1024))
	default:
		return fmt.Sprintf("%.1f GB", float64(size)/(1024*1024*1024))
	}
}

func (s *AttachmentService) EncodeAttachmentBase64(content []byte) string {
	return base64.StdEncoding.EncodeToString(content)
}

func (s *AttachmentService) DecodeAttachmentBase64(encoded string) ([]byte, error) {
	return base64.StdEncoding.DecodeString(encoded)
}

func (s *AttachmentService) IsImage(att *models.Attachment) bool {
	return len(att.MimeType) >= 6 && att.MimeType[:6] == "image/"
}

func (s *AttachmentService) IsPDF(att *models.Attachment) bool {
	return att.MimeType == "application/pdf"
}

func (s *AttachmentService) IsDocument(att *models.Attachment) bool {
	docTypes := []string{
		"application/msword",
		"application/vnd.openxmlformats-officedocument.",
		"application/vnd.ms-excel",
		"application/vnd.openxmlformats-officedocument.spreadsheetml.",
		"application/vnd.ms-powerpoint",
		"application/vnd.openxmlformats-officedocument.presentationml.",
		"text/",
	}
	for _, t := range docTypes {
		if len(att.MimeType) >= len(t) && att.MimeType[:len(t)] == t {
			return true
		}
	}
	return false
}
