package service

import (
	"errors"
	"server/internal/domain/model"
	"server/internal/domain/userService/dto"
	"server/internal/domain/userService/repository"
	apperror "server/pkg/appError"
	tokenutils "server/pkg/utils/tokenutils"

	"gorm.io/gorm"
)

type UserService struct {
	userRepo        repository.UserRepository
	userProfileRepo repository.UserProfileRepository
}

func NewUserService(userRepo repository.UserRepository, userProfileRepo repository.UserProfileRepository) *UserService {
	return &UserService{
		userRepo:        userRepo,
		userProfileRepo: userProfileRepo,
	}
}

func (s *UserService) SaveProfile(db *gorm.DB, userID uint, req dto.SaveUserProfileRequest) (*dto.SaveUserProfileResponse, error) {
	tx := db.Begin()
	if tx.Error != nil {
		return nil, apperror.New(500, "TRANSACTION_START_FAILED", "gagal memulai transaksi")
	}

	if err := s.userRepo.UpdateFullNameTX(tx, userID, req.FullName); err != nil {
		tx.Rollback()
		return nil, apperror.New(500, "FULLNAME_UPDATE_FAILED", "gagal memperbarui nama lengkap")
	}

	profile, err := s.userProfileRepo.GetByIDTX(tx, userID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			newProfile := model.UserProfile{
				UserID:         userID,
				Bio:            req.Bio,
				ProfilePicture: req.ProfilePicture,
				Birthday:       req.Birthday,
				Gender:         req.Gender,
			}
			if _, err := s.userProfileRepo.CreateTX(tx, &newProfile); err != nil {
				tx.Rollback()
				return nil, apperror.New(500, "PROFILE_CREATE_FAILED", "gagal membuat profil")
			}
			if err := tx.Commit().Error; err != nil {
				return nil, apperror.New(500, "TRANSACTION_COMMIT_FAILED", "gagal menyimpan perubahan")
			}
			newProfileResponse := dto.SaveUserProfileResponse{
				UserID:         userID,
				Bio:            req.Bio,
				ProfilePicture: req.ProfilePicture,
				Birthday:       req.Birthday,
				Gender:         req.Gender,
				FullName:       req.FullName,
			}
			return &newProfileResponse, nil
		} else {
			tx.Rollback()
			return nil, apperror.New(500, "PROFILE_FETCH_FAILED", "gagal mengambil profil")
		}
	}

	profile.Bio = req.Bio
	profile.ProfilePicture = req.ProfilePicture
	profile.Birthday = req.Birthday
	profile.Gender = req.Gender

	if _, err := s.userProfileRepo.UpdateTX(tx, profile); err != nil {
		tx.Rollback()
		return nil, apperror.New(500, "PROFILE_UPDATE_FAILED", "gagal memperbarui profil")
	}

	if err := tx.Commit().Error; err != nil {
		return nil, apperror.New(500, "TRANSACTION_COMMIT_FAILED", "gagal menyimpan perubahan")
	}

	profileResponse := dto.SaveUserProfileResponse{
		UserID:         userID,
		Bio:            profile.Bio,
		ProfilePicture: profile.ProfilePicture,
		Birthday:       profile.Birthday,
		Gender:         profile.Gender,
		FullName:       req.FullName,
		Username:       *req.Username,
	}
	return &profileResponse, nil
}

func (s *UserService) GetProfile(userID uint) (*dto.GetProfileResponse, error) {
	user, err := s.userRepo.GetByID(userID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, apperror.New(404, "USER_NOT_FOUND", "pengguna tidak ditemukan")
		}
		return nil, apperror.New(500, "USER_FETCH_FAILED", "gagal mendapatkan profil user")
	}

	return &dto.GetProfileResponse{
		UserID:         user.ID,
		FullName:       user.FullName,
		Bio:            user.Profile.Bio,
		ProfilePicture: user.Profile.ProfilePicture,
		Username:       user.Username,
		Birthday:       user.Profile.Birthday,
		Gender:         user.Profile.Gender,
		Email:          user.Email,
	}, nil
}

func (s *UserService) SaveSecurity(userID uint, req dto.SaveUserSecurityRequest) error {
	user, err := s.userRepo.GetByID(userID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return apperror.New(404, "USER_NOT_FOUND", "pengguna tidak ditemukan")
		}
		return apperror.New(500, "USER_FETCH_FAILED", "gagal mengambil data pengguna")
	}

	isValidPassword := false
	if user.Password != nil {
		isValidPassword = tokenutils.CheckHashString(req.CurrentPassword, *user.Password)
	}

	if !isValidPassword {
		return apperror.New(400, "INVALID_PASSWORD", "Kata sandi lama anda salah")
	}

	hashedPassword, err := tokenutils.HashString(req.NewPassword)
	if err != nil {
		return apperror.New(500, "PASSWORD_HASH_FAILED", "Gagal mengenkripsi kata sandi")
	}

	user.Password = &hashedPassword
	if err := s.userRepo.Save(user); err != nil {
		return apperror.New(500, "PASSWORD_UPDATE_FAILED", "Gagal memperbarui kata sandi")
	}

	return nil
}
