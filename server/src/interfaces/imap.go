package interfaces

import (
	"time"

	"github.com/skygenesisenterprise/aether-mail/server/src/models"
)

type IMAPClient interface {
	Connect(host string, port int, useTLS bool) error
	Authenticate(username, password string) error
	Disconnect() error
	IsConnected() bool

	ListMailboxes(reference, mailbox string) ([]*models.Folder, error)
	GetMailboxStatus(mailbox string) (*models.Folder, error)
	SelectMailbox(mailbox string) error

	ListMessages(sequence string, items []string) ([]*models.Email, error)
	FetchMessage(messageNum int, items []string) (*models.Email, error)
	SearchMessages(criteria string) ([]int, error)

	CopyMessages(sequence, mailbox string) error
	MoveMessages(sequence, mailbox string) error
	DeleteMessages(sequence string) error
	MarkMessagesSeen(sequence string) error
	MarkMessagesFlagged(sequence string) error

	CreateMailbox(mailbox string) error
	RenameMailbox(oldName, newName string) error
	DeleteMailbox(mailbox string) error
	SubscribeMailbox(mailbox string) error
	UnsubscribeMailbox(mailbox string) error

	GetQuota() (*QuotaInfo, error)
	GetACL(mailbox string) ([]*ACLEvent, error)
	SetACL(mailbox, identifier, rights string) error
	DeleteACL(mailbox, identifier string) error

	ID(params map[string]string) (map[string]string, error)

	Noop() error
	Check() error
	Expunge() error

	StartTLS() error
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

type IMAPResponse struct {
	Tag      string
	Response string
	Data     interface{}
	Error    error
}

type IMAPCommand struct {
	Tag      string
	Command  string
	Args     []interface{}
	Response chan *IMAPResponse
}

type IMAPSession struct {
	UserID          string
	AccountID       string
	Mailbox         string
	SeqNum          int
	AuthenticatedAt time.Time
	LastAccessAt    time.Time
}

type IMAPServer interface {
	Start(port int) error
	Stop() error
	GetClient() IMAPClient
	HandleConnection(conn interface{}) error
}

type IMAPHandler interface {
	HandleConnect(server *IMAPServer, conn interface{}) error
	HandleAuth(server *IMAPServer, conn interface{}, username, password string) error
	HandleCommand(server *IMAPServer, conn interface{}, cmd *IMAPCommand) error
	HandleDisconnect(server *IMAPServer, conn interface{}) error
}
