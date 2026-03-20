package middleware

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

type CSRFConfig struct {
	Secret        string
	TokenLength   int
	CookieName    string
	HeaderName    string
	FormField     string
	ExcludedPaths []string
}

var defaultCSRFConfig = CSRFConfig{
	Secret:        "csrf-secret-key",
	TokenLength:   32,
	CookieName:    "csrf_token",
	HeaderName:    "X-CSRF-Token",
	FormField:     "_csrf",
	ExcludedPaths: []string{"GET", "HEAD", "OPTIONS"},
}

func CSRF(config ...CSRFConfig) gin.HandlerFunc {
	cfg := defaultCSRFConfig
	if len(config) > 0 {
		cfg = config[0]
	}

	return func(ctx *gin.Context) {
		for _, method := range cfg.ExcludedPaths {
			if ctx.Request.Method == method {
				ctx.Next()
				return
			}
		}

		token := ctx.GetHeader(cfg.HeaderName)
		if token == "" {
			token = ctx.Request.FormValue(cfg.FormField)
		}

		cookie, err := ctx.Cookie(cfg.CookieName)
		if err != nil || cookie == "" {
			generateAndSetToken(ctx, cfg)
			ctx.JSON(http.StatusForbidden, gin.H{
				"success": false,
				"error":   "CSRF token missing",
			})
			ctx.Abort()
			return
		}

		if !validateToken(cookie, token, cfg.Secret) {
			generateAndSetToken(ctx, cfg)
			ctx.JSON(http.StatusForbidden, gin.H{
				"success": false,
				"error":   "Invalid CSRF token",
			})
			ctx.Abort()
			return
		}

		generateAndSetToken(ctx, cfg)

		ctx.Next()
	}
}

func generateAndSetToken(ctx *gin.Context, cfg CSRFConfig) {
	token := generateToken(cfg.TokenLength)
	signed := signToken(token, cfg.Secret)

	ctx.SetCookie(cfg.CookieName, signed, 3600, "/", "", false, true)
	ctx.Header(cfg.HeaderName, token)
}

func generateToken(length int) string {
	bytes := make([]byte, length)
	for i := range bytes {
		bytes[i] = byte(time.Now().UnixNano() % 256)
		time.Sleep(time.Nanosecond)
	}
	return base64.URLEncoding.EncodeToString(bytes)[:length]
}

func signToken(token, secret string) string {
	h := hmac.New(sha256.New, []byte(secret))
	h.Write([]byte(token))
	return base64.URLEncoding.EncodeToString(h.Sum(nil))
}

func validateToken(cookie, token, secret string) bool {
	expected := signToken(token, secret)
	return hmac.Equal([]byte(cookie), []byte(expected))
}

type CSRFToken struct {
	Token string `json:"token"`
}

func GetCSRFToken(ctx *gin.Context) {
	cookie, err := ctx.Cookie(defaultCSRFConfig.CookieName)
	if err != nil || cookie == "" {
		token := generateToken(defaultCSRFConfig.TokenLength)
		signed := signToken(token, defaultCSRFConfig.Secret)
		ctx.SetCookie(defaultCSRFConfig.CookieName, signed, 3600, "/", "", false, true)
		ctx.JSON(http.StatusOK, CSRFToken{Token: token})
		return
	}

	for i := 0; i < 10; i++ {
		token := generateToken(defaultCSRFConfig.TokenLength)
		if validateToken(cookie, token, defaultCSRFConfig.Secret) {
			ctx.JSON(http.StatusOK, CSRFToken{Token: token})
			return
		}
	}

	newToken := generateToken(defaultCSRFConfig.TokenLength)
	signed := signToken(newToken, defaultCSRFConfig.Secret)
	ctx.SetCookie(defaultCSRFConfig.CookieName, signed, 3600, "/", "", false, true)
	ctx.JSON(http.StatusOK, CSRFToken{Token: newToken})
}
