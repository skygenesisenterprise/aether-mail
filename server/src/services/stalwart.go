package services

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"
	"time"

	"github.com/skygenesisenterprise/aether-mail/server/src/config"
	"github.com/skygenesisenterprise/aether-mail/server/src/models"
)

type StalwartService struct {
	baseURL    string
	httpClient *http.Client
	authToken  string
	accountID  string
}

func NewStalwartService(cfg *config.StalwartConfig) *StalwartService {
	protocol := "http"
	if cfg.UseTLS {
		protocol = "https"
	}

	return &StalwartService{
		baseURL: fmt.Sprintf("%s://%s:%d", protocol, cfg.Host, cfg.HTTPPort),
		httpClient: &http.Client{
			Timeout: 60 * time.Second,
			Transport: &http.Transport{
				MaxIdleConns:        100,
				MaxIdleConnsPerHost: 10,
				IdleConnTimeout:     90 * time.Second,
			},
		},
	}
}

func (s *StalwartService) SetAuthToken(token string) {
	s.authToken = token
}

func (s *StalwartService) SetAccountID(accountID string) {
	s.accountID = accountID
}

func (s *StalwartService) doRequest(method, endpoint string, body interface{}) ([]byte, int, error) {
	var reqBody io.Reader
	if body != nil {
		jsonData, err := json.Marshal(body)
		if err != nil {
			return nil, 0, fmt.Errorf("failed to marshal request body: %w", err)
		}
		reqBody = bytes.NewBuffer(jsonData)
	}

	req, err := http.NewRequest(method, s.baseURL+endpoint, reqBody)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Accept", "application/json")

	if s.authToken != "" {
		req.Header.Set("Authorization", "Bearer "+s.authToken)
	}

	resp, err := s.httpClient.Do(req)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to execute request: %w", err)
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, resp.StatusCode, fmt.Errorf("failed to read response body: %w", err)
	}

	if resp.StatusCode >= 400 {
		return respBody, resp.StatusCode, fmt.Errorf("request failed with status %d: %s", resp.StatusCode, string(respBody))
	}

	return respBody, resp.StatusCode, nil
}

func (s *StalwartService) doFormRequest(method, endpoint string, data url.Values) ([]byte, int, error) {
	req, err := http.NewRequest(method, s.baseURL+endpoint, strings.NewReader(data.Encode()))
	if err != nil {
		return nil, 0, fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	req.Header.Set("Accept", "application/json")

	if s.authToken != "" {
		req.Header.Set("Authorization", "Bearer "+s.authToken)
	}

	resp, err := s.httpClient.Do(req)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to execute request: %w", err)
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, resp.StatusCode, fmt.Errorf("failed to read response body: %w", err)
	}

	if resp.StatusCode >= 400 {
		return respBody, resp.StatusCode, fmt.Errorf("request failed with status %d: %s", resp.StatusCode, string(respBody))
	}

	return respBody, resp.StatusCode, nil
}

type APIResponse struct {
	Success bool        `json:"success"`
	Data    interface{} `json:"data,omitempty"`
	Error   string      `json:"error,omitempty"`
	Message string      `json:"message,omitempty"`
}

func (s *StalwartService) parseResponse(respBody []byte, target interface{}) error {
	var apiResp APIResponse
	if err := json.Unmarshal(respBody, &apiResp); err != nil {
		return fmt.Errorf("failed to parse API response: %w", err)
	}

	if !apiResp.Success && apiResp.Error != "" {
		return fmt.Errorf("API error: %s", apiResp.Error)
	}

	if target != nil {
		dataBytes, err := json.Marshal(apiResp.Data)
		if err != nil {
			return fmt.Errorf("failed to marshal response data: %w", err)
		}
		if err := json.Unmarshal(dataBytes, target); err != nil {
			return fmt.Errorf("failed to unmarshal response data: %w", err)
		}
	}

	return nil
}

func (s *StalwartService) Authenticate(username, password string) (*models.TokenResponse, error) {
	data := url.Values{
		"username":   {username},
		"password":   {password},
		"grant_type": {"password"},
	}

	respBody, statusCode, err := s.doFormRequest("POST", "/oauth/token", data)
	if err != nil {
		return nil, err
	}

	if statusCode == 401 {
		return nil, fmt.Errorf("invalid credentials")
	}

	var tokenResp models.TokenResponse
	if err := json.Unmarshal(respBody, &tokenResp); err != nil {
		return nil, fmt.Errorf("failed to parse token response: %w", err)
	}

	s.authToken = tokenResp.AccessToken
	return &tokenResp, nil
}

func (s *StalwartService) RefreshToken(refreshToken string) (*models.TokenResponse, error) {
	data := url.Values{
		"refresh_token": {refreshToken},
		"grant_type":    {"refresh_token"},
	}

	respBody, _, err := s.doFormRequest("POST", "/oauth/token", data)
	if err != nil {
		return nil, err
	}

	var tokenResp models.TokenResponse
	if err := json.Unmarshal(respBody, &tokenResp); err != nil {
		return nil, fmt.Errorf("failed to parse refresh token response: %w", err)
	}

	s.authToken = tokenResp.AccessToken
	return &tokenResp, nil
}

func (s *StalwartService) GetAccount(accountID string) (*models.User, error) {
	respBody, _, err := s.doRequest("GET", fmt.Sprintf("/api/v1/accounts/%s", accountID), nil)
	if err != nil {
		return nil, err
	}

	var user models.User
	if err := s.parseResponse(respBody, &user); err != nil {
		return nil, err
	}

	return &user, nil
}

func (s *StalwartService) GetAccounts() ([]*models.Account, error) {
	respBody, _, err := s.doRequest("GET", "/api/v1/accounts", nil)
	if err != nil {
		return nil, err
	}

	var accounts []*models.Account
	if err := s.parseResponse(respBody, &accounts); err != nil {
		return nil, err
	}

	return accounts, nil
}

func (s *StalwartService) CreateAccount(account *models.Account) (*models.Account, error) {
	respBody, _, err := s.doRequest("POST", "/api/v1/accounts", account)
	if err != nil {
		return nil, err
	}

	var created models.Account
	if err := s.parseResponse(respBody, &created); err != nil {
		return nil, err
	}

	return &created, nil
}

func (s *StalwartService) GetIdentities(accountID string) ([]*models.Identity, error) {
	respBody, _, err := s.doRequest("GET", fmt.Sprintf("/api/v1/accounts/%s/identities", accountID), nil)
	if err != nil {
		return nil, err
	}

	var identities []*models.Identity
	if err := s.parseResponse(respBody, &identities); err != nil {
		return nil, err
	}

	return identities, nil
}

func (s *StalwartService) GetFolders(accountID string) (*models.FolderList, error) {
	respBody, _, err := s.doRequest("GET", fmt.Sprintf("/api/v1/accounts/%s/mailboxes", accountID), nil)
	if err != nil {
		return nil, err
	}

	var folderList models.FolderList
	if err := s.parseResponse(respBody, &folderList); err != nil {
		return nil, err
	}

	return &folderList, nil
}

func (s *StalwartService) GetFolder(accountID, mailboxID string) (*models.Folder, error) {
	respBody, _, err := s.doRequest("GET", fmt.Sprintf("/api/v1/accounts/%s/mailboxes/%s", accountID, mailboxID), nil)
	if err != nil {
		return nil, err
	}

	var folder models.Folder
	if err := s.parseResponse(respBody, &folder); err != nil {
		return nil, err
	}

	return &folder, nil
}

func (s *StalwartService) CreateFolder(req *models.CreateFolderRequest) (*models.Folder, error) {
	respBody, _, err := s.doRequest("POST", "/api/v1/mailboxes", req)
	if err != nil {
		return nil, err
	}

	var folder models.Folder
	if err := s.parseResponse(respBody, &folder); err != nil {
		return nil, err
	}

	return &folder, nil
}

func (s *StalwartService) RenameFolder(req *models.RenameFolderRequest) (*models.Folder, error) {
	respBody, _, err := s.doRequest("PATCH", fmt.Sprintf("/api/v1/mailboxes/%s", req.MailboxID), req)
	if err != nil {
		return nil, err
	}

	var folder models.Folder
	if err := s.parseResponse(respBody, &folder); err != nil {
		return nil, err
	}

	return &folder, nil
}

func (s *StalwartService) DeleteFolder(accountID, mailboxID string) error {
	_, _, err := s.doRequest("DELETE", fmt.Sprintf("/api/v1/accounts/%s/mailboxes/%s", accountID, mailboxID), nil)
	return err
}

func (s *StalwartService) SubscribeFolder(accountID, mailboxID string, subscribe bool) error {
	req := &models.SubscribeFolderRequest{
		AccountID: accountID,
		MailboxID: mailboxID,
		Subscribe: subscribe,
	}
	_, _, err := s.doRequest("POST", "/api/v1/mailboxes/subscribe", req)
	return err
}

func (s *StalwartService) GetEmails(query *models.EmailQuery) (*models.EmailList, error) {
	respBody, _, err := s.doRequest("POST", "/api/v1/emails/query", query)
	if err != nil {
		return nil, err
	}

	var emailList models.EmailList
	if err := s.parseResponse(respBody, &emailList); err != nil {
		return nil, err
	}

	return &emailList, nil
}

func (s *StalwartService) GetEmail(accountID, emailID string) (*models.Email, error) {
	respBody, _, err := s.doRequest("GET", fmt.Sprintf("/api/v1/accounts/%s/emails/%s", accountID, emailID), nil)
	if err != nil {
		return nil, err
	}

	var email models.Email
	if err := s.parseResponse(respBody, &email); err != nil {
		return nil, err
	}

	return &email, nil
}

func (s *StalwartService) GetEmailRaw(accountID, emailID string) (string, error) {
	respBody, _, err := s.doRequest("GET", fmt.Sprintf("/api/v1/accounts/%s/emails/%s/raw", accountID, emailID), nil)
	if err != nil {
		return "", err
	}

	return string(respBody), nil
}

func (s *StalwartService) GetThread(accountID, threadID string) (*models.Thread, error) {
	respBody, _, err := s.doRequest("GET", fmt.Sprintf("/api/v1/accounts/%s/threads/%s", accountID, threadID), nil)
	if err != nil {
		return nil, err
	}

	var thread models.Thread
	if err := s.parseResponse(respBody, &thread); err != nil {
		return nil, err
	}

	return &thread, nil
}

func (s *StalwartService) GetThreads(accountID, mailboxID string, limit, offset int) (*models.EmailList, error) {
	query := &models.EmailQuery{
		AccountID:  accountID,
		MailboxIDs: []string{mailboxID},
		Limit:      limit,
		Offset:     offset,
		Sort:       []models.SortOrder{{Property: "date", IsAscending: false}},
	}

	return s.GetEmails(query)
}

func (s *StalwartService) SendEmail(email *models.SendEmailRequest) (*models.Email, error) {
	respBody, _, err := s.doRequest("POST", "/api/v1/emails/send", email)
	if err != nil {
		return nil, err
	}

	var sentEmail models.Email
	if err := s.parseResponse(respBody, &sentEmail); err != nil {
		return nil, err
	}

	return &sentEmail, nil
}

func (s *StalwartService) CreateDraft(email *models.SendEmailRequest) (*models.Email, error) {
	respBody, _, err := s.doRequest("POST", "/api/v1/emails/draft", email)
	if err != nil {
		return nil, err
	}

	var draft models.Email
	if err := s.parseResponse(respBody, &draft); err != nil {
		return nil, err
	}

	return &draft, nil
}

func (s *StalwartService) UpdateDraft(accountID, draftID string, email *models.SendEmailRequest) (*models.Email, error) {
	respBody, _, err := s.doRequest("PUT", fmt.Sprintf("/api/v1/accounts/%s/emails/%s", accountID, draftID), email)
	if err != nil {
		return nil, err
	}

	var updated models.Email
	if err := s.parseResponse(respBody, &updated); err != nil {
		return nil, err
	}

	return &updated, nil
}

func (s *StalwartService) DeleteDraft(accountID, draftID string) error {
	_, _, err := s.doRequest("DELETE", fmt.Sprintf("/api/v1/accounts/%s/emails/%s", accountID, draftID), nil)
	return err
}

func (s *StalwartService) MoveEmails(req *models.MoveEmailsRequest) error {
	_, _, err := s.doRequest("POST", "/api/v1/emails/move", req)
	return err
}

func (s *StalwartService) MarkEmailsRead(accountID string, emailIDs []string) error {
	req := &models.EmailActionRequest{
		AccountID: accountID,
		EmailIDs:  emailIDs,
		Operation: "markRead",
	}
	_, _, err := s.doRequest("POST", "/api/v1/emails/action", req)
	return err
}

func (s *StalwartService) MarkEmailsUnread(accountID string, emailIDs []string) error {
	req := &models.EmailActionRequest{
		AccountID: accountID,
		EmailIDs:  emailIDs,
		Operation: "markUnread",
	}
	_, _, err := s.doRequest("POST", "/api/v1/emails/action", req)
	return err
}

func (s *StalwartService) StarEmails(accountID string, emailIDs []string) error {
	req := &models.EmailActionRequest{
		AccountID: accountID,
		EmailIDs:  emailIDs,
		Operation: "markStarred",
	}
	_, _, err := s.doRequest("POST", "/api/v1/emails/action", req)
	return err
}

func (s *StalwartService) UnstarEmails(accountID string, emailIDs []string) error {
	req := &models.EmailActionRequest{
		AccountID: accountID,
		EmailIDs:  emailIDs,
		Operation: "unstar",
	}
	_, _, err := s.doRequest("POST", "/api/v1/emails/action", req)
	return err
}

func (s *StalwartService) DeleteEmails(accountID string, emailIDs []string) error {
	req := &models.EmailActionRequest{
		AccountID: accountID,
		EmailIDs:  emailIDs,
		Operation: "delete",
	}
	_, _, err := s.doRequest("POST", "/api/v1/emails/action", req)
	return err
}

func (s *StalwartService) ArchiveEmails(accountID string, emailIDs []string) error {
	req := &models.EmailActionRequest{
		AccountID: accountID,
		EmailIDs:  emailIDs,
		Operation: "archive",
	}
	_, _, err := s.doRequest("POST", "/api/v1/emails/action", req)
	return err
}

func (s *StalwartService) SetLabels(req *models.SetLabelsRequest) error {
	_, _, err := s.doRequest("POST", "/api/v1/emails/labels", req)
	return err
}

func (s *StalwartService) Search(query *models.SearchQuery) (*models.SearchResult, error) {
	respBody, _, err := s.doRequest("POST", "/api/v1/emails/search", query)
	if err != nil {
		return nil, err
	}

	var result models.SearchResult
	if err := s.parseResponse(respBody, &result); err != nil {
		return nil, err
	}

	return &result, nil
}

func (s *StalwartService) QuickSearch(accountID, queryStr string, limit int) (*models.QuickSearchResult, error) {
	query := &models.QuickSearch{
		AccountID: accountID,
		Query:     queryStr,
		Limit:     limit,
	}

	respBody, _, err := s.doRequest("POST", "/api/v1/search/quick", query)
	if err != nil {
		return nil, err
	}

	var result models.QuickSearchResult
	if err := s.parseResponse(respBody, &result); err != nil {
		return nil, err
	}

	return &result, nil
}

func (s *StalwartService) GetContacts(accountID string, limit, offset int) (*models.ContactList, error) {
	respBody, _, err := s.doRequest("GET", fmt.Sprintf("/api/v1/accounts/%s/contacts?limit=%d&offset=%d", accountID, limit, offset), nil)
	if err != nil {
		return nil, err
	}

	var contactList models.ContactList
	if err := s.parseResponse(respBody, &contactList); err != nil {
		return nil, err
	}

	return &contactList, nil
}

func (s *StalwartService) GetContact(accountID, contactID string) (*models.Contact, error) {
	respBody, _, err := s.doRequest("GET", fmt.Sprintf("/api/v1/accounts/%s/contacts/%s", accountID, contactID), nil)
	if err != nil {
		return nil, err
	}

	var contact models.Contact
	if err := s.parseResponse(respBody, &contact); err != nil {
		return nil, err
	}

	return &contact, nil
}

func (s *StalwartService) CreateContact(req *models.CreateContactRequest) (*models.Contact, error) {
	respBody, _, err := s.doRequest("POST", "/api/v1/contacts", req)
	if err != nil {
		return nil, err
	}

	var contact models.Contact
	if err := s.parseResponse(respBody, &contact); err != nil {
		return nil, err
	}

	return &contact, nil
}

func (s *StalwartService) UpdateContact(req *models.UpdateContactRequest) (*models.Contact, error) {
	respBody, _, err := s.doRequest("PUT", fmt.Sprintf("/api/v1/contacts/%s", req.ID), req)
	if err != nil {
		return nil, err
	}

	var contact models.Contact
	if err := s.parseResponse(respBody, &contact); err != nil {
		return nil, err
	}

	return &contact, nil
}

func (s *StalwartService) DeleteContact(accountID, contactID string) error {
	_, _, err := s.doRequest("DELETE", fmt.Sprintf("/api/v1/accounts/%s/contacts/%s", accountID, contactID), nil)
	return err
}

func (s *StalwartService) SearchContacts(accountID, query string) (*models.ContactList, error) {
	body := map[string]string{
		"account_id": accountID,
		"query":      query,
	}
	respBody, _, err := s.doRequest("POST", "/api/v1/contacts/search", body)
	if err != nil {
		return nil, err
	}

	var contactList models.ContactList
	if err := s.parseResponse(respBody, &contactList); err != nil {
		return nil, err
	}

	return &contactList, nil
}

func (s *StalwartService) GetContactGroups(accountID string) (*models.GroupList, error) {
	respBody, _, err := s.doRequest("GET", fmt.Sprintf("/api/v1/accounts/%s/contact-groups", accountID), nil)
	if err != nil {
		return nil, err
	}

	var groupList models.GroupList
	if err := s.parseResponse(respBody, &groupList); err != nil {
		return nil, err
	}

	return &groupList, nil
}

func (s *StalwartService) CreateContactGroup(req *models.CreateGroupRequest) (*models.ContactGroup, error) {
	respBody, _, err := s.doRequest("POST", "/api/v1/contact-groups", req)
	if err != nil {
		return nil, err
	}

	var group models.ContactGroup
	if err := s.parseResponse(respBody, &group); err != nil {
		return nil, err
	}

	return &group, nil
}

func (s *StalwartService) GetTags(accountID string) ([]*models.Tag, error) {
	respBody, _, err := s.doRequest("GET", fmt.Sprintf("/api/v1/accounts/%s/tags", accountID), nil)
	if err != nil {
		return nil, err
	}

	var tags []*models.Tag
	if err := s.parseResponse(respBody, &tags); err != nil {
		return nil, err
	}

	return tags, nil
}

func (s *StalwartService) CreateTag(req *models.CreateTagRequest) (*models.Tag, error) {
	respBody, _, err := s.doRequest("POST", "/api/v1/tags", req)
	if err != nil {
		return nil, err
	}

	var tag models.Tag
	if err := s.parseResponse(respBody, &tag); err != nil {
		return nil, err
	}

	return &tag, nil
}

func (s *StalwartService) UpdateTag(req *models.UpdateTagRequest) (*models.Tag, error) {
	respBody, _, err := s.doRequest("PUT", fmt.Sprintf("/api/v1/tags/%s", req.ID), req)
	if err != nil {
		return nil, err
	}

	var tag models.Tag
	if err := s.parseResponse(respBody, &tag); err != nil {
		return nil, err
	}

	return &tag, nil
}

func (s *StalwartService) DeleteTag(accountID, tagID string) error {
	_, _, err := s.doRequest("DELETE", fmt.Sprintf("/api/v1/accounts/%s/tags/%s", accountID, tagID), nil)
	return err
}

func (s *StalwartService) GetSettings(accountID string) (*models.UserSettings, error) {
	respBody, _, err := s.doRequest("GET", fmt.Sprintf("/api/v1/accounts/%s/settings", accountID), nil)
	if err != nil {
		return nil, err
	}

	var settings models.UserSettings
	if err := s.parseResponse(respBody, &settings); err != nil {
		return nil, err
	}

	return &settings, nil
}

func (s *StalwartService) UpdateSettings(req *models.UpdateSettingsRequest) (*models.UserSettings, error) {
	respBody, _, err := s.doRequest("PATCH", fmt.Sprintf("/api/v1/accounts/%s/settings", req.AccountID), req)
	if err != nil {
		return nil, err
	}

	var settings models.UserSettings
	if err := s.parseResponse(respBody, &settings); err != nil {
		return nil, err
	}

	return &settings, nil
}

func (s *StalwartService) GetVacationResponder(accountID string) (*models.VacationResponder, error) {
	respBody, _, err := s.doRequest("GET", fmt.Sprintf("/api/v1/accounts/%s/vacation", accountID), nil)
	if err != nil {
		return nil, err
	}

	var responder models.VacationResponder
	if err := s.parseResponse(respBody, &responder); err != nil {
		return nil, err
	}

	return &responder, nil
}

func (s *StalwartService) UpdateVacationResponder(req *models.UpdateVacationResponderRequest) (*models.VacationResponder, error) {
	respBody, _, err := s.doRequest("PUT", fmt.Sprintf("/api/v1/accounts/%s/vacation", req.AccountID), req)
	if err != nil {
		return nil, err
	}

	var responder models.VacationResponder
	if err := s.parseResponse(respBody, &responder); err != nil {
		return nil, err
	}

	return &responder, nil
}

func (s *StalwartService) GetFilterRules(accountID string) (*models.FilterRuleList, error) {
	respBody, _, err := s.doRequest("GET", fmt.Sprintf("/api/v1/accounts/%s/filters", accountID), nil)
	if err != nil {
		return nil, err
	}

	var rules models.FilterRuleList
	if err := s.parseResponse(respBody, &rules); err != nil {
		return nil, err
	}

	return &rules, nil
}

func (s *StalwartService) CreateFilterRule(req *models.CreateFilterRuleRequest) (*models.FilterRule, error) {
	respBody, _, err := s.doRequest("POST", "/api/v1/filters", req)
	if err != nil {
		return nil, err
	}

	var rule models.FilterRule
	if err := s.parseResponse(respBody, &rule); err != nil {
		return nil, err
	}

	return &rule, nil
}

func (s *StalwartService) UpdateFilterRule(req *models.UpdateFilterRuleRequest) (*models.FilterRule, error) {
	respBody, _, err := s.doRequest("PUT", fmt.Sprintf("/api/v1/filters/%s", req.ID), req)
	if err != nil {
		return nil, err
	}

	var rule models.FilterRule
	if err := s.parseResponse(respBody, &rule); err != nil {
		return nil, err
	}

	return &rule, nil
}

func (s *StalwartService) DeleteFilterRule(accountID, ruleID string) error {
	_, _, err := s.doRequest("DELETE", fmt.Sprintf("/api/v1/accounts/%s/filters/%s", accountID, ruleID), nil)
	return err
}

func (s *StalwartService) GetSignatures(accountID string) ([]*models.Signature, error) {
	respBody, _, err := s.doRequest("GET", fmt.Sprintf("/api/v1/accounts/%s/signatures", accountID), nil)
	if err != nil {
		return nil, err
	}

	var signatures []*models.Signature
	if err := s.parseResponse(respBody, &signatures); err != nil {
		return nil, err
	}

	return signatures, nil
}

func (s *StalwartService) CreateSignature(req *models.CreateSignatureRequest) (*models.Signature, error) {
	respBody, _, err := s.doRequest("POST", "/api/v1/signatures", req)
	if err != nil {
		return nil, err
	}

	var signature models.Signature
	if err := s.parseResponse(respBody, &signature); err != nil {
		return nil, err
	}

	return &signature, nil
}

func (s *StalwartService) UpdateSignature(req *models.UpdateSignatureRequest) (*models.Signature, error) {
	respBody, _, err := s.doRequest("PUT", fmt.Sprintf("/api/v1/signatures/%s", req.ID), req)
	if err != nil {
		return nil, err
	}

	var signature models.Signature
	if err := s.parseResponse(respBody, &signature); err != nil {
		return nil, err
	}

	return &signature, nil
}

func (s *StalwartService) DeleteSignature(accountID, signatureID string) error {
	_, _, err := s.doRequest("DELETE", fmt.Sprintf("/api/v1/accounts/%s/signatures/%s", accountID, signatureID), nil)
	return err
}

func (s *StalwartService) GetAttachments(accountID, emailID string) ([]*models.Attachment, error) {
	respBody, _, err := s.doRequest("GET", fmt.Sprintf("/api/v1/accounts/%s/emails/%s/attachments", accountID, emailID), nil)
	if err != nil {
		return nil, err
	}

	var attachments []*models.Attachment
	if err := s.parseResponse(respBody, &attachments); err != nil {
		return nil, err
	}

	return attachments, nil
}

func (s *StalwartService) GetAttachmentContent(accountID, emailID, attachmentID string) ([]byte, string, error) {
	respBody, _, err := s.doRequest("GET", fmt.Sprintf("/api/v1/accounts/%s/emails/%s/attachments/%s/content", accountID, emailID, attachmentID), nil)
	if err != nil {
		return nil, "", err
	}

	contentType := "application/octet-stream"
	return respBody, contentType, nil
}

func (s *StalwartService) DownloadAttachment(accountID, emailID, attachmentID string) error {
	_, _, err := s.doRequest("POST", fmt.Sprintf("/api/v1/accounts/%s/emails/%s/attachments/%s/download", accountID, emailID, attachmentID), nil)
	return err
}

func (s *StalwartService) GetNotifications(accountID string, limit, offset int) (*models.NotificationList, error) {
	respBody, _, err := s.doRequest("GET", fmt.Sprintf("/api/v1/accounts/%s/notifications?limit=%d&offset=%d", accountID, limit, offset), nil)
	if err != nil {
		return nil, err
	}

	var notifications models.NotificationList
	if err := s.parseResponse(respBody, &notifications); err != nil {
		return nil, err
	}

	return &notifications, nil
}

func (s *StalwartService) MarkNotificationsRead(accountID string, notificationIDs []string) error {
	req := &models.MarkNotificationReadRequest{
		AccountID:       accountID,
		NotificationIDs: notificationIDs,
	}
	_, _, err := s.doRequest("POST", "/api/v1/notifications/mark-read", req)
	return err
}

func (s *StalwartService) DismissNotification(accountID, notificationID string) error {
	_, _, err := s.doRequest("POST", fmt.Sprintf("/api/v1/accounts/%s/notifications/%s/dismiss", accountID, notificationID), nil)
	return err
}

func (s *StalwartService) GetCalendarEvents(accountID, calendarID string, start, end time.Time) ([]*models.CalendarEvent, error) {
	endpoint := fmt.Sprintf("/api/v1/accounts/%s/calendars/%s/events?start=%s&end=%s",
		accountID, calendarID, start.Format(time.RFC3339), end.Format(time.RFC3339))

	respBody, _, err := s.doRequest("GET", endpoint, nil)
	if err != nil {
		return nil, err
	}

	var events []*models.CalendarEvent
	if err := s.parseResponse(respBody, &events); err != nil {
		return nil, err
	}

	return events, nil
}

func (s *StalwartService) CreateCalendarEvent(req *models.CreateEventRequest) (*models.CalendarEvent, error) {
	respBody, _, err := s.doRequest("POST", "/api/v1/events", req)
	if err != nil {
		return nil, err
	}

	var event models.CalendarEvent
	if err := s.parseResponse(respBody, &event); err != nil {
		return nil, err
	}

	return &event, nil
}

func (s *StalwartService) UpdateCalendarEvent(req *models.UpdateEventRequest) (*models.CalendarEvent, error) {
	respBody, _, err := s.doRequest("PUT", fmt.Sprintf("/api/v1/events/%s", req.EventID), req)
	if err != nil {
		return nil, err
	}

	var event models.CalendarEvent
	if err := s.parseResponse(respBody, &event); err != nil {
		return nil, err
	}

	return &event, nil
}

func (s *StalwartService) DeleteCalendarEvent(accountID, eventID string) error {
	_, _, err := s.doRequest("DELETE", fmt.Sprintf("/api/v1/accounts/%s/events/%s", accountID, eventID), nil)
	return err
}

func (s *StalwartService) Ping() error {
	_, statusCode, err := s.doRequest("GET", "/health", nil)
	if err != nil {
		return err
	}
	if statusCode != 200 {
		return fmt.Errorf("health check failed with status %d", statusCode)
	}
	return nil
}
