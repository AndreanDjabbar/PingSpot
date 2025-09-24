package router

import (
	"server/internal/domain/reportService/handler"
	reportRepository "server/internal/domain/reportService/repository"
	"server/internal/domain/reportService/service"
	userRepository "server/internal/domain/userService/repository"
	"server/internal/infrastructure/database"
	"server/internal/middleware"

	"github.com/gofiber/fiber/v2"
)

func RegisterReportRoutes(app *fiber.App) {
	database := database.GetPostgresDB()
	reportRepo := reportRepository.NewReportRepository(database)
	reportLocationRepo := reportRepository.NewReportLocationRepository(database)
	reportImageRepo := reportRepository.NewReportImageRepository(database)
	userProfileRepo := userRepository.NewUserProfileRepository(database)
	userRepo := userRepository.NewUserRepository(database)
	reportService := service.NewreportService(reportRepo, reportLocationRepo, reportImageRepo, userRepo, userProfileRepo)
	reportHandler := handler.NewReportHandler(reportService)

	reportRoute := app.Group("/pingspot/api/report", middleware.JWTProtected())
	reportRoute.Post("/", reportHandler.CreateReportHandler)
	reportRoute.Get("/", reportHandler.GetReportHandler)
}
