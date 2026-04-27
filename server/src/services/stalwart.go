package services

import (
	"bytes"
	"crypto/tls"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"
	"time"

	"github.com/skygenesisenterprise/aether-mail/server/src/config"
	"github.com/skygenesisenterprise/aether-mail/server/src/models"
	"github.com/skygenesisenterprise/aether-mail/server/src/utils"
)

type StalwartService struct {
	baseURL    string
	jmapURL    string
	httpClient *http.Client
	authToken  string
	accountID  string
}

func NewStalwartService(cfg *config.StalwartConfig) *StalwartService {
	protocol := "http"
	if cfg.UseTLS {
		protocol = "https"
	}

	adminURL := fmt.Sprintf("%s://%s:%d", protocol, cfg.Host, cfg.HTTPPort)
	jmapURL := fmt.Sprintf("%s://%s:%d", protocol, cfg.Host, cfg.JMAPPort)

	return &StalwartService{
		baseURL: adminURL,
		jmapURL: jmapURL,
		httpClient: &http.Client{
			Timeout: 60 * time.Second,
			Transport: &http.Transport{
				MaxIdleConns:        100,
				MaxIdleConnsPerHost: 10,
				IdleConnTimeout:     90 * time.Second,
				TLSClientConfig: &tls.Config{
					InsecureSkipVerify: cfg.SkipVerify,
				},
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

type JMAPMethod struct {
	Name     string                 `json:"name"`
	Args     map[string]interface{} `json:"args"`
	MethodID string                 `json:"method_id,omitempty"`
}

type JMAPRequest struct {
	Using       []string     `json:"using"`
	MethodCalls []JMAPMethod `json:"methodCalls"`
	AccountID   string       `json:"accountId,omitempty"`
}

type JMAPResponse struct {
	MethodResponses [][]interface{} `json:"methodResponses"`
	SessionState    string          `json:"sessionState"`
}

func (s *StalwartService) doJMAPRequest(methodCalls []JMAPMethod) ([]byte, error) {
	jmapReq := JMAPRequest{
		Using:       []string{"urn:ietf:params:jmap:core", "urn:ietf:params:jmap:mail"},
		MethodCalls: methodCalls,
	}

	if s.accountID != "" {
		jmapReq.AccountID = s.accountID
	}

	jsonData, err := json.Marshal(jmapReq)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal JMAP request: %w", err)
	}

	req, err := http.NewRequest("POST", s.jmapURL+"/jmap", bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, fmt.Errorf("failed to create JMAP request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Accept", "application/json")

	if s.authToken != "" {
		req.Header.Set("Authorization", "Bearer "+s.authToken)
	}

	resp, err := s.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to execute JMAP request: %w", err)
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read JMAP response: %w", err)
	}

	if resp.StatusCode >= 400 {
		return nil, fmt.Errorf("JMAP request failed with status %d: %s", resp.StatusCode, string(respBody))
	}

	return respBody, nil
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
	s.accountID = accountID

	methodCalls := []JMAPMethod{
		{
			Name: "Mailbox/get",
			Args: map[string]interface{}{
				"accountId": accountID,
				"ids":       nil,
			},
			MethodID: "0",
		},
	}

	respBody, err := s.doJMAPRequest(methodCalls)
	if err != nil {
		return nil, err
	}

	var jmapResp JMAPResponse
	if err := json.Unmarshal(respBody, &jmapResp); err != nil {
		return nil, fmt.Errorf("failed to parse JMAP response: %w", err)
	}

	if len(jmapResp.MethodResponses) == 0 {
		return nil, fmt.Errorf("empty JMAP response")
	}

	responseData := jmapResp.MethodResponses[0]
	if len(responseData) < 2 {
		return nil, fmt.Errorf("invalid JMAP response format")
	}

	folderList := &models.FolderList{
		AccountID: accountID,
	}

	if args, ok := responseData[1].(map[string]interface{}); ok {
		if list, ok := args["list"].([]interface{}); ok {
			for _, mb := range list {
				if mailbox, ok := mb.(map[string]interface{}); ok {
					folder := &models.Folder{
						ID:           getString(mailbox["id"]),
						Name:         getString(mailbox["name"]),
						ParentID:     getString(mailbox["parentId"]),
						IsSubscribed: getBool(mailbox["isSubscribed"]),
						Path:         getString(mailbox["name"]),
						IsSelectable: true,
					}
					folderList.Folders = append(folderList.Folders, folder)
				}
			}
		}
		if total, ok := args["total"].(float64); ok {
			folderList.Total = int(total)
		}
	}

	return folderList, nil
}

func getString(v interface{}) string {
	if v == nil {
		return ""
	}
	if s, ok := v.(string); ok {
		return s
	}
	return ""
}

func getBool(v interface{}) bool {
	if v == nil {
		return false
	}
	if b, ok := v.(bool); ok {
		return b
	}
	return false
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
	s.accountID = query.AccountID

	filter := map[string]interface{}{}
	if len(query.MailboxIDs) > 0 {
		filter["mailboxIds"] = query.MailboxIDs
	}
	if query.IsRead != nil {
		filter["isRead"] = *query.IsRead
	}
	if query.IsStarred != nil {
		filter["isFlagged"] = *query.IsStarred
	}

	emailQueryArgs := map[string]interface{}{
		"accountId": query.AccountID,
		"limit":     query.Limit,
		"filter":    filter,
	}

	if query.Offset > 0 {
		emailQueryArgs["position"] = query.Offset
	}

	if len(query.Sort) > 0 {
		sort := []map[string]interface{}{}
		for _, s := range query.Sort {
			sort = append(sort, map[string]interface{}{
				"property":    s.Property,
				"isAscending": s.IsAscending,
				"collation":   "U",
			})
		}
		emailQueryArgs["sort"] = sort
	}

	methodCalls := []JMAPMethod{
		{
			Name:     "Email/query",
			Args:     emailQueryArgs,
			MethodID: "0",
		},
	}

	respBody, err := s.doJMAPRequest(methodCalls)
	if err != nil {
		return nil, err
	}

	var jmapResp JMAPResponse
	if err := json.Unmarshal(respBody, &jmapResp); err != nil {
		return nil, fmt.Errorf("failed to parse JMAP response: %w", err)
	}

	if len(jmapResp.MethodResponses) == 0 {
		return nil, fmt.Errorf("empty JMAP response")
	}

	responseData := jmapResp.MethodResponses[0]
	if len(responseData) < 2 {
		return nil, fmt.Errorf("invalid JMAP response format")
	}

	var emailIDs []string
	var total int

	if args, ok := responseData[1].(map[string]interface{}); ok {
		if ids, ok := args["ids"].([]interface{}); ok {
			for _, id := range ids {
				if idStr, ok := id.(string); ok {
					emailIDs = append(emailIDs, idStr)
				}
			}
		}
		if t, ok := args["total"].(float64); ok {
			total = int(t)
		}
	}

	if len(emailIDs) == 0 {
		return &models.EmailList{
			AccountID:   query.AccountID,
			Emails:      []*models.Email{},
			TotalEmails: 0,
		}, nil
	}

	emailGetArgs := map[string]interface{}{
		"accountId": query.AccountID,
		"ids":       emailIDs,
		"properties": []string{
			"id", "subject", "from", "to", "cc", "bcc",
			"preview", "textBody", "htmlBody", "hasAttachments",
			"keywords", "receivedAt", "sentAt", "mailboxIds",
			"threadId", "size", "headers",
		},
	}

	methodCalls = []JMAPMethod{
		{
			Name:     "Email/get",
			Args:     emailGetArgs,
			MethodID: "1",
		},
	}

	respBody, err = s.doJMAPRequest(methodCalls)
	if err != nil {
		return nil, err
	}

	if err := json.Unmarshal(respBody, &jmapResp); err != nil {
		return nil, fmt.Errorf("failed to parse Email/get response: %w", err)
	}

	if len(jmapResp.MethodResponses) == 0 {
		return nil, fmt.Errorf("empty Email/get response")
	}

	emailList := &models.EmailList{
		AccountID:   query.AccountID,
		TotalEmails: int64(total),
	}

	responseData = jmapResp.MethodResponses[0]
	if len(responseData) >= 2 {
		if args, ok := responseData[1].(map[string]interface{}); ok {
			if list, ok := args["list"].([]interface{}); ok {
				for _, e := range list {
					if emailData, ok := e.(map[string]interface{}); ok {
						email := s.parseJMAPEmail(emailData)
						emailList.Emails = append(emailList.Emails, email)
					}
				}
			}
		}
	}

	return emailList, nil
}

func containsMimeBoundary(content string) bool {
	if content == "" {
		return false
	}
	lower := strings.ToLower(content)
	if strings.Contains(lower, "----_nmp") || strings.Contains(lower, "--==_") {
		return true
	}
	if strings.Contains(lower, "boundary=") && strings.Contains(lower, "multipart") {
		return true
	}
	if isTrulyCorruptedMime(content) {
		return true
	}
	return false
}

func isTrulyCorruptedMime(content string) bool {
	lines := strings.Split(content, "\n")
	mimeHeaderCount := 0
	htmlTagCount := 0

	for i, line := range lines {
		lower := strings.ToLower(strings.TrimSpace(line))
		if strings.HasPrefix(lower, "content-type:") ||
			strings.HasPrefix(lower, "content-transfer-encoding:") ||
			strings.HasPrefix(lower, "content-disposition:") ||
			strings.HasPrefix(lower, "mime-version:") {
			mimeHeaderCount++
		}
		if strings.HasPrefix(lower, "<html") || strings.HasPrefix(lower, "</html>") {
			htmlTagCount++
		}
		if i > 10 && mimeHeaderCount > 2 && htmlTagCount == 0 {
			return true
		}
	}
	return mimeHeaderCount > 4
}

func (s *StalwartService) parseJMAPEmail(data map[string]interface{}) *models.Email {
	email := &models.Email{
		ID: getString(data["id"]),
	}

	if subject, ok := data["subject"].(string); ok {
		email.Subject = subject
	}

	if fromList, ok := data["from"].([]interface{}); ok && len(fromList) > 0 {
		if from, ok := fromList[0].(map[string]interface{}); ok {
			email.From = &models.EmailAddress{
				Name:  getString(from["name"]),
				Email: getString(from["email"]),
			}
		}
	}

	if toList, ok := data["to"].([]interface{}); ok {
		for _, t := range toList {
			if to, ok := t.(map[string]interface{}); ok {
				email.To = append(email.To, &models.EmailAddress{
					Name:  getString(to["name"]),
					Email: getString(to["email"]),
				})
			}
		}
	}

	if ccList, ok := data["cc"].([]interface{}); ok {
		for _, c := range ccList {
			if cc, ok := c.(map[string]interface{}); ok {
				email.Cc = append(email.Cc, &models.EmailAddress{
					Name:  getString(cc["name"]),
					Email: getString(cc["email"]),
				})
			}
		}
	}

	if bccList, ok := data["bcc"].([]interface{}); ok {
		for _, b := range bccList {
			if bcc, ok := b.(map[string]interface{}); ok {
				email.Bcc = append(email.Bcc, &models.EmailAddress{
					Name:  getString(bcc["name"]),
					Email: getString(bcc["email"]),
				})
			}
		}
	}

	if preview, ok := data["preview"].(string); ok {
		email.Preview = preview
	}

	email.HasAttachments = getBool(data["hasAttachments"])

	if keywords, ok := data["keywords"].(map[string]interface{}); ok {
		email.IsRead = keywords["$seen"] == true
		email.IsStarred = keywords["$flagged"] == true
	}

	if receivedAt, ok := data["receivedAt"].(string); ok {
		if t, err := time.Parse(time.RFC3339, receivedAt); err == nil {
			email.Date = t
		}
	}

	if threadId, ok := data["threadId"].(string); ok {
		email.ThreadID = threadId
	}

	if size, ok := data["size"].(float64); ok {
		email.Size = int64(size)
	}

	if mailboxIds, ok := data["mailboxIds"].(map[string]interface{}); ok {
		for mbxId := range mailboxIds {
			email.MailboxID = mbxId
			break
		}
	}

	if htmlBody, ok := data["htmlBody"].([]interface{}); ok && len(htmlBody) > 0 {
		if hb, ok := htmlBody[0].(map[string]interface{}); ok {
			if content, ok := hb["content"].(string); ok {
				if containsMimeBoundary(content) {
					email.BodyHTML = ""
				} else {
					email.BodyHTML = utils.DetectAndFixUTF8(s.decodeTextContent(content, hb))
				}
			}
		}
	} else if textBody, ok := data["textBody"].([]interface{}); ok && len(textBody) > 0 {
		if tb, ok := textBody[0].(map[string]interface{}); ok {
			if content, ok := tb["content"].(string); ok {
				if containsMimeBoundary(content) {
					email.Body = ""
				} else {
					email.Body = utils.DetectAndFixUTF8(s.decodeTextContent(content, tb))
				}
			}
		}
	}

	if email.Body == "" && email.BodyHTML == "" {
		if rawContent, err := s.GetEmailRaw(s.accountID, email.ID); err == nil && rawContent != "" {
			parsedEmail, err := utils.ParseEmail(rawContent)
			if err == nil && parsedEmail != nil {
				if parsedEmail.Body != "" {
					email.Body = utils.DetectAndFixUTF8(cleanEmailBody(parsedEmail.Body))
				}
				if parsedEmail.BodyHTML != "" {
					email.BodyHTML = utils.DetectAndFixUTF8(cleanEmailBody(parsedEmail.BodyHTML))
				}
				if email.Preview == "" && parsedEmail.Preview != "" {
					email.Preview = parsedEmail.Preview
				}
			}
		}
	}

	return email
}

func (s *StalwartService) decodeTextContent(content string, part map[string]interface{}) string {
	if encoding, ok := part["encoding"].(string); ok {
		if strings.ToLower(encoding) == "quoted-printable" {
			decoded, err := utils.QuotedPrintableDecode(content)
			if err == nil {
				return decoded
			}
		} else if strings.ToLower(encoding) == "base64" {
			// Strip newlines before decoding – base64 in emails is often line-wrapped.
			clean := strings.ReplaceAll(content, "\r\n", "")
			clean = strings.ReplaceAll(clean, "\n", "")
			clean = strings.ReplaceAll(clean, "\r", "")
			decoded, err := base64.StdEncoding.DecodeString(clean)
			if err == nil {
				return string(decoded)
			}
		}
	}
	return content
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
