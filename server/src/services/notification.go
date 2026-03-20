package services

import (
	"sync"
	"time"

	"github.com/skygenesisenterprise/aether-mail/server/src/models"
)

type NotificationService struct {
	stalwart      *StalwartService
	realtimeHub   *RealtimeHub
	cache         map[string]*models.NotificationList
	cacheMu       sync.RWMutex
	unreadCount   map[string]int64
	unreadCountMu sync.RWMutex
}

type RealtimeHub struct {
	clients    map[string]chan *models.WebhookPayload
	mu         sync.RWMutex
	register   chan *Client
	unregister chan *Client
}

type Client struct {
	AccountID string
	Channel   chan *models.WebhookPayload
}

func NewRealtimeHub() *RealtimeHub {
	hub := &RealtimeHub{
		clients:    make(map[string]chan *models.WebhookPayload),
		register:   make(chan *Client),
		unregister: make(chan *Client),
	}
	go hub.run()
	return hub
}

func (h *RealtimeHub) run() {
	for {
		select {
		case client := <-h.register:
			h.mu.Lock()
			h.clients[client.AccountID] = client.Channel
			h.mu.Unlock()

		case client := <-h.unregister:
			h.mu.Lock()
			if ch, ok := h.clients[client.AccountID]; ok && ch == client.Channel {
				delete(h.clients, client.AccountID)
				close(client.Channel)
			}
			h.mu.Unlock()
		}
	}
}

func (h *RealtimeHub) Register(accountID string) chan *models.WebhookPayload {
	channel := make(chan *models.WebhookPayload, 100)
	h.register <- &Client{AccountID: accountID, Channel: channel}
	return channel
}

func (h *RealtimeHub) Unregister(accountID string, channel chan *models.WebhookPayload) {
	h.unregister <- &Client{AccountID: accountID, Channel: channel}
}

func (h *RealtimeHub) Broadcast(accountID string, payload *models.WebhookPayload) {
	h.mu.RLock()
	if ch, ok := h.clients[accountID]; ok {
		select {
		case ch <- payload:
		default:
		}
	}
	h.mu.RUnlock()
}

func NewNotificationService(stalwart *StalwartService) *NotificationService {
	return &NotificationService{
		stalwart:    stalwart,
		realtimeHub: NewRealtimeHub(),
		cache:       make(map[string]*models.NotificationList),
		unreadCount: make(map[string]int64),
	}
}

func (s *NotificationService) GetNotifications(accountID string, limit, offset int) (*models.NotificationList, error) {
	if limit == 0 {
		limit = 50
	}

	notifications, err := s.stalwart.GetNotifications(accountID, limit, offset)
	if err != nil {
		return nil, err
	}

	s.cacheMu.Lock()
	s.cache[accountID] = notifications
	s.unreadCount[accountID] = notifications.TotalUnread
	s.cacheMu.Unlock()

	return notifications, nil
}

func (s *NotificationService) GetUnreadCount(accountID string) int64 {
	s.unreadCountMu.RLock()
	count, ok := s.unreadCount[accountID]
	s.unreadCountMu.RUnlock()

	if !ok {
		notifications, err := s.GetNotifications(accountID, 1, 0)
		if err == nil {
			count = notifications.TotalUnread
		}
	}

	return count
}

func (s *NotificationService) MarkAsRead(accountID string, notificationIDs []string) error {
	err := s.stalwart.MarkNotificationsRead(accountID, notificationIDs)
	if err != nil {
		return err
	}

	s.unreadCountMu.Lock()
	if count, ok := s.unreadCount[accountID]; ok {
		delta := int64(len(notificationIDs))
		if delta > count {
			s.unreadCount[accountID] = 0
		} else {
			s.unreadCount[accountID] = count - delta
		}
	}
	s.unreadCountMu.Unlock()

	s.clearCache(accountID)

	return nil
}

func (s *NotificationService) MarkAllAsRead(accountID string) error {
	notifications, err := s.GetNotifications(accountID, 1000, 0)
	if err != nil {
		return err
	}

	ids := make([]string, len(notifications.Notifications))
	for i, n := range notifications.Notifications {
		ids[i] = n.ID
	}

	if len(ids) > 0 {
		err = s.stalwart.MarkNotificationsRead(accountID, ids)
		if err != nil {
			return err
		}
	}

	s.unreadCountMu.Lock()
	s.unreadCount[accountID] = 0
	s.unreadCountMu.Unlock()

	s.clearCache(accountID)

	return nil
}

func (s *NotificationService) DismissNotification(accountID, notificationID string) error {
	err := s.stalwart.DismissNotification(accountID, notificationID)
	if err != nil {
		return err
	}

	s.clearCache(accountID)

	return nil
}

func (s *NotificationService) Subscribe(accountID string) chan *models.WebhookPayload {
	return s.realtimeHub.Register(accountID)
}

func (s *NotificationService) Unsubscribe(accountID string, channel chan *models.WebhookPayload) {
	s.realtimeHub.Unregister(accountID, channel)
}

func (s *NotificationService) SendNotification(accountID string, notificationType string, data interface{}) {
	payload := &models.WebhookPayload{
		Type:      notificationType,
		AccountID: accountID,
		Data:      data,
	}
	s.realtimeHub.Broadcast(accountID, payload)
}

func (s *NotificationService) clearCache(accountID string) {
	s.cacheMu.Lock()
	delete(s.cache, accountID)
	s.cacheMu.Unlock()
}

func (s *NotificationService) ClearAllCache() {
	s.cacheMu.Lock()
	s.cache = make(map[string]*models.NotificationList)
	s.cacheMu.Unlock()

	s.unreadCountMu.Lock()
	s.unreadCount = make(map[string]int64)
	s.unreadCountMu.Unlock()
}

func (s *NotificationService) CreateNotification(accountID, notifType, title, body, emailID, senderEmail string) *models.Notification {
	notification := &models.Notification{
		ID:          generateID(),
		AccountID:   accountID,
		Type:        notifType,
		Title:       title,
		Body:        body,
		EmailID:     emailID,
		SenderEmail: senderEmail,
		IsRead:      false,
		IsDismissed: false,
		CreatedAt:   time.Now(),
	}

	s.SendNotification(accountID, "new_notification", notification)

	return notification
}

func generateID() string {
	return time.Now().Format("20060102150405.000000")
}
