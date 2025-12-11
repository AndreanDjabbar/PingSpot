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

	"github.com/google/uuid"
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

	refreshTokenID := uuid.New().String()
	refreshToken := tokenutils.GenerateRefreshToken(user.ID, refreshTokenID)
	hashedRefreshToken := tokenutils.HashSHA256String(refreshToken)

	tx := db.Begin()
	userSession, err := s.userSessionRepo.CreateTX(tx, &model.UserSession{
		UserID:         user.ID,
		ExpiresAt:      time.Now().Add(7 * 24 * time.Hour).Unix(),
		IsActive:       true,
		RefreshTokenID: refreshTokenID,
		HashedRefreshToken: hashedRefreshToken,
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

	accessToken := tokenutils.GenerateAccessToken(user.ID, userSession.ID, user.Email, user.Username, user.FullName)

	redisClient := cache.GetRedis()

	refreshKey := fmt.Sprintf("refresh_token:%s", refreshTokenID)
	err = redisClient.Set(context.Background(), refreshKey, hashedRefreshToken, 7*24*time.Hour).Err()
	if err != nil {
		logger.Error("Failed to save refresh token to Redis", zap.Error(err))
		return nil, "", "", apperror.New(500, "REFRESH_TOKEN_SAVE_FAILED", "Gagal menyimpan refresh token")
	}

	userSessionKey := fmt.Sprintf("user_session:%d", user.ID)
	err = redisClient.SAdd(context.Background(), userSessionKey, userSession.ID).Err()
	if err != nil {
		logger.Error("Failed to save user session ID to Redis set", zap.Error(err))
		return nil, "", "", apperror.New(500, "USER_SESSION_SAVE_FAILED", "Gagal menyimpan sesi user")
	}
	return user, accessToken, refreshToken, nil
}

func (s *AuthService) RefreshToken(refreshToken string) (string, string, error) {
    claims, err := tokenutils.ValidateRefreshToken(refreshToken)
    if err != nil {
        return "", "", apperror.New(401, "INVALID_REFRESH_TOKEN", "Refresh token tidak valid")
    }
	
    userID := uint(claims["user_id"].(float64))
    refreshTokenID := claims["refresh_token_id"].(string)
    hashedRefreshToken := tokenutils.HashSHA256String(refreshToken)

    redisClient := cache.GetRedis()
    refreshKey := fmt.Sprintf("refresh_token:%s", refreshTokenID)

    storedHashedRefreshToken, err := redisClient.Get(context.Background(), refreshKey).Result()
    if err != nil || storedHashedRefreshToken != hashedRefreshToken {
        return "", "", apperror.New(401, "REFRESH_TOKEN_INVALID", "Refresh token tidak cocok atau tidak ditemukan")
    }

	user, err := s.userRepo.GetByID(userID)
	if err != nil {
		return "", "", apperror.New(500, "USER_FETCH_FAILED", "Gagal mengambil data user")
	}

    userSession, err := s.userSessionRepo.GetByRefreshTokenID(refreshTokenID)
    if err != nil {
        return "", "", apperror.New(401, "USER_SESSION_NOT_FOUND", "Sesi user tidak ditemukan")
    }

    if !userSession.IsActive || time.Now().Unix() > userSession.ExpiresAt {
        return "", "", apperror.New(401, "SESSION_INVALID", "Sesi sudah tidak aktif atau kedaluwarsa")
    }

    newRefreshTokenID := uuid.New().String()
    newRefreshToken := tokenutils.GenerateRefreshToken(userID, newRefreshTokenID)
    newHashedRefreshToken := tokenutils.HashSHA256String(newRefreshToken)

    if err := redisClient.Del(context.Background(), refreshKey).Err(); err != nil {
        logger.Warn("Failed to delete old refresh token", zap.Error(err))
    }

    newRefreshKey := fmt.Sprintf("refresh_token:%s", newRefreshTokenID)
    if err := redisClient.Set(context.Background(), newRefreshKey, newHashedRefreshToken, 7*24*time.Hour).Err(); err != nil {
        return "", "", apperror.New(500, "REFRESH_TOKEN_SAVE_FAILED", "Gagal menyimpan refresh token baru")
    }

    userSession.RefreshTokenID = newRefreshTokenID
    userSession.HashedRefreshToken = newHashedRefreshToken
	
    if err := s.userSessionRepo.Update(userSession); err != nil {
        return "", "", apperror.New(500, "SESSION_UPDATE_FAILED", "Gagal memperbarui sesi")
    }

    accessToken := tokenutils.GenerateAccessToken(userID, userSession.ID, user.Email, user.Username, user.FullName)

    return accessToken, newRefreshToken, nil
}

func (s *AuthService) Logout(userID uint, refreshTokenID string) error {
	redisClient := cache.GetRedis()
	refreshKey := fmt.Sprintf("refresh_token:%s", refreshTokenID)
	if err := redisClient.Del(context.Background(), refreshKey).Err(); err != nil {
		logger.Warn("Failed to delete refresh token from Redis", zap.Error(err))
	}
	userSession, err := s.userSessionRepo.GetByRefreshTokenID(refreshTokenID)
	if err != nil {
		return apperror.New(500, "USER_SESSION_FETCH_FAILED", "Gagal mengambil sesi user")
	}
	userSession.IsActive = false
	if err := s.userSessionRepo.Update(userSession); err != nil {
		return apperror.New(500, "USER_SESSION_UPDATE_FAILED", "Gagal memperbarui sesi user")
	}
	userSessionKey := fmt.Sprintf("user_session:%d", userID)
	if err := redisClient.SRem(context.Background(), userSessionKey, userSession.ID).Err(); err != nil {
		logger.Warn("Failed to remove user session ID from Redis set", zap.Error(err))
	}
	return nil
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
