package services

import (
	"bufio"
	"crypto/tls"
	"fmt"
	"io"
	"net"
	"net/textproto"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/skygenesisenterprise/aether-mail/server/src/models"
)

type POP3Service struct {
	host      string
	port      int
	useTLS    bool
	conn      net.Conn
	reader    *textproto.Reader
	isAuth    bool
	isUpdated bool
	username  string
	messages  map[int]*POP3MessageInfo
}

type POP3MessageInfo struct {
	MessageNum int
	UniqueID   string
	Size       int64
	Downloaded bool
}

func NewPOP3Service() *POP3Service {
	return &POP3Service{
		messages: make(map[int]*POP3MessageInfo),
	}
}

func (s *POP3Service) Connect(host string, port int) error {
	s.host = host
	s.port = port

	addr := fmt.Sprintf("%s:%d", host, port)
	conn, err := net.DialTimeout("tcp", addr, 30*time.Second)
	if err != nil {
		return fmt.Errorf("failed to connect to POP3 server: %w", err)
	}

	s.conn = conn
	s.reader = textproto.NewReader(bufio.NewReader(conn))

	resp, err := s.reader.ReadLine()
	if err != nil {
		return fmt.Errorf("failed to read greeting: %w", err)
	}

	if !strings.HasPrefix(resp, "+OK") {
		return fmt.Errorf("unexpected greeting: %s", resp)
	}

	return nil
}

func (s *POP3Service) ConnectTLS(host string, port int) error {
	s.host = host
	s.port = port

	addr := fmt.Sprintf("%s:%d", host, port)
	conn, err := tls.Dial("tcp", addr, &tls.Config{
		ServerName: host,
	})
	if err != nil {
		return fmt.Errorf("failed to connect to POP3 server: %w", err)
	}

	s.conn = conn
	s.reader = textproto.NewReader(bufio.NewReader(conn))
	s.useTLS = true

	resp, err := s.reader.ReadLine()
	if err != nil {
		return fmt.Errorf("failed to read greeting: %w", err)
	}

	if !strings.HasPrefix(resp, "+OK") {
		return fmt.Errorf("unexpected greeting: %s", resp)
	}

	return nil
}

func (s *POP3Service) Authenticate(username, password string) error {
	s.username = username

	cmd := fmt.Sprintf("USER %s", username)
	if err := s.sendCommand(cmd); err != nil {
		return fmt.Errorf("USER command failed: %w", err)
	}

	resp, err := s.reader.ReadLine()
	if err != nil {
		return fmt.Errorf("failed to read USER response: %w", err)
	}

	if !strings.HasPrefix(resp, "+OK") {
		return fmt.Errorf("USER rejected: %s", resp)
	}

	cmd = fmt.Sprintf("PASS %s", password)
	if err := s.sendCommand(cmd); err != nil {
		return fmt.Errorf("PASS command failed: %w", err)
	}

	resp, err = s.reader.ReadLine()
	if err != nil {
		return fmt.Errorf("failed to read PASS response: %w", err)
	}

	if !strings.HasPrefix(resp, "+OK") {
		return fmt.Errorf("PASS rejected: %s", resp)
	}

	s.isAuth = true
	return nil
}

func (s *POP3Service) AuthenticateAPOP(username, password string) error {
	s.username = username

	cmd := fmt.Sprintf("APOP %s %s", username, password)
	if err := s.sendCommand(cmd); err != nil {
		return fmt.Errorf("APOP command failed: %w", err)
	}

	resp, err := s.reader.ReadLine()
	if err != nil {
		return fmt.Errorf("failed to read APOP response: %w", err)
	}

	if !strings.HasPrefix(resp, "+OK") {
		return fmt.Errorf("APOP rejected: %s", resp)
	}

	s.isAuth = true
	return nil
}

func (s *POP3Service) Disconnect() error {
	if s.conn != nil {
		s.Quit()
		s.conn.Close()
		s.conn = nil
	}
	return nil
}

func (s *POP3Service) IsConnected() bool {
	return s.conn != nil
}

func (s *POP3Service) Stat() (*POP3Stat, error) {
	if !s.isAuth {
		return nil, fmt.Errorf("not authenticated")
	}

	cmd := "STAT"
	if err := s.sendCommand(cmd); err != nil {
		return nil, fmt.Errorf("STAT command failed: %w", err)
	}

	resp, err := s.reader.ReadLine()
	if err != nil {
		return nil, fmt.Errorf("failed to read STAT response: %w", err)
	}

	if !strings.HasPrefix(resp, "+OK") {
		return nil, fmt.Errorf("STAT rejected: %s", resp)
	}

	parts := strings.Split(resp, " ")
	if len(parts) < 3 {
		return nil, fmt.Errorf("invalid STAT response: %s", resp)
	}

	messages, _ := strconv.ParseInt(parts[1], 10, 64)
	octets, _ := strconv.ParseInt(parts[2], 10, 64)

	return &POP3Stat{
		Messages: messages,
		Octets:   octets,
	}, nil
}

func (s *POP3Service) List() ([]*POP3MessageInfo, error) {
	if !s.isAuth {
		return nil, fmt.Errorf("not authenticated")
	}

	cmd := "LIST"
	if err := s.sendCommand(cmd); err != nil {
		return nil, fmt.Errorf("LIST command failed: %w", err)
	}

	var messages []*POP3MessageInfo
	for {
		resp, err := s.reader.ReadLine()
		if err != nil {
			return nil, fmt.Errorf("failed to read LIST response: %w", err)
		}

		if strings.HasPrefix(resp, ".") {
			break
		}

		if strings.HasPrefix(resp, "+OK") {
			continue
		}

		parts := strings.Split(resp, " ")
		if len(parts) >= 2 {
			msgNum, _ := strconv.Atoi(parts[0])
			size, _ := strconv.ParseInt(parts[1], 10, 64)
			info := &POP3MessageInfo{
				MessageNum: msgNum,
				Size:       size,
			}
			messages = append(messages, info)
			s.messages[msgNum] = info
		}
	}

	return messages, nil
}

func (s *POP3Service) Uidl() ([]*POP3UID, error) {
	if !s.isAuth {
		return nil, fmt.Errorf("not authenticated")
	}

	cmd := "UIDL"
	if err := s.sendCommand(cmd); err != nil {
		return nil, fmt.Errorf("UIDL command failed: %w", err)
	}

	var uids []*POP3UID
	for {
		resp, err := s.reader.ReadLine()
		if err != nil {
			return nil, fmt.Errorf("failed to read UIDL response: %w", err)
		}

		if strings.HasPrefix(resp, ".") {
			break
		}

		if strings.HasPrefix(resp, "+OK") {
			continue
		}

		parts := strings.Split(resp, " ")
		if len(parts) >= 2 {
			msgNum, _ := strconv.Atoi(parts[0])
			uid := &POP3UID{
				MessageNum: msgNum,
				UniqueID:   parts[1],
			}
			uids = append(uids, uid)

			if info, ok := s.messages[msgNum]; ok {
				info.UniqueID = parts[1]
			}
		}
	}

	return uids, nil
}

func (s *POP3Service) Retr(messageNum int) (*models.Email, error) {
	if !s.isAuth {
		return nil, fmt.Errorf("not authenticated")
	}

	cmd := fmt.Sprintf("RETR %d", messageNum)
	if err := s.sendCommand(cmd); err != nil {
		return nil, fmt.Errorf("RETR command failed: %w", err)
	}

	email := &models.Email{}

	resp, err := s.reader.ReadLine()
	if err != nil {
		return nil, fmt.Errorf("failed to read RETR response: %w", err)
	}

	if !strings.HasPrefix(resp, "+OK") {
		return nil, fmt.Errorf("RETR rejected: %s", resp)
	}

	var body strings.Builder
	for {
		line, err := s.reader.ReadLine()
		if err != nil {
			return nil, fmt.Errorf("failed to read email body: %w", err)
		}

		if line == "." {
			break
		}

		if strings.HasPrefix(line, "..") {
			line = line[1:]
		}

		body.WriteString(line)
		body.WriteString("\r\n")
	}

	email.Body = body.String()
	s.messages[messageNum].Downloaded = true

	return email, nil
}

func (s *POP3Service) Top(messageNum int, lines int) ([]byte, error) {
	if !s.isAuth {
		return nil, fmt.Errorf("not authenticated")
	}

	cmd := fmt.Sprintf("TOP %d %d", messageNum, lines)
	if err := s.sendCommand(cmd); err != nil {
		return nil, fmt.Errorf("TOP command failed: %w", err)
	}

	var body strings.Builder
	for {
		line, err := s.reader.ReadLine()
		if err != nil {
			return nil, fmt.Errorf("failed to read TOP response: %w", err)
		}

		if line == "." {
			break
		}

		if strings.HasPrefix(line, "..") {
			line = line[1:]
		}

		body.WriteString(line)
		body.WriteString("\r\n")
	}

	return []byte(body.String()), nil
}

func (s *POP3Service) Dele(messageNum int) error {
	if !s.isAuth {
		return fmt.Errorf("not authenticated")
	}

	cmd := fmt.Sprintf("DELE %d", messageNum)
	if err := s.sendCommand(cmd); err != nil {
		return fmt.Errorf("DELE command failed: %w", err)
	}

	resp, err := s.reader.ReadLine()
	if err != nil {
		return fmt.Errorf("failed to read DELE response: %w", err)
	}

	if !strings.HasPrefix(resp, "+OK") {
		return fmt.Errorf("DELE rejected: %s", resp)
	}

	delete(s.messages, messageNum)
	s.isUpdated = true

	return nil
}

func (s *POP3Service) Noop() error {
	if !s.isAuth {
		return fmt.Errorf("not authenticated")
	}

	cmd := "NOOP"
	if err := s.sendCommand(cmd); err != nil {
		return fmt.Errorf("NOOP command failed: %w", err)
	}

	resp, err := s.reader.ReadLine()
	if err != nil {
		return fmt.Errorf("failed to read NOOP response: %w", err)
	}

	if !strings.HasPrefix(resp, "+OK") {
		return fmt.Errorf("NOOP rejected: %s", resp)
	}

	return nil
}

func (s *POP3Service) Reset() error {
	if !s.isAuth {
		return fmt.Errorf("not authenticated")
	}

	cmd := "RSET"
	if err := s.sendCommand(cmd); err != nil {
		return fmt.Errorf("RSET command failed: %w", err)
	}

	resp, err := s.reader.ReadLine()
	if err != nil {
		return fmt.Errorf("failed to read RSET response: %w", err)
	}

	if !strings.HasPrefix(resp, "+OK") {
		return fmt.Errorf("RSET rejected: %s", resp)
	}

	s.isUpdated = false

	return nil
}

func (s *POP3Service) Quit() error {
	if s.conn == nil {
		return nil
	}

	cmd := "QUIT"
	if err := s.sendCommand(cmd); err != nil {
		return fmt.Errorf("QUIT command failed: %w", err)
	}

	resp, err := s.reader.ReadLine()
	if err != nil && err != io.EOF {
		return fmt.Errorf("failed to read QUIT response: %w", err)
	}

	if resp != "" && !strings.HasPrefix(resp, "+OK") {
		return fmt.Errorf("QUIT rejected: %s", resp)
	}

	return nil
}

func (s *POP3Service) sendCommand(cmd string) error {
	_, err := fmt.Fprintf(s.conn, "%s\r\n", cmd)
	return err
}

func (s *POP3Service) GetMessageInfo(messageNum int) (*POP3MessageInfo, error) {
	if info, ok := s.messages[messageNum]; ok {
		return info, nil
	}
	return nil, fmt.Errorf("message not found")
}

func (s *POP3Service) GetMessageCount() int {
	return len(s.messages)
}

func (s *POP3Service) GetTotalSize() int64 {
	var total int64
	for _, msg := range s.messages {
		total += msg.Size
	}
	return total
}

func (s *POP3Service) GetUndownloadedMessages() []*POP3MessageInfo {
	var undownloaded []*POP3MessageInfo
	for _, msg := range s.messages {
		if !msg.Downloaded {
			undownloaded = append(undownloaded, msg)
		}
	}
	return undownloaded
}

func (s *POP3Service) IsUpdated() bool {
	return s.isUpdated
}

func (s *POP3Service) GetLastCommand() string {
	return ""
}

var (
	pop3Pool   sync.Pool
	pop3PoolMu sync.Mutex
)

func GetPOP3FromPool() *POP3Service {
	pop3PoolMu.Lock()
	defer pop3PoolMu.Unlock()

	if p := pop3Pool.Get(); p != nil {
		return p.(*POP3Service)
	}
	return NewPOP3Service()
}

func ReturnPOP3ToPool(s *POP3Service) {
	pop3PoolMu.Lock()
	defer pop3PoolMu.Unlock()

	s.conn = nil
	s.isAuth = false
	s.username = ""
	s.messages = make(map[int]*POP3MessageInfo)
	pop3Pool.Put(s)
}

type POP3Stat struct {
	Messages int64
	Octets   int64
}

type POP3UID struct {
	MessageNum int
	UniqueID   string
}
