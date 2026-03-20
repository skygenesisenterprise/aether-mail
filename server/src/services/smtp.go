package services

import (
	"crypto/tls"
	"encoding/base64"
	"fmt"
	"io"
	"net"
	"net/smtp"
	"strings"
	"sync"
	"time"

	"github.com/skygenesisenterprise/aether-mail/server/src/models"
)

type SMTPService struct {
	host     string
	port     int
	useTLS   bool
	conn     net.Conn
	reader   io.Reader
	isAuth   bool
	username string
	authType string
}

func NewSMTPService() *SMTPService {
	return &SMTPService{}
}

func (s *SMTPService) Connect(host string, port int, useTLS bool) error {
	s.host = host
	s.port = port
	s.useTLS = useTLS

	addr := fmt.Sprintf("%s:%d", host, port)
	conn, err := net.DialTimeout("tcp", addr, 30*time.Second)
	if err != nil {
		return fmt.Errorf("failed to connect to SMTP server: %w", err)
	}

	s.conn = conn
	s.reader = conn

	reader := io.Reader(conn)
	s.reader = reader

	buffer := make([]byte, 1024)
	conn.SetReadDeadline(time.Now().Add(30 * time.Second))
	n, err := conn.Read(buffer)
	if err != nil && err != io.EOF {
		return fmt.Errorf("failed to read greeting: %w", err)
	}

	resp := string(buffer[:n])
	if !strings.HasPrefix(resp, "220") {
		return fmt.Errorf("unexpected greeting: %s", resp)
	}

	if useTLS {
		if err := s.StartTLS(); err != nil {
			return fmt.Errorf("STARTTLS failed: %w", err)
		}
	}

	return nil
}

func (s *SMTPService) Authenticate(username, password string) error {
	s.username = username

	auth := smtp.PlainAuth("", username, password, s.host)

	err := smtp.SendMail(s.host+":"+fmt.Sprintf("%d", s.port), auth, username, []string{}, []byte(""))
	if err != nil {
		if strings.Contains(err.Error(), "authentication") {
			return fmt.Errorf("authentication failed: %w", err)
		}
	}

	s.isAuth = true
	return nil
}

func (s *SMTPService) Disconnect() error {
	if s.conn != nil {
		s.Quit()
		s.conn.Close()
		s.conn = nil
	}
	return nil
}

func (s *SMTPService) IsConnected() bool {
	return s.conn != nil
}

func (s *SMTPService) SendEmail(from *models.EmailAddress, to []*models.EmailAddress, data []byte) (string, error) {
	if !s.isAuth {
		return "", fmt.Errorf("not authenticated")
	}

	fromAddr := from.Email
	toAddrs := make([]string, len(to))
	for i, t := range to {
		toAddrs[i] = t.Email
	}

	err := smtp.SendMail(s.host+":"+fmt.Sprintf("%d", s.port), nil, fromAddr, toAddrs, data)
	if err != nil {
		return "", fmt.Errorf("failed to send email: %w", err)
	}

	return fmt.Sprintf("<%d.%d@%s>", time.Now().Unix(), time.Now().UnixNano(), s.host), nil
}

func (s *SMTPService) SendMail(from *models.EmailAddress, to []*models.EmailAddress, msg *models.Email) (string, error) {
	if !s.isAuth {
		return "", fmt.Errorf("not authenticated")
	}

	fromAddr := from.Email
	toAddrs := make([]string, len(to))
	for i, t := range to {
		toAddrs[i] = t.Email
	}

	var data []byte
	if msg.BodyHTML != "" {
		headers := make(map[string]string)
		headers["From"] = fromAddr
		headers["To"] = strings.Join(toAddrs, ", ")
		if msg.Subject != "" {
			headers["Subject"] = msg.Subject
		}
		headers["MIME-Version"] = "1.0"
		headers["Content-Type"] = "text/html; charset=\"utf-8\""

		data = formatMessage(headers, msg.BodyHTML)
	} else if msg.Body != "" {
		headers := make(map[string]string)
		headers["From"] = fromAddr
		headers["To"] = strings.Join(toAddrs, ", ")
		if msg.Subject != "" {
			headers["Subject"] = msg.Subject
		}
		headers["Content-Type"] = "text/plain; charset=\"utf-8\""

		data = formatMessage(headers, msg.Body)
	}

	err := smtp.SendMail(s.host+":"+fmt.Sprintf("%d", s.port), nil, fromAddr, toAddrs, data)
	if err != nil {
		return "", fmt.Errorf("failed to send email: %w", err)
	}

	return fmt.Sprintf("<%d.%d@%s>", time.Now().Unix(), time.Now().UnixNano(), s.host), nil
}

func (s *SMTPService) StartTLS() error {
	if s.conn == nil {
		return fmt.Errorf("not connected")
	}

	_, err := fmt.Fprintf(s.conn, "STARTTLS\r\n")
	if err != nil {
		return fmt.Errorf("failed to send STARTTLS: %w", err)
	}

	resp := make([]byte, 1024)
	s.conn.SetReadDeadline(time.Now().Add(30 * time.Second))
	n, err := s.conn.Read(resp)
	if err != nil {
		return fmt.Errorf("failed to read STARTTLS response: %w", err)
	}

	response := string(resp[:n])
	if !strings.HasPrefix(response, "220") {
		return fmt.Errorf("STARTTLS rejected: %s", response)
	}

	tlsConn := tls.Client(s.conn, &tls.Config{
		ServerName: s.host,
	})
	if err != nil {
		return fmt.Errorf("TLS handshake failed: %w", err)
	}

	if err := tlsConn.Handshake(); err != nil {
		return fmt.Errorf("TLS handshake failed: %w", err)
	}

	s.conn = tlsConn
	s.reader = tlsConn

	return nil
}

func (s *SMTPService) Reset() error {
	if s.conn == nil {
		return fmt.Errorf("not connected")
	}

	_, err := fmt.Fprintf(s.conn, "RSET\r\n")
	if err != nil {
		return fmt.Errorf("failed to send RSET: %w", err)
	}

	resp := make([]byte, 1024)
	s.conn.SetReadDeadline(time.Now().Add(30 * time.Second))
	n, err := s.conn.Read(resp)
	if err != nil {
		return fmt.Errorf("failed to read RSET response: %w", err)
	}

	response := string(resp[:n])
	if !strings.HasPrefix(response, "250") {
		return fmt.Errorf("RSET rejected: %s", response)
	}

	return nil
}

func (s *SMTPService) Quit() error {
	if s.conn == nil {
		return nil
	}

	_, err := fmt.Fprintf(s.conn, "QUIT\r\n")
	if err != nil {
		return fmt.Errorf("failed to send QUIT: %w", err)
	}

	resp := make([]byte, 1024)
	s.conn.SetReadDeadline(time.Now().Add(30 * time.Second))
	s.conn.Read(resp)

	return nil
}

func (s *SMTPService) Noop() error {
	if s.conn == nil {
		return fmt.Errorf("not connected")
	}

	_, err := fmt.Fprintf(s.conn, "NOOP\r\n")
	if err != nil {
		return fmt.Errorf("failed to send NOOP: %w", err)
	}

	resp := make([]byte, 1024)
	s.conn.SetReadDeadline(time.Now().Add(30 * time.Second))
	n, err := s.conn.Read(resp)
	if err != nil {
		return fmt.Errorf("failed to read NOOP response: %w", err)
	}

	response := string(resp[:n])
	if !strings.HasPrefix(response, "250") {
		return fmt.Errorf("NOOP rejected: %s", response)
	}

	return nil
}

func formatMessage(headers map[string]string, body string) []byte {
	var result strings.Builder
	for k, v := range headers {
		result.WriteString(fmt.Sprintf("%s: %s\r\n", k, v))
	}
	result.WriteString("\r\n")
	result.WriteString(body)
	return []byte(result.String())
}

func (s *SMTPService) AuthLogin() error {
	s.authType = "login"

	_, err := fmt.Fprintf(s.conn, "AUTH LOGIN\r\n")
	if err != nil {
		return fmt.Errorf("failed to send AUTH LOGIN: %w", err)
	}

	resp := make([]byte, 1024)
	s.conn.SetReadDeadline(time.Now().Add(30 * time.Second))
	n, err := s.conn.Read(resp)
	if err != nil {
		return fmt.Errorf("failed to read AUTH LOGIN response: %w", err)
	}

	response := string(resp[:n])
	if !strings.HasPrefix(response, "334") {
		return fmt.Errorf("AUTH LOGIN rejected: %s", response)
	}

	return nil
}

func (s *SMTPService) AuthSendUsername(username string) error {
	encoded := base64.StdEncoding.EncodeToString([]byte(username))
	_, err := fmt.Fprintf(s.conn, "%s\r\n", encoded)
	if err != nil {
		return fmt.Errorf("failed to send username: %w", err)
	}

	resp := make([]byte, 1024)
	s.conn.SetReadDeadline(time.Now().Add(30 * time.Second))
	n, err := s.conn.Read(resp)
	if err != nil {
		return fmt.Errorf("failed to read username response: %w", err)
	}

	response := string(resp[:n])
	if !strings.HasPrefix(response, "334") {
		return fmt.Errorf("username rejected: %s", response)
	}

	return nil
}

func (s *SMTPService) AuthSendPassword(password string) error {
	encoded := base64.StdEncoding.EncodeToString([]byte(password))
	_, err := fmt.Fprintf(s.conn, "%s\r\n", encoded)
	if err != nil {
		return fmt.Errorf("failed to send password: %w", err)
	}

	resp := make([]byte, 1024)
	s.conn.SetReadDeadline(time.Now().Add(30 * time.Second))
	n, err := s.conn.Read(resp)
	if err != nil {
		return fmt.Errorf("failed to read password response: %w", err)
	}

	response := string(resp[:n])
	if strings.HasPrefix(response, "535") {
		return fmt.Errorf("authentication failed: %s", response)
	}

	s.isAuth = true
	return nil
}

func (s *SMTPService) SendCommand(cmd string) (string, error) {
	if s.conn == nil {
		return "", fmt.Errorf("not connected")
	}

	_, err := fmt.Fprintf(s.conn, "%s\r\n", cmd)
	if err != nil {
		return "", fmt.Errorf("failed to send command: %w", err)
	}

	resp := make([]byte, 4096)
	s.conn.SetReadDeadline(time.Now().Add(60 * time.Second))
	n, err := s.conn.Read(resp)
	if err != nil {
		return "", fmt.Errorf("failed to read response: %w", err)
	}

	return string(resp[:n]), nil
}

func (s *SMTPService) GetCapabilities() ([]string, error) {
	if s.conn == nil {
		return nil, fmt.Errorf("not connected")
	}

	_, err := fmt.Fprintf(s.conn, "EHLO localhost\r\n")
	if err != nil {
		return nil, fmt.Errorf("failed to send EHLO: %w", err)
	}

	var caps []string
	buffer := make([]byte, 4096)

	for {
		s.conn.SetReadDeadline(time.Now().Add(30 * time.Second))
		n, err := s.conn.Read(buffer)
		if err != nil {
			return nil, fmt.Errorf("failed to read EHLO response: %w", err)
		}

		lines := strings.Split(string(buffer[:n]), "\r\n")
		for _, line := range lines {
			if strings.HasPrefix(line, "250-") || strings.HasPrefix(line, "250 ") {
				parts := strings.SplitN(line, " ", 2)
				if len(parts) > 1 {
					caps = append(caps, parts[1])
				}
			}
			if strings.HasPrefix(line, "220") {
				break
			}
		}
		break
	}

	return caps, nil
}

var (
	smtpPool   sync.Pool
	smtpPoolMu sync.Mutex
)

func GetSMTPFromPool() *SMTPService {
	smtpPoolMu.Lock()
	defer smtpPoolMu.Unlock()

	if p := smtpPool.Get(); p != nil {
		return p.(*SMTPService)
	}
	return NewSMTPService()
}

func ReturnSMTPToPool(s *SMTPService) {
	smtpPoolMu.Lock()
	defer smtpPoolMu.Unlock()

	s.conn = nil
	s.isAuth = false
	s.username = ""
	smtpPool.Put(s)
}
