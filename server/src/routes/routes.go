package routes

import (
	"github.com/gin-gonic/gin"

	"github.com/skygenesisenterprise/aether-mail/server/src/config"
	"github.com/skygenesisenterprise/aether-mail/server/src/controllers"
	"github.com/skygenesisenterprise/aether-mail/server/src/middleware"
	"github.com/skygenesisenterprise/aether-mail/server/src/services"
)

type Router struct {
	engine                 *gin.Engine
	authController         *controllers.AuthController
	oauthController        *controllers.OAuthController
	emailController        *controllers.EmailController
	folderController       *controllers.FolderController
	contactController      *controllers.ContactController
	imapController         *controllers.IMAPController
	smtpController         *controllers.SMTPController
	pop3Controller         *controllers.POP3Controller
	meetingController      *controllers.MeetingController
	organizationController *controllers.OrganizationController
	todoController         *controllers.TodoController
	settingsController     *controllers.SettingsController
	notificationController *controllers.NotificationController
	authMiddleware         *middleware.AuthMiddleware
}

func NewRouter(
	stalwartService *services.StalwartService,
	jwtService *services.JWTService,
	oauthService *services.OAuthService,
	mailConfig *config.MailConfig,
) *Router {
	meetingService := services.NewMeetingService(stalwartService)
	organizationService := services.NewOrganizationService(stalwartService)
	todoService := services.NewTodoService(stalwartService)
	settingsService := services.NewSettingsService(stalwartService)
	notificationService := services.NewNotificationService(stalwartService)

	return &Router{
		authController:         controllers.NewAuthController(stalwartService, jwtService, oauthService, mailConfig),
		oauthController:        controllers.NewOAuthController(oauthService, jwtService, mailConfig),
		emailController:        controllers.NewEmailController(stalwartService, mailConfig),
		folderController:       controllers.NewFolderController(stalwartService, mailConfig),
		contactController:      controllers.NewContactController(stalwartService),
		imapController:         controllers.NewIMAPController(stalwartService),
		smtpController:         controllers.NewSMTPController(),
		pop3Controller:         controllers.NewPOP3Controller(),
		meetingController:      controllers.NewMeetingController(meetingService),
		organizationController: controllers.NewOrganizationController(organizationService),
		todoController:         controllers.NewTodoController(todoService),
		settingsController:     controllers.NewSettingsController(settingsService),
		notificationController: controllers.NewNotificationController(notificationService),
		authMiddleware:         middleware.NewAuthMiddleware(jwtService),
	}
}

func SetupRoutes(
	engine *gin.Engine,
	stalwartService *services.StalwartService,
	jwtService *services.JWTService,
	oauthService *services.OAuthService,
	mailConfig *config.MailConfig,
) {
	router := NewRouter(stalwartService, jwtService, oauthService, mailConfig)

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

			// OAuth endpoints
			auth.GET("/oauth/:provider", router.oauthController.InitiateOAuth)
			auth.GET("/oauth/:provider/url", router.oauthController.GetAuthURL)
			auth.GET("/oauth/:provider/callback", router.oauthController.HandleCallback)
			auth.POST("/oauth/login", router.oauthController.OAuthLogin)
		}

		account := api.Group("/account")
		account.Use(router.authMiddleware.RequireAuth())
		{
			account.GET("/me", router.authController.GetAccount)
			account.GET("/accounts", router.authController.GetAccounts)
			account.GET("/signatures", router.settingsController.GetSignatures)
			account.POST("/signatures", router.settingsController.CreateSignature)
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

		meetings := api.Group("/meetings")
		meetings.Use(router.authMiddleware.RequireAuth())
		{
			meetings.GET("", router.meetingController.GetMeetings)
			meetings.GET("/:meetingId", router.meetingController.GetMeeting)
			meetings.POST("", router.meetingController.CreateMeeting)
			meetings.PUT("/:meetingId", router.meetingController.UpdateMeeting)
			meetings.DELETE("/:meetingId", router.meetingController.DeleteMeeting)
			meetings.POST("/:meetingId/join", router.meetingController.JoinMeeting)
			meetings.POST("/:meetingId/start", router.meetingController.StartMeeting)
			meetings.POST("/:meetingId/end", router.meetingController.EndMeeting)
			meetings.POST("/:meetingId/leave", router.meetingController.LeaveMeeting)
			meetings.GET("/:meetingId/participants", router.meetingController.GetParticipants)
			meetings.POST("/:meetingId/invite", router.meetingController.InviteParticipants)
			meetings.POST("/:meetingId/participants/:userId/remove", router.meetingController.RemoveParticipant)
			meetings.POST("/:meetingId/participants/:userId/mute", router.meetingController.MuteParticipant)
			meetings.POST("/:meetingId/participants/:userId/remove-from-call", router.meetingController.RemoveFromCall)
			meetings.GET("/:meetingId/recordings", router.meetingController.GetRecordings)
			meetings.GET("/:meetingId/recordings/:recordingId", router.meetingController.GetRecording)
			meetings.POST("/:meetingId/recordings/start", router.meetingController.StartRecording)
			meetings.POST("/:meetingId/recordings/stop", router.meetingController.StopRecording)
			meetings.DELETE("/:meetingId/recordings/:recordingId", router.meetingController.DeleteRecording)
		}

		conversations := api.Group("/meetings/conversations")
		conversations.Use(router.authMiddleware.RequireAuth())
		{
			conversations.GET("", router.meetingController.GetConversations)
			conversations.GET("/:conversationId", router.meetingController.GetConversation)
			conversations.POST("/:conversationId/start", router.meetingController.StartCall)
			conversations.POST("/:conversationId/accept", router.meetingController.AcceptCall)
			conversations.POST("/:conversationId/decline", router.meetingController.DeclineCall)
			conversations.POST("/:conversationId/hold", router.meetingController.ToggleHold)
			conversations.POST("/:conversationId/resume", router.meetingController.ToggleHold)
			conversations.POST("/:conversationId/mute", router.meetingController.ToggleMute)
			conversations.POST("/:conversationId/unmute", router.meetingController.ToggleMute)
			conversations.POST("/:conversationId/video-on", router.meetingController.ToggleVideo)
			conversations.POST("/:conversationId/video-off", router.meetingController.ToggleVideo)
			conversations.POST("/:conversationId/screenshare", router.meetingController.ToggleScreenShare)
			conversations.POST("/:conversationId/screenshare-stop", router.meetingController.ToggleScreenShare)
			conversations.GET("/:conversationId/participants", router.meetingController.GetParticipants)
			conversations.GET("/:conversationId/messages", router.meetingController.GetMessages)
			conversations.GET("/:conversationId/messages/:messageId", router.meetingController.GetMessage)
			conversations.POST("/:conversationId/messages", router.meetingController.SendMessage)
			conversations.DELETE("/:conversationId/messages/:messageId", router.meetingController.DeleteMessage)
		}

		meetingSettings := api.Group("/meetings/settings")
		meetingSettings.Use(router.authMiddleware.RequireAuth())
		{
			meetingSettings.GET("", router.meetingController.GetSettings)
			meetingSettings.PUT("", router.meetingController.UpdateSettings)
		}

		organization := api.Group("/organization")
		organization.Use(router.authMiddleware.RequireAuth())
		{
			organization.GET("", router.organizationController.GetOrganization)
			organization.PATCH("", router.organizationController.UpdateOrganization)
			organization.GET("/members", router.organizationController.GetMembers)
			organization.POST("/invites", router.organizationController.InviteMember)
			organization.DELETE("/members/:userId", router.organizationController.RemoveMember)
			organization.GET("/domains", router.organizationController.GetDomains)
			organization.POST("/domains", router.organizationController.AddDomain)
			organization.POST("/domains/:domainId/verify", router.organizationController.VerifyDomain)
		}

		tasks := api.Group("/tasks")
		tasks.Use(router.authMiddleware.RequireAuth())
		{
			tasks.GET("", router.todoController.GetTodos)
			tasks.GET("/:taskId", router.todoController.GetTodo)
			tasks.POST("", router.todoController.CreateTodo)
			tasks.PUT("/:id", router.todoController.UpdateTodo)
			tasks.DELETE("/:taskId", router.todoController.DeleteTodo)
			tasks.POST("/:id/complete", router.todoController.CompleteTodo)
		}

		taskLists := api.Group("/task-lists")
		taskLists.Use(router.authMiddleware.RequireAuth())
		{
			taskLists.GET("", router.todoController.GetTodoLists)
			taskLists.POST("", router.todoController.CreateTodoList)
		}

		settings := api.Group("/settings")
		settings.Use(router.authMiddleware.RequireAuth())
		{
			settings.GET("", router.settingsController.GetSettings)
			settings.PATCH("", router.settingsController.UpdateSettings)
			settings.GET("/vacation", router.settingsController.GetVacation)
			settings.PUT("/vacation", router.settingsController.UpdateVacation)
		}

		filters := api.Group("/filters")
		filters.Use(router.authMiddleware.RequireAuth())
		{
			filters.GET("", router.settingsController.GetFilters)
			filters.POST("", router.settingsController.CreateFilter)
			filters.PUT("/:id", router.settingsController.UpdateFilter)
			filters.DELETE("/:ruleId", router.settingsController.DeleteFilter)
		}

		labels := api.Group("/labels")
		labels.Use(router.authMiddleware.RequireAuth())
		{
			labels.GET("/:accountId", router.settingsController.GetLabels)
			labels.POST("", router.settingsController.CreateLabel)
			labels.PUT("/:labelId", router.settingsController.UpdateLabel)
			labels.DELETE("/:labelId", router.settingsController.DeleteLabel)
		}

		accountSignatures := api.Group("/account/signatures")
		accountSignatures.Use(router.authMiddleware.RequireAuth())
		{
			accountSignatures.PUT("/:id", router.settingsController.UpdateSignature)
			accountSignatures.DELETE("/:id", router.settingsController.DeleteSignature)
		}

		notifications := api.Group("/notifications")
		notifications.Use(router.authMiddleware.RequireAuth())
		{
			notifications.GET("", router.notificationController.GetNotifications)
			notifications.GET("/:notificationId", router.notificationController.GetNotification)
			notifications.POST("/mark-read", router.notificationController.MarkRead)
			notifications.POST("/:notificationId/dismiss", router.notificationController.Dismiss)
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