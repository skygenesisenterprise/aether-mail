package services

import (
	"github.com/skygenesisenterprise/aether-mail/server/src/models"
)

type TagService struct {
	stalwart *StalwartService
}

func NewTagService(stalwart *StalwartService) *TagService {
	return &TagService{
		stalwart: stalwart,
	}
}

func (s *TagService) GetTags(accountID string) ([]*models.Tag, error) {
	return s.stalwart.GetTags(accountID)
}

func (s *TagService) GetTag(accountID, tagID string) (*models.Tag, error) {
	tags, err := s.GetTags(accountID)
	if err != nil {
		return nil, err
	}

	for _, tag := range tags {
		if tag.ID == tagID {
			return tag, nil
		}
	}

	return nil, nil
}

func (s *TagService) CreateTag(req *models.CreateTagRequest) (*models.Tag, error) {
	if req.Color == "" {
		req.Color = "#808080"
	}

	return s.stalwart.CreateTag(req)
}

func (s *TagService) UpdateTag(req *models.UpdateTagRequest) (*models.Tag, error) {
	return s.stalwart.UpdateTag(req)
}

func (s *TagService) DeleteTag(accountID, tagID string) error {
	return s.stalwart.DeleteTag(accountID, tagID)
}

func (s *TagService) RenameTag(accountID, tagID, newName string) (*models.Tag, error) {
	return s.UpdateTag(&models.UpdateTagRequest{
		AccountID: accountID,
		ID:        tagID,
		Name:      newName,
	})
}

func (s *TagService) ChangeTagColor(accountID, tagID, newColor string) (*models.Tag, error) {
	return s.UpdateTag(&models.UpdateTagRequest{
		AccountID: accountID,
		ID:        tagID,
		Color:     newColor,
	})
}

func (s *TagService) ApplyTagToEmails(accountID, tagID string, emailIDs []string) error {
	return s.stalwart.SetLabels(&models.SetLabelsRequest{
		AccountID: accountID,
		EmailIDs:  emailIDs,
		Labels:    []string{tagID},
	})
}

func (s *TagService) RemoveTagFromEmails(accountID, tagID string, emailIDs []string) error {
	return s.stalwart.SetLabels(&models.SetLabelsRequest{
		AccountID: accountID,
		EmailIDs:  emailIDs,
		Labels:    []string{tagID},
	})
}

type TagColor struct {
	Color string
	Name  string
}

var PredefinedTagColors = []TagColor{
	{Color: "#FF0000", Name: "Red"},
	{Color: "#FFA500", Name: "Orange"},
	{Color: "#FFFF00", Name: "Yellow"},
	{Color: "#008000", Name: "Green"},
	{Color: "#008080", Name: "Teal"},
	{Color: "#0000FF", Name: "Blue"},
	{Color: "#000080", Name: "Navy"},
	{Color: "#800080", Name: "Purple"},
	{Color: "#FF00FF", Name: "Magenta"},
	{Color: "#808080", Name: "Gray"},
	{Color: "#000000", Name: "Black"},
}
