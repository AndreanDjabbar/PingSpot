package userservice

import (
	"server/internal/middleware"

	"github.com/gofiber/fiber/v2"
)

func RegisterUserRoutes(app *fiber.App) {
	profileRoute := app.Group("/pingspot/api/user/profile", middleware.JWTProtected())
    profileRoute.Get("/", getProfileHandler)
    profileRoute.Post("/", saveUserProfileHandler)

	securityRoute := app.Group("/pingspot/api/user/security", middleware.JWTProtected())
    securityRoute.Post("/", saveUserSecurityHandler)
}