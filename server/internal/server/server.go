package server

import (
	"server/internal/logger"
	userRouter "server/internal/router/user"
	mainRouter "server/internal/router/mainService"
	"server/pkg/utils/envUtils"
	"server/pkg/utils/responseUtils"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
)

type FiberServer struct {
	*fiber.App
}

func New() *FiberServer {
    app := fiber.New(fiber.Config{
        ServerHeader: "Pingspot Server",
        AppName:      "Pingspot API Server",
        BodyLimit:    10 * 1024 * 1024,
    })

    app.Static("/user", "./uploads/user")
    app.Static("/main", "./uploads/main")

    return &FiberServer{
        App: app,
    }
}

func DefaultHandler(c *fiber.Ctx) error {
	logger.Info("DEFAULT CONTROLLER")
	data := map[string]any{
		"message":    "Welcome to Pingspot API.. Please check the repository for more information.",
		"repository": envUtils.GithubRepoURL(),
	}
	return responseUtils.ResponseSuccess(c, 200, "Welcome to Pingspot API", "data", data)
}

func (s *FiberServer) RegisterFiberRoutes() {
	s.App.Use(cors.New(cors.Config{
		AllowOrigins:     "*",
		AllowMethods:     "GET,POST,PUT,DELETE,OPTIONS,PATCH",
		AllowHeaders:     "Accept,Authorization,Content-Type",
		AllowCredentials: false,
		MaxAge:           300,
	}))
	defaultRoute := s.App.Group("/pingspot/api")
	defaultRoute.Get("/", DefaultHandler)

	mainRouter.RegisterRoutes(s.App)
	userRouter.RegisterRoutes(s.App)
}