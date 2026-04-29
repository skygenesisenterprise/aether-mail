package config

import (
	"os"
	"strconv"
	"strings"
	"time"
)

// Default mail server hosts embedded in the engine.
// The application does not rely solely on environment variables.
const (
	DefaultMailHostPrimary   = "mail.skygenesisenterprise.net"
	DefaultMailHostSecondary = "mail.skygenesisenterprise.com"
)

// ResolveMailHost returns the appropriate mail server host based on the email domain.
func ResolveMailHost(email string) string {
	parts := strings.Split(email, "@")
	if len(parts) < 2 {
		return DefaultMailHostPrimary
	}
	domain := strings.ToLower(parts[1])
	switch domain {
	case "skygenesisenterprise.com":
		return DefaultMailHostSecondary
	default:
		return DefaultMailHostPrimary
	}
}

type Config struct {
	Stalwart StalwartConfig
	JWT      JWTConfig
	CORS     CORSConfig
	Server   ServerConfig
	Log      LogConfig
	Mail     MailConfig
}

type StalwartConfig struct {
	Host       string
	HTTPPort   int
	JMAPPort   int
	IMAPPort   int
	SMTPPort   int
	UseTLS     bool
	SkipVerify bool
}

type JWTConfig struct {
	Secret string
	Expiry time.Duration
	Issuer string
}

type CORSConfig struct {
	AllowedOrigins []string
}

type ServerConfig struct {
	Port    int
	Mode    string
	Timeout time.Duration
}

type LogConfig struct {
	Level  string
	File   string
	Format string
}

type MailConfig struct {
	DefaultProvider string
	IMAP            IMAPConfig
	SMTP            SMTPConfig
	POP3            POP3Config
	OAuth           OAuthConfig
}

type OAuthConfig struct {
	RedirectURL string
	Google      OAuthProviderConfig
	Microsoft   OAuthProviderConfig
	Proton      OAuthProviderConfig
}

type OAuthProviderConfig struct {
	ClientID     string
	ClientSecret string
	RedirectURL  string
	Tenant       string
}

type IMAPConfig struct {
	Host       string
	Port       int
	UseTLS     bool
	SkipVerify bool
}

type SMTPConfig struct {
	Host       string
	Port       int
	UseTLS     bool
	SkipVerify bool
}

type POP3Config struct {
	Host       string
	Port       int
	UseTLS     bool
	SkipVerify bool
}

func Load() *Config {
	return &Config{
		Stalwart: StalwartConfig{
			Host:       getEnv("STALWART_HOST", DefaultMailHostPrimary),
			HTTPPort:   getEnvInt("STALWART_HTTP_PORT", 8080),
			JMAPPort:   getEnvInt("STALWART_JMAP_PORT", 8081),
			IMAPPort:   getEnvInt("STALWART_IMAP_PORT", 993),
			SMTPPort:   getEnvInt("STALWART_SMTP_PORT", 587),
			UseTLS:     getEnvBool("STALWART_USE_TLS", true),
			SkipVerify: getEnvBool("STALWART_SKIP_VERIFY", false),
		},
		JWT: JWTConfig{
			Secret: getEnv("JWT_SECRET", "change-me-in-production"),
			Expiry: getEnvDuration("JWT_EXPIRY", 24*time.Hour),
			Issuer: getEnv("JWT_ISSUER", "aether-mail"),
		},
		CORS: CORSConfig{
			AllowedOrigins: getEnvSlice("CORS_ALLOWED_ORIGINS", []string{"http://localhost:3000"}),
		},
		Server: ServerConfig{
			Port:    getEnvInt("SERVER_PORT", 8080),
			Mode:    getEnv("GIN_MODE", "debug"),
			Timeout: getEnvDuration("SERVER_TIMEOUT", 30*time.Second),
		},
		Log: LogConfig{
			Level:  getEnv("LOG_LEVEL", "info"),
			File:   getEnv("LOG_FILE", "./src/logs/server.log"),
			Format: getEnv("LOG_FORMAT", "json"),
		},
		Mail: MailConfig{
			DefaultProvider: getEnv("MAIL_PROVIDER", "stalwart"),
			IMAP: IMAPConfig{
				Host:       getEnv("IMAP_HOST", DefaultMailHostPrimary),
				Port:       getEnvInt("IMAP_PORT", 993),
				UseTLS:     getEnvBool("IMAP_USE_TLS", true),
				SkipVerify: getEnvBool("IMAP_SKIP_VERIFY", false),
			},
			SMTP: SMTPConfig{
				Host:       getEnv("SMTP_HOST", DefaultMailHostPrimary),
				Port:       getEnvInt("SMTP_PORT", 587),
				UseTLS:     getEnvBool("SMTP_USE_TLS", true),
				SkipVerify: getEnvBool("SMTP_SKIP_VERIFY", false),
			},
			POP3: POP3Config{
				Host:       getEnv("POP3_HOST", DefaultMailHostPrimary),
				Port:       getEnvInt("POP3_PORT", 995),
				UseTLS:     getEnvBool("POP3_USE_TLS", true),
				SkipVerify: getEnvBool("POP3_SKIP_VERIFY", false),
			},
			OAuth: OAuthConfig{
				RedirectURL: getEnv("OAUTH_REDIRECT_URL", "http://localhost:8080/api/v1/auth/oauth/callback"),
				Google: OAuthProviderConfig{
					ClientID:     getEnv("GOOGLE_CLIENT_ID", ""),
					ClientSecret: getEnv("GOOGLE_CLIENT_SECRET", ""),
					RedirectURL:  getEnv("GOOGLE_REDIRECT_URL", "http://localhost:8080/api/v1/auth/oauth/google/callback"),
				},
				Microsoft: OAuthProviderConfig{
					ClientID:     getEnv("MICROSOFT_CLIENT_ID", ""),
					ClientSecret: getEnv("MICROSOFT_CLIENT_SECRET", ""),
					RedirectURL:  getEnv("MICROSOFT_REDIRECT_URL", "http://localhost:8080/api/v1/auth/oauth/microsoft/callback"),
					Tenant:       getEnv("MICROSOFT_TENANT", "common"),
				},
				Proton: OAuthProviderConfig{
					ClientID:     getEnv("PROTON_CLIENT_ID", ""),
					ClientSecret: getEnv("PROTON_CLIENT_SECRET", ""),
					RedirectURL:  getEnv("PROTON_REDIRECT_URL", "http://localhost:8080/api/v1/auth/oauth/proton/callback"),
				},
			},
		},
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func getEnvInt(key string, defaultValue int) int {
	if value := os.Getenv(key); value != "" {
		if intValue, err := strconv.Atoi(value); err == nil {
			return intValue
		}
	}
	return defaultValue
}

func getEnvBool(key string, defaultValue bool) bool {
	if value := os.Getenv(key); value != "" {
		return value == "true" || value == "1"
	}
	return defaultValue
}

func getEnvDuration(key string, defaultValue time.Duration) time.Duration {
	if value := os.Getenv(key); value != "" {
		if duration, err := time.ParseDuration(value); err == nil {
			return duration
		}
	}
	return defaultValue
}

func getEnvSlice(key string, defaultValue []string) []string {
	if value := os.Getenv(key); value != "" {
		return strings.Split(value, ",")
	}
	return defaultValue
}
