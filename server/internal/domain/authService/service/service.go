package service

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"server/internal/domain/authService/dto"
	"server/internal/domain/authService/util"
	"server/internal/domain/model"
	"server/internal/domain/userService/repository"
	"server/internal/infrastructure/cache"
	apperror "server/pkg/appError"
	"server/pkg/logger"
	"server/pkg/utils/env"
	tokenutils "server/pkg/utils/tokenutils"
	"time"

	"go.uber.org/zap"
	"gorm.io/gorm"
)

type AuthService struct {
	userRepo        repository.UserRepository
	userSessionRepo repository.UserSessionRepository
	userProfileRepo repository.UserProfileRepository
}

func NewAuthService(
	userRepo repository.UserRepository,
	userProfileRepo repository.UserProfileRepository,
	userSessionRepo repository.UserSessionRepository,
) *AuthService {
	return &AuthService{
		userRepo:        userRepo,
		userProfileRepo: userProfileRepo,
		userSessionRepo: userSessionRepo,
	}
}

func (s *AuthService) Register(db *gorm.DB, req dto.RegisterRequest, isVerified bool) (*model.User, error) {
	tx := db.Begin()
	if tx.Error != nil {
		return nil, apperror.New(500, "TRANSACTION_START_FAILED", "Gagal memulai transaksi")
	}
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	_, err := s.userRepo.GetByEmail(req.Email)
	if err == nil {
		tx.Rollback()
		return nil, apperror.New(400, "EMAIL_ALREADY_REGISTERED", "Email sudah terdaftar")
	}
	if !errors.Is(err, gorm.ErrRecordNotFound) {
		tx.Rollback()
		return nil, apperror.New(500, "USER_CHECK_FAILED", "Terjadi kesalahan saat cek data user")
	}

	hashedPassword, err := tokenutils.HashString(req.Password)
	if err != nil {
		tx.Rollback()
		return nil, apperror.New(500, "PASSWORD_HASH_FAILED", "Gagal mengenkripsi password")
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

	createdUser, err := s.userRepo.CreateTX(tx, &user)
	if err != nil {
		tx.Rollback()
		return nil, apperror.New(500, "USER_CREATE_FAILED", "Gagal membuat user")
	}

	newProfile := model.UserProfile{
		UserID: createdUser.ID,
	}

	if _, err := s.userProfileRepo.CreateTX(tx, &newProfile); err != nil {
		fmt.Println("Error creating UserProfile:", err)
		tx.Rollback()
		return nil, apperror.New(500, "PROFILE_CREATE_FAILED", "Gagal membuat profil user")
	}

	if err := tx.Commit().Error; err != nil {
		return nil, apperror.New(500, "TRANSACTION_COMMIT_FAILED", "Gagal menyimpan perubahan")
	}

	return createdUser, nil
}

func (s *AuthService) Login(db *gorm.DB, req dto.LoginRequest) (*model.User, string, string, error) {
	user, err := s.userRepo.GetByEmail(req.Email)
	if err != nil {
		return nil, "", "", apperror.New(401, "INVALID_CREDENTIALS", "Email atau password salah")
	}

	if user.Password == nil || !tokenutils.CheckHashString(req.Password, *user.Password) {
		return nil, "", "", apperror.New(401, "INVALID_CREDENTIALS", "Email atau password salah")
	}

	if !user.IsVerified {
		randomCode1, err := tokenutils.GenerateRandomCode(150)
		if err != nil {
			logger.Error("Failed to generate random code", zap.Error(err))
			return nil, "", "", apperror.New(500, "CODE_GENERATION_FAILED", "Gagal membuat kode acak")
		}
		randomCode2, err := tokenutils.GenerateRandomCode(150)
		if err != nil {
			logger.Error("Failed to generate random code", zap.Error(err))
			return nil, "", "", apperror.New(500, "CODE_GENERATION_FAILED", "Gagal membuat kode acak")
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
			return nil, "", "", apperror.New(500, "VERIFICATION_CODE_SAVE_FAILED", "Gagal menyimpan kode verifikasi")
		}
		redisKey := fmt.Sprintf("link:%d", user.ID)
		err = redisClient.Set(context.Background(), redisKey, linkJSON, 300*time.Second).Err()
		if err != nil {
			logger.Error("Failed to save verification link to Redis", zap.Error(err))
			return nil, "", "", apperror.New(500, "VERIFICATION_CODE_REDIS_FAILED", "Gagal menyimpan kode verifikasi ke Redis")
		}
		go util.SendVerificationEmail(user.Email, user.Username, verificationLink)
		return nil, "", "", apperror.New(403, "ACCOUNT_NOT_VERIFIED", "Akun belum diverifikasi, silakan cek email untuk verifikasi")
	}

	accessToken := tokenutils.GenerateAccessToken(user.ID, user.Email, user.Username, user.FullName)
	refreshToken := tokenutils.GenerateRefreshToken(user.ID)

	hashedRefreshToken := tokenutils.HashSHA256String(refreshToken)

	tx := db.Begin()
	_, err = s.userSessionRepo.CreateTX(tx, &model.UserSession{
		UserID:         user.ID,
		ExpiresAt:      time.Now().Add(300 * time.Second).Unix(),
		IsActive:       true,
		RefreshTokenID: hashedRefreshToken,
		IPAddress:      req.IPAddress,
		UserAgent:      req.UserAgent,
	})
	if err != nil {
		tx.Rollback()
		logger.Error("Failed to create user session", zap.Error(err))
		return nil, "", "", apperror.New(500, "USER_SESSION_CREATE_FAILED", "Gagal membuat sesi user")
	}

	if err := tx.Commit().Error; err != nil {
		logger.Error("Failed to commit user session transaction", zap.Error(err))
		return nil, "", "", apperror.New(500, "USER_SESSION_COMMIT_FAILED", "Gagal menyimpan sesi user")
	}

	redisClient := cache.GetRedis()
	refreshKey := fmt.Sprintf("refresh_token:%d", user.ID)
	err = redisClient.Set(context.Background(), refreshKey, refreshToken, 7*24*time.Hour).Err()
	if err != nil {
		logger.Error("Failed to save refresh token to Redis", zap.Error(err))
		return nil, "", "", apperror.New(500, "REFRESH_TOKEN_SAVE_FAILED", "Gagal menyimpan refresh token")
	}

	return user, accessToken, refreshToken, nil
}

func (s *AuthService) VerifyUser(userID uint) (*model.User, error) {
	user, err := s.userRepo.GetByID(userID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, apperror.New(404, "USER_NOT_FOUND", "User tidak ditemukan")
		}
		return nil, apperror.New(500, "USER_FETCH_FAILED", "Gagal mengambil data user")
	}

	if user.IsVerified {
		return nil, apperror.New(400, "ALREADY_VERIFIED", "Akun sudah diverifikasi")
	}

	user.IsVerified = true

	if err := s.userRepo.Save(user); err != nil {
		return nil, apperror.New(500, "USER_SAVE_FAILED", "Gagal menyimpan data user")
	}

	return user, nil
}

func (s *AuthService) UpdateUserByEmail(email string, updatedUser *model.User) (*model.User, error) {
	_, err := s.userRepo.GetByEmail(email)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, apperror.New(404, "USER_NOT_FOUND", "User tidak ditemukan")
		}
		return nil, apperror.New(500, "USER_FETCH_FAILED", "Gagal mencari user")
	}

	user, err := s.userRepo.UpdateByEmail(email, updatedUser)
	if err != nil {
		return nil, apperror.New(500, "USER_UPDATE_FAILED", "Gagal update user")
	}

	return user, nil
}

func (s *AuthService) GetUserByEmail(email string) (*model.User, error) {
	user, err := s.userRepo.GetByEmail(email)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, apperror.New(500, "USER_FETCH_FAILED", "Gagal mengambil data user")
	}
	return user, nil
}
