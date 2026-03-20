package config

import (
	"os"
	"strconv"
	"time"
)

type Config struct {
	Stalwart StalwartConfig
	JWT      JWTConfig
	CORS     CORSConfig
	Server   ServerConfig
	Log      LogConfig
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

func Load() *Config {
	return &Config{
		Stalwart: StalwartConfig{
			Host:       getEnv("STALWART_HOST", "localhost"),
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
		return []string{value}
	}
	return defaultValue
}
