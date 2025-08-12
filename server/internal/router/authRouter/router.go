package authrouter

import (
	authhandler "server2/internal/handler/authHandler"

	"github.com/gofiber/adaptor/v2"
	"github.com/gofiber/fiber/v2"
)

func RegisterAuthRoutes(app *fiber.App) {
	authRoute := app.Group("/pingspot/api/auth")
	authRoute.Get("/", authhandler.DefaultHandler)
	authRoute.Post("/verification", authhandler.VerificationHandler)
	authRoute.Post("/register", authhandler.RegisterHandler)
	authRoute.Post("/login", authhandler.LoginHandler)
	authRoute.Post("/logout", authhandler.LogoutHandler)
	authRoute.Post("/forgot-password/email-verification", authhandler.ForgotPasswordEmailVerificationHandler)
	authRoute.Post("/forgot-password/link-verification", authhandler.ForgotPasswordLinkVerificationHandler)
	authRoute.Post("/forgot-password/reset-password", authhandler.ForgotPasswordResetPasswordHandler)
	authRoute.Get("/google", adaptor.HTTPHandlerFunc(authhandler.GoogleLoginHandler))
	authRoute.Get("/google/callback", adaptor.HTTPHandlerFunc(authhandler.GoogleCallbackHandler))
}