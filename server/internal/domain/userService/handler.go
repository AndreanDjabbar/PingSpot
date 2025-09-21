package userservice

import (
	"fmt"
	"path/filepath"
	"server/internal/infrastructure/database"
	"server/pkg/logger"
	"server/pkg/utils/env"
	mainutils "server/pkg/utils/mainUtils"
	"server/pkg/utils/response"
	"time"

	"github.com/gofiber/fiber/v2"
	"go.uber.org/zap"
)

func defaultHandler(c *fiber.Ctx) error {
	logger.Info("DEFAULT AUTH HANDLER")
	data := map[string]any{
		"message":    "Selamat datang di Pingspot AUTH API.. Silakan cek repository untuk informasi lebih lanjut.",
		"repository": env.GithubRepoURL(),
	}
	return response.ResponseSuccess(c, 200, "Selamat datang di Pingspot AUTH API", "data", data)
}

func saveUserSecurityHandler(c *fiber.Ctx) error {
	logger.Info("SAVE USER SECURITY HANDLER")
	var req saveUserSecurityRequest
	if err := c.BodyParser(&req); err != nil {
		logger.Error("Failed to parse request body", zap.Error(err))
		return response.ResponseError(c, 400, "Format body request tidak valid", "", err.Error())
	}
	if err := validate.Struct(req); err != nil {
		errors := formatSaveUserSecurityValidationErrors(err)
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
	if err := SaveSecurity(db, userId, req); err != nil {
		logger.Error("Failed to update user password", zap.Error(err))
		return response.ResponseError(c, 500, "Gagal memperbarui kata sandi", "", err.Error())
	}
	return response.ResponseSuccess(c, 200, "Kata sandi berhasil diperbarui. Silahkan masuk kembali dengan kata sandi baru anda.", "data", nil)
}

func saveUserProfileHandler(c *fiber.Ctx) error {
	logger.Info("SAVE USER PROFILE HANDLER")
	_, err := c.MultipartForm()
	if err != nil {
		logger.Error("Failed to parse multipart form", zap.Error(err))
		return response.ResponseError(c, 400, "Format body request tidak valid", "", err.Error())
	}
	fullName := c.FormValue("fullName")
	gender := c.FormValue("gender")
	birthday := c.FormValue("birthday")
	bio := c.FormValue("bio")
	file, err := c.FormFile("profilePicture")
	var profilePicture string
	if err == nil && file != nil {
		if file.Size > 5*1024*1024 {
			logger.Error("Profile picture file size too large", zap.Int64("size", file.Size))
			return response.ResponseError(c, 400, "Ukuran gambar terlalu besar", "", "Maksimal ukuran gambar 5MB")
		}

		ext := filepath.Ext(file.Filename)
		if ext != ".jpg" && ext != ".jpeg" && ext != ".png" {
			logger.Error("Unsupported profile picture file format", zap.String("extension", ext))
			return response.ResponseError(c, 400, "Format file tidak didukung", "", "Gunakan JPG atau PNG")
		}

		fileName := fmt.Sprintf("%d%s", time.Now().UnixNano(), ext)
		savePath := filepath.Join("uploads/user", fileName)

		if err := c.SaveFile(file, savePath); err != nil {
			logger.Error("Failed to save profile picture", zap.Error(err))
			return response.ResponseError(c, 500, "Gagal menyimpan gambar", "", err.Error())
		}
		profilePicture = fileName
	} else {
		if c.FormValue("removeProfilePicture") == "true" {
			profilePicture = ""
		} else if c.FormValue("defaultProfilePicture") != "" {
			profilePictureName := c.FormValue("defaultProfilePicture")
			profilePicture = profilePictureName
		} else {
			profilePicture = ""
		}
	}

	req := saveUserProfileRequest{
		FullName:       fullName,
		Gender:         mainutils.StrPtrOrNil(gender),
		Bio:            mainutils.StrPtrOrNil(bio),
		ProfilePicture: mainutils.StrPtrOrNil(profilePicture),
		Birthday:       mainutils.StrPtrOrNil(birthday),
	}

	db := database.GetDB()

	if err := validate.Struct(req); err != nil {
		errors := formatSaveUserProfileValidationErrors(err)
		logger.Error("Validation failed", zap.Error(err))
		return response.ResponseError(c, 400, "Validasi gagal", "errors", errors)
	}

	claims, err := mainutils.GetJWTClaims(c)
	if err != nil {
		logger.Error("Failed to get JWT claims", zap.Error(err))
		return response.ResponseError(c, 401, "Token tidak valid", "", "Anda harus login terlebih dahulu")
	}
	userId := uint(claims["user_id"].(float64))
	newProfile, err := SaveProfile(db, userId, req)
	if err != nil {
		logger.Error("Failed to save user profile", zap.Error(err))
		return response.ResponseError(c, 500, "Gagal memperbarui profil pengguna", "", err.Error())
	}
	newProfileFormatted := map[string]any{
		"bio":      newProfile.Bio,
		"avatar":   newProfile.ProfilePicture,
		"fullname": newProfile.User.FullName,
		"username": newProfile.User.Username,
		"gender":   newProfile.Gender,
		"birthday": newProfile.Birthday,
	}
	return response.ResponseSuccess(c, 200, "Profil pengguna berhasil diperbarui", "data", newProfileFormatted)
}

func getProfileHandler(c *fiber.Ctx) error {
	logger.Info("GET MY PROFILE HANDLER")
	db := database.GetDB()
	claims, err := mainutils.GetJWTClaims(c)
	if err != nil {
		logger.Error("Failed to get JWT claims", zap.Error(err))
		return response.ResponseError(c, 401, "Token tidak valid", "", "Anda harus login terlebih dahulu")
	}
	userId := uint(claims["user_id"].(float64))
	myProfile, err := GetProfile(db, userId)
	if err != nil {
		logger.Error("Failed to get my profile", zap.Error(err))
		return response.ResponseError(c, 500, "Gagal mendapatkan profil pengguna", "", err.Error())
	}
	myProfileFormatted := map[string]any{
		"bio":            myProfile.Bio,
		"profilePicture": myProfile.ProfilePicture,
		"fullname":       myProfile.User.FullName,
		"username":       myProfile.User.Username,
		"birthday":       myProfile.Birthday,
		"gender":         myProfile.Gender,
		"email":          myProfile.User.Email,
		"userID":         myProfile.UserID,
	}
	return response.ResponseSuccess(c, 200, "Berhasil mendapatkan profil pengguna", "data", myProfileFormatted)
}
