package mainRouter

import (
	"server2/internal/handler/mainHandler"
	"server2/internal/middleware"

	"github.com/gofiber/fiber/v2"
)

func RegisterMainRoutes(app *fiber.App) {
	mainRoute := app.Group("pingspot/api/main", middleware.JWTProtected())
	mainRoute.Get("/", mainHandler.DefaultHandler)
}