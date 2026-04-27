package services

import (
	"bufio"
	"crypto/tls"
	"encoding/base64"
	"fmt"
	"io"
	"net"
	"regexp"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/skygenesisenterprise/aether-mail/server/src/models"
	"github.com/skygenesisenterprise/aether-mail/server/src/utils"
)

type IMAPService struct {
	host            string
	port            int
	useTLS          bool
	conn            net.Conn
	reader          *bufio.Reader
	writer          io.Writer
	tag             int
	tagMu           sync.Mutex
	isAuth          bool
	isSelected      bool
	selectedMailbox string
	username        string
}

func NewIMAPService() *IMAPService {
	return &IMAPService{
		tag: 0,
	}
}

func (s *IMAPService) Connect(host string, port int, useTLS bool) error {
	s.host = host
	s.port = port
	s.useTLS = useTLS

	addr := fmt.Sprintf("%s:%d", host, port)
	conn, err := net.DialTimeout("tcp", addr, 30*time.Second)
	if err != nil {
		return fmt.Errorf("failed to connect to IMAP server: %w", err)
	}

	s.conn = conn
	s.reader = bufio.NewReader(conn)
	s.writer = conn

	if useTLS {
		tlsConfig := &tls.Config{
			ServerName:         host,
			InsecureSkipVerify: true,
		}
		tlsConn := tls.Client(conn, tlsConfig)
		if err := tlsConn.Handshake(); err != nil {
			return fmt.Errorf("TLS handshake failed: %w", err)
		}
		s.conn = tlsConn
		s.reader = bufio.NewReader(tlsConn)
		s.writer = tlsConn
	}

	resp, err := s.readResponse()
	if err != nil {
		return fmt.Errorf("failed to read greeting: %w", err)
	}

	if !strings.HasPrefix(resp, "* OK") {
		return fmt.Errorf("unexpected greeting: %s", resp)
	}

	return nil
}

func (s *IMAPService) Authenticate(username, password string) error {
	s.username = username

	tag := s.nextTag()
	
	quotedUsername := s.quoteString(username)
	quotedPassword := s.quoteString(password)
	
	cmd := fmt.Sprintf("%s LOGIN %s %s", tag, quotedUsername, quotedPassword)
	fmt.Printf("[IMAP] LOGIN command: %s LOGIN [username] [password]\n", tag)

	if err := s.sendCommand(cmd); err != nil {
		return fmt.Errorf("failed to send LOGIN command: %w", err)
	}

	resp, err := s.readResponse()
	if err != nil {
		return fmt.Errorf("failed to read LOGIN response: %w", err)
	}

	if strings.HasPrefix(resp, tag+" OK") {
		s.isAuth = true
		return nil
	}

	return fmt.Errorf("authentication failed: %s", resp)
}

func (s *IMAPService) Disconnect() error {
	if s.conn != nil {
		s.sendCommand("LOGOUT")
		s.conn.Close()
		s.conn = nil
	}
	return nil
}

func (s *IMAPService) IsConnected() bool {
	return s.conn != nil
}

func (s *IMAPService) ListMailboxes(reference, mailbox string) ([]*models.Folder, error) {
	tag := s.nextTag()
	cmd := fmt.Sprintf("%s LIST %s %s", tag, s.escapeString(reference), s.escapeString(mailbox))

	if err := s.sendCommand(cmd); err != nil {
		return nil, err
	}

	var folders []*models.Folder
	for {
		resp, err := s.readResponse()
		if err != nil {
			return nil, err
		}

		if strings.HasPrefix(resp, tag+" ") {
			break
		}

		if strings.HasPrefix(resp, "* LIST") {
			folder := s.parseListResponse(resp)
			if folder != nil {
				folders = append(folders, folder)
			}
		}
	}

	return folders, nil
}

func (s *IMAPService) GetMailboxStatus(mailbox string) (*models.Folder, error) {
	tag := s.nextTag()
	cmd := fmt.Sprintf("%s STATUS %s (MESSAGES UNSEEN RECENT UIDVALIDITY UIDNEXT)", tag, s.escapeString(mailbox))

	if err := s.sendCommand(cmd); err != nil {
		return nil, err
	}

	resp, err := s.readResponse()
	if err != nil {
		return nil, err
	}

	if !strings.HasPrefix(resp, "* STATUS") {
		return nil, fmt.Errorf("unexpected response: %s", resp)
	}

	return s.parseStatusResponse(resp, mailbox), nil
}

func (s *IMAPService) SelectMailbox(mailbox string) error {
	tag := s.nextTag()
	cmd := fmt.Sprintf("%s SELECT %s", tag, s.escapeString(mailbox))

	if err := s.sendCommand(cmd); err != nil {
		return err
	}

	for {
		resp, err := s.readResponse()
		if err != nil {
			return err
		}

		if strings.HasPrefix(resp, tag+" ") {
			if strings.Contains(resp, "OK") {
				s.isSelected = true
				s.selectedMailbox = mailbox
				return nil
			}
			return fmt.Errorf("SELECT failed: %s", resp)
		}
	}
}

func (s *IMAPService) ListMessages(sequence string, items []string) ([]*models.Email, error) {
	if !s.isSelected {
		return nil, fmt.Errorf("no mailbox selected")
	}

	tag := s.nextTag()
	cmd := fmt.Sprintf("%s FETCH %s (%s)", tag, sequence, strings.Join(items, " "))

	if err := s.sendCommand(cmd); err != nil {
		return nil, err
	}

	var emails []*models.Email
	for {
		resp, err := s.readResponse()
		if err != nil {
			return nil, err
		}

		if strings.HasPrefix(resp, tag+" ") {
			break
		}

		if strings.HasPrefix(resp, "* ") && strings.Contains(resp, "FETCH") {
			email := s.parseFetchResponse(resp)
			if email != nil {
				emails = append(emails, email)
			}
		}
	}

	return emails, nil
}

func (s *IMAPService) ListMessagesByUID(limit, offset int) ([]*models.Email, error) {
	if !s.isSelected {
		return nil, fmt.Errorf("no mailbox selected")
	}

	if limit == 0 {
		total, _ := s.GetMessageCount()
		limit = total
		if limit == 0 {
			limit = 1
		}
	}

	tag := s.nextTag()
	start := offset + 1
	end := offset + limit
	cmd := fmt.Sprintf("%s UID FETCH %d:%d (UID FLAGS ENVELOPE BODY.PEEK[HEADER] BODY.PEEK[TEXT])", tag, start, end)

	if err := s.sendCommand(cmd); err != nil {
		return nil, err
	}

	var emails []*models.Email
	var currentEmailResp strings.Builder
	respCount := 0

	for {
		resp, err := s.readResponse()
		if err != nil {
			return nil, err
		}
		respCount++

		if strings.HasPrefix(resp, tag+" OK") || strings.HasPrefix(resp, tag+" BAD") {
			if currentEmailResp.Len() > 0 {
				email := s.parseEmailResponse(currentEmailResp.String())
				if email != nil {
					if email.ID == "" {
						email.ID = fmt.Sprintf("%d-%d", start, len(emails)+1)
					}
					emails = append(emails, email)
				}
			}
			break
		}

		if strings.HasPrefix(resp, "* ") && strings.Contains(resp, "FETCH") {
			if currentEmailResp.Len() > 0 {
				email := s.parseEmailResponse(currentEmailResp.String())
				if email != nil {
					if email.ID == "" {
						email.ID = fmt.Sprintf("%d-%d", start, len(emails)+1)
					}
					emails = append(emails, email)
				}
			}
			currentEmailResp.Reset()
			currentEmailResp.WriteString(resp)
		} else if currentEmailResp.Len() > 0 {
			if strings.HasPrefix(resp, "* ") && !strings.Contains(resp, "FETCH") && respCount > 1 {
				email := s.parseEmailResponse(currentEmailResp.String())
				if email != nil {
					if email.ID == "" {
						email.ID = fmt.Sprintf("%d-%d", start, len(emails)+1)
					}
					emails = append(emails, email)
				}
				currentEmailResp.Reset()
			} else if resp == ")" || strings.HasPrefix(resp, tag+" ") {
				email := s.parseEmailResponse(currentEmailResp.String())
				if email != nil {
					if email.ID == "" {
						email.ID = fmt.Sprintf("%d-%d", start, len(emails)+1)
					}
					emails = append(emails, email)
				}
				currentEmailResp.Reset()
			} else {
				currentEmailResp.WriteString("\r\n" + resp)
			}
		}
	}

	return emails, nil
}

func (s *IMAPService) FetchEmailByUID(uid int) (*models.Email, error) {
	if !s.isSelected {
		return nil, fmt.Errorf("no mailbox selected")
	}

	tag := s.nextTag()
	cmd := fmt.Sprintf("%s UID FETCH %d (UID FLAGS ENVELOPE BODY.PEEK[HEADER] BODY.PEEK[TEXT])", tag, uid)

	if err := s.sendCommand(cmd); err != nil {
		return nil, err
	}

	var fullResponse strings.Builder
	inBody := false

	for {
		resp, err := s.readResponse()
		if err != nil {
			return nil, err
		}

		if strings.HasPrefix(resp, tag+" ") {
			break
		}

		if strings.HasPrefix(resp, "* ") {
			if strings.Contains(resp, "FETCH") {
				if fullResponse.Len() > 0 {
					fullResponse.WriteString("\r\n")
				}
				fullResponse.WriteString(resp)
				if strings.Contains(resp, "BODY[TEXT]") {
					inBody = true
				}
			} else if inBody {
				fullResponse.WriteString("\r\n" + resp)
				if strings.HasPrefix(resp, ")") {
					inBody = false
				}
			} else {
				fullResponse.WriteString("\r\n" + resp)
			}
		} else if fullResponse.Len() > 0 {
			if resp == ")" {
				break
			}
			fullResponse.WriteString(resp)
		}
	}

	if fullResponse.Len() == 0 {
		return nil, fmt.Errorf("email not found")
	}

	email := s.parseEmailResponse(fullResponse.String())
	if email != nil {
		email.ID = fmt.Sprintf("%d", uid)
	}

	return email, nil
}

func (s *IMAPService) SearchBySubject(subject string) ([]int, error) {
	return s.SearchMessages(fmt.Sprintf("SUBJECT \"%s\"", subject))
}

func (s *IMAPService) SearchByFrom(from string) ([]int, error) {
	return s.SearchMessages(fmt.Sprintf("FROM \"%s\"", from))
}

func (s *IMAPService) GetMessageCount() (int, error) {
	status, err := s.GetMailboxStatus(s.selectedMailbox)
	if err != nil {
		return 0, err
	}
	return int(status.TotalEmails), nil
}

func (s *IMAPService) FetchMessage(messageNum int, items []string) (*models.Email, error) {
	emails, err := s.ListMessages(strconv.Itoa(messageNum), items)
	if err != nil {
		return nil, err
	}
	if len(emails) == 0 {
		return nil, fmt.Errorf("message not found")
	}
	return emails[0], nil
}

func (s *IMAPService) SearchMessages(criteria string) ([]int, error) {
	if !s.isSelected {
		return nil, fmt.Errorf("no mailbox selected")
	}

	tag := s.nextTag()
	cmd := fmt.Sprintf("%s SEARCH CHARSET UTF-8 %s", tag, criteria)

	if err := s.sendCommand(cmd); err != nil {
		return nil, err
	}

	var ids []int
	for {
		resp, err := s.readResponse()
		if err != nil {
			return nil, err
		}

		if strings.HasPrefix(resp, tag+" ") {
			break
		}

		if strings.HasPrefix(resp, "* SEARCH") {
			parts := strings.Split(resp, " ")
			for _, p := range parts[2:] {
				if id, err := strconv.Atoi(strings.TrimSpace(p)); err == nil {
					ids = append(ids, id)
				}
			}
		}
	}

	return ids, nil
}

func (s *IMAPService) CopyMessages(sequence, mailbox string) error {
	if !s.isSelected {
		return fmt.Errorf("no mailbox selected")
	}

	tag := s.nextTag()
	cmd := fmt.Sprintf("%s COPY %s %s", tag, sequence, s.escapeString(mailbox))

	if err := s.sendCommand(cmd); err != nil {
		return err
	}

	resp, err := s.readResponse()
	if err != nil {
		return err
	}

	if !strings.HasPrefix(resp, tag+" OK") {
		return fmt.Errorf("COPY failed: %s", resp)
	}

	return nil
}

func (s *IMAPService) MoveMessages(sequence, mailbox string) error {
	if err := s.CopyMessages(sequence, mailbox); err != nil {
		return err
	}
	return s.DeleteMessages(sequence)
}

func (s *IMAPService) DeleteMessages(sequence string) error {
	if !s.isSelected {
		return fmt.Errorf("no mailbox selected")
	}

	tag := s.nextTag()
	cmd := fmt.Sprintf("%s STORE %s +FLAGS (\\Deleted)", tag, sequence)

	if err := s.sendCommand(cmd); err != nil {
		return err
	}

	resp, err := s.readResponse()
	if err != nil {
		return err
	}

	if !strings.HasPrefix(resp, tag+" OK") {
		return fmt.Errorf("DELETE failed: %s", resp)
	}

	return nil
}

func (s *IMAPService) MarkMessagesSeen(sequence string) error {
	if !s.isSelected {
		return fmt.Errorf("no mailbox selected")
	}

	tag := s.nextTag()
	cmd := fmt.Sprintf("%s STORE %s +FLAGS (\\Seen)", tag, sequence)

	if err := s.sendCommand(cmd); err != nil {
		return err
	}

	resp, err := s.readResponse()
	if err != nil {
		return err
	}

	if !strings.HasPrefix(resp, tag+" OK") {
		return fmt.Errorf("mark seen failed: %s", resp)
	}

	return nil
}

func (s *IMAPService) UnmarkMessagesSeen(sequence string) error {
	if !s.isSelected {
		return fmt.Errorf("no mailbox selected")
	}

	tag := s.nextTag()
	cmd := fmt.Sprintf("%s STORE %s -FLAGS (\\Seen)", tag, sequence)

	if err := s.sendCommand(cmd); err != nil {
		return err
	}

	resp, err := s.readResponse()
	if err != nil {
		return err
	}

	if !strings.HasPrefix(resp, tag+" OK") {
		return fmt.Errorf("unmark seen failed: %s", resp)
	}

	return nil
}

func (s *IMAPService) MarkMessagesFlagged(sequence string) error {
	if !s.isSelected {
		return fmt.Errorf("no mailbox selected")
	}

	tag := s.nextTag()
	cmd := fmt.Sprintf("%s STORE %s +FLAGS (\\Flagged)", tag, sequence)

	if err := s.sendCommand(cmd); err != nil {
		return err
	}

	resp, err := s.readResponse()
	if err != nil {
		return err
	}

	if !strings.HasPrefix(resp, tag+" OK") {
		return fmt.Errorf("mark flagged failed: %s", resp)
	}

	return nil
}

func (s *IMAPService) CreateMailbox(mailbox string) error {
	tag := s.nextTag()
	cmd := fmt.Sprintf("%s CREATE %s", tag, s.escapeString(mailbox))

	if err := s.sendCommand(cmd); err != nil {
		return err
	}

	resp, err := s.readResponse()
	if err != nil {
		return err
	}

	if !strings.HasPrefix(resp, tag+" OK") {
		return fmt.Errorf("CREATE failed: %s", resp)
	}

	return nil
}

func (s *IMAPService) RenameMailbox(oldName, newName string) error {
	tag := s.nextTag()
	cmd := fmt.Sprintf("%s RENAME %s %s", tag, s.escapeString(oldName), s.escapeString(newName))

	if err := s.sendCommand(cmd); err != nil {
		return err
	}

	resp, err := s.readResponse()
	if err != nil {
		return err
	}

	if !strings.HasPrefix(resp, tag+" OK") {
		return fmt.Errorf("RENAME failed: %s", resp)
	}

	return nil
}

func (s *IMAPService) DeleteMailbox(mailbox string) error {
	tag := s.nextTag()
	cmd := fmt.Sprintf("%s DELETE %s", tag, s.escapeString(mailbox))

	if err := s.sendCommand(cmd); err != nil {
		return err
	}

	resp, err := s.readResponse()
	if err != nil {
		return err
	}

	if !strings.HasPrefix(resp, tag+" OK") {
		return fmt.Errorf("DELETE mailbox failed: %s", resp)
	}

	return nil
}

func (s *IMAPService) SubscribeMailbox(mailbox string) error {
	tag := s.nextTag()
	cmd := fmt.Sprintf("%s SUBSCRIBE %s", tag, s.escapeString(mailbox))

	if err := s.sendCommand(cmd); err != nil {
		return err
	}

	resp, err := s.readResponse()
	if err != nil {
		return err
	}

	if !strings.HasPrefix(resp, tag+" OK") {
		return fmt.Errorf("SUBSCRIBE failed: %s", resp)
	}

	return nil
}

func (s *IMAPService) UnsubscribeMailbox(mailbox string) error {
	tag := s.nextTag()
	cmd := fmt.Sprintf("%s UNSUBSCRIBE %s", tag, s.escapeString(mailbox))

	if err := s.sendCommand(cmd); err != nil {
		return err
	}

	resp, err := s.readResponse()
	if err != nil {
		return err
	}

	if !strings.HasPrefix(resp, tag+" OK") {
		return fmt.Errorf("UNSUBSCRIBE failed: %s", resp)
	}

	return nil
}

func (s *IMAPService) GetQuota() (*QuotaInfo, error) {
	tag := s.nextTag()
	cmd := fmt.Sprintf("%s GETQUOTA \"\"", tag)

	if err := s.sendCommand(cmd); err != nil {
		return nil, err
	}

	for {
		resp, err := s.readResponse()
		if err != nil {
			return nil, err
		}

		if strings.HasPrefix(resp, tag+" ") {
			return nil, fmt.Errorf("GETQUOTA not supported")
		}

		if strings.HasPrefix(resp, "* QUOTA") {
			return s.parseQuotaResponse(resp), nil
		}
	}
}

func (s *IMAPService) GetACL(mailbox string) ([]*ACLEvent, error) {
	return nil, nil
}

func (s *IMAPService) SetACL(mailbox, identifier, rights string) error {
	return nil
}

func (s *IMAPService) DeleteACL(mailbox, identifier string) error {
	return nil
}

func (s *IMAPService) ID(params map[string]string) (map[string]string, error) {
	tag := s.nextTag()

	args := []string{}
	for k, v := range params {
		args = append(args, fmt.Sprintf("\"%s\" \"%s\"", k, v))
	}

	cmd := fmt.Sprintf("%s ID (%s)", tag, strings.Join(args, " "))

	if err := s.sendCommand(cmd); err != nil {
		return nil, err
	}

	resp, err := s.readResponse()
	if err != nil {
		return nil, err
	}

	if strings.HasPrefix(resp, tag+" OK") {
		return nil, nil
	}

	return nil, fmt.Errorf("ID failed: %s", resp)
}

func (s *IMAPService) Noop() error {
	tag := s.nextTag()
	cmd := fmt.Sprintf("%s NOOP", tag)

	if err := s.sendCommand(cmd); err != nil {
		return err
	}

	resp, err := s.readResponse()
	if err != nil {
		return err
	}

	if !strings.HasPrefix(resp, tag+" OK") {
		return fmt.Errorf("NOOP failed: %s", resp)
	}

	return nil
}

func (s *IMAPService) Check() error {
	if !s.isSelected {
		return fmt.Errorf("no mailbox selected")
	}

	tag := s.nextTag()
	cmd := fmt.Sprintf("%s CHECK", tag)

	if err := s.sendCommand(cmd); err != nil {
		return err
	}

	resp, err := s.readResponse()
	if err != nil {
		return err
	}

	if !strings.HasPrefix(resp, tag+" OK") {
		return fmt.Errorf("CHECK failed: %s", resp)
	}

	return nil
}

func (s *IMAPService) Expunge() error {
	if !s.isSelected {
		return fmt.Errorf("no mailbox selected")
	}

	tag := s.nextTag()
	cmd := fmt.Sprintf("%s EXPUNGE", tag)

	if err := s.sendCommand(cmd); err != nil {
		return err
	}

	_, err := s.readResponse()
	return err
}

func (s *IMAPService) StartTLS() error {
	tag := s.nextTag()
	cmd := fmt.Sprintf("%s STARTTLS", tag)

	if err := s.sendCommand(cmd); err != nil {
		return err
	}

	resp, err := s.readResponse()
	if err != nil {
		return err
	}

	if !strings.HasPrefix(resp, tag+" OK") {
		return fmt.Errorf("STARTTLS failed: %s", resp)
	}

	tlsConn := tls.Client(s.conn, &tls.Config{
		ServerName: s.host,
	})

	if err := tlsConn.Handshake(); err != nil {
		return fmt.Errorf("TLS handshake failed: %w", err)
	}

	s.conn = tlsConn
	s.reader = bufio.NewReader(tlsConn)
	s.writer = tlsConn

	return nil
}

func (s *IMAPService) nextTag() string {
	s.tagMu.Lock()
	defer s.tagMu.Unlock()
	s.tag++
	return fmt.Sprintf("A%04d", s.tag)
}

func (s *IMAPService) sendCommand(cmd string) error {
	_, err := fmt.Fprintf(s.writer, "%s\r\n", cmd)
	return err
}

func (s *IMAPService) readResponse() (string, error) {
	line, err := s.reader.ReadString('\n')
	if err != nil {
		return "", err
	}
	return strings.TrimSpace(line), nil
}

func (s *IMAPService) escapeString(str string) string {
	if strings.ContainsAny(str, " \t\\\"()") {
		return fmt.Sprintf("\"%s\"", strings.ReplaceAll(str, "\"", "\\\""))
	}
	return str
}

func (s *IMAPService) quoteString(str string) string {
	escaped := strings.ReplaceAll(str, "\\", "\\\\")
	escaped = strings.ReplaceAll(escaped, "\"", "\\\"")
	return fmt.Sprintf("\"%s\"", escaped)
}

func (s *IMAPService) parseListResponse(resp string) *models.Folder {
	folder := &models.Folder{}

	parts := strings.Split(resp, "\"")
	if len(parts) >= 4 {
		folder.Name = parts[len(parts)-2]
		folder.Path = folder.Name
	}

	if strings.Contains(resp, "\\Noselect") {
		folder.IsSelectable = false
	}
	if strings.Contains(resp, "\\Inbox") {
		folder.Name = "INBOX"
		folder.Path = "INBOX"
	}

	return folder
}

func (s *IMAPService) parseStatusResponse(resp, mailbox string) *models.Folder {
	folder := &models.Folder{
		Name: mailbox,
		Path: mailbox,
	}

	parts := strings.Split(resp, "(")
	if len(parts) < 2 {
		return folder
	}

	content := parts[1]
	content = strings.TrimSuffix(content, ")")

	for _, part := range strings.Split(content, " ") {
		part = strings.TrimSpace(part)
		if strings.HasPrefix(part, "MESSAGES=") {
			val, _ := strconv.ParseInt(strings.TrimPrefix(part, "MESSAGES="), 10, 64)
			folder.TotalEmails = val
		}
		if strings.HasPrefix(part, "UNSEEN=") {
			val, _ := strconv.ParseInt(strings.TrimPrefix(part, "UNSEEN="), 10, 64)
			folder.UnreadEmails = val
		}
	}

	return folder
}

func (s *IMAPService) parseFetchResponse(resp string) *models.Email {
	email := &models.Email{}

	if strings.Contains(resp, "FLAGS (\\Seen)") {
		email.IsRead = true
	}
	if strings.Contains(resp, "FLAGS (\\Flagged)") {
		email.IsFlagged = true
	}
	if strings.Contains(resp, "FLAGS (\\Answered)") {
		email.Keywords = append(email.Keywords, "answered")
	}

	return email
}

func (s *IMAPService) parseEmailResponse(resp string) *models.Email {
	email := &models.Email{}

	if strings.Contains(resp, "\\Seen") {
		email.IsRead = true
	}
	if strings.Contains(resp, "\\Flagged") {
		email.IsFlagged = true
		email.IsStarred = true
	}
	if strings.Contains(resp, "\\Answered") {
		email.Keywords = append(email.Keywords, "answered")
	}
	if strings.Contains(resp, "\\Draft") {
		email.IsDraft = true
	}
	if strings.Contains(resp, "\\Deleted") {
		email.IsDeleted = true
	}

	uidRegex := regexp.MustCompile(`UID\s+(\d+)`)
	uidMatch := uidRegex.FindStringSubmatch(resp)
	if len(uidMatch) > 1 {
		email.ID = uidMatch[1]
	}

	msgIdMatch := regexp.MustCompile(`(?i)Message-ID:\s*[<]?([^<>]+)[>]?`).FindStringSubmatch(resp)
	if len(msgIdMatch) > 1 && email.ID == "" {
		email.ID = msgIdMatch[1]
	}

	envelopeRegex := regexp.MustCompile(`ENVELOPE\s*\((.+)\)`)
	envelopeMatch := envelopeRegex.FindStringSubmatch(resp)
	if len(envelopeMatch) > 1 {
		s.parseEnvelope(envelopeMatch[1], email)
	}

	lines := strings.Split(resp, "\r\n")
	var bodyLines []string
	var headerLines []string
	inBody := false
	seenBodyMarker := false

	for _, line := range lines {
		if strings.Contains(line, "BODY[HEADER]") {
			seenBodyMarker = true
			inBody = false
			continue
		}
		if strings.Contains(line, "BODY[TEXT]") {
			seenBodyMarker = true
			inBody = true
			continue
		}

		if !inBody && !seenBodyMarker {
			headerLines = append(headerLines, line)
		} else if inBody {
			if !strings.HasPrefix(line, ")") && !strings.HasPrefix(line, "* ") && 
			   !strings.HasPrefix(line, "A000") && !strings.HasPrefix(line, "OK ") {
				bodyLines = append(bodyLines, line)
			}
		}
	}

	for _, header := range headerLines {
		if strings.HasPrefix(header, " ") || strings.HasPrefix(header, "\t") {
			continue
		}
		s.parseHeaderLine(header, email)
	}

	if len(bodyLines) > 0 {
		var mimeHeaders []string
		for _, header := range headerLines {
			lower := strings.ToLower(header)
			if strings.HasPrefix(lower, "content-type:") || strings.HasPrefix(lower, "content-transfer-encoding:") {
				mimeHeaders = append(mimeHeaders, header)
			}
		}
		bodyStr := strings.Join(bodyLines, "\n")
		if len(mimeHeaders) > 0 {
			bodyStr = strings.Join(mimeHeaders, "\n") + "\n\n" + bodyStr
		}
		email.Body, email.BodyHTML = s.parseMimeBody(bodyStr)
		email.Body = strings.TrimSpace(email.Body)
		if len(email.Body) > 200 {
			email.Preview = email.Body[:200] + "..."
		} else {
			email.Preview = email.Body
		}
	}

	if email.From == nil {
		email.From = &models.EmailAddress{Name: "", Email: ""}
	}
	if email.To == nil {
		email.To = []*models.EmailAddress{}
	}

	if email.Subject == "" {
		email.Subject = "(No Subject)"
	}

	if email.Date.IsZero() {
		email.Date = time.Now()
	}

	if email.ID == "" {
		email.ID = fmt.Sprintf("%d", time.Now().UnixNano())
	}

	return email
}

func (s *IMAPService) parseHeaderLine(header string, email *models.Email) {
	header = strings.TrimSpace(header)
	if header == "" {
		return
	}

	colonIdx := strings.Index(header, ":")
	if colonIdx == -1 {
		return
	}

	field := strings.ToLower(strings.TrimSpace(header[:colonIdx]))
	value := strings.TrimSpace(header[colonIdx+1:])

	if value == "" || value == "NIL" {
		return
	}

	switch field {
	case "from":
		if email.From == nil || email.From.Email == "" {
			email.From = s.parseEmailAddress(value)
		}
	case "to":
		if len(email.To) == 0 {
			email.To = s.parseAddressList(value)
		}
	case "cc":
		email.Cc = s.parseAddressList(value)
	case "bcc":
		email.Bcc = s.parseAddressList(value)
	case "subject":
		if email.Subject == "" || email.Subject == "(No Subject)" {
			email.Subject = value
		}
	case "date":
		if email.Date.IsZero() {
			if t, err := time.Parse(time.RFC1123Z, value); err == nil {
				email.Date = t
			} else if t, err := time.Parse(time.RFC1123, value); err == nil {
				email.Date = t
			} else if t, err := time.Parse("Mon, 02 Jan 2006 15:04:05 -0700", value); err == nil {
				email.Date = t
			}
		}
	}
}

func (s *IMAPService) parseAddressList(addrStr string) []*models.EmailAddress {
	var addresses []*models.EmailAddress

	addrStr = strings.TrimSpace(addrStr)
	if addrStr == "" || addrStr == "NIL" {
		return addresses
	}

	recipients := strings.Split(addrStr, ",")
	for _, recipient := range recipients {
		addr := s.parseEmailAddress(strings.TrimSpace(recipient))
		if addr != nil && addr.Email != "" {
			addresses = append(addresses, addr)
		}
	}

	return addresses
}

func (s *IMAPService) parseEnvelope(envStr string, email *models.Email) {
	parts := s.splitEnvelopeParts(envStr)

	if len(parts) < 3 {
		return
	}

	dateStr := strings.Trim(parts[0], "\" ")
	if dateStr != "NIL" && dateStr != "" {
		dateStr = strings.ReplaceAll(dateStr, "\"", "")
		if t, err := time.Parse("\"02 Jan 2006 15:04:05 -0700\"", dateStr); err == nil {
			email.Date = t
		} else if t, err := time.Parse("02 Jan 2006 15:04:05 -0700", dateStr); err == nil {
			email.Date = t
		}
	}

	subject := strings.Trim(parts[1], "\" ")
	if subject != "NIL" && subject != "" {
		email.Subject = subject
	}

	if len(parts) > 2 && parts[2] != "NIL" {
		fromAddr := s.parseEnvelopeAddress(parts[2])
		if fromAddr != nil {
			email.From = fromAddr
		}
	}

	if len(parts) > 3 && parts[3] != "NIL" {
		toAddr := s.parseEnvelopeAddress(parts[3])
		if toAddr != nil {
			email.To = []*models.EmailAddress{toAddr}
		}
	}
}

func (s *IMAPService) splitEnvelopeParts(str string) []string {
	var parts []string
	var current strings.Builder
	depth := 0
	inQuote := false

	for _, ch := range str {
		if ch == '"' && (current.Len() == 0 || current.String()[current.Len()-1] != '\\') {
			inQuote = !inQuote
			current.WriteRune(ch)
		} else if ch == '(' && !inQuote {
			if depth > 0 {
				current.WriteRune(ch)
			}
			depth++
		} else if ch == ')' && !inQuote {
			depth--
			if depth == 0 && current.Len() > 0 {
				parts = append(parts, current.String())
				current.Reset()
			} else if depth > 0 {
				current.WriteRune(ch)
			}
		} else if ch == ' ' && depth == 0 && !inQuote && current.Len() > 0 {
			parts = append(parts, current.String())
			current.Reset()
		} else {
			current.WriteRune(ch)
		}
	}

	if current.Len() > 0 {
		parts = append(parts, current.String())
	}

	return parts
}

func (s *IMAPService) parseEnvelopeAddress(addrStr string) *models.EmailAddress {
	addrStr = strings.TrimSpace(addrStr)
	if addrStr == "" || addrStr == "NIL" || addrStr == "NIL NIL" {
		return nil
	}

	addr := &models.EmailAddress{}

	if strings.HasPrefix(addrStr, "(") && strings.HasSuffix(addrStr, ")") {
		inner := strings.Trim(addrStr, "()")
		parts := s.splitEnvelopeParts(inner)
		
		name := ""
		mailbox := ""
		host := ""
		
		for i, part := range parts {
			part = strings.TrimSpace(part)
			if part == "NIL" {
				continue
			}
			part = strings.Trim(part, "\"")
			
			switch i {
			case 0:
				name = part
			case 1:
				if part != "" && part != "NIL" {
					name = part
				}
			case 2:
				mailbox = part
			case 3:
				host = part
			}
		}
		
		if name != "" {
			addr.Name = name
		}
		if mailbox != "" && host != "" {
			addr.Email = mailbox + "@" + host
			addr.Mailbox = mailbox
			addr.Host = host
		} else if mailbox != "" {
			addr.Email = mailbox
			addr.Mailbox = mailbox
		}
	} else if strings.Contains(addrStr, "@") {
		addr.Email = strings.Trim(addrStr, "\" ")
		parts := strings.Split(addr.Email, "@")
		if len(parts) >= 2 {
			addr.Mailbox = parts[0]
			addr.Host = strings.Join(parts[1:], "@")
		}
	}

	return addr
}

func (s *IMAPService) parseEmailAddress(addrStr string) *models.EmailAddress {
	addr := &models.EmailAddress{}

	addrStr = strings.TrimSpace(addrStr)
	if addrStr == "" || addrStr == "NIL" {
		return addr
	}

	addrStr = strings.Trim(addrStr, "\"")

	re := regexp.MustCompile(`^(?:"([^"]+)")?\s*<?([^<>@]+@[^<>@]+)>?$`)
	matches := re.FindStringSubmatch(addrStr)

	if len(matches) >= 3 {
		if matches[1] != "" {
			addr.Name = matches[1]
		}
		addr.Email = matches[2]
	} else if strings.Contains(addrStr, "@") {
		addr.Email = addrStr
	}

	return addr
}

func (s *IMAPService) parseAddressFromEnvelope(resp string) *models.EmailAddress {
	addr := &models.EmailAddress{}

	parts := strings.Split(resp, "(")
	if len(parts) > 1 {
		addrStr := parts[1]
		if nameIdx := strings.Index(addrStr, "\""); nameIdx != -1 && nameIdx < 10 {
			endQuote := strings.Index(addrStr[nameIdx+1:], "\"")
			if endQuote != -1 {
				addr.Name = addrStr[nameIdx+1 : nameIdx+1+endQuote]
			}
		}
		if atIdx := strings.Index(addrStr, "@"); atIdx != -1 {
			addr.Email = strings.TrimSpace(addrStr[:atIdx])
			if hostIdx := strings.Index(addrStr[atIdx:], "@"); hostIdx != -1 {
				rest := addrStr[atIdx+hostIdx:]
				if spaceIdx := strings.Index(rest, " "); spaceIdx != -1 {
					addr.Host = rest[1:spaceIdx]
				} else {
					addr.Host = strings.TrimSpace(rest[1:])
				}
			}
		}
	}

	return addr
}

func (s *IMAPService) parseStringFromEnvelope(resp string) string {
	parts := strings.Split(resp, "(")
	if len(parts) < 2 {
		return ""
	}
	closeIdx := strings.Index(parts[1], ")")
	if closeIdx == -1 {
		return strings.TrimSpace(parts[1])
	}
	return strings.TrimSpace(parts[1][:closeIdx])
}

func (s *IMAPService) parseQuotaResponse(resp string) *QuotaInfo {
	info := &QuotaInfo{}

	parts := strings.Split(resp, "(")
	if len(parts) < 2 {
		return info
	}

	content := parts[1]
	content = strings.TrimSuffix(content, ")")

	for _, part := range strings.Split(content, " ") {
		part = strings.TrimSpace(part)
		if strings.HasPrefix(part, "STORAGE=") {
			val, _ := strconv.ParseInt(strings.TrimPrefix(part, "STORAGE="), 10, 64)
			info.StorageUsed = val
		}
	}

	return info
}

type QuotaInfo struct {
	StorageLimit  int64
	StorageUsed   int64
	MessagesLimit int64
	MessagesUsed  int64
}

type ACLEvent struct {
	Identifier string
	Rights     string
}

func (s *IMAPService) parseMimeBody(body string) (string, string) {
	if body == "" {
		return "", ""
	}

	body = strings.TrimSpace(body)
	bodyLower := strings.ToLower(body)

	hasMultipart := strings.Contains(bodyLower, "multipart")
	hasBoundary := strings.Contains(bodyLower, "boundary")
	hasNmP := strings.Contains(body, "----_NmP")
	hasPart := strings.Contains(body, "=_Part_")

	if !hasMultipart && !hasNmP && !hasBoundary && !hasPart {
		return s.extractSinglePartWithHeaders(body)
	}

	boundary := s.findMimeBoundary(body)
	if boundary == "" {
		return s.extractSinglePartWithHeaders(body)
	}

	boundaryVariant1 := "--" + boundary
	boundaryVariant2 := boundary
	if strings.HasPrefix(boundary, "----") {
		boundaryVariant2 = boundary[2:]
	}
	if strings.HasPrefix(boundary, "=_Part_") {
		boundaryVariant2 = strings.ReplaceAll(boundary, "=_Part_", "_Part_")
	}

	var parts []string
	lines := strings.Split(body, "\n")
	var current strings.Builder

	for _, line := range lines {
		trimLine := strings.TrimSpace(line)
		if strings.HasPrefix(trimLine, boundaryVariant1) || strings.HasPrefix(trimLine, "--"+boundary) ||
			strings.HasPrefix(trimLine, boundaryVariant2) || strings.HasPrefix(trimLine, "--"+boundaryVariant2) ||
			strings.HasPrefix(trimLine, boundary) {
			if current.Len() > 0 {
				parts = append(parts, current.String())
				current.Reset()
			}
			continue
		}
		current.WriteString(line)
		current.WriteString("\n")
	}

	if current.Len() > 0 {
		parts = append(parts, current.String())
	}

	if len(parts) <= 1 {
		return s.extractSinglePartWithHeaders(body)
	}

	var htmlPart, textPart string

	for _, part := range parts {
		part = strings.TrimSpace(part)
		if part == "" {
			continue
		}

		if strings.HasPrefix(part, "--") && len(part) > 2 {
			continue
		}

		lower := strings.ToLower(part)
		if strings.Contains(lower, "content-id:") {
			continue
		}

		_, decoded := s.extractSinglePartWithHeaders(part)

		if strings.Contains(lower, "text/html") {
			if len(decoded) > len(htmlPart) {
				htmlPart = decoded
			}
		} else if strings.Contains(lower, "text/plain") {
			if len(decoded) > len(textPart) {
				textPart = decoded
			}
		}
	}

	if htmlPart != "" {
		htmlPart = utils.CleanMimeContent(htmlPart)
		htmlPart = cleanEmailBody(htmlPart)
		if htmlPart != "" {
			return "", htmlPart
		}
	}

	if textPart != "" {
		textPart = s.stripHtmlTags(textPart)
		textPart = cleanEmailBody(textPart)
		return textPart, ""
	}

	return s.extractSinglePartWithHeaders(body)
}

func (s *IMAPService) extractSinglePartWithHeaders(body string) (string, string) {
	if body == "" {
		return "", ""
	}

	lines := strings.Split(body, "\n")

	var headerLines []string
	contentStart := -1

	for i, line := range lines {
		trimmed := strings.TrimSpace(line)
		if trimmed == "" {
			if len(headerLines) > 0 {
				contentStart = i + 1
				break
			}
			continue
		}
		headerLines = append(headerLines, line)
	}

	if contentStart == -1 || contentStart >= len(lines) {
		body = cleanMimeHeaders(body)
		return body, ""
	}

	transferEncoding := ""
	charset := ""
	contentType := "text/plain"

	for _, header := range headerLines {
		lower := strings.ToLower(header)
		if strings.HasPrefix(lower, "content-transfer-encoding:") {
			enc := strings.TrimSpace(strings.SplitN(header, ":", 2)[1])
			transferEncoding = enc
		}
		if strings.HasPrefix(lower, "content-type:") {
			ct := strings.TrimSpace(strings.SplitN(header, ":", 2)[1])
			contentType = ct
			if strings.Contains(lower, "charset=") {
				re := regexp.MustCompile(`charset="?([^";\s]+)"?`)
				matches := re.FindStringSubmatch(lower)
				if len(matches) > 1 {
					charset = matches[1]
				}
			}
		}
	}

	content := strings.Join(lines[contentStart:], "\n")

	content = strings.TrimSpace(content)

	if transferEncoding == "quoted-printable" {
		content = s.decodeQuotedPrintable(content)
	} else if transferEncoding == "base64" {
		decoded, err := base64.StdEncoding.DecodeString(strings.ReplaceAll(content, "\n", ""))
		if err == nil {
			content = string(decoded)
		}
	}

	content = strings.TrimSpace(content)

	if charset != "" && strings.ToLower(charset) != "utf-8" {
		content = utils.ToUTF8(content, charset)
	}

	content = cleanMimeHeaders(content)

	if strings.Contains(contentType, "text/html") {
		if content != "" {
			content = utils.CleanMimeContent(content)
			return "", content
		}
	}

	if isHtmlContent(content) {
		content = utils.CleanMimeContent(content)
		return "", content
	}

	text := s.stripHtmlTags(content)
	return text, ""
}

func cleanMimeHeaders(content string) string {
	if content == "" {
		return ""
	}

	re := regexp.MustCompile(`(?m)^[A-Za-z0-9-]+:\s.*$`)
	content = re.ReplaceAllString(content, "")

	re = regexp.MustCompile(`(?m)^----_[A-Za-z0-9=-]+$`)
	content = re.ReplaceAllString(content, "")

	re = regexp.MustCompile(`(?m)^--[A-Za-z0-9_=-]+$`)
	content = re.ReplaceAllString(content, "")

	content = strings.TrimSpace(content)

	return content
}

func isHtmlContent(body string) bool {
	lower := strings.ToLower(body)
	return strings.Contains(lower, "<html") || strings.Contains(lower, "<!doctype html") ||
		strings.Contains(lower, "<body") && strings.Contains(lower, "</body>")
}

func (s *IMAPService) findMimeBoundary(body string) string {
	re := regexp.MustCompile(`boundary="([^"]+)"`)
	matches := re.FindStringSubmatch(body)
	if len(matches) > 1 {
		return matches[1]
	}

	re = regexp.MustCompile(`----=_Part_[0-9.]+`)
	matches = re.FindStringSubmatch(body)
	if len(matches) > 1 {
		return matches[1]
	}

	re = regexp.MustCompile(`----=_?NmP?-[a-f0-9]+`)
	matches = re.FindStringSubmatch(body)
	if len(matches) > 1 {
		return matches[1]
	}

	re = regexp.MustCompile(`----[A-Za-z0-9_=-?]+`)
	matches = re.FindStringSubmatch(body)
	if len(matches) > 1 && len(matches[1]) > 10 {
		return matches[1]
	}

	// Generic: any line that looks like a MIME boundary
	re = regexp.MustCompile(`(?m)^--([A-Za-z0-9_=-?]{10,})`)
	matches = re.FindStringSubmatch(body)
	if len(matches) > 1 {
		return matches[1]
	}

	return ""
}

func (s *IMAPService) splitByBoundary(body, boundary string) []string {
	if body == "" || boundary == "" {
		return []string{body}
	}

	boundaryLine := "--" + boundary
	var parts []string

	lines := strings.Split(body, "\n")
	var current strings.Builder

	for _, line := range lines {
		if strings.HasPrefix(line, boundaryLine) || strings.HasPrefix(line, "--"+boundary) {
			if current.Len() > 0 {
				parts = append(parts, current.String())
				current.Reset()
			}
			continue
		}
		current.WriteString(line)
		current.WriteString("\n")
	}

	if current.Len() > 0 {
		parts = append(parts, current.String())
	}

	if len(parts) == 0 {
		return []string{body}
	}

	return parts
}

func (s *IMAPService) decodeQuotedPrintable(body string) string {
	var result strings.Builder
	i := 0
	
	for i < len(body) {
		if i+1 < len(body) && body[i] == '=' && (body[i+1] == '\r' || body[i+1] == '\n') {
			if i+2 < len(body) && body[i+2] == '\n' {
				i += 3
			} else if i+1 < len(body) {
				i += 2
			} else {
				i++
			}
			continue
		}
		
		if i+2 < len(body) && body[i] == '=' {
			hex := body[i+1 : i+3]
			if matched, _ := regexp.MatchString("^[0-9A-Fa-f]{2}$", hex); matched {
				if val, err := strconv.ParseInt(hex, 16, 32); err == nil {
					result.WriteByte(byte(val))
					i += 3
					continue
				}
			}
		}
		
		result.WriteByte(body[i])
		i++
	}
	
	return result.String()
}

func (s *IMAPService) decodeQuotedPrintableLine(line string) string {
	result := strings.Builder{}
	i := 0

	for i < len(line) {
		if i+2 < len(line) && line[i] == '=' {
			hex := line[i+1 : i+3]
			if matched, _ := regexp.MatchString("^[0-9A-Fa-f]{2}$", hex); matched {
				if val, err := strconv.ParseInt(hex, 16, 32); err == nil {
					result.WriteByte(byte(val))
					i += 3
				} else {
					result.WriteByte(line[i])
					i++
				}
			} else {
				result.WriteByte(line[i])
				i++
			}
		} else {
			result.WriteByte(line[i])
			i++
		}
	}

	return result.String()
}

func (s *IMAPService) stripHtmlTags(body string) string {
	if body == "" {
		return ""
	}

	// Remove <style>, <script>, etc. and their content first
	body = utils.RemoveInvisibleBlocks(body)
	body = utils.RemoveInvisibleChars(body)

	// Replace block-level and line-break tags with newlines before stripping other tags
	replacements := map[string]string{
		"<br>": "\n", "<br/>": "\n", "<br />": "\n",
		"</p>": "\n", "</div>": "\n", "</h1>": "\n", "</h2>": "\n",
		"</h3>": "\n", "</h4>": "\n", "</h5>": "\n", "</h6>": "\n",
		"</li>": "\n", "</tr>": "\n", "</td>": " ", "<td>": " ",
		"<hr>": "\n---\n", "<hr/>": "\n---\n", "<hr />": "\n---\n",
	}

	for tag, replacement := range replacements {
		body = strings.ReplaceAll(body, tag, replacement)
		body = strings.ReplaceAll(body, strings.ToUpper(tag), replacement)
	}

	// Strip all remaining HTML tags
	re := regexp.MustCompile(`<[^>]+>`)
	body = re.ReplaceAllString(body, "")

	// Decode common HTML entities
	entities := map[string]string{
		"&nbsp;": " ", "&amp;": "&", "&lt;": "<", "&gt;": ">",
		"&quot;": "\"", "&#39;": "'", "&apos;": "'", "&ndash;": "–",
		"&mdash;": "—", "&hellip;": "…", "&laquo;": "«", "&raquo;": "»",
		"&#8217;": "'", "&#8220;": "\"", "&#8221;": "\"", "&#8230;": "…",
	}
	for enc, dec := range entities {
		body = strings.ReplaceAll(body, enc, dec)
	}

	// Normalize whitespace: collapse multiple spaces, but preserve line breaks
	lines := strings.Split(body, "\n")
	for i, line := range lines {
		lines[i] = strings.TrimSpace(regexp.MustCompile(`\s+`).ReplaceAllString(line, " "))
	}
	body = strings.Join(lines, "\n")

	// Collapse more than 2 consecutive blank lines
	body = regexp.MustCompile(`\n{3,}`).ReplaceAllString(body, "\n\n")

	return strings.TrimSpace(body)
}

func cleanEmailBody(body string) string {
	// Remove invisible blocks and invisible chars before line-by-line cleaning
	body = utils.RemoveInvisibleBlocks(body)
	body = utils.RemoveInvisibleChars(body)

	lines := strings.Split(body, "\n")
	var cleaned []string
	emptyCount := 0

	cssLineRe := regexp.MustCompile(`^[\w\s,\.\-:#\[\]\(\)"'=]+\{$`)
	cssPropRe := regexp.MustCompile(`^\s*[\w\-]+\s*:\s*[^;]+;?\s*$`)
	cssClosingRe := regexp.MustCompile(`^\s*\}\s*$`)

	for _, line := range lines {
		trimmed := strings.TrimSpace(line)

		if trimmed == "" {
			emptyCount++
			if emptyCount <= 2 {
				cleaned = append(cleaned, trimmed)
			}
			continue
		}

		emptyCount = 0

		// MIME boundaries (any line starting with -- is a boundary or separator)
		if strings.HasPrefix(trimmed, "--") {
			continue
		}
		if strings.HasPrefix(trimmed, "=_") {
			continue
		}
		if strings.HasPrefix(trimmed, "----==_") {
			continue
		}
		if regexp.MustCompile(`^[A-Za-z0-9+/]+={0,2}$`).MatchString(trimmed) && len(trimmed) > 40 {
			continue
		}
		// Stray MIME headers embedded in content
		lower := strings.ToLower(trimmed)
		if strings.HasPrefix(lower, "content-") {
			continue
		}
		if strings.HasPrefix(lower, "mime-version:") {
			continue
		}
		if strings.HasPrefix(lower, "charset=") || strings.Contains(lower, "; charset=") {
			// Only skip if it looks like a header remnant, not normal text
			if strings.Contains(lower, "text/") || strings.Contains(lower, "html") || strings.Contains(lower, "plain") || strings.Contains(lower, "multipart") {
				continue
			}
		}

		// CSS residual lines
		lower = strings.ToLower(trimmed)
		if cssLineRe.MatchString(trimmed) || cssClosingRe.MatchString(trimmed) {
			continue
		}
		if cssPropRe.MatchString(trimmed) {
			continue
		}
		if strings.HasPrefix(lower, "@media") || strings.HasPrefix(lower, "@import") || strings.HasPrefix(lower, "@font-face") {
			continue
		}
		if trimmed == "{" || trimmed == "}" {
			continue
		}

		cleaned = append(cleaned, line)
	}

	result := strings.TrimSpace(strings.Join(cleaned, "\n"))

	result = utils.DetectAndFixUTF8(result)

	return result
}
