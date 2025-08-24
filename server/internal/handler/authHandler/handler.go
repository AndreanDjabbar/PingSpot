package authhandler

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	dtoAuth "server/internal/dto/auth"
	"server/internal/infrastructure/cache"
	"server/internal/infrastructure/database"
	"server/internal/logger"
	authservice "server/internal/service/authService"
	"server/internal/validation"
	"server/internal/validation/authValidation"
	"server/pkg/utils/envUtils"
	mainutils "server/pkg/utils/mainUtils"
	"server/pkg/utils/responseUtils"
	"strconv"
	"time"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
	"github.com/markbates/goth/gothic"
	"github.com/redis/go-redis/v9"
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
	var req dtoAuth.RegisterRequest
	db := database.GetDB()
	if err := c.BodyParser(&req); err != nil {
		logger.Error("Failed to parse request body", zap.Error(err))
		return responseUtils.ResponseError(c, 400, "Format body request tidak valid", "", err.Error())
	}

	if err := validate.Struct(req); err != nil {
		errors := authValidation.FormatRegisterValidationErrors(err)
		logger.Error("Validation failed", zap.Error(err))
		return responseUtils.ResponseError(c, 400, "Validasi gagal", "errors", errors)
	}

	user, err := authservice.Register(db, req, false)
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

	redisClient := cache.GetRedis()

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

func VerificationHandler(c *fiber.Ctx) error {
	logger.Info("VERIFICATION HANDLER")
	code1 := c.Query("code1")
	userId := c.Query("userId")
	code2 := c.Query("code2")

	if code1 == "" || userId == "" || code2 == "" {
		return responseUtils.ResponseError(c, 400, "Parameter tidak lengkap", "", nil)
	}

	redisClient := cache.GetRedis()
	redisKey := fmt.Sprintf("link:%s", userId)
	linkData, err := redisClient.Get(c.Context(), redisKey).Result()
	if err != nil {
		var errorMsg string
		if err == redis.Nil {
			errorMsg = "Link verifikasi tidak ditemukan atau sudah kadaluarsa"
		} else {
			errorMsg = "Gagal mendapatkan kode verifikasi"
		}
		logger.Error("Failed to get verification link from Redis", zap.Error(err))
		return responseUtils.ResponseError(c, 500, "Gagal mendapatkan kode verifikasi", "", errorMsg)
	}

	var link map[string]string
	if err := json.Unmarshal([]byte(linkData), &link); err != nil {
		logger.Error("Failed to unmarshal verification link data", zap.Error(err))
		return responseUtils.ResponseError(c, 500, "Gagal memproses link verifikasi", "", err.Error())
	}

	if link["link1"] != code1 || link["link2"] != code2 {
		return responseUtils.ResponseError(c, 400, "link verifikasi tidak valid", "", "Link verifikasi tidak valid")
	}

	userIdUint, err := strconv.ParseUint(userId, 10, 32)
	if err != nil {
		logger.Error("Invalid user ID format", zap.Error(err))
		return responseUtils.ResponseError(c, 400, "ID pengguna tidak valid", "", err.Error())
	}

	db := database.GetDB()
	user, err := authservice.VerifyUser(db, uint(userIdUint))
	if err != nil {
		logger.Error("Verification failed", zap.Error(err))
		return responseUtils.ResponseError(c, 500, "Verifikasi gagal", "", err.Error())
	}

	if err := redisClient.Del(c.Context(), redisKey).Err(); err != nil {
		logger.Error("Failed to delete verification link from Redis", zap.Error(err))
	}

	dataUser := map[string]any{
		"username": user.Username,
		"email":    user.Email,
	}

	return responseUtils.ResponseSuccess(c, 200, "Akun berhasil diverifikasi", "data", dataUser)
}

func LoginHandler(c *fiber.Ctx) error {
	logger.Info("LOGIN HANDLER")
	var req dtoAuth.LoginRequest
	db := database.GetDB()
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

func GoogleLoginHandler(w http.ResponseWriter, r *http.Request) {
	logger.Info("GOOGLE LOGIN HANDLER")
	r = r.WithContext(context.WithValue(context.Background(), "provider", "google"))
	gothic.BeginAuthHandler(w, r)
}

func GoogleCallbackHandler(w http.ResponseWriter, r *http.Request) {
	logger.Info("GOOGLE CALLBACK HANDLER")
	r = r.WithContext(context.WithValue(context.Background(), "provider", "google"))
	user, err := gothic.CompleteUserAuth(w, r)
	if err != nil {
		logger.Error("Google authentication failed", zap.Error(err))
		http.Error(w, "Authentication failed", http.StatusUnauthorized)
		return
	}
	email := user.Email
	fullName := user.Name
	nickName := user.RawData["given_name"].(string)
	if nickName == "" {
		nickName = user.RawData["name"].(string)
	}
	providerId := user.RawData["id"].(string)
	logger.Info("Google user authenticated", zap.String("email", email), zap.String("name", fullName))

	db := database.GetDB()
	existingUser, err := authservice.GetUserByEmail(db, email)
	if err != nil {
		logger.Error("Error retrieving user by email", zap.Error(err))
		http.Error(w, "Terdapat masalah", http.StatusNotFound)
	}

	if existingUser == nil {

		newUser := dtoAuth.RegisterRequest{
			Username:   nickName,
			Email:      email,
			FullName:   fullName,
			Provider:   "GOOGLE",
			ProviderID: &providerId,
		}
		createdUser, err := authservice.Register(db, newUser, true)
		if err != nil {
			logger.Error("Error registering new user", zap.Error(err))
			http.Error(w, "Terdapat masalah saat registrasi", http.StatusInternalServerError)
			return
		}
		logger.Info("New user registered", zap.String("user_id", fmt.Sprintf("%d", createdUser.ID)))
		existingUser = createdUser
	}

	token, err := mainutils.GenerateJWT(existingUser.ID, []byte(envUtils.JWTSecret()), existingUser.Email, existingUser.Username, existingUser.FullName)
	if err != nil {
		logger.Error("Error generating token for Google user", zap.Error(err))
		http.Error(w, "Terdapat masalah saat login", http.StatusInternalServerError)
		return
	}
	http.Redirect(w, r, fmt.Sprintf("%s/auth/google?token=%s", envUtils.ClientURL(), token), http.StatusFound)
}

func ForgotPasswordEmailVerificationHandler(c *fiber.Ctx) error {
	logger.Info("FORGOT PASSWORD EMAIL VERIFICATION HANDLER")
	var req dtoAuth.ForgotPasswordEmailVerificationRequest
	db := database.GetDB()
	if err := c.BodyParser(&req); err != nil {
		logger.Error("Failed to parse request body", zap.Error(err))
		return responseUtils.ResponseError(c, 400, "Format body request tidak valid", "", err.Error())
	}
	if err := validate.Struct(req); err != nil {
		errors := authValidation.FormatForgotPasswordEmailVerificationValidationErrors(err)
		logger.Error("Validation failed", zap.Error(err))
		return responseUtils.ResponseError(c, 400, "Validasi gagal", "errors", errors)
	}

	user, err := authservice.GetUserByEmail(db, req.Email)
	if err != nil {
		logger.Error("Failed to get user by email", zap.Error(err))
		return responseUtils.ResponseError(c, 500, "Gagal mendapatkan pengguna", "", err.Error())
	}
	if user != nil {
		redisClient := cache.GetRedis()
		verificationCode, err := mainutils.GenerateRandomCode(200)
		if err != nil {
			logger.Error("Failed to generate verification code", zap.Error(err))
			return responseUtils.ResponseError(c, 500, "Gagal membuat kode verifikasi", "", err.Error())
		}
		verificationLink := fmt.Sprintf("%s/auth/forgot-password/verification?code=%s&email=%s", envUtils.ClientURL(), verificationCode, req.Email)
		redisKey := fmt.Sprintf("forgot_password:%s", req.Email)
		err = redisClient.Set(c.Context(), redisKey, verificationCode, 300*time.Second).Err()
		if err != nil {
			logger.Error("Failed to save verification code to Redis", zap.Error(err))
			return responseUtils.ResponseError(c, 500, "Gagal menyimpan kode verifikasi ke Redis", "", err.Error())
		}

		go func(email, username, link string) {
			if err := mainutils.SendEmail(email, username, "Pingspot - Verifikasi Email untuk mengatur ulang kata sandi", link); err != nil {
				logger.Error("Failed to send verification email (background)", zap.Error(err))
			}
		}(req.Email, req.Email, verificationLink)
	}
	return responseUtils.ResponseSuccess(c, 200, "Silahkan cek email anda untuk verifikasi pengaturan ulang kata sandi", "data", nil)
}

func ForgotPasswordLinkVerificationHandler(c *fiber.Ctx) error {
	logger.Info("FORGOT PASSWORD LINK VERIFICATION HANDLER")
	code := c.Query("code")
	email := c.Query("email")

	if code == "" || email == "" {
		return responseUtils.ResponseError(c, 400, "Parameter tidak lengkap", "", nil)
	}

	redisClient := cache.GetRedis()
	redisKey := fmt.Sprintf("forgot_password:%s", email)
	storedCode, err := redisClient.Get(c.Context(), redisKey).Result()
	if err != nil {
		if err == redis.Nil {
			return responseUtils.ResponseError(c, 400, "Link verifikasi tidak ditemukan atau sudah kadaluarsa", "", nil)
		}
		logger.Error("Failed to get verification code from Redis", zap.Error(err))
		return responseUtils.ResponseError(c, 500, "Gagal mendapatkan kode verifikasi", "", err.Error())
	}

	if storedCode != code {
		return responseUtils.ResponseError(c, 400, "Link verifikasi tidak valid", "", nil)
	}

	return responseUtils.ResponseSuccess(c, 200, "Link verifikasi berhasil", "data", map[string]any{
		"email": email,
	})
}

func ForgotPasswordResetPasswordHandler(c *fiber.Ctx) error {
	logger.Info("FORGOT PASSWORD RESET PASSWORD HANDLER")
	var req dtoAuth.ForgotPasswordResetPasswordRequest
	db := database.GetDB()
	if err := c.BodyParser(&req); err != nil {
		logger.Error("Failed to parse request body", zap.Error(err))
		return responseUtils.ResponseError(c, 400, "Format body request tidak valid", "", err.Error())
	}
	if err := validate.Struct(req); err != nil {
		errors := authValidation.FormatForgotPasswordResetPasswordValidationErrors(err)
		logger.Error("Validation failed", zap.Error(err))
		return responseUtils.ResponseError(c, 400, "Validasi gagal", "errors", errors)
	}

	user, err := authservice.GetUserByEmail(db, req.Email)
	if err != nil {
		logger.Error("Failed to get user by email", zap.Error(err))
		return responseUtils.ResponseError(c, 500, "Gagal mendapatkan pengguna", "", err.Error())
	}
	if user == nil {
		return responseUtils.ResponseError(c, 404, "Pengguna tidak ditemukan", "", "Email tidak terdaftar")
	}

	hashNewPassword, err := mainutils.HashPassword(req.Password)
	if err != nil {
		logger.Error("Failed to hash new password", zap.Error(err))
		return responseUtils.ResponseError(c, 500, "Gagal mengenkripsi kata sandi baru", "", err.Error())
	}
	user.Password = &hashNewPassword

	updatedUser, err := authservice.UpdateUserByEmail(db, req.Email, user)
	if err != nil {
		logger.Error("Failed to update user password", zap.Error(err))
		return responseUtils.ResponseError(c, 500, "Gagal memperbarui kata sandi", "", err.Error())
	}
	if updatedUser == nil {
		return responseUtils.ResponseError(c, 404, "Pengguna tidak ditemukan", "", "Email tidak terdaftar")
	}

	return responseUtils.ResponseSuccess(c, 200, "Kata sandi berhasil diperbarui. Silahkan masuk dengan identitas terbaru anda", "data", nil)
}

func LogoutHandler(c *fiber.Ctx) error {
	logger.Info("LOGOUT HANDLER")
	token := c.Get("Authorization")
	if token == "" {
		return responseUtils.ResponseError(c, 401, "Token tidak ditemukan", "", "Anda harus login terlebih dahulu")
	}

	if len(token) > 7 && token[:7] == "Bearer " {
		token = token[7:]
	}

	claims, err := mainutils.ParseJWT(token, []byte(envUtils.JWTSecret()))
	if err != nil {
		logger.Error("Failed to parse JWT token", zap.Error(err))
		return responseUtils.ResponseError(c, 401, "Token tidak valid", "", err.Error())
	}

	exp := claims["exp"].(float64)
	now := time.Now().Unix()
	ttl := time.Duration(int64(exp)-now) * time.Second

	if ttl > 0 {
		redisClient := cache.GetRedis()
		blacklistKey := fmt.Sprintf("blacklist:%s", token)

		err = redisClient.Set(c.Context(), blacklistKey, "true", ttl).Err()
		if err != nil {
			logger.Error("Failed to blacklist token in Redis", zap.Error(err))
			return responseUtils.ResponseError(c, 500, "Gagal memproses logout", "", err.Error())
		}

		logger.Info("Token blacklisted successfully", zap.String("token_prefix", token[:10]+"..."))
	}

	return responseUtils.ResponseSuccess(c, 200, "Logout berhasil", "data", nil)
}
