package middleware

import (
	"context"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

type contextKey string

const requestIDKey contextKey = "request_id"

func TimeoutMiddleware(timeout time.Duration) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		_, cancel := context.WithTimeout(ctx.Request.Context(), timeout)
		defer cancel()

		finished := make(chan struct{})

		go func() {
			ctx.Next()
			close(finished)
		}()

		select {
		case <-finished:
			return
		case <-ctx.Request.Context().Done():
			ctx.JSON(http.StatusGatewayTimeout, gin.H{
				"success":    false,
				"error":      "Request timeout",
				"request_id": ctx.GetString("request_id"),
			})
			ctx.Abort()
		}
	}
}

func RequestIDMiddleware() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		requestID := ctx.GetHeader("X-Request-ID")
		if requestID == "" {
			requestID = generateRequestID()
		}
		ctx.Set("request_id", requestID)
		ctx.Header("X-Request-ID", requestID)
		ctx.Request = ctx.Request.WithContext(context.WithValue(ctx.Request.Context(), requestIDKey, requestID))
		ctx.Next()
	}
}

func ContextCancellationMiddleware() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		ctx.Request = ctx.Request.WithContext(context.WithValue(ctx.Request.Context(), "client_ip", ctx.ClientIP()))
		ctx.Request = ctx.Request.WithContext(context.WithValue(ctx.Request.Context(), "method", ctx.Request.Method))
		ctx.Request = ctx.Request.WithContext(context.WithValue(ctx.Request.Context(), "path", ctx.Request.URL.Path))
		ctx.Next()
	}
}

func ResponseTimeMiddleware(headerName ...string) gin.HandlerFunc {
	name := "X-Response-Time"
	if len(headerName) > 0 {
		name = headerName[0]
	}

	return func(ctx *gin.Context) {
		start := time.Now()
		ctx.Next()
		duration := time.Since(start)
		ctx.Header(name, duration.String())
	}
}

func ServerHeaderMiddleware(serverName string) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		ctx.Header("Server", serverName)
		ctx.Next()
	}
}

func ContentLengthMiddleware() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		ctx.Next()

		if ctx.Writer.Size() > 0 {
			ctx.Header("Content-Length", string(rune(ctx.Writer.Size())))
		}
	}
}

type contextData struct {
	StartTime time.Time
	RequestID string
	ClientIP  string
	UserID    string
}

func GetContextData(ctx *gin.Context) *contextData {
	startTime, _ := ctx.Get("start_time")
	requestID, _ := ctx.Get("request_id")
	clientIP, _ := ctx.Get("client_ip")
	userID, _ := ctx.Get("user_id")

	return &contextData{
		StartTime: startTime.(time.Time),
		RequestID: requestID.(string),
		ClientIP:  clientIP.(string),
		UserID:    userID.(string),
	}
}

func ContextMiddleware() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		ctx.Set("start_time", time.Now())

		if _, exists := ctx.Get("request_id"); !exists {
			ctx.Set("request_id", generateRequestID())
		}

		if _, exists := ctx.Get("client_ip"); !exists {
			ctx.Set("client_ip", ctx.ClientIP())
		}

		ctx.Next()
	}
}
