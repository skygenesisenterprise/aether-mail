package services

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/skygenesisenterprise/aether-mail/server/src/config"
	"github.com/skygenesisenterprise/aether-mail/server/src/models"
)

type StalwartService struct {
	baseURL    string
	httpClient *http.Client
	authToken  string
}

func NewStalwartService(cfg *config.StalwartConfig) *StalwartService {
	return &StalwartService{
		baseURL: fmt.Sprintf("http://%s:%d", cfg.Host, cfg.HTTPPort),
		httpClient: &http.Client{
			Timeout: 30 * time.Second,
		},
	}
}

func (s *StalwartService) SetAuthToken(token string) {
	s.authToken = token
}

func (s *StalwartService) doRequest(method, endpoint string, body interface{}) ([]byte, error) {
	var reqBody io.Reader
	if body != nil {
		jsonData, err := json.Marshal(body)
		if err != nil {
			return nil, fmt.Errorf("failed to marshal request body: %w", err)
		}
		reqBody = bytes.NewBuffer(jsonData)
	}

	req, err := http.NewRequest(method, s.baseURL+endpoint, reqBody)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	if s.authToken != "" {
		req.Header.Set("Authorization", "Bearer "+s.authToken)
	}

	resp, err := s.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to execute request: %w", err)
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response body: %w", err)
	}

	if resp.StatusCode >= 400 {
		return nil, fmt.Errorf("request failed with status %d: %s", resp.StatusCode, string(respBody))
	}

	return respBody, nil
}

func (s *StalwartService) Authenticate(username, password string) (*models.TokenResponse, error) {
	body := map[string]string{
		"username": username,
		"password": password,
	}

	respBody, err := s.doRequest("POST", "/auth/login", body)
	if err != nil {
		return nil, err
	}

	var authResp models.AuthResponse
	if err := json.Unmarshal(respBody, &authResp); err != nil {
		return nil, fmt.Errorf("failed to parse auth response: %w", err)
	}

	return authResp.Data, nil
}

func (s *StalwartService) GetAccount(accountID string) (*models.User, error) {
	respBody, err := s.doRequest("GET", fmt.Sprintf("/accounts/%s", accountID), nil)
	if err != nil {
		return nil, err
	}

	var user models.User
	if err := json.Unmarshal(respBody, &user); err != nil {
		return nil, fmt.Errorf("failed to parse user response: %w", err)
	}

	return &user, nil
}

func (s *StalwartService) GetEmails(query *models.EmailQuery) (*models.EmailList, error) {
	respBody, err := s.doRequest("POST", "/emails/query", query)
	if err != nil {
		return nil, err
	}

	var emailList models.EmailList
	if err := json.Unmarshal(respBody, &emailList); err != nil {
		return nil, fmt.Errorf("failed to parse email list response: %w", err)
	}

	return &emailList, nil
}

func (s *StalwartService) GetEmail(accountID, emailID string) (*models.Email, error) {
	respBody, err := s.doRequest("GET", fmt.Sprintf("/emails/%s/%s", accountID, emailID), nil)
	if err != nil {
		return nil, err
	}

	var email models.Email
	if err := json.Unmarshal(respBody, &email); err != nil {
		return nil, fmt.Errorf("failed to parse email response: %w", err)
	}

	return &email, nil
}

func (s *StalwartService) GetFolders(accountID string) (*models.FolderList, error) {
	respBody, err := s.doRequest("GET", fmt.Sprintf("/mailboxes/%s", accountID), nil)
	if err != nil {
		return nil, err
	}

	var folderList models.FolderList
	if err := json.Unmarshal(respBody, &folderList); err != nil {
		return nil, fmt.Errorf("failed to parse folder list response: %w", err)
	}

	return &folderList, nil
}

func (s *StalwartService) CreateFolder(req *models.CreateFolderRequest) (*models.Folder, error) {
	respBody, err := s.doRequest("POST", "/mailboxes", req)
	if err != nil {
		return nil, err
	}

	var folder models.Folder
	if err := json.Unmarshal(respBody, &folder); err != nil {
		return nil, fmt.Errorf("failed to parse create folder response: %w", err)
	}

	return &folder, nil
}

func (s *StalwartService) RenameFolder(req *models.RenameFolderRequest) (*models.Folder, error) {
	respBody, err := s.doRequest("PATCH", "/mailboxes/rename", req)
	if err != nil {
		return nil, err
	}

	var folder models.Folder
	if err := json.Unmarshal(respBody, &folder); err != nil {
		return nil, fmt.Errorf("failed to parse rename folder response: %w", err)
	}

	return &folder, nil
}

func (s *StalwartService) DeleteFolder(accountID, mailboxID string) error {
	_, err := s.doRequest("DELETE", fmt.Sprintf("/mailboxes/%s/%s", accountID, mailboxID), nil)
	return err
}

func (s *StalwartService) MoveEmails(req *models.FolderAction) error {
	_, err := s.doRequest("POST", "/emails/move", req)
	return err
}

func (s *StalwartService) DeleteEmails(req *models.FolderAction) error {
	_, err := s.doRequest("POST", "/emails/delete", req)
	return err
}

func (s *StalwartService) SendEmail(email *models.Email) (*models.Email, error) {
	respBody, err := s.doRequest("POST", "/emails/send", email)
	if err != nil {
		return nil, err
	}

	var sentEmail models.Email
	if err := json.Unmarshal(respBody, &sentEmail); err != nil {
		return nil, fmt.Errorf("failed to parse send email response: %w", err)
	}

	return &sentEmail, nil
}

func (s *StalwartService) CreateDraft(email *models.Email) (*models.Email, error) {
	respBody, err := s.doRequest("POST", "/emails/draft", email)
	if err != nil {
		return nil, err
	}

	var draft models.Email
	if err := json.Unmarshal(respBody, &draft); err != nil {
		return nil, fmt.Errorf("failed to parse create draft response: %w", err)
	}

	return &draft, nil
}

func (s *StalwartService) GetContacts(accountID string, limit, offset int) (*models.ContactList, error) {
	query := fmt.Sprintf("/contacts/%s?limit=%d&offset=%d", accountID, limit, offset)
	respBody, err := s.doRequest("GET", query, nil)
	if err != nil {
		return nil, err
	}

	var contactList models.ContactList
	if err := json.Unmarshal(respBody, &contactList); err != nil {
		return nil, fmt.Errorf("failed to parse contact list response: %w", err)
	}

	return &contactList, nil
}

func (s *StalwartService) CreateContact(req *models.CreateContactRequest) (*models.Contact, error) {
	respBody, err := s.doRequest("POST", "/contacts", req)
	if err != nil {
		return nil, err
	}

	var contact models.Contact
	if err := json.Unmarshal(respBody, &contact); err != nil {
		return nil, fmt.Errorf("failed to parse create contact response: %w", err)
	}

	return &contact, nil
}

func (s *StalwartService) UpdateContact(req *models.UpdateContactRequest) (*models.Contact, error) {
	respBody, err := s.doRequest("PATCH", "/contacts", req)
	if err != nil {
		return nil, err
	}

	var contact models.Contact
	if err := json.Unmarshal(respBody, &contact); err != nil {
		return nil, fmt.Errorf("failed to parse update contact response: %w", err)
	}

	return &contact, nil
}

func (s *StalwartService) DeleteContact(accountID, contactID string) error {
	_, err := s.doRequest("DELETE", fmt.Sprintf("/contacts/%s/%s", accountID, contactID), nil)
	return err
}

func (s *StalwartService) SearchContacts(accountID, query string) (*models.ContactList, error) {
	body := map[string]string{
		"account_id": accountID,
		"query":      query,
	}
	respBody, err := s.doRequest("POST", "/contacts/search", body)
	if err != nil {
		return nil, err
	}

	var contactList models.ContactList
	if err := json.Unmarshal(respBody, &contactList); err != nil {
		return nil, fmt.Errorf("failed to parse search contacts response: %w", err)
	}

	return &contactList, nil
}
