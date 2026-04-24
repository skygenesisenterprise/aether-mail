package middleware

import (
	"net/http"
	"regexp"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
)

var (
	emailRegex   = regexp.MustCompile(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`)
	uuidRegex    = regexp.MustCompile(`^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$`)
	urlRegex    = regexp.MustCompile(`^https?://`)
	phoneRegex  = regexp.MustCompile(`^\+?[0-9]{10,15}$`)
)

func ValidateEmail(field string) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		value := ctx.GetHeader(field)
		if value == "" {
			value = ctx.Query(field)
		}
		if value == "" {
			value = ctx.Param(field)
		}

		if value != "" && !emailRegex.MatchString(value) {
			ctx.JSON(http.StatusBadRequest, gin.H{
				"success": false,
				"error":  "Invalid email format",
			})
			ctx.Abort()
			return
		}

		ctx.Next()
	}
}

func ValidateUUID(field string) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		value := ctx.Param(field)
		if value == "" {
			value = ctx.Query(field)
		}

		if value != "" && !uuidRegex.MatchString(value) {
			ctx.JSON(http.StatusBadRequest, gin.H{
				"success": false,
				"error":  "Invalid UUID format",
			})
			ctx.Abort()
			return
		}

		ctx.Next()
	}
}

func ValidateURL(field string) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		value := ctx.Query(field)
		if value == "" {
			value = ctx.Param(field)
		}

		if value != "" && !urlRegex.MatchString(value) {
			ctx.JSON(http.StatusBadRequest, gin.H{
				"success": false,
				"error":  "Invalid URL format",
			})
			ctx.Abort()
			return
		}

		ctx.Next()
	}
}

func ValidateRequired(fields ...string) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		for _, field := range fields {
			value := ctx.GetHeader(field)
			if value == "" {
				value = ctx.Query(field)
			}
			if value == "" {
				value = ctx.Param(field)
			}
			if value == "" {
				ctx.JSON(http.StatusBadRequest, gin.H{
					"success": false,
					"error":  "Missing required field: " + field,
				})
				ctx.Abort()
				return
			}
		}

		ctx.Next()
	}
}

func ValidatePagination() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		limit := ctx.DefaultQuery("limit", "50")
		offset := ctx.DefaultQuery("offset", "0")

		limitInt, err := strconv.Atoi(limit)
		if err != nil || limitInt < 0 || limitInt > 100 {
			ctx.JSON(http.StatusBadRequest, gin.H{
				"success": false,
				"error":  "Invalid limit (0-100)",
			})
			ctx.Abort()
			return
		}

		offsetInt, err := strconv.Atoi(offset)
		if err != nil || offsetInt < 0 {
			ctx.JSON(http.StatusBadRequest, gin.H{
				"success": false,
				"error":  "Invalid offset",
			})
			ctx.Abort()
			return
		}

		ctx.Set("limit", limitInt)
		ctx.Set("offset", offsetInt)
		ctx.Next()
	}
}

func ValidateSort(field string, allowedValues []string) gin.HandlerFunc {
	allowed := make(map[string]bool)
	for _, v := range allowedValues {
		allowed[v] = true
	}

	return func(ctx *gin.Context) {
		sort := ctx.Query("sort")
		if sort == "" {
			ctx.Next()
			return
		}

		if !allowed[sort] {
			ctx.JSON(http.StatusBadRequest, gin.H{
				"success": false,
				"error":  "Invalid sort value",
			})
			ctx.Abort()
			return
		}

		ctx.Set("sort", sort)
		ctx.Next()
	}
}

func ValidateDateRange() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		startDate := ctx.Query("start_date")
		endDate := ctx.Query("end_date")

		if startDate == "" || endDate == "" {
			ctx.Next()
			return
		}

		if strings.Compare(startDate, endDate) > 0 {
			ctx.JSON(http.StatusBadRequest, gin.H{
				"success": false,
				"error":  "start_date must be before end_date",
			})
			ctx.Abort()
			return
		}

		ctx.Set("start_date", startDate)
		ctx.Set("end_date", endDate)
		ctx.Next()
	}
}

func NormalizeQueryParams() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		query := ctx.Request.URL.Query()

		for key, values := range query {
			if len(values) > 0 {
				ctx.Set("normalized_"+key, values[0])
			}
		}

		ctx.Next()
	}
}

func MergeQueryParams(fields ...string) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		for _, field := range fields {
			value := ctx.Query(field)
			if value == "" {
				value = ctx.GetHeader(field)
			}

			if value != "" {
				ctx.Set(field, value)
			}
		}

		ctx.Next()
	}
}