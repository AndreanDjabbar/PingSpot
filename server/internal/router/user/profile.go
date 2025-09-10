package user

import (
	userHandler "server/internal/handler/user"
	"server/internal/middleware"
	"github.com/gofiber/fiber/v2"
)

func registerProfileRoutes(app *fiber.App) {
    profileRoute := app.Group("/pingspot/api/user/profile", middleware.JWTProtected())
    profileRoute.Get("/", userHandler.DefaultHandler)
    profileRoute.Post("/", userHandler.SaveUserProfileHandler)
    profileRoute.Get("/me", userHandler.GetMyProfileHandler)
}
