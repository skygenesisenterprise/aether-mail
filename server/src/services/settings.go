package services

import (
	"sync"

	"github.com/skygenesisenterprise/aether-mail/server/src/models"
)

type SettingsService struct {
	stalwart *StalwartService
	cache    map[string]*models.UserSettings
	cacheMu  sync.RWMutex
}

func NewSettingsService(stalwart *StalwartService) *SettingsService {
	return &SettingsService{
		stalwart: stalwart,
		cache:    make(map[string]*models.UserSettings),
	}
}

func (s *SettingsService) GetSettings(accountID string) (*models.UserSettings, error) {
	s.cacheMu.RLock()
	if cached, ok := s.cache[accountID]; ok {
		s.cacheMu.RUnlock()
		return cached, nil
	}
	s.cacheMu.RUnlock()

	settings, err := s.stalwart.GetSettings(accountID)
	if err != nil {
		return nil, err
	}

	s.cacheMu.Lock()
	s.cache[accountID] = settings
	s.cacheMu.Unlock()

	return settings, nil
}

func (s *SettingsService) UpdateSettings(req *models.UpdateSettingsRequest) (*models.UserSettings, error) {
	settings, err := s.stalwart.UpdateSettings(req)
	if err != nil {
		return nil, err
	}

	s.cacheMu.Lock()
	s.cache[req.AccountID] = settings
	s.cacheMu.Unlock()

	return settings, nil
}

func (s *SettingsService) GetEmailSettings(accountID string) (*models.EmailSettings, error) {
	settings, err := s.GetSettings(accountID)
	if err != nil {
		return nil, err
	}
	return settings.EmailSettings, nil
}

func (s *SettingsService) GetDisplaySettings(accountID string) (*models.DisplaySettings, error) {
	settings, err := s.GetSettings(accountID)
	if err != nil {
		return nil, err
	}
	return settings.DisplaySettings, nil
}

func (s *SettingsService) GetNotificationSettings(accountID string) (*models.NotificationSettings, error) {
	settings, err := s.GetSettings(accountID)
	if err != nil {
		return nil, err
	}
	return settings.NotificationSettings, nil
}

func (s *SettingsService) GetComposeSettings(accountID string) (*models.ComposeSettings, error) {
	settings, err := s.GetSettings(accountID)
	if err != nil {
		return nil, err
	}
	return settings.ComposeSettings, nil
}

func (s *SettingsService) GetPrivacySettings(accountID string) (*models.PrivacySettings, error) {
	settings, err := s.GetSettings(accountID)
	if err != nil {
		return nil, err
	}
	return settings.PrivacySettings, nil
}

func (s *SettingsService) UpdateEmailSettings(accountID string, emailSettings *models.EmailSettings) error {
	_, err := s.UpdateSettings(&models.UpdateSettingsRequest{
		AccountID:     accountID,
		EmailSettings: emailSettings,
	})
	return err
}

func (s *SettingsService) UpdateDisplaySettings(accountID string, displaySettings *models.DisplaySettings) error {
	_, err := s.UpdateSettings(&models.UpdateSettingsRequest{
		AccountID:       accountID,
		DisplaySettings: displaySettings,
	})
	return err
}

func (s *SettingsService) UpdateNotificationSettings(accountID string, notificationSettings *models.NotificationSettings) error {
	_, err := s.UpdateSettings(&models.UpdateSettingsRequest{
		AccountID:            accountID,
		NotificationSettings: notificationSettings,
	})
	return err
}

func (s *SettingsService) UpdateComposeSettings(accountID string, composeSettings *models.ComposeSettings) error {
	_, err := s.UpdateSettings(&models.UpdateSettingsRequest{
		AccountID:       accountID,
		ComposeSettings: composeSettings,
	})
	return err
}

func (s *SettingsService) UpdatePrivacySettings(accountID string, privacySettings *models.PrivacySettings) error {
	_, err := s.UpdateSettings(&models.UpdateSettingsRequest{
		AccountID:       accountID,
		PrivacySettings: privacySettings,
	})
	return err
}

func (s *SettingsService) ClearCache(accountID string) {
	s.cacheMu.Lock()
	delete(s.cache, accountID)
	s.cacheMu.Unlock()
}

func (s *SettingsService) ClearAllCache() {
	s.cacheMu.Lock()
	s.cache = make(map[string]*models.UserSettings)
	s.cacheMu.Unlock()
}

func (s *SettingsService) GetVacationResponder(accountID string) (*models.VacationResponder, error) {
	return s.stalwart.GetVacationResponder(accountID)
}

func (s *SettingsService) UpdateVacationResponder(req *models.UpdateVacationResponderRequest) (*models.VacationResponder, error) {
	return s.stalwart.UpdateVacationResponder(req)
}

func (s *SettingsService) GetFilterRules(accountID string) (*models.FilterRuleList, error) {
	return s.stalwart.GetFilterRules(accountID)
}

func (s *SettingsService) CreateFilterRule(req *models.CreateFilterRuleRequest) (*models.FilterRule, error) {
	return s.stalwart.CreateFilterRule(req)
}

func (s *SettingsService) UpdateFilterRule(req *models.UpdateFilterRuleRequest) (*models.FilterRule, error) {
	return s.stalwart.UpdateFilterRule(req)
}

func (s *SettingsService) DeleteFilterRule(accountID, ruleID string) error {
	return s.stalwart.DeleteFilterRule(accountID, ruleID)
}

func (s *SettingsService) GetSignatures(accountID string) ([]*models.Signature, error) {
	return s.stalwart.GetSignatures(accountID)
}

func (s *SettingsService) CreateSignature(req *models.CreateSignatureRequest) (*models.Signature, error) {
	return s.stalwart.CreateSignature(req)
}

func (s *SettingsService) UpdateSignature(req *models.UpdateSignatureRequest) (*models.Signature, error) {
	return s.stalwart.UpdateSignature(req)
}

func (s *SettingsService) DeleteSignature(accountID, signatureID string) error {
	return s.stalwart.DeleteSignature(accountID, signatureID)
}
