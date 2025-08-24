package auth

import (
	authHandler "server/internal/handler/auth"

	"github.com/gofiber/adaptor/v2"
	"github.com/gofiber/fiber/v2"
)

func RegisterRoutes(app *fiber.App) {
	authRoute := app.Group("/pingspot/api/auth")
	authRoute.Get("/", authHandler.DefaultHandler)
	authRoute.Post("/verification", authHandler.VerificationHandler)
	authRoute.Post("/register", authHandler.RegisterHandler)
	authRoute.Post("/login", authHandler.LoginHandler)
	authRoute.Post("/logout", authHandler.LogoutHandler)
	authRoute.Post("/forgot-password/email-verification", authHandler.ForgotPasswordEmailVerificationHandler)
	authRoute.Post("/forgot-password/link-verification", authHandler.ForgotPasswordLinkVerificationHandler)
	authRoute.Post("/forgot-password/reset-password", authHandler.ForgotPasswordResetPasswordHandler)
	authRoute.Get("/google", adaptor.HTTPHandlerFunc(authHandler.GoogleLoginHandler))
	authRoute.Get("/google/callback", adaptor.HTTPHandlerFunc(authHandler.GoogleCallbackHandler))
}