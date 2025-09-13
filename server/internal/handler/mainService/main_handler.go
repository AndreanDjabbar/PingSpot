package mainService

import (
	"server/pkg/logger"
	"server/pkg/utils/env"
	mainutils "server/pkg/utils/mainUtils"
	"server/pkg/utils/response"

	"github.com/gofiber/fiber/v2"
	"go.uber.org/zap"
)

func DefaultHandler(c *fiber.Ctx) error {
	logger.Info("DEFAULT MAIN HANDLER")
	_, error := mainutils.GetJWTClaims(c)
	if error != nil {
		logger.Error("Failed to get JWT claims", zap.Error(error))
		return response.ResponseError(c, 401, "Token tidak valid", "", "Anda harus login terlebih dahulu")
	}
	data := map[string]any{
		"message":    "Selamat datang di Pingspot MAIN API.. Silakan cek repository untuk informasi lebih lanjut.",
		"repository": env.GithubRepoURL(),
	}
	return response.ResponseSuccess(c, 200, "Selamat datang di Pingspot MAIN API", "data", data)
}
