package services

import (
	"fmt"
	"strconv"
	"strings"
	"time"

	"github.com/skygenesisenterprise/aether-mail/server/src/models"
)

type IMAPEmailService struct {
	host     string
	port     int
	useTLS   bool
	username string
	password string
}

func NewIMAPEmailService(host string, port int, useTLS bool, username, password string) *IMAPEmailService {
	return &IMAPEmailService{
		host:     host,
		port:     port,
		useTLS:   useTLS,
		username: username,
		password: password,
	}
}

func (s *IMAPEmailService) GetFolders() ([]*models.Folder, error) {
	imap := &IMAPService{}
	if err := imap.Connect(s.host, s.port, s.useTLS); err != nil {
		return nil, err
	}
	defer imap.Disconnect()

	if err := imap.Authenticate(s.username, s.password); err != nil {
		return nil, err
	}

	folders, err := imap.ListMailboxes("", "*")
	if err != nil {
		return nil, err
	}

	var result []*models.Folder
	for _, f := range folders {
		result = append(result, &models.Folder{
			ID:           f.Name,
			Name:         f.Name,
			Path:         f.Path,
			IsSelectable: f.IsSelectable,
			IsSubscribed: true,
			TotalEmails:  f.TotalEmails,
			UnreadEmails: f.UnreadEmails,
		})
	}

	return result, nil
}

func (s *IMAPEmailService) GetEmails(mailbox string, limit, offset int) (*models.EmailList, error) {
	fmt.Printf("[IMAPEmailService] GetEmails - mailbox: %s, limit: %d, offset: %d\n", mailbox, limit, offset)
	imap := &IMAPService{}
	if err := imap.Connect(s.host, s.port, s.useTLS); err != nil {
		fmt.Printf("[IMAPEmailService] Connect error: %v\n", err)
		return nil, err
	}
	defer imap.Disconnect()

	if err := imap.Authenticate(s.username, s.password); err != nil {
		fmt.Printf("[IMAPEmailService] Authenticate error: %v\n", err)
		return nil, err
	}

	fmt.Printf("[IMAPEmailService] Authenticated successfully\n")

	if err := imap.SelectMailbox(mailbox); err != nil {
		fmt.Printf("[IMAPEmailService] SelectMailbox error: %v\n", err)
		return nil, err
	}

	fmt.Printf("[IMAPEmailService] Selected mailbox: %s, isSelected: %v\n", mailbox, imap.isSelected)

	total, _ := imap.GetMessageCount()
	fmt.Printf("[IMAPEmailService] Total messages in %s: %d\n", mailbox, total)
	
	if limit == 0 {
		limit = total
	}

	fmt.Printf("[IMAPEmailService] Fetching %d emails starting from offset %d\n", limit, offset)
	
	emails, err := imap.ListMessagesByUID(limit, offset)
	if err != nil {
		fmt.Printf("[IMAPEmailService] ListMessagesByUID error: %v\n", err)
		return nil, err
	}
	
	fmt.Printf("[IMAPEmailService] Retrieved %d emails\n", len(emails))

	return &models.EmailList{
		AccountID:   s.username,
		MailboxID:   mailbox,
		TotalEmails: int64(total),
		Emails:      emails,
	}, nil
}

func (s *IMAPEmailService) GetEmail(mailbox string, uid int) (*models.Email, error) {
	imap := &IMAPService{}
	if err := imap.Connect(s.host, s.port, s.useTLS); err != nil {
		return nil, err
	}
	defer imap.Disconnect()

	if err := imap.Authenticate(s.username, s.password); err != nil {
		return nil, err
	}

	if err := imap.SelectMailbox(mailbox); err != nil {
		return nil, err
	}

	return imap.FetchEmailByUID(uid)
}

func (s *IMAPEmailService) MarkAsRead(uids []string) error {
	imap := &IMAPService{}
	if err := imap.Connect(s.host, s.port, s.useTLS); err != nil {
		return err
	}
	defer imap.Disconnect()

	if err := imap.Authenticate(s.username, s.password); err != nil {
		return err
	}

	if err := imap.SelectMailbox("INBOX"); err != nil {
		return err
	}

	for _, uidStr := range uids {
		uid, err := strconv.Atoi(uidStr)
		if err != nil {
			continue
		}
		if err := imap.MarkMessagesSeen(strconv.Itoa(uid)); err != nil {
			fmt.Printf("[IMAPEmailService] MarkAsRead error for UID %d: %v\n", uid, err)
		}
	}

	return nil
}

func (s *IMAPEmailService) MarkAsUnread(uids []string) error {
	imap := &IMAPService{}
	if err := imap.Connect(s.host, s.port, s.useTLS); err != nil {
		return err
	}
	defer imap.Disconnect()

	if err := imap.Authenticate(s.username, s.password); err != nil {
		return err
	}

	if err := imap.SelectMailbox("INBOX"); err != nil {
		return err
	}

	for _, uidStr := range uids {
		uid, err := strconv.Atoi(uidStr)
		if err != nil {
			continue
		}
		if err := imap.UnmarkMessagesSeen(strconv.Itoa(uid)); err != nil {
			fmt.Printf("[IMAPEmailService] MarkAsUnread error for UID %d: %v\n", uid, err)
		}
	}

	return nil
}

func (s *IMAPEmailService) DeleteEmails(uids []string) error {
	imap := &IMAPService{}
	if err := imap.Connect(s.host, s.port, s.useTLS); err != nil {
		return err
	}
	defer imap.Disconnect()

	if err := imap.Authenticate(s.username, s.password); err != nil {
		return err
	}

	if err := imap.SelectMailbox("INBOX"); err != nil {
		return err
	}

	sequences := make([]string, 0, len(uids))
	for _, uidStr := range uids {
		uid, err := strconv.Atoi(uidStr)
		if err != nil {
			continue
		}
		sequences = append(sequences, strconv.Itoa(uid))
	}

	if len(sequences) > 0 {
		seqStr := strings.Join(sequences, ",")
		if err := imap.DeleteMessages(seqStr); err != nil {
			return err
		}
	}

	return nil
}

func parseIMAPAddress(resp string) *models.EmailAddress {
	addr := &models.EmailAddress{}

	resp = strings.TrimSpace(resp)
	if resp == "NIL" {
		return addr
	}

	if strings.HasPrefix(resp, "(") && strings.HasSuffix(resp, ")") {
		resp = resp[1 : len(resp)-1]
	}

	parts := strings.Split(resp, " ")
	for i, part := range parts {
		part = strings.Trim(part, "()\"")
		if strings.Contains(part, "@") {
			addr.Email = part
			if i > 0 {
				name := strings.Join(parts[:i], " ")
				name = strings.Trim(name, "\"")
				if name != "" {
					addr.Name = name
				}
			}
			break
		}
	}

	return addr
}

func parseIMAPEnvelope(resp string) (from *models.EmailAddress, subject string, date time.Time) {
	from = &models.EmailAddress{}

	lines := strings.Split(resp, "\r\n")
	for _, line := range lines {
		line = strings.TrimSpace(line)
		if strings.HasPrefix(line, "Subject:") {
			subject = strings.TrimPrefix(line, "Subject:")
			subject = strings.TrimSpace(subject)
			subject = strings.Trim(subject, "\"")
		}
		if strings.HasPrefix(line, "From:") {
			fromStr := strings.TrimPrefix(line, "From:")
			from = parseIMAPAddress(fromStr)
		}
		if strings.HasPrefix(line, "Date:") {
			dateStr := strings.TrimPrefix(line, "Date:")
			dateStr = strings.TrimSpace(dateStr)
			if t, err := time.Parse(time.RFC1123Z, dateStr); err == nil {
				date = t
			} else if t, err := time.Parse(time.RFC1123, dateStr); err == nil {
				date = t
			} else if t, err := time.Parse("02 Jan 2006 15:04:05 -0700", dateStr); err == nil {
				date = t
			}
		}
	}

	return
}

func getFieldValue(body, field string) string {
	lines := strings.Split(body, "\r\n")
	for _, line := range lines {
		if strings.HasPrefix(strings.ToLower(line), strings.ToLower(field)+":") {
			return strings.TrimPrefix(line, field+":")
		}
	}
	return ""
}

func parseIMAPEmailListResponse(lines []string, limit int) []*models.Email {
	var emails []*models.Email

	for _, line := range lines {
		if !strings.Contains(line, "FETCH") {
			continue
		}

		email := &models.Email{}

		if strings.Contains(line, "\\Seen") {
			email.IsRead = true
		}
		if strings.Contains(line, "\\Flagged") {
			email.IsFlagged = true
			email.IsStarred = true
		}

		from := getFieldValue(line, "From")
		if from != "" {
			email.From = parseIMAPAddress(from)
		}

		email.Subject = getFieldValue(line, "Subject")
		if email.Subject == "" {
			email.Subject = "(No Subject)"
		}

		dateStr := getFieldValue(line, "Date")
		if dateStr != "" {
			if t, err := time.Parse(time.RFC1123Z, dateStr); err == nil {
				email.Date = t
			} else if t, err := time.Parse(time.RFC1123, dateStr); err == nil {
				email.Date = t
			}
		}

		if email.Date.IsZero() {
			email.Date = time.Now()
		}

		email.ID = strconv.FormatInt(time.Now().UnixNano(), 10)

		if len(emails) < limit {
			emails = append(emails, email)
		}
	}

	return emails
}
