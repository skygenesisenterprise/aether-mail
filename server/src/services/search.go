package services

import (
	"encoding/json"
	"fmt"
	"sync"
	"time"

	"github.com/skygenesisenterprise/aether-mail/server/src/models"
)

type SearchService struct {
	stalwart *StalwartService
	cache    *SearchCache
}

type SearchCache struct {
	mu    sync.RWMutex
	items map[string]*CachedSearch
}

type CachedSearch struct {
	Query   *models.SearchQuery
	Result  *models.SearchResult
	Expires time.Time
}

func NewSearchService(stalwart *StalwartService) *SearchService {
	return &SearchService{
		stalwart: stalwart,
		cache: &SearchCache{
			items: make(map[string]*CachedSearch),
		},
	}
}

func (s *SearchService) Search(query *models.SearchQuery) (*models.SearchResult, error) {
	startTime := time.Now()

	if query.Limit == 0 {
		query.Limit = 50
	}
	if query.Limit > 500 {
		query.Limit = 500
	}

	result, err := s.stalwart.Search(query)
	if err != nil {
		return nil, err
	}

	result.QueryTime = time.Since(startTime).Milliseconds()

	s.cacheResult(query, result)

	return result, nil
}

func (s *SearchService) QuickSearch(accountID, queryStr string, limit int) (*models.QuickSearchResult, error) {
	if limit == 0 {
		limit = 10
	}

	return s.stalwart.QuickSearch(accountID, queryStr, limit)
}

func (s *SearchService) SearchEmails(accountID, searchStr string, mailboxIDs []string, page, pageSize int) (*models.EmailList, error) {
	if pageSize == 0 {
		pageSize = 20
	}

	query := &models.EmailQuery{
		AccountID:  accountID,
		MailboxIDs: mailboxIDs,
		Sort: []models.SortOrder{
			{Property: "date", IsAscending: false},
		},
		Limit:  pageSize,
		Offset: (page - 1) * pageSize,
	}

	if searchStr != "" {
		query.Subject = searchStr
		query.Body = searchStr
	}

	return s.stalwart.GetEmails(query)
}

func (s *SearchService) SearchBySender(accountID, sender string, page, pageSize int) (*models.EmailList, error) {
	if pageSize == 0 {
		pageSize = 20
	}

	query := &models.EmailQuery{
		AccountID: accountID,
		From:      sender,
		Sort: []models.SortOrder{
			{Property: "date", IsAscending: false},
		},
		Limit:  pageSize,
		Offset: (page - 1) * pageSize,
	}

	return s.stalwart.GetEmails(query)
}

func (s *SearchService) SearchByDateRange(accountID string, startDate, endDate time.Time, mailboxIDs []string) (*models.EmailList, error) {
	query := &models.EmailQuery{
		AccountID:  accountID,
		MailboxIDs: mailboxIDs,
		DateAfter:  &startDate,
		DateBefore: &endDate,
		Sort: []models.SortOrder{
			{Property: "date", IsAscending: false},
		},
		Limit: 100,
	}

	return s.stalwart.GetEmails(query)
}

func (s *SearchService) SearchWithAttachments(accountID string, mailboxIDs []string, page, pageSize int) (*models.EmailList, error) {
	if pageSize == 0 {
		pageSize = 20
	}

	hasAttachment := true
	query := &models.EmailQuery{
		AccountID:     accountID,
		MailboxIDs:    mailboxIDs,
		HasAttachment: &hasAttachment,
		Sort: []models.SortOrder{
			{Property: "date", IsAscending: false},
		},
		Limit:  pageSize,
		Offset: (page - 1) * pageSize,
	}

	return s.stalwart.GetEmails(query)
}

func (s *SearchService) SearchContacts(accountID, query string) (*models.ContactList, error) {
	return s.stalwart.SearchContacts(accountID, query)
}

func (s *SearchService) AdvancedSearch(query *models.SearchQuery) (*models.SearchResult, error) {
	startTime := time.Now()

	queryJSON, _ := json.Marshal(query)
	cacheKey := fmt.Sprintf("%x", queryJSON)

	s.cache.mu.RLock()
	if cached, ok := s.cache.items[cacheKey]; ok {
		if time.Now().Before(cached.Expires) {
			s.cache.mu.RUnlock()
			return cached.Result, nil
		}
	}
	s.cache.mu.RUnlock()

	result, err := s.stalwart.Search(query)
	if err != nil {
		return nil, err
	}

	result.QueryTime = time.Since(startTime).Milliseconds()

	return result, nil
}

func (s *SearchService) cacheResult(query *models.SearchQuery, result *models.SearchResult) {
	queryJSON, _ := json.Marshal(query)
	cacheKey := fmt.Sprintf("%x", queryJSON)

	s.cache.mu.Lock()
	defer s.cache.mu.Unlock()

	s.cache.items[cacheKey] = &CachedSearch{
		Query:   query,
		Result:  result,
		Expires: time.Now().Add(5 * time.Minute),
	}
}

func (s *SearchService) ClearCache() {
	s.cache.mu.Lock()
	defer s.cache.mu.Unlock()

	s.cache.items = make(map[string]*CachedSearch)
}

func (s *SearchService) ClearUserCache(accountID string) {
	s.cache.mu.Lock()
	defer s.cache.mu.Unlock()

	for key, cached := range s.cache.items {
		if cached.Query.AccountID == accountID {
			delete(s.cache.items, key)
		}
	}
}
