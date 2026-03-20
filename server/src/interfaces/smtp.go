package interfaces

import (
	"github.com/skygenesisenterprise/aether-mail/server/src/models"
)

type SMTPClient interface {
	Connect(host string, port int, useTLS bool) error
	Authenticate(username, password string) error
	Disconnect() error
	IsConnected() bool

	SendEmail(from *models.EmailAddress, to []*models.EmailAddress, data []byte) (string, error)
	SendMail(from *models.EmailAddress, to []*models.EmailAddress, msg *models.Email) (string, error)
	StartTLS() error
	Reset() error
	Quit() error
	Noop() error
}

type SMTPResponse struct {
	StatusCode int
	Message    string
	Response   string
	Error      error
}

type SMTPMessage struct {
	From        *models.EmailAddress
	To          []*models.EmailAddress
	Cc          []*models.EmailAddress
	Bcc         []*models.EmailAddress
	Subject     string
	Body        string
	BodyHTML    string
	Headers     map[string]string
	Attachments []*models.Attachment
}

type SMTPEnvelope struct {
	From    string
	To      []string
	Message []byte
}

type SMTPCommand struct {
	Command  string
	Args     []interface{}
	Response chan *SMTPResponse
}

type SMTPSession struct {
	UserID          string
	AccountID       string
	AuthenticatedAt string
	RemoteAddr      string
	LocalAddr       string
}

type SMTPServer interface {
	Start(port int) error
	Stop() error
	GetClient() SMTPClient
	HandleConnection(conn interface{}) error
}

type SMTPHandler interface {
	HandleConnect(server *SMTPServer, conn interface{}) error
	HandleAuth(server *SMTPServer, conn interface{}, username, password string) error
	HandleMessage(server *SMTPServer, conn interface{}, envelope *SMTPEnvelope) error
	HandleDisconnect(server *SMTPServer, conn interface{}) error
}
