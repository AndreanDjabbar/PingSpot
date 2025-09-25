package router

import (
	"server/internal/domain/authService/handler"
	"server/internal/domain/authService/service"
	"server/internal/domain/userService/repository"
	"server/internal/infrastructure/database"

	"github.com/gofiber/adaptor/v2"
	"github.com/gofiber/fiber/v2"
)

func RegisterAuthRoutes(app *fiber.App) {
	db := database.GetPostgresDB()
	userRepo := repository.NewUserRepository(db)
	userProfileRepo := repository.NewUserProfileRepository(db)
	authService := service.NewAuthService(userRepo, userProfileRepo)
	authHandler := handler.NewAuthHandler(authService)

	authRoute := app.Group("/pingspot/api/auth")
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
