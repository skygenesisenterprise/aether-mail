package interfaces

import (
	"github.com/skygenesisenterprise/aether-mail/server/src/models"
)

type POP3Client interface {
	Connect(host string, port int) error
	Authenticate(username, password string) error
	Disconnect() error
	IsConnected() bool

	Stat() (*POP3Stat, error)
	List() ([]*POP3MessageInfo, error)
	Uidl() ([]*POP3UID, error)

	Retr(messageNum int) (*models.Email, error)
	Top(messageNum int, lines int) ([]byte, error)
	Dele(messageNum int) error

	Noop() error
	Reset() error
	Quit() error
}

type POP3Stat struct {
	Messages int64
	Octets   int64
}

type POP3MessageInfo struct {
	MessageNum int
	Octets     int64
}

type POP3UID struct {
	MessageNum int
	UniqueID   string
}

type POP3Response struct {
	Status  string
	Message string
	Data    interface{}
	Error   error
}

type POP3Command struct {
	Command  string
	Args     []interface{}
	Response chan *POP3Response
}

type POP3Session struct {
	UserID          string
	AccountID       string
	Messages        []*POP3MessageInfo
	Deleted         map[int]bool
	AuthenticatedAt string
	RemoteAddr      string
}

type POP3Server interface {
	Start(port int) error
	Stop() error
	GetClient() POP3Client
	HandleConnection(conn interface{}) error
}

type POP3Handler interface {
	HandleConnect(server *POP3Server, conn interface{}) error
	HandleAuth(server *POP3Server, conn interface{}, username, password string) error
	HandleCommand(server *POP3Server, conn interface{}, cmd *POP3Command) error
	HandleDisconnect(server *POP3Server, conn interface{}) error
}

type POP3Capabilities struct {
	User            bool
	Top             bool
	LoginDelay      int
	UIDL            bool
	PIPELINING      bool
	SASL            []string
	RespCodes       bool
	NetNews         bool
	Private         bool
	MultiRecipients bool
	BINARYMIME      bool
	CHUNKING        bool
	EightBitMIME    bool
}

const (
	POP3_OK  = "+OK"
	POP3_ERR = "-ERR"
)
