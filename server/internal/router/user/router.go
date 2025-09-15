package user

import (
	"github.com/gofiber/fiber/v2"
)

func RegisterRoutes(app *fiber.App) {
	registerAuthRoutes(app)
	registerProfileRoutes(app)
	registerSecurityRoutes(app)
}