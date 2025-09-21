package router

import (
	authservice "server/internal/domain/authService"
	mainservice "server/internal/domain/mainService"
	userservice "server/internal/domain/userService"

	"github.com/gofiber/fiber/v2"
)

func RegisterRoutes(app *fiber.App) {
	userservice.RegisterUserRoutes(app)
	authservice.RegisterAuthRoutes(app)
	mainservice.RegisterMainRoutes(app)
}