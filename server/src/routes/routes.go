package routes

import (
	"github.com/gin-gonic/gin"

	"github.com/skygenesisenterprise/aether-mail/server/src/controllers"
	"github.com/skygenesisenterprise/aether-mail/server/src/middleware"
	"github.com/skygenesisenterprise/aether-mail/server/src/services"
)

type Router struct {
	engine            *gin.Engine
	authController    *controllers.AuthController
	emailController   *controllers.EmailController
	folderController  *controllers.FolderController
	contactController *controllers.ContactController
	authMiddleware    *middleware.AuthMiddleware
}

func NewRouter(
	stalwartService *services.StalwartService,
	jwtService *services.JWTService,
) *Router {
	return &Router{
		authController:    controllers.NewAuthController(stalwartService, jwtService),
		emailController:   controllers.NewEmailController(stalwartService),
		folderController:  controllers.NewFolderController(stalwartService),
		contactController: controllers.NewContactController(stalwartService),
		authMiddleware:    middleware.NewAuthMiddleware(jwtService),
	}
}

func SetupRoutes(
	engine *gin.Engine,
	stalwartService *services.StalwartService,
	jwtService *services.JWTService,
) {
	router := NewRouter(stalwartService, jwtService)

	api := engine.Group("/api/v1")
	{
		auth := api.Group("/auth")
		{
			auth.POST("/login", router.authController.Login)
			auth.POST("/logout", router.authMiddleware.RequireAuth(), router.authController.Logout)
		}

		account := api.Group("/account")
		account.Use(router.authMiddleware.RequireAuth())
		{
			account.GET("/me", router.authController.GetAccount)
		}

		emails := api.Group("/emails")
		emails.Use(router.authMiddleware.RequireAuth())
		{
			emails.GET("/:accountId", router.emailController.GetEmails)
			emails.GET("/:accountId/:emailId", router.emailController.GetEmail)
			emails.POST("/send", router.emailController.SendEmail)
			emails.POST("/draft", router.emailController.CreateDraft)
			emails.POST("/move", router.emailController.MoveEmails)
			emails.POST("/delete", router.emailController.DeleteEmails)
		}

		mailboxes := api.Group("/mailboxes")
		mailboxes.Use(router.authMiddleware.RequireAuth())
		{
			mailboxes.GET("/:accountId", router.folderController.GetFolders)
			mailboxes.POST("", router.folderController.CreateFolder)
			mailboxes.PATCH("/rename", router.folderController.RenameFolder)
			mailboxes.DELETE("/:accountId/:mailboxId", router.folderController.DeleteFolder)
		}

		contacts := api.Group("/contacts")
		contacts.Use(router.authMiddleware.RequireAuth())
		{
			contacts.GET("/:accountId", router.contactController.GetContacts)
			contacts.POST("", router.contactController.CreateContact)
			contacts.PATCH("", router.contactController.UpdateContact)
			contacts.DELETE("/:accountId/:contactId", router.contactController.DeleteContact)
			contacts.GET("/search", router.contactController.SearchContacts)
		}
	}
}
