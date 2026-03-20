package middleware

import (
	"net/http"
	"regexp"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
)

type Validator struct {
	rules    map[string][]ValidationRule
	messages map[string]string
}

type ValidationRule func(value interface{}) error

func NewValidator() *Validator {
	return &Validator{
		rules:    make(map[string][]ValidationRule),
		messages: make(map[string]string),
	}
}

func (v *Validator) AddRule(field string, rules ...ValidationRule) {
	v.rules[field] = append(v.rules[field], rules...)
}

func (v *Validator) SetMessage(field, message string) {
	v.messages[field] = message
}

func (v *Validator) Validate(data map[string]interface{}) map[string]string {
	errors := make(map[string]string)

	for field, rules := range v.rules {
		value, exists := data[field]
		if !exists {
			value = nil
		}

		for _, rule := range rules {
			if err := rule(value); err != nil {
				msg := err.Error()
				if customMsg, ok := v.messages[field]; ok {
					msg = customMsg
				}
				errors[field] = msg
				break
			}
		}
	}

	return errors
}

func Required() ValidationRule {
	return func(value interface{}) error {
		if value == nil {
			return &ValidationError{Field: "field", Message: "This field is required"}
		}
		if str, ok := value.(string); ok && strings.TrimSpace(str) == "" {
			return &ValidationError{Field: "field", Message: "This field is required"}
		}
		return nil
	}
}

func Email() ValidationRule {
	return func(value interface{}) error {
		if value == nil {
			return nil
		}
		str, ok := value.(string)
		if !ok {
			return &ValidationError{Field: "field", Message: "Invalid email format"}
		}
		if str == "" {
			return nil
		}
		emailRegex := regexp.MustCompile(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`)
		if !emailRegex.MatchString(str) {
			return &ValidationError{Field: "field", Message: "Invalid email format"}
		}
		return nil
	}
}

func MinLength(min int) ValidationRule {
	return func(value interface{}) error {
		if value == nil {
			return nil
		}
		str, ok := value.(string)
		if !ok {
			return nil
		}
		if len(str) < min {
			return &ValidationError{Field: "field", Message: "Minimum length is " + strconv.Itoa(min)}
		}
		return nil
	}
}

func MaxLength(max int) ValidationRule {
	return func(value interface{}) error {
		if value == nil {
			return nil
		}
		str, ok := value.(string)
		if !ok {
			return nil
		}
		if len(str) > max {
			return &ValidationError{Field: "field", Message: "Maximum length is " + strconv.Itoa(max)}
		}
		return nil
	}
}

func Min(min int) ValidationRule {
	return func(value interface{}) error {
		if value == nil {
			return nil
		}
		switch v := value.(type) {
		case int:
			if v < min {
				return &ValidationError{Field: "field", Message: "Minimum value is " + strconv.Itoa(min)}
			}
		case float64:
			if v < float64(min) {
				return &ValidationError{Field: "field", Message: "Minimum value is " + strconv.Itoa(min)}
			}
		}
		return nil
	}
}

func Max(max int) ValidationRule {
	return func(value interface{}) error {
		if value == nil {
			return nil
		}
		switch v := value.(type) {
		case int:
			if v > max {
				return &ValidationError{Field: "field", Message: "Maximum value is " + strconv.Itoa(max)}
			}
		case float64:
			if v > float64(max) {
				return &ValidationError{Field: "field", Message: "Maximum value is " + strconv.Itoa(max)}
			}
		}
		return nil
	}
}

func Pattern(pattern *regexp.Regexp) ValidationRule {
	return func(value interface{}) error {
		if value == nil {
			return nil
		}
		str, ok := value.(string)
		if !ok {
			return nil
		}
		if !pattern.MatchString(str) {
			return &ValidationError{Field: "field", Message: "Invalid format"}
		}
		return nil
	}
}

func OneOf(values ...interface{}) ValidationRule {
	return func(value interface{}) error {
		if value == nil {
			return nil
		}
		for _, v := range values {
			if value == v {
				return nil
			}
		}
		return &ValidationError{Field: "field", Message: "Value must be one of the allowed values"}
	}
}

type ValidationError struct {
	Field   string
	Message string
}

func (e *ValidationError) Error() string {
	return e.Message
}

func ValidationMiddleware(v *Validator) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		data := make(map[string]interface{})

		for key, values := range ctx.Request.URL.Query() {
			if len(values) > 0 {
				data[key] = values[0]
			}
		}

		if ctx.Request.Method == "POST" || ctx.Request.Method == "PUT" || ctx.Request.Method == "PATCH" {
			if err := ctx.Request.ParseForm(); err == nil {
				for key, values := range ctx.Request.PostForm {
					if len(values) > 0 {
						data[key] = values[0]
					}
				}
			}
		}

		errors := v.Validate(data)
		if len(errors) > 0 {
			ctx.JSON(http.StatusBadRequest, gin.H{
				"success": false,
				"errors":  errors,
			})
			ctx.Abort()
			return
		}

		ctx.Next()
	}
}
