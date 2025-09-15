package user

import (
	userDto "server/internal/dto/user"
	"server/internal/infrastructure/database"
	userService "server/internal/service/user"
	userValidation "server/internal/validation/user"
	"server/pkg/logger"
	mainutils "server/pkg/utils/mainUtils"
	"server/pkg/utils/response"
	"github.com/gofiber/fiber/v2"
	"go.uber.org/zap"
)

func SaveUserSecurityHandler(c *fiber.Ctx) error {
	logger.Info("SAVE USER SECURITY HANDLER")
	var req userDto.SaveUserSecurityRequest
	if err := c.BodyParser(&req); err != nil {
		logger.Error("Failed to parse request body", zap.Error(err))
		return response.ResponseError(c, 400, "Format body request tidak valid", "", err.Error())
	}
	if err := userValidation.Validate.Struct(req); err != nil {
		errors := userValidation.FormatSaveUserSecurityValidationErrors(err)
		logger.Error("Validation failed", zap.Error(err))
		return response.ResponseError(c, 400, "Validasi gagal", "errors", errors)
	}
	claims, err := mainutils.GetJWTClaims(c)
	if err != nil {
		logger.Error("Failed to get JWT claims", zap.Error(err))
		return response.ResponseError(c, 401, "Token tidak valid", "", "Anda harus login terlebih dahulu")
	}
	userId := uint(claims["user_id"].(float64))
	db := database.GetDB()
	if err := userService.SaveSecurity(db, userId, req); err != nil {
		logger.Error("Failed to update user password", zap.Error(err))
		return response.ResponseError(c, 500, "Gagal memperbarui kata sandi", "", err.Error())
	}
	return response.ResponseSuccess(c, 200, "Kata sandi berhasil diperbarui. Silahkan masuk kembali dengan kata sandi baru anda.", "data", nil)
}