package services

import (
	"bufio"
	"crypto/tls"
	"fmt"
	"io"
	"net"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/skygenesisenterprise/aether-mail/server/src/models"
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
		tlsConn := tls.Client(conn, &tls.Config{
			ServerName: host,
		})
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
	cmd := fmt.Sprintf("%s LOGIN %s %s", tag, s.escapeString(username), s.escapeString(password))

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
