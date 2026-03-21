package services

import (
	"sync"
)

type Session struct {
	UserID   string
	Email    string
	Password string
	IMAPHost string
	IMAPPort int
	SMTPHost string
	SMTPPort int
}

type SessionManager struct {
	sessions map[string]*Session
	mu       sync.RWMutex
}

var sessionManager *SessionManager
var once sync.Once

func GetSessionManager() *SessionManager {
	once.Do(func() {
		sessionManager = &SessionManager{
			sessions: make(map[string]*Session),
		}
	})
	return sessionManager
}

func (sm *SessionManager) SetSession(userID string, session *Session) {
	sm.mu.Lock()
	defer sm.mu.Unlock()
	sm.sessions[userID] = session
}

func (sm *SessionManager) GetSession(userID string) (*Session, bool) {
	sm.mu.RLock()
	defer sm.mu.RUnlock()
	session, ok := sm.sessions[userID]
	return session, ok
}

func (sm *SessionManager) DeleteSession(userID string) {
	sm.mu.Lock()
	defer sm.mu.Unlock()
	delete(sm.sessions, userID)
}
