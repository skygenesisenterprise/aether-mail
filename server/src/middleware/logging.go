package middleware

import (
	"bytes"
	"io"
	"log"
	"runtime"
	"time"

	"github.com/gin-gonic/gin"
)

type responseWriter struct {
	gin.ResponseWriter
	body       *bytes.Buffer
	statusCode int
}

func (rw *responseWriter) Write(b []byte) (int, error) {
	rw.body.Write(b)
	return rw.ResponseWriter.Write(b)
}

func (rw *responseWriter) WriteHeader(code int) {
	rw.statusCode = code
	rw.ResponseWriter.WriteHeader(code)
}

type LogConfig struct {
	EnableBody   bool
	EnableHeader bool
	EnableQuery  bool
	ExcludePaths []string
	CustomLogger func(logEntry LogEntry)
}

type LogEntry struct {
	Timestamp  time.Time
	Method     string
	Path       string
	StatusCode int
	Latency    time.Duration
	ClientIP   string
	UserAgent  string
	BodySize   int
	Query      string
	Headers    map[string]string
	RequestID  string
}

func Logger(config ...LogConfig) gin.HandlerFunc {
	cfg := LogConfig{
		EnableBody:   true,
		EnableHeader: false,
		EnableQuery:  true,
		ExcludePaths: []string{"/health", "/metrics"},
	}

	if len(config) > 0 {
		cfg = config[0]
	}

	return func(ctx *gin.Context) {
		for _, path := range cfg.ExcludePaths {
			if ctx.Request.URL.Path == path {
				ctx.Next()
				return
			}
		}

		start := time.Now()
		requestID := ctx.GetHeader("X-Request-ID")
		if requestID == "" {
			requestID = generateRequestID()
		}
		ctx.Set("request_id", requestID)
		ctx.Header("X-Request-ID", requestID)

		var body []byte
		if cfg.EnableBody && ctx.Request.Body != nil {
			body, _ = io.ReadAll(ctx.Request.Body)
			ctx.Request.Body = io.NopCloser(bytes.NewBuffer(body))
		}

		rw := &responseWriter{
			ResponseWriter: ctx.Writer,
			body:           bytes.NewBuffer(nil),
			statusCode:     200,
		}
		ctx.Writer = rw

		ctx.Next()

		latency := time.Since(start)

		entry := LogEntry{
			Timestamp:  start,
			Method:     ctx.Request.Method,
			Path:       ctx.Request.URL.Path,
			StatusCode: rw.statusCode,
			Latency:    latency,
			ClientIP:   ctx.ClientIP(),
			UserAgent:  ctx.Request.UserAgent(),
			BodySize:   rw.body.Len(),
			Query:      ctx.Request.URL.RawQuery,
			RequestID:  requestID,
		}

		if cfg.EnableHeader {
			entry.Headers = make(map[string]string)
			for key, values := range ctx.Request.Header {
				if len(values) > 0 {
					entry.Headers[key] = values[0]
				}
			}
		}

		if cfg.CustomLogger != nil {
			cfg.CustomLogger(entry)
		} else {
			statusColor := getStatusColor(rw.statusCode)
			log.Printf("[%s] %s %s %s %d %s (%s)",
				requestID,
				ctx.Request.Method,
				ctx.Request.URL.Path,
				statusColor,
				rw.statusCode,
				latency,
				ctx.ClientIP(),
			)
		}
	}
}

func getStatusColor(status int) string {
	switch {
	case status >= 200 && status < 300:
		return "\033[32m"
	case status >= 300 && status < 400:
		return "\033[33m"
	case status >= 400 && status < 500:
		return "\033[31m"
	case status >= 500:
		return "\033[35m"
	default:
		return ""
	}
}

func generateRequestID() string {
	return time.Now().Format("20060102150405.000000")
}

func RecoveryWithLogger() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		defer func() {
			if err := recover(); err != nil {
				requestID, _ := ctx.Get("request_id")
				log.Printf("[%v] PANIC RECOVERED: %v\n%s", requestID, err, stack())
				ctx.AbortWithStatusJSON(500, gin.H{
					"success":    false,
					"error":      "Internal server error",
					"request_id": requestID,
				})
			}
		}()
		ctx.Next()
	}
}

func stack() string {
	buf := make([]byte, 4096)
	n := 0
	for i := 0; i < 10; i++ {
		n = runtime.Stack(buf, true)
		if n < len(buf) {
			break
		}
		buf = make([]byte, n*2)
	}
	return string(buf[:n])
}
