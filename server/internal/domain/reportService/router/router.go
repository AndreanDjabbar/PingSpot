package router

import (
	"server/internal/domain/reportService/handler"
	"server/internal/domain/reportService/repository"
	"server/internal/domain/reportService/service"
	"server/internal/infrastructure/database"
	"server/internal/middleware"

	"github.com/gofiber/fiber/v2"
)

func RegisterReportRoutes(app *fiber.App) {
	database := database.GetPostgresDB()
	reportRepo := repository.NewReportRepository(database)
	reportLocationRepo := repository.NewReportLocationRepository(database)
	reportImageRepo := repository.NewReportImageRepository(database)
	reportService := service.NewreportService(reportRepo, reportLocationRepo, reportImageRepo)
	reportHandler := handler.NewReportHandler(reportService)

	reportRoute := app.Group("/pingspot/api/report", middleware.JWTProtected())
	reportRoute.Post("/", reportHandler.CreateReportHandler)
}
