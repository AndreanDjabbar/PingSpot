package mainservice

import (
	"server/internal/middleware"

	"github.com/gofiber/fiber/v2"
)

func RegisterMainRoutes(app *fiber.App) {
	reportRoute := app.Group("/pingspot/api/main/report", middleware.JWTProtected())
	reportRoute.Post("/", createReportHandler)
}