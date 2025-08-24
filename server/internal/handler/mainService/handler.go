package mainService

import (
	"server/internal/logger"
	"server/pkg/utils/envUtils"
	mainutils "server/pkg/utils/mainUtils"
	"server/pkg/utils/responseUtils"

	"github.com/gofiber/fiber/v2"
	"go.uber.org/zap"
)

func DefaultHandler(c *fiber.Ctx) error {
	logger.Info("DEFAULT MAIN HANDLER")
	_, error := mainutils.GetJWTClaims(c)
	if error != nil {
		logger.Error("Failed to get JWT claims", zap.Error(error))
		return responseUtils.ResponseError(c, 401, "Token tidak valid", "", "Anda harus login terlebih dahulu")
	}
	data := map[string]any{
		"message":    "Selamat datang di Pingspot MAIN API.. Silakan cek repository untuk informasi lebih lanjut.",
		"repository": envUtils.GithubRepoURL(),
	}
	return responseUtils.ResponseSuccess(c, 200, "Selamat datang di Pingspot MAIN API", "data", data)
}
