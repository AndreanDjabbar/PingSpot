package router

import (
	"server/internal/domain/authService/handler"
	"server/internal/domain/authService/service"
	"server/internal/domain/userService/repository"
	"server/internal/infrastructure/database"
	"server/internal/middleware"
	"time"

	"github.com/gofiber/adaptor/v2"
	"github.com/gofiber/fiber/v2"
)

func RegisterAuthRoutes(app *fiber.App) {
	db := database.GetPostgresDB()
	userRepo := repository.NewUserRepository(db)
	userProfileRepo := repository.NewUserProfileRepository(db)
	userSessionRepo := repository.NewUserSessionRepository(db)
	authService := service.NewAuthService(userRepo, userProfileRepo, userSessionRepo)
	authHandler := handler.NewAuthHandler(authService)

	authRoute := app.Group("/pingspot/api/auth")

	authRoute.Post("/verification", 
	middleware.TimeoutMiddleware(10*time.Second), 
	authHandler.VerificationHandler,
	)

	authRoute.Post("/register", 
	middleware.TimeoutMiddleware(15*time.Second), 
	middleware.UserRateLimiterMiddleware(middleware.NewRateLimiter(middleware.RateLimiterConfig{
		Window:      10 * time.Minute,
		MaxRequests: 6,
	})),
	authHandler.RegisterHandler,
	)

	authRoute.Post("/login", 
	middleware.TimeoutMiddleware(10*time.Second), 
	middleware.UserRateLimiterMiddleware(middleware.NewRateLimiter(middleware.RateLimiterConfig{
		Window:      10 * time.Minute,
		MaxRequests: 6,
	})),
	authHandler.LoginHandler,
	)

	authRoute.Post("/logout", 
	middleware.TimeoutMiddleware(5*time.Second),
	middleware.UserRateLimiterMiddleware(middleware.NewRateLimiter(middleware.RateLimiterConfig{
		Window:      10 * time.Minute,
		MaxRequests: 5,
	})), 
	authHandler.LogoutHandler,
	)

	authRoute.Post("/forgot-password/email-verification",
	middleware.UserRateLimiterMiddleware(middleware.NewRateLimiter(middleware.RateLimiterConfig{
		Window:      10 * time.Minute,
		MaxRequests: 6,
	})),
	middleware.TimeoutMiddleware(10*time.Second), 
	authHandler.ForgotPasswordEmailVerificationHandler,
	)

	authRoute.Post("/forgot-password/link-verification", 
	middleware.TimeoutMiddleware(5*time.Second), 
	middleware.UserRateLimiterMiddleware(middleware.NewRateLimiter(middleware.RateLimiterConfig{
		Window:      10 * time.Minute,
		MaxRequests: 6,
	})),
	authHandler.ForgotPasswordLinkVerificationHandler,
	)

	authRoute.Post("/forgot-password/reset-password", 
	middleware.TimeoutMiddleware(5*time.Second), 
	middleware.UserRateLimiterMiddleware(middleware.NewRateLimiter(middleware.RateLimiterConfig{
		Window:      10 * time.Minute,
		MaxRequests: 6,
	})),
	authHandler.ForgotPasswordResetPasswordHandler,
	)

	authRoute.Post("/refresh-token", 
	middleware.TimeoutMiddleware(8*time.Second), 
	middleware.UserRateLimiterMiddleware(middleware.NewRateLimiter(middleware.RateLimiterConfig{
		Window:      1 * time.Minute,
		MaxRequests: 20,
	})),
	authHandler.RefreshTokenHandler,
	)

	authRoute.Get("/google", 
	middleware.TimeoutMiddleware(3*time.Second), 
	middleware.UserRateLimiterMiddleware(middleware.NewRateLimiter(middleware.RateLimiterConfig{
		Window:      1 * time.Minute,
		MaxRequests: 10,
	})),
	adaptor.HTTPHandlerFunc(authHandler.GoogleLoginHandler),
	)

	authRoute.Get("/google/callback", 
	middleware.TimeoutMiddleware(10*time.Second), 
	middleware.UserRateLimiterMiddleware(middleware.NewRateLimiter(middleware.RateLimiterConfig{
		Window:      1 * time.Minute,
		MaxRequests: 10,
	})),
	adaptor.HTTPHandlerFunc(authHandler.GoogleCallbackHandler),
	)
}
