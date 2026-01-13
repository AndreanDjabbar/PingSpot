package router

import (
	"server/internal/domain/userService/handler"
	"server/internal/domain/userService/repository"
	"server/internal/domain/userService/service"
	"server/internal/infrastructure/database"
	"server/internal/middleware"
	"time"

	"github.com/gofiber/fiber/v2"
)

func RegisterUserRoutes(app *fiber.App) {
	db := database.GetPostgresDB()
	userRepo := repository.NewUserRepository(db)
	userProfileRepo := repository.NewUserProfileRepository(db)
	userService := service.NewUserService(userRepo, userProfileRepo)
	userHandler := handler.NewUserHandler(userService)

	userRoute := app.Group("/pingspot/api/user", middleware.ValidateAccessToken())

	userRoute.Get("/statistics", 
	middleware.TimeoutMiddleware(15*time.Second),
	middleware.UserRateLimiterMiddleware(middleware.NewRateLimiter(middleware.RateLimiterConfig{
		Window:      1 * time.Minute,
		MaxRequests: 100,
	})),  
	userHandler.GetUserStatistics,
	)

	profileRoute := app.Group("/pingspot/api/user/profile", middleware.ValidateAccessToken())

	profileRoute.Get("/", 
	middleware.TimeoutMiddleware(5*time.Second),
	middleware.UserRateLimiterMiddleware(middleware.NewRateLimiter(middleware.RateLimiterConfig{
		Window:      1 * time.Minute,
		MaxRequests: 50,
	})), 
	userHandler.GetProfileHandler,
	)
	profileRoute.Get("/:username", 
	middleware.TimeoutMiddleware(5*time.Second),
	middleware.UserRateLimiterMiddleware(middleware.NewRateLimiter(middleware.RateLimiterConfig{
		Window:      1 * time.Minute,
		MaxRequests: 100,
	})), 
	userHandler.GetProfileByUsernameHandler,
	)
	profileRoute.Post("/", 
	middleware.TimeoutMiddleware(10*time.Second), 
	middleware.UserRateLimiterMiddleware(middleware.NewRateLimiter(middleware.RateLimiterConfig{
		Window:      1 * time.Minute,
		MaxRequests: 100,
	})), 
	userHandler.SaveUserProfileHandler,
	)

	securityRoute := app.Group("/pingspot/api/user/security", middleware.ValidateAccessToken())
	
	securityRoute.Post("/", 
	middleware.TimeoutMiddleware(10*time.Second),
	middleware.UserRateLimiterMiddleware(middleware.NewRateLimiter(middleware.RateLimiterConfig{
		Window:      1 * time.Minute,
		MaxRequests: 50,
	})),  
	userHandler.SaveUserSecurityHandler,
	)
}
