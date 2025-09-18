package mainService

import (
	mainHandler "server/internal/handler/mainService"
	"server/internal/middleware"

	"github.com/gofiber/fiber/v2"
)

func RegisterReportRoutes(app *fiber.App) {
	reportRoute := app.Group("/pingspot/api/main/report", middleware.JWTProtected())
	reportRoute.Post("/", mainHandler.CreateReportHandler)
}