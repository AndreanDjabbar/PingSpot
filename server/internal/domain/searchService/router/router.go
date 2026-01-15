package router

import (
	reportRepository "server/internal/domain/reportService/repository"
	"server/internal/domain/searchService/handler"
	"server/internal/domain/searchService/service"
	userRepository "server/internal/domain/userService/repository"
	"server/internal/infrastructure/database"
	"server/internal/middleware"
	"time"

	"github.com/gofiber/fiber/v2"
)

func RegisterSearchRoutes(app *fiber.App) {
	db := database.GetPostgresDB()
	userRepo := userRepository.NewUserRepository(db)
	reportRepo := reportRepository.NewReportRepository(db)

	searchService := service.NewSearchService(userRepo, reportRepo)
	searchHandler := handler.NewSearchHandler(searchService)

	searchRoute := app.Group("/pingspot/api/search", middleware.ValidateAccessToken())
	searchRoute.Get("/", 
	middleware.TimeoutMiddleware(40*time.Second),
	middleware.UserRateLimiterMiddleware(middleware.NewRateLimiter(middleware.RateLimiterConfig{
		Window:      1 * time.Minute,
		MaxRequests: 150,
		KeyPrefix: "search_requests",
	})), 
	searchHandler.HandleSearch,
	)
}
