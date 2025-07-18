package authrouter

import (
	authhandler "server2/internal/handler/authHandler"

	"github.com/gofiber/fiber/v2"
)

func RegisterAuthRoutes(app *fiber.App) {
	authRoute := app.Group("/pingspot/api/auth")
	authRoute.Get("/", authhandler.DefaultHandler)
	authRoute.Post("/register", authhandler.RegisterHandler)
	authRoute.Post("/login", authhandler.LoginHandler)
}