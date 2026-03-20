package main

import (
	"fmt"
	"io"
	"log"
	"os"
	"runtime"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"

	"github.com/skygenesisenterprise/aether-mail/server/src/config"
	"github.com/skygenesisenterprise/aether-mail/server/src/middleware"
	"github.com/skygenesisenterprise/aether-mail/server/src/routes"
	"github.com/skygenesisenterprise/aether-mail/server/src/services"
)

func displayBanner() {
	fmt.Printf("\n")
	fmt.Printf("\033[1;36m    ██╗    ██╗██╗  ██╗ █████╗ ████████╗██╗  ██╗███████╗████████╗\n")
	fmt.Printf("\033[1;36m    ██║    ██║██║  ██║██╔══██╗╚══██╔══╝██║  ██║██╔════╝╚══██╔══╝\n")
	fmt.Printf("\033[1;36m    ██║ █╗ ██║███████║███████║   ██║   ███████║█████╗     ██║   \n")
	fmt.Printf("\033[1;36m    ██║███╗██║██╔══██║██╔══██║   ██║   ██╔══██║██╔══╝     ██║   \n")
	fmt.Printf("\033[1;36m    ╚███╔███╔╝██║  ██║██║  ██║   ██║   ██║  ██║███████╗   ██║   \n")
	fmt.Printf("\033[1;36m     ╚══╝╚══╝ ╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝╚══════╝   ╚═╝   \n")
	fmt.Printf("\033[0;37m")
	fmt.Printf("\n")
	fmt.Printf("\033[1;33m    ╔══════════════════════════════════════════════════════════════╗\n")
	fmt.Printf("\033[1;33m    ║                    AETHER MAIL SERVER                       ║\n")
	fmt.Printf("\033[1;33m    ║               Enterprise Email Management                   ║\n")
	fmt.Printf("\033[1;33m    ║                   Version 1.0.0-alpha                       ║\n")
	fmt.Printf("\033[1;33m    ╚══════════════════════════════════════════════════════════════╝\n")
	fmt.Printf("\033[0;37m")
	fmt.Printf("\n")
	fmt.Printf("\033[1;32m[✓] System Architecture: %s\033[0m\n", runtime.GOARCH)
	fmt.Printf("\033[1;32m[✓] Operating System: %s\033[0m\n", runtime.GOOS)
	fmt.Printf("\033[1;32m[✓] Go Version: %s\033[0m\n", runtime.Version())
	fmt.Printf("\033[1;32m[✓] CPU Cores: %d\033[0m\n", runtime.NumCPU())
	fmt.Printf("\033[1;32m[✓] Process ID: %d\033[0m\n", os.Getpid())
	fmt.Printf("\n")
}

func main() {
	displayBanner()

	fmt.Printf("\033[1;34m[info] Initializing Aether Mail server...\033[0m\n")
	time.Sleep(300 * time.Millisecond)

	fmt.Printf("\033[1;34m[info] Loading .env file...\033[0m\n")
	if err := godotenv.Load(); err != nil {
		fmt.Printf("\033[1;33m[warn] No .env file found, using environment variables\033[0m\n")
	} else {
		fmt.Printf("\033[1;32m[success] .env file loaded successfully\033[0m\n")
	}
	time.Sleep(200 * time.Millisecond)

	fmt.Printf("\033[1;34m[info] Loading configuration...\033[0m\n")
	cfg := config.Load()
	time.Sleep(200 * time.Millisecond)

	fmt.Printf("\033[1;34m[info] Initializing Stalwart mail service...\033[0m\n")
	stalwartService := services.NewStalwartService(&cfg.Stalwart)
	time.Sleep(100 * time.Millisecond)
	fmt.Printf("\033[1;32m[success] Stalwart service connected\033[0m\n")

	fmt.Printf("\033[1;34m[info] Initializing JWT service...\033[0m\n")
	jwtService := services.NewJWTService(cfg.JWT.Secret, cfg.JWT.Expiry, cfg.JWT.Issuer)
	time.Sleep(100 * time.Millisecond)

	fmt.Printf("\033[1;34m[info] Setting up Gin router...\033[0m\n")
	gin.SetMode(gin.ReleaseMode)
	router := gin.New()
	router.Use(gin.Logger())
	router.Use(gin.Recovery())
	gin.DefaultWriter = io.Discard
	time.Sleep(200 * time.Millisecond)

	fmt.Printf("\033[1;34m[info] Configuring middleware...\033[0m\n")
	router.Use(middleware.CORS(cfg.CORS.AllowedOrigins))
	time.Sleep(100 * time.Millisecond)

	fmt.Printf("\033[1;34m[info] Setting up API routes...\033[0m\n")
	routes.SetupRoutes(router, stalwartService, jwtService)
	time.Sleep(200 * time.Millisecond)

	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	fmt.Printf("\n")
	fmt.Printf("\033[1;32m[✓] All systems operational\033[0m\n")
	fmt.Printf("\n")
	fmt.Printf("\033[1;36m┌─────────────────────────────────────────────────────────────────┐\n")
	fmt.Printf("\033[1;36m│                      AETHER MAIL SERVER READY                 │\n")
	fmt.Printf("\033[1;36m├─────────────────────────────────────────────────────────────────┤\n")
	fmt.Printf("\033[1;36m│  🌐 Server listening on: http://localhost:%d                     │\n", cfg.Server.Port)
	fmt.Printf("\033[1;36m│  📧 Email API: http://localhost:%d/api/v1/emails              │\n", cfg.Server.Port)
	fmt.Printf("\033[1;36m│  📁 Mailboxes API: http://localhost:%d/api/v1/mailboxes        │\n", cfg.Server.Port)
	fmt.Printf("\033[1;36m│  👥 Contacts API: http://localhost:%d/api/v1/contacts          │\n", cfg.Server.Port)
	fmt.Printf("\033[1;36m│  ⚡ Mode: %s                                                   │\n", gin.Mode())
	fmt.Printf("\033[1;36m└─────────────────────────────────────────────────────────────────┘\n")
	fmt.Printf("\033[0;37m\n")
	fmt.Printf("\033[1;33m[info] Press Ctrl+C to stop the server\033[0m\n\n")

	fmt.Printf("\033[1;34m[info] Starting HTTP server...\033[0m\n")
	addr := fmt.Sprintf(":%d", cfg.Server.Port)
	if err := router.Run(addr); err != nil {
		fmt.Printf("\033[1;31m[error] Failed to start server: %v\033[0m\n", err)
		log.Fatal(err)
	}
}
