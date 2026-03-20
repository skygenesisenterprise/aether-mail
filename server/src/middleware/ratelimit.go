package middleware

import (
	"fmt"
	"math"
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
)

type RateLimiter struct {
	requests map[string]*requestInfo
	mu       sync.RWMutex
	limit    int
	window   time.Duration
}

type requestInfo struct {
	count     int
	resetTime time.Time
}

func NewRateLimiter(limit int, window time.Duration) gin.HandlerFunc {
	rl := &RateLimiter{
		requests: make(map[string]*requestInfo),
		limit:    limit,
		window:   window,
	}

	go rl.cleanup()

	return func(ctx *gin.Context) {
		key := ctx.ClientIP()

		rl.mu.Lock()
		info, exists := rl.requests[key]
		now := time.Now()

		if !exists || now.After(info.resetTime) {
			rl.requests[key] = &requestInfo{
				count:     1,
				resetTime: now.Add(window),
			}
			rl.mu.Unlock()
			ctx.Next()
			return
		}

		if info.count >= rl.limit {
			rl.mu.Unlock()
			retryAfter := math.Ceil(info.resetTime.Sub(now).Seconds())
			ctx.Header("Retry-After", fmt.Sprintf("%.0f", retryAfter))
			ctx.JSON(http.StatusTooManyRequests, gin.H{
				"success":     false,
				"error":       "Too many requests",
				"retry_after": retryAfter,
			})
			ctx.Abort()
			return
		}

		info.count++
		rl.mu.Unlock()
		ctx.Next()
	}
}

func (rl *RateLimiter) cleanup() {
	ticker := time.NewTicker(5 * time.Minute)
	for range ticker.C {
		rl.mu.Lock()
		now := time.Now()
		for key, info := range rl.requests {
			if now.After(info.resetTime) {
				delete(rl.requests, key)
			}
		}
		rl.mu.Unlock()
	}
}

type IPRateLimiter struct {
	rateLimiters map[string]*RateLimiter
	mu           sync.RWMutex
}

func NewIPRateLimiter() *IPRateLimiter {
	return &IPRateLimiter{
		rateLimiters: make(map[string]*RateLimiter),
	}
}

func (irl *IPRateLimiter) Get(key string, limit int, window time.Duration) gin.HandlerFunc {
	irl.mu.RLock()
	rl, exists := irl.rateLimiters[key]
	irl.mu.RUnlock()

	if !exists {
		irl.mu.Lock()
		rl = &RateLimiter{
			requests: make(map[string]*requestInfo),
			limit:    limit,
			window:   window,
		}
		irl.rateLimiters[key] = rl
		irl.mu.Unlock()
	}

	return rl.Handler()
}

func (rl *RateLimiter) Handler() gin.HandlerFunc {
	return NewRateLimiter(rl.limit, rl.window)
}
