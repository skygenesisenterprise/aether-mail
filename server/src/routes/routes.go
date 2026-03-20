package routes

import (
	"github.com/gin-gonic/gin"

	"github.com/skygenesisenterprise/aether-mail/server/src/config"
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
	imapController    *controllers.IMAPController
	smtpController    *controllers.SMTPController
	pop3Controller    *controllers.POP3Controller
	authMiddleware    *middleware.AuthMiddleware
}

func NewRouter(
	stalwartService *services.StalwartService,
	jwtService *services.JWTService,
	mailConfig *config.MailConfig,
) *Router {
	return &Router{
		authController:    controllers.NewAuthController(stalwartService, jwtService, mailConfig),
		emailController:   controllers.NewEmailController(stalwartService),
		folderController:  controllers.NewFolderController(stalwartService),
		contactController: controllers.NewContactController(stalwartService),
		imapController:    controllers.NewIMAPController(stalwartService),
		smtpController:    controllers.NewSMTPController(),
		pop3Controller:    controllers.NewPOP3Controller(),
		authMiddleware:    middleware.NewAuthMiddleware(jwtService),
	}
}

func SetupRoutes(
	engine *gin.Engine,
	stalwartService *services.StalwartService,
	jwtService *services.JWTService,
	mailConfig *config.MailConfig,
) {
	router := NewRouter(stalwartService, jwtService, mailConfig)

	api := engine.Group("/api/v1")
	{
		auth := api.Group("/auth")
		{
			auth.POST("/login", router.authController.Login)
			auth.POST("/logout", router.authMiddleware.RequireAuth(), router.authController.Logout)
			auth.POST("/refresh", router.authController.RefreshToken)
			auth.POST("/change-password", router.authMiddleware.RequireAuth(), router.authController.ChangePassword)
			auth.POST("/reset-password", router.authController.ResetPassword)
			auth.POST("/set-password", router.authController.SetPassword)
		}

		account := api.Group("/account")
		account.Use(router.authMiddleware.RequireAuth())
		{
			account.GET("/me", router.authController.GetAccount)
			account.GET("/accounts", router.authController.GetAccounts)
		}

		emails := api.Group("/emails")
		emails.Use(router.authMiddleware.RequireAuth())
		{
			emails.GET("/:accountId", router.emailController.GetEmails)
			emails.GET("/:accountId/:emailId", router.emailController.GetEmail)
			emails.GET("/:accountId/:emailId/raw", router.emailController.GetEmailRaw)
			emails.GET("/:accountId/threads/:threadId", router.emailController.GetThread)
			emails.POST("/send", router.emailController.SendEmail)
			emails.POST("/draft", router.emailController.CreateDraft)
			emails.PUT("/:accountId/:draftId", router.emailController.UpdateDraft)
			emails.DELETE("/:accountId/:draftId", router.emailController.DeleteDraft)
			emails.POST("/move", router.emailController.MoveEmails)
			emails.POST("/delete", router.emailController.DeleteEmails)
			emails.POST("/mark-read", router.emailController.MarkAsRead)
			emails.POST("/mark-unread", router.emailController.MarkAsUnread)
			emails.POST("/star", router.emailController.StarEmails)
			emails.POST("/unstar", router.emailController.UnstarEmails)
			emails.POST("/archive", router.emailController.ArchiveEmails)
			emails.POST("/search", router.emailController.Search)
			emails.GET("/quick-search", router.emailController.QuickSearch)
		}

		mailboxes := api.Group("/mailboxes")
		mailboxes.Use(router.authMiddleware.RequireAuth())
		{
			mailboxes.GET("/:accountId", router.folderController.GetFolders)
			mailboxes.GET("/:accountId/:mailboxId", router.folderController.GetFolder)
			mailboxes.POST("", router.folderController.CreateFolder)
			mailboxes.PATCH("/rename", router.folderController.RenameFolder)
			mailboxes.DELETE("/:accountId/:mailboxId", router.folderController.DeleteFolder)
			mailboxes.POST("/subscribe", router.folderController.SubscribeFolder)
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

		protocols := api.Group("/protocols")
		protocols.Use(router.authMiddleware.RequireAuth())
		{
			imap := protocols.Group("/imap")
			{
				imap.POST("/connect", router.imapController.Connect)
				imap.POST("/login", router.imapController.Login)
				imap.POST("/disconnect", router.imapController.Disconnect)
				imap.GET("/mailboxes", router.imapController.ListMailboxes)
				imap.GET("/mailboxes/:mailbox/status", router.imapController.GetMailboxStatus)
				imap.POST("/mailboxes/:mailbox/select", router.imapController.SelectMailbox)
				imap.GET("/messages", router.imapController.FetchMessages)
				imap.POST("/messages/search", router.imapController.SearchMessages)
				imap.POST("/messages/move", router.imapController.MoveMessages)
				imap.POST("/messages/delete", router.imapController.DeleteMessages)
				imap.POST("/mailboxes/create", router.imapController.CreateMailbox)
				imap.POST("/mailboxes/rename", router.imapController.RenameMailbox)
				imap.DELETE("/mailboxes/:mailbox", router.imapController.DeleteMailbox)
				imap.POST("/noop", router.imapController.Noop)
				imap.POST("/expunge", router.imapController.Expunge)
			}

			smtp := protocols.Group("/smtp")
			{
				smtp.POST("/connect", router.smtpController.Connect)
				smtp.POST("/authenticate", router.smtpController.Authenticate)
				smtp.POST("/disconnect", router.smtpController.Disconnect)
				smtp.POST("/send", router.smtpController.SendEmail)
				smtp.POST("/send-raw", router.smtpController.SendRawEmail)
				smtp.POST("/reset", router.smtpController.Reset)
				smtp.POST("/quit", router.smtpController.Quit)
				smtp.POST("/noop", router.smtpController.Noop)
			}

			pop3 := protocols.Group("/pop3")
			{
				pop3.POST("/connect", router.pop3Controller.Connect)
				pop3.POST("/authenticate", router.pop3Controller.Authenticate)
				pop3.POST("/disconnect", router.pop3Controller.Disconnect)
				pop3.GET("/stat", router.pop3Controller.Stat)
				pop3.GET("/list", router.pop3Controller.ListMessages)
				pop3.GET("/uidl", router.pop3Controller.Uidl)
				pop3.GET("/messages/:number", router.pop3Controller.Retr)
				pop3.GET("/messages/:number/top", router.pop3Controller.Top)
				pop3.DELETE("/messages/:number", router.pop3Controller.Dele)
				pop3.POST("/reset", router.pop3Controller.Reset)
				pop3.POST("/noop", router.pop3Controller.Noop)
				pop3.POST("/quit", router.pop3Controller.Quit)
			}
		}
	}
}
