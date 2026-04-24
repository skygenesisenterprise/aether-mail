package middleware

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

type role string

const (
	RoleAdmin  role = "admin"
	RoleUser  role = "user"
	RoleGuest role = "guest"
)

func RoleMiddleware(allowedRoles ...role) gin.HandlerFunc {
	roles := make(map[role]bool)
	for _, r := range allowedRoles {
		roles[r] = true
	}

	return func(ctx *gin.Context) {
		userRole := ctx.GetString("user_role")
		if userRole == "" {
			userRole = string(RoleUser)
		}

		if !roles[role(userRole)] {
			ctx.JSON(http.StatusForbidden, gin.H{
				"success": false,
				"error":  "Insufficient permissions",
			})
			ctx.Abort()
			return
		}

		ctx.Next()
	}
}

func AdminOnly() gin.HandlerFunc {
	return RoleMiddleware(RoleAdmin)
}

func OwnerOnly() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		resourceID := ctx.Param("id")
		userID := ctx.GetString("userId")

		if resourceID != "" && resourceID != userID {
			ctx.JSON(http.StatusForbidden, gin.H{
				"success": false,
				"error":  "You can only modify your own resources",
			})
			ctx.Abort()
			return
		}

		ctx.Next()
	}
}

func RateLimitByUser(requests int, windowSize string) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		ctx.Next()
	}
}

func SubscriptionRequired() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		hasSubscription := ctx.GetBool("has_subscription")
		if !hasSubscription {
			ctx.JSON(http.StatusPaymentRequired, gin.H{
				"success": false,
				"error":  "Subscription required",
			})
			ctx.Abort()
			return
		}
		ctx.Next()
	}
}

func VerifyAccount() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		isVerified := ctx.GetBool("account_verified")
		if !isVerified {
			ctx.JSON(http.StatusForbidden, gin.H{
				"success": false,
				"error":  "Account verification required",
			})
			ctx.Abort()
			return
		}
		ctx.Next()
	}
}

func APIKeyAuth() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		apiKey := ctx.GetHeader("X-API-Key")
		if apiKey == "" {
			apiKey = ctx.Query("api_key")
		}

		if apiKey == "" {
			ctx.JSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"error":  "API key required",
			})
			ctx.Abort()
			return
		}

		ctx.Set("api_key", apiKey)
		ctx.Next()
	}
}

func WebhookAuth() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		signature := ctx.GetHeader("X-Webhook-Signature")
		if signature == "" {
			ctx.JSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"error":  "Webhook signature required",
			})
			ctx.Abort()
			return
		}

		ctx.Set("webhook_signature", signature)
		ctx.Next()
	}
}

func ParseAccountID() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		accountID := ctx.Param("accountId")
		if accountID == "" {
			accountID = ctx.Query("accountId")
		}

		if accountID == "" {
			accountID = ctx.GetString("userId")
		}

		ctx.Set("account_id", accountID)
		ctx.Next()
	}
}

func RequireAccountID() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		accountID := ctx.GetString("account_id")
		if accountID == "" {
			ctx.JSON(http.StatusBadRequest, gin.H{
				"success": false,
				"error":  "Account ID required",
			})
			ctx.Abort()
			return
		}
		ctx.Next()
	}
}

func ScopeMiddleware(requiredScopes ...string) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		scopesClaim := ctx.GetString("scopes")
		if scopesClaim == "" {
			ctx.JSON(http.StatusForbidden, gin.H{
				"success": false,
				"error":  "Scopes claim missing",
			})
			ctx.Abort()
			return
		}

		userScopes := strings.Split(scopesClaim, " ")
		for _, required := range requiredScopes {
			found := false
			for _, userScope := range userScopes {
				if userScope == required {
					found = true
					break
				}
			}
			if !found {
				ctx.JSON(http.StatusForbidden, gin.H{
					"success": false,
					"error":  "Insufficient scope: " + required,
				})
				ctx.Abort()
				return
			}
		}

		ctx.Next()
	}
}

func DeviceMiddleware() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		deviceID := ctx.GetHeader("X-Device-ID")
		if deviceID == "" {
			deviceID = ctx.Query("device_id")
		}

		ctx.Set("device_id", deviceID)
		ctx.Next()
	}
}

func SessionMiddleware() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		sessionToken := ctx.GetHeader("X-Session-Token")
		if sessionToken == "" {
			cookie, err := ctx.Cookie("session_token")
			if err != nil || cookie == "" {
				ctx.JSON(http.StatusUnauthorized, gin.H{
					"success": false,
					"error":  "Session required",
				})
				ctx.Abort()
				return
			}
			sessionToken = cookie
		}

		ctx.Set("session_token", sessionToken)
		ctx.Next()
	}
}