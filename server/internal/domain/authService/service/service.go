package service

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"server/internal/domain/authService/validation"
	"server/internal/domain/model"
	"server/internal/domain/userService/repository"
	"server/internal/infrastructure/cache"
	"server/pkg/logger"
	"server/pkg/utils/env"
	mainutils "server/pkg/utils/mainUtils"
	"time"

	"go.uber.org/zap"
	"gorm.io/gorm"
)

type AuthService struct {
    userRepo repository.UserRepository
}

func NewAuthService(userRepo repository.UserRepository) *AuthService {
    return &AuthService{userRepo: userRepo}
}

func (s *AuthService) Register(req validation.RegisterRequest, isVerified bool) (*model.User, error) {
	_, err := s.userRepo.GetByEmail(req.Email)
	if err == nil {
		return nil, errors.New("Email sudah terdaftar")
	}
	if !errors.Is(err, gorm.ErrRecordNotFound) {
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
		Provider:   model.Provider(req.Provider),
		ProviderID: req.ProviderID,
		IsVerified: isVerified,
	}

	if err := s.userRepo.Create(&user); err != nil {
		return nil, errors.New("Gagal menyimpan user")
	}

	return &user, nil
}

func (s *AuthService) Login(req validation.LoginRequest) (*model.User, string, error) {
	user, err := s.userRepo.GetByEmail(req.Email)
	if err != nil {
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
		verificationLink := fmt.Sprintf("%s/auth/verify-account/%s/%d/%s", env.ClientURL(), randomCode1, user.ID, randomCode2)

		redisClient := cache.GetRedis()
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

	token, err := mainutils.GenerateJWT(user.ID, []byte(env.JWTSecret()), user.Email, user.Username, user.FullName)
	if err != nil {
		return nil, "", errors.New("Gagal membuat token JWT")
	}

	return user, token, nil
}

func (s *AuthService) VerifyUser(userID uint) (*model.User, error) {
	user, err := s.userRepo.GetByID(userID)
	if err != nil {
		return nil, errors.New("User tidak ditemukan")
	}

	if user.IsVerified {
		return nil, errors.New("Akun sudah diverifikasi")
	}

	user.IsVerified = true

	if err := s.userRepo.Save(user); err != nil {
		return nil, errors.New("Gagal menyimpan data user")
	}

	return user, nil
}

func (s *AuthService) UpdateUserByEmail(email string, updatedUser *model.User) (*model.User, error) {
    _, err := s.userRepo.GetByEmail(email)
    if err != nil {
        if errors.Is(err, gorm.ErrRecordNotFound) {
            return nil, errors.New("User tidak ditemukan")
        }
        return nil, errors.New("Gagal mencari user")
    }

    user, err := s.userRepo.UpdateByEmail(email, updatedUser)
    if err != nil {
        return nil, errors.New("Gagal update user")
    }

    return user, nil
}

func (s *AuthService) GetUserByEmail(email string) (*model.User, error) {
    user, err := s.userRepo.GetByEmail(email)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
    return user, nil
}