package router

import (
	"server/internal/domain/mainService/handler"
	"server/internal/domain/mainService/repository"
	"server/internal/domain/mainService/service"
	"server/internal/infrastructure/database"
	"server/internal/middleware"

	"github.com/gofiber/fiber/v2"
)

func RegisterMainRoutes(app *fiber.App) {
	database := database.GetDB()
	reportRepo := repository.NewReportRepository(database)
	reportLocationRepo := repository.NewReportLocationRepository(database)
	reportImageRepo := repository.NewReportImageRepository(database)
	mainService := service.NewMainService(reportRepo, reportLocationRepo, reportImageRepo, database)
	mainHandler := handler.NewMainHandler(mainService)

	reportRoute := app.Group("/pingspot/api/main/report", middleware.JWTProtected())
	reportRoute.Post("/", mainHandler.CreateReportHandler)
}