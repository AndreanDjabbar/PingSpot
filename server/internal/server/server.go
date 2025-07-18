package server

import (
	"server2/internal/logger"
	authrouter "server2/internal/router/authRouter"
	"server2/internal/router/mainRouter"
	"server2/pkg/utils/envUtils"
	"server2/pkg/utils/responseUtils"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
)

type FiberServer struct {
	*fiber.App
}

func New() *FiberServer {
	server := &FiberServer{
		App: fiber.New(fiber.Config{
			ServerHeader: "Pingspot Server",
			AppName:      "Pingspot API Server",
		}),
	}
	return server
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

	mainRouter.RegisterMainRoutes(s.App)
	authrouter.RegisterAuthRoutes(s.App)
}