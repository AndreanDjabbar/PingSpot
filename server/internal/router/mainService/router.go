package mainService

import (
	mainHandler "server/internal/handler/mainService"
	"server/internal/middleware"

	"github.com/gofiber/fiber/v2"
)

func RegisterRoutes(app *fiber.App) {
	mainRoute := app.Group("pingspot/api/main", middleware.JWTProtected())
	mainRoute.Get("/", mainHandler.DefaultHandler)
}