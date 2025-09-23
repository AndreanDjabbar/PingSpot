package router

import (
	authRouter "server/internal/domain/authService/router"
	mainRouter "server/internal/domain/reportService/router"
	userRouter "server/internal/domain/userService/router"

	"github.com/gofiber/fiber/v2"
)

func RegisterRoutes(app *fiber.App) {
	userRouter.RegisterUserRoutes(app)
	authRouter.RegisterAuthRoutes(app)
	mainRouter.RegisterReportRoutes(app)
}
