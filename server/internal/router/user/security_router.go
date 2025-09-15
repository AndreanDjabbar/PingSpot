package user

import (
	userHandler "server/internal/handler/user"
	"server/internal/middleware"
	"github.com/gofiber/fiber/v2"
)

func registerSecurityRoutes(app *fiber.App) {
    profileRoute := app.Group("/pingspot/api/user/security", middleware.JWTProtected())
    profileRoute.Get("/", userHandler.DefaultHandler)
    profileRoute.Post("/", userHandler.SaveUserSecurityHandler)
}
