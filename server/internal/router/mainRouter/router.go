package mainRouter

import (
	"server/internal/handler/mainHandler"
	"server/internal/middleware"

	"github.com/gofiber/fiber/v2"
)

func RegisterMainRoutes(app *fiber.App) {
	mainRoute := app.Group("pingspot/api/main", middleware.JWTProtected())
	mainRoute.Get("/", mainHandler.DefaultHandler)
}