package user

import (
	userHandler "server/internal/handler/user"
	"server/internal/middleware"

	"github.com/gofiber/adaptor/v2"
	"github.com/gofiber/fiber/v2"
)

func RegisterRoutes(app *fiber.App) {
	authRoute := app.Group("/pingspot/api/user/auth")
	authRoute.Get("/", userHandler.DefaultHandler)
	authRoute.Post("/verification", userHandler.VerificationHandler)
	authRoute.Post("/register", userHandler.RegisterHandler)
	authRoute.Post("/login", userHandler.LoginHandler)
	authRoute.Post("/logout", userHandler.LogoutHandler)
	authRoute.Post("/forgot-password/email-verification", userHandler.ForgotPasswordEmailVerificationHandler)
	authRoute.Post("/forgot-password/link-verification", userHandler.ForgotPasswordLinkVerificationHandler)
	authRoute.Post("/forgot-password/reset-password", userHandler.ForgotPasswordResetPasswordHandler)
	authRoute.Get("/google", adaptor.HTTPHandlerFunc(userHandler.GoogleLoginHandler))
	authRoute.Get("/google/callback", adaptor.HTTPHandlerFunc(userHandler.GoogleCallbackHandler))

	profileRoute := app.Group("/pingspot/api/user/profile", middleware.JWTProtected())
	profileRoute.Get("/", userHandler.DefaultHandler)
	profileRoute.Post("/", userHandler.SaveUserProfileHandler)
}