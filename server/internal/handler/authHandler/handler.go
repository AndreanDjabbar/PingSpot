package authhandler

import (
	"encoding/json"
	"fmt"
	"server2/internal/config"
	"server2/internal/dto"
	"server2/internal/logger"
	authservice "server2/internal/service/authService"
	"server2/internal/validation"
	"server2/internal/validation/authValidation"
	"server2/pkg/utils/envUtils"
	mainutils "server2/pkg/utils/mainUtils"
	"server2/pkg/utils/responseUtils"
	"time"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
	"go.uber.org/zap"
)

var validate *validator.Validate

func init() {
	validate = validator.New()
	validation.RegisterCustomValidations(validate)
}

func DefaultHandler(c *fiber.Ctx) error {
	logger.Info("DEFAULT AUTH HANDLER")
	data := map[string]any{
		"message":    "Selamat datang di Pingspot AUTH API.. Silakan cek repository untuk informasi lebih lanjut.",
		"repository": envUtils.GithubRepoURL(),
	}
	return responseUtils.ResponseSuccess(c, 200, "Selamat datang di Pingspot AUTH API", "data", data)
}

func RegisterHandler(c *fiber.Ctx) error {
	logger.Info("REGISTER HANDLER")
	var req dto.RegisterRequest
	db := config.GetDB()
	if err := c.BodyParser(&req); err != nil {
		logger.Error("Failed to parse request body", zap.Error(err))
		return responseUtils.ResponseError(c, 400, "Format body request tidak valid", "", err.Error())
	}

	if err := validate.Struct(req); err != nil {
		errors := authValidation.FormatRegisterValidationErrors(err)
		logger.Error("Validation failed", zap.Error(err))
		return responseUtils.ResponseError(c, 400, "Validasi gagal", "errors", errors)
	}

	user, err := authservice.Register(db, req)
	if err != nil {
		logger.Error("Registration failed", zap.Error(err))
		return responseUtils.ResponseError(c, 500, "Registrasi gagal", "", err.Error())
	}

	newUser := map[string]any{
		"id":         user.ID,
		"username":   user.Username,
		"email":      user.Email,
		"created_at": user.CreatedAt,
		"updated_at": user.UpdatedAt,
	}

	randomCode1, err := mainutils.GenerateRandomCode(150)
	if err != nil {
		logger.Error("Failed to generate random code", zap.Error(err))
		return responseUtils.ResponseError(c, 500, "Gagal membuat kode acak", "", err.Error())
	}
	randomCode2, err := mainutils.GenerateRandomCode(150)
	if err != nil {
		logger.Error("Failed to generate random code", zap.Error(err))
		return responseUtils.ResponseError(c, 500, "Gagal membuat kode acak", "", err.Error())
	}
	verificationLink := fmt.Sprintf("%s/auth/verification?code1=%s&userId=%d&code2=%s", envUtils.ClientURL(), randomCode1, user.ID, randomCode2)

	redisClient := config.GetRedis()

	linkData := map[string]string{
		"link1": randomCode1,
		"link2": randomCode2,
	}
	linkJSON, err := json.Marshal(linkData)
	if err != nil {
		logger.Error("Failed to marshal verification link data", zap.Error(err))
		return responseUtils.ResponseError(c, 500, "Gagal menyimpan kode verifikasi", "", err.Error())
	}

	redisKey := fmt.Sprintf("link:%d", newUser["id"])
	err = redisClient.Set(c.Context(), redisKey, linkJSON, 300*time.Second).Err()
	if err != nil {
		logger.Error("Failed to save verification link to Redis", zap.Error(err))
		return responseUtils.ResponseError(c, 500, "Gagal menyimpan kode verifikasi ke Redis", "", err.Error())
	}

	go func(email, username, link string) {
		if err := mainutils.SendEmail(email, username, "Pingspot - Verifikasi Registrasi", link); err != nil {
			logger.Error("Failed to send verification email (background)", zap.Error(err))
		}
	}(newUser["email"].(string), newUser["username"].(string), verificationLink)

	logger.Info("User registered successfully", zap.String("user_id", fmt.Sprintf("%d", user.ID)))

	return responseUtils.ResponseSuccess(c, 200, "Registrasi berhasil. Silahkan cek email anda untuk verifikasi akun", "data", newUser)
}

func LoginHandler(c *fiber.Ctx) error {
	logger.Info("LOGIN HANDLER")
	var req dto.LoginRequest
	db := config.GetDB()
	if err := c.BodyParser(&req); err != nil {
		logger.Error("Failed to parse request body", zap.Error(err))
		return responseUtils.ResponseError(c, 400, "Format body request tidak valid", "", err.Error())
	}

	if err := validate.Struct(req); err != nil {
		errors := authValidation.FormatLoginValidationErrors(err)
		logger.Error("Validation failed", zap.Error(err))
		return responseUtils.ResponseError(c, 400, "Validasi gagal", "errors", errors)
	}

	_, token, err := authservice.Login(db, req)
	if err != nil {
		logger.Error("Login failed", zap.Error(err))
		return responseUtils.ResponseError(c, 401, "Login gagal", "", err.Error())
	}

	return responseUtils.ResponseSuccess(c, 200, "Login berhasil", "data", map[string]any{
		"token": token,
	})
}