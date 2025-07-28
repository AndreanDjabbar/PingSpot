package authservice

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"server2/internal/config"
	"server2/internal/dto"
	"server2/internal/logger"
	"server2/internal/model"
	"server2/pkg/utils/envUtils"
	mainutils "server2/pkg/utils/mainUtils"
	"time"

	"go.uber.org/zap"
	"gorm.io/gorm"
)

func Register(db *gorm.DB, req dto.RegisterRequest) (*model.User, error) {
	var existing model.User
	if err := db.Where("email = ? OR username = ?", req.Email, req.Username).First(&existing).Error; err == nil {
		return nil, errors.New("Email atau username sudah terdaftar")
	} else if err != gorm.ErrRecordNotFound {
		return nil, errors.New("Terjadi kesalahan saat cek data user")
	}

	hashedPassword, err := mainutils.HashPassword(req.Password)
	if err != nil {
		return nil, errors.New("Gagal mengenkripsi password")
	}

	user := model.User{
		Username:   req.Username,
		Email:      req.Email,
		Password:   &hashedPassword,
		FullName:   req.FullName,
		Phone:      req.Phone,
		Provider:   model.Provider(req.Provider),
		ProviderID: req.ProviderID,
		IsVerified: false,
	}
	if err := db.Create(&user).Error; err != nil {
		return nil, errors.New("Terjadi kesalahan saat registrasi")
	}

	return &user, nil
}

func Login(db *gorm.DB, req dto.LoginRequest) (*model.User, string, error) {
	var user model.User
	if err := db.Where("email = ?", req.Email).First(&user).Error; err != nil {
		return nil, "", errors.New("Email atau password salah")
	}

	if user.Password == nil || !mainutils.CheckPasswordHash(req.Password, *user.Password) {
		return nil, "", errors.New("Email atau password salah")
	}

	if !user.IsVerified {
		randomCode1, err := mainutils.GenerateRandomCode(150)
		if err != nil {
			logger.Error("Failed to generate random code", zap.Error(err))
			return nil, "", errors.New("Gagal membuat kode acak")
		}
		randomCode2, err := mainutils.GenerateRandomCode(150)
		if err != nil {
			logger.Error("Failed to generate random code", zap.Error(err))
			return nil, "", errors.New("Gagal membuat kode acak")
		}
		verificationLink := fmt.Sprintf("%s/auth/verify-account/%s/%d/%s", envUtils.ClientURL(), randomCode1, user.ID, randomCode2)

		redisClient := config.GetRedis()
		linkData := map[string]string{
			"link1": randomCode1,
			"link2": randomCode2,
		}
		linkJSON, err := json.Marshal(linkData)
		if err != nil {
			logger.Error("Failed to marshal verification link data", zap.Error(err))
			return nil, "", errors.New("Gagal menyimpan kode verifikasi")
		}
		redisKey := fmt.Sprintf("link:%d", user.ID)
		err = redisClient.Set(context.Background(), redisKey, linkJSON, 300*time.Second).Err()
		if err != nil {
			logger.Error("Failed to save verification link to Redis", zap.Error(err))
			return nil, "", errors.New("Gagal menyimpan kode verifikasi ke Redis")
		}
		go func(email, username, link string) {
			if err := mainutils.SendEmail(email, username, "Pingspot - Verifikasi Akun", link); err != nil {
				logger.Error("Failed to send verification email (background)", zap.Error(err))
			}
		}(user.Email, user.Username, verificationLink)
		return nil, "", errors.New("Akun belum diverifikasi, silakan cek email untuk verifikasi")
	}

	token, err := mainutils.GenerateJWT(user.ID, []byte(envUtils.JWTSecret()), user.Email, user.Username, user.FullName)
	if err != nil {
		return nil, "", errors.New("Gagal membuat token JWT")
	}

	return &user, token, nil
}

func VerifyUser(db *gorm.DB, userID uint) (*model.User, error) {
	var user model.User

	if err := db.First(&user, userID).Error; err != nil {
		return nil, errors.New("User tidak ditemukan")
	}

	if user.IsVerified {
		return nil, errors.New("Akun sudah diverifikasi")
	}

	user.IsVerified = true
	if err := db.Save(&user).Error; err != nil {
		return nil, errors.New("Gagal memverifikasi akun")
	}

	return &user, nil
}