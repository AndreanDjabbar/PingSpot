package authservice

import (
	"github.com/gofiber/adaptor/v2"
	"github.com/gofiber/fiber/v2"
)

func RegisterAuthRoutes(app *fiber.App) {
	authRoute := app.Group("/pingspot/api/auth")
	authRoute.Post("/verification", verificationHandler)
	authRoute.Post("/register", registerHandler)
	authRoute.Post("/login", loginHandler)
	authRoute.Post("/logout", logoutHandler)
	authRoute.Post("/forgot-password/email-verification", forgotPasswordEmailVerificationHandler)
	authRoute.Post("/forgot-password/link-verification", forgotPasswordLinkVerificationHandler)
	authRoute.Post("/forgot-password/reset-password", forgotPasswordResetPasswordHandler)
	authRoute.Get("/google", adaptor.HTTPHandlerFunc(googleLoginHandler))
	authRoute.Get("/google/callback", adaptor.HTTPHandlerFunc(googleCallbackHandler))
}