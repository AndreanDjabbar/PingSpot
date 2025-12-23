package router

import (
	authRouter "server/internal/domain/authService/router"
	mainRouter "server/internal/domain/reportService/router"
	searchRouter "server/internal/domain/searchService/router"
	userRouter "server/internal/domain/userService/router"

	"github.com/gofiber/fiber/v2"
)

func RegisterRoutes(app *fiber.App) {
	userRouter.RegisterUserRoutes(app)
	authRouter.RegisterAuthRoutes(app)
	searchRouter.RegisterSearchRoutes(app)
	mainRouter.RegisterReportRoutes(app)
}
