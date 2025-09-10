package user

import (
	"fmt"
	"path/filepath"
	userDto "server/internal/dto/user"
	"server/internal/infrastructure/database"
	"server/internal/logger"
	userService "server/internal/service/user"
	userValidation "server/internal/validation/user"
	mainutils "server/pkg/utils/mainUtils"
	"server/pkg/utils/responseUtils"
	"time"
	"github.com/gofiber/fiber/v2"
	"go.uber.org/zap"
)

func SaveUserProfileHandler(c *fiber.Ctx) error {
	logger.Info("SAVE USER PROFILE HANDLER")
	_, err := c.MultipartForm()
	if err != nil {
		logger.Error("Failed to parse multipart form", zap.Error(err))
		return responseUtils.ResponseError(c, 400, "Format body request tidak valid", "", err.Error())
	}
	fullName := c.FormValue("fullName")
	gender := c.FormValue("gender")
	bio := c.FormValue("bio")
	file, err := c.FormFile("profilePicture")
	var profilePicture string
	if err == nil && file != nil {
		if file.Size > 5*1024*1024 { 
			logger.Error("Profile picture file size too large", zap.Int64("size", file.Size))
			return responseUtils.ResponseError(c, 400, "Ukuran gambar terlalu besar", "", "Maksimal ukuran gambar 5MB")
		}

		ext := filepath.Ext(file.Filename)
		if ext != ".jpg" && ext != ".jpeg" && ext != ".png" {
			logger.Error("Unsupported profile picture file format", zap.String("extension", ext))
			return responseUtils.ResponseError(c, 400, "Format file tidak didukung", "", "Gunakan JPG atau PNG")
		}

		fileName := fmt.Sprintf("%d%s", time.Now().UnixNano(), ext)
		savePath := filepath.Join("uploads/user", fileName)
		
		if err := c.SaveFile(file, savePath); err != nil {
			logger.Error("Failed to save profile picture", zap.Error(err))
			return responseUtils.ResponseError(c, 500, "Gagal menyimpan gambar", "", err.Error())
		}
		profilePicture = fileName
	} else {
		profilePicture = ""
	}

	req := userDto.SaveUserProfileRequest{
		FullName: fullName,
		Gender: mainutils.StrPtrOrNil(gender),
		Bio: mainutils.StrPtrOrNil(bio),
		ProfilePicture: mainutils.StrPtrOrNil(profilePicture),
	}
	
	db := database.GetDB()

	if err := userValidation.Validate.Struct(req); err != nil {
		errors := userValidation.FormatSaveUserProfileValidationErrors(err)
		logger.Error("Validation failed", zap.Error(err))
		return responseUtils.ResponseError(c, 400, "Validasi gagal", "errors", errors)
	}

	claims, err := mainutils.GetJWTClaims(c)
	if err != nil {
		logger.Error("Failed to get JWT claims", zap.Error(err))
		return responseUtils.ResponseError(c, 401, "Token tidak valid", "", "Anda harus login terlebih dahulu")
	}
	userId := uint(claims["user_id"].(float64))
	newProfile, err := userService.SaveProfile(db, userId, req)
	if err != nil {
		logger.Error("Failed to save user profile", zap.Error(err))
		return responseUtils.ResponseError(c, 500, "Gagal memperbarui profil pengguna", "", err.Error())
	}
	newProfileFormatted := map[string]any{
		"bio": 	newProfile.Bio,
		"avatar": newProfile.ProfilePicture,
		"fullname": newProfile.User.FullName,
		"username": newProfile.User.Username,
		"age": newProfile.Age,
		"gender": newProfile.Gender,
	}
	return responseUtils.ResponseSuccess(c, 200, "Profil pengguna berhasil diperbarui", "data", newProfileFormatted)
}

func GetMyProfileHandler(c *fiber.Ctx) error {
	logger.Info("GET MY PROFILE HANDLER")
	db := database.GetDB()
	claims, err := mainutils.GetJWTClaims(c)
	if err != nil {
		logger.Error("Failed to get JWT claims", zap.Error(err))
		return responseUtils.ResponseError(c, 401, "Token tidak valid", "", "Anda harus login terlebih dahulu")
	}
	userId := uint(claims["user_id"].(float64))
	myProfile, err := userService.GetMyProfile(db, userId)
	if err != nil {
		logger.Error("Failed to get my profile", zap.Error(err))
		return responseUtils.ResponseError(c, 500, "Gagal mendapatkan profil pengguna", "", err.Error())
	}
	myProfileFormatted := map[string]any{
		"bio": 	myProfile.Bio,
		"profilePicture": myProfile.ProfilePicture,
		"fullname": myProfile.User.FullName,
		"username": myProfile.User.Username,
		"age": myProfile.Age,
		"gender": myProfile.Gender,
		"email": myProfile.User.Email,
		"userID": myProfile.UserID,
	}
	return responseUtils.ResponseSuccess(c, 200, "Berhasil mendapatkan profil pengguna", "data", myProfileFormatted)
}