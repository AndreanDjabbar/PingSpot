package mainHandler

import (
	"server2/internal/logger"
	"server2/pkg/utils/envUtils"
	"server2/pkg/utils/responseUtils"

	"github.com/gofiber/fiber/v2"
)

func DefaultHandler(c *fiber.Ctx) error {
	logger.Info("DEFAULT MAIN HANDLER")
	data := map[string]any{
		"message":    "Selamat datang di Pingspot MAIN API.. Silakan cek repository untuk informasi lebih lanjut.",
		"repository": envUtils.GithubRepoURL(),
	}
	return responseUtils.ResponseSuccess(c, 200, "Selamat datang di Pingspot MAIN API", "data", data)
}
