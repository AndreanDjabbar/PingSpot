package router

import (
	"server/internal/domain/userService/handler"
	"server/internal/domain/userService/repository"
	"server/internal/domain/userService/service"
	"server/internal/infrastructure/database"
	"server/internal/middleware"

	"github.com/gofiber/fiber/v2"
)

func RegisterUserRoutes(app *fiber.App) {
	db := database.GetPostgresDB()
	userRepo := repository.NewUserRepository(db)
	userProfileRepo := repository.NewUserProfileRepository(db)
	userService := service.NewUserService(userRepo, userProfileRepo)
	userHandler := handler.NewUserHandler(userService)

	profileRoute := app.Group("/pingspot/api/user/profile", middleware.ValidateAccessToken())
	profileRoute.Get("/", userHandler.GetProfileHandler)
	profileRoute.Post("/", userHandler.SaveUserProfileHandler)

	securityRoute := app.Group("/pingspot/api/user/security", middleware.ValidateAccessToken())
	securityRoute.Post("/", userHandler.SaveUserSecurityHandler)
}
