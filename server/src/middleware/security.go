package middleware

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
)

type SecurityHeaders struct {
	XSSProtection         string
	ContentTypeOptions    string
	FrameOptions          string
	ContentSecurityPolicy string
	HSTSMaxAge            int
	ReferrerPolicy        string
	PermissionsPolicy     string
}

var defaultSecurityHeaders = SecurityHeaders{
	XSSProtection:         "1; mode=block",
	ContentTypeOptions:    "nosniff",
	FrameOptions:          "DENY",
	ContentSecurityPolicy: "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self';",
	HSTSMaxAge:            31536000,
	ReferrerPolicy:        "strict-origin-when-cross-origin",
	PermissionsPolicy:     "geolocation=(), microphone=(), camera=()",
}

func SecurityHeadersMiddleware(headers ...SecurityHeaders) gin.HandlerFunc {
	h := defaultSecurityHeaders
	if len(headers) > 0 {
		h = headers[0]
	}

	return func(ctx *gin.Context) {
		ctx.Header("X-XSS-Protection", h.XSSProtection)
		ctx.Header("X-Content-Type-Options", h.ContentTypeOptions)
		ctx.Header("X-Frame-Options", h.FrameOptions)
		ctx.Header("X-Permitted-Cross-Domain-Policies", "none")
		ctx.Header("Referrer-Policy", h.ReferrerPolicy)
		ctx.Header("Permissions-Policy", h.PermissionsPolicy)

		if ctx.Request.TLS != nil {
			ctx.Header("Strict-Transport-Security", fmt.Sprintf("max-age=%d; includeSubDomains", h.HSTSMaxAge))
		}

		ctx.Header("Content-Security-Policy", h.ContentSecurityPolicy)

		ctx.Next()
	}
}

type CacheConfig struct {
	Path           string
	MaxAge         int
	Private        bool
	NoCache        bool
	NoStore        bool
	MustRevalidate bool
}

func CacheMiddleware(config CacheConfig) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		if config.NoCache {
			ctx.Header("Cache-Control", "no-cache, no-store, must-revalidate")
			ctx.Header("Pragma", "no-cache")
			ctx.Header("Expires", "0")
		} else if config.NoStore {
			ctx.Header("Cache-Control", "no-store")
		} else {
			cacheControl := fmt.Sprintf("max-age=%d", config.MaxAge)
			if config.Private {
				cacheControl += ", private"
			} else {
				cacheControl += ", public"
			}
			if config.MustRevalidate {
				cacheControl += ", must-revalidate"
			}
			ctx.Header("Cache-Control", cacheControl)
			ctx.Header("Expires", time.Now().Add(time.Duration(config.MaxAge)*time.Second).Format(http.TimeFormat))
		}

		ctx.Next()
	}
}

func StaticCacheMiddleware() gin.HandlerFunc {
	return CacheMiddleware(CacheConfig{
		Path:    "/static/",
		MaxAge:  86400,
		Private: false,
		NoCache: false,
		NoStore: false,
	})
}

func NoCacheMiddleware() gin.HandlerFunc {
	return CacheMiddleware(CacheConfig{
		NoCache: true,
	})
}

type CompressionConfig struct {
	Level         int
	MinSize       int
	ExcludedPaths []string
}

func CompressionMiddleware(config ...CompressionConfig) gin.HandlerFunc {
	cfg := CompressionConfig{
		Level:   5,
		MinSize: 1024,
	}

	if len(config) > 0 {
		cfg = config[0]
	}

	return func(ctx *gin.Context) {
		for _, path := range cfg.ExcludedPaths {
			if strings.HasPrefix(ctx.Request.URL.Path, path) {
				ctx.Next()
				return
			}
		}

		if _, ok := ctx.Get("Gin-Custom-Static"); ok {
			ctx.Next()
			return
		}

		ctx.Next()
	}
}

type ResponseSizeLimiter struct {
	mu              sync.Mutex
	sizes           map[string]int64
	maxSize         int64
	cleanupInterval time.Duration
}

func NewResponseSizeLimiter(maxSize int64) *ResponseSizeLimiter {
	rsl := &ResponseSizeLimiter{
		sizes:           make(map[string]int64),
		maxSize:         maxSize,
		cleanupInterval: 5 * time.Minute,
	}

	go rsl.cleanup()

	return rsl
}

func (rsl *ResponseSizeLimiter) cleanup() {
	ticker := time.NewTicker(rsl.cleanupInterval)
	for range ticker.C {
		rsl.mu.Lock()
		for key, size := range rsl.sizes {
			if size == -1 {
				delete(rsl.sizes, key)
			}
		}
		rsl.mu.Unlock()
	}
}

func (rsl *ResponseSizeLimiter) Limit() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		ctx.Next()

		if ctx.Writer.Size() > int(rsl.maxSize) {
			ctx.JSON(http.StatusRequestEntityTooLarge, gin.H{
				"success":  false,
				"error":    "Response too large",
				"max_size": rsl.maxSize,
			})
		}
	}
}

func MaxRequestBodySize(size int) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		ctx.Request.Body = http.MaxBytesReader(ctx.Writer, ctx.Request.Body, int64(size))

		_, err := io.ReadAll(ctx.Request.Body)
		if err != nil {
			ctx.JSON(http.StatusRequestEntityTooLarge, gin.H{
				"success":  false,
				"error":    "Request body too large",
				"max_size": size,
			})
			ctx.Abort()
			return
		}

		ctx.Request.Body = io.NopCloser(bytes.NewBuffer([]byte{}))
		ctx.Next()
	}
}

func SecureJSONMiddleware() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		ctx.Header("X-Content-Type-Options", "nosniff")
		ctx.Header("X-Frame-Options", "DENY")
		ctx.Next()
	}
}

func XSSProtectionMiddleware() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		ctx.Header("X-XSS-Protection", "1; mode=block")
		ctx.Header("X-Content-Type-Options", "nosniff")
		ctx.Next()
	}
}

type CSPReport struct {
	CSPReport struct {
		DocumentURI       string `json:"document-uri"`
		ViolatedDirective string `json:"violated-directive"`
		OriginalPolicy    string `json:"original-policy"`
	} `json:"csp-report"`
}

func CSPReportMiddleware() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		if ctx.Request.URL.Path == "/csp-report" && ctx.Request.Method == "POST" {
			var report CSPReport
			if err := json.NewDecoder(ctx.Request.Body).Decode(&report); err != nil {
				ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid report"})
				return
			}
			fmt.Printf("CSP Violation: %s\n", report.CSPReport.ViolatedDirective)
			ctx.Status(http.StatusNoContent)
			return
		}
		ctx.Next()
	}
}
