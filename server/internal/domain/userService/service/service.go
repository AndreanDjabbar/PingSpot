package service

import (
	"errors"
	"server/internal/domain/userService/model"
	"server/internal/domain/userService/repository"
	"server/internal/domain/userService/validation"
	mainutils "server/pkg/utils/mainUtils"

	"gorm.io/gorm"
)

type UserService struct {
	db  *gorm.DB
    userRepo repository.UserRepository
    userProfileRepo repository.UserProfileRepository
}

func NewUserService(userRepo repository.UserRepository, userProfileRepo repository.UserProfileRepository, db *gorm.DB) *UserService {
    return &UserService{
        userRepo: userRepo,
        userProfileRepo: userProfileRepo,
        db:  db,
    }
}

func (s *UserService) UpdateUserByEmail(email string, updatedUser *model.User) (*model.User, error) {
	_, err := s.userRepo.GetByEmail(email)
	if err != nil {
		return nil, errors.New("user tidak ditemukan")
	}

	updated, err := s.userRepo.UpdateByEmail(email, updatedUser)
	if err != nil {
		return nil, errors.New("gagal update user")
	}

	return updated, nil
}

func (s *UserService) SaveProfile(db *gorm.DB, userID uint, req validation.SaveUserProfileRequest) (*model.UserProfile, error) {
    tx := db.Begin()
    if tx.Error != nil {
        return nil, errors.New("gagal memulai transaksi")
    }

    if err := s.userRepo.UpdateFullNameTX(tx, userID, req.FullName); err != nil {
        tx.Rollback()
        return nil, err
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
                return nil, err
            }
            if err := tx.Commit().Error; err != nil {
                return nil, err
            }
            return &newProfile, nil
        } else {
            tx.Rollback()
            return nil, err
        }
    }

    profile.Bio = req.Bio
    profile.ProfilePicture = req.ProfilePicture
    profile.Birthday = req.Birthday
    profile.Gender = req.Gender

    if _, err := s.userProfileRepo.UpdateTX(tx, profile); err != nil {
        tx.Rollback()
        return nil, err
    }

    if err := tx.Commit().Error; err != nil {
        return nil, err
    }

    return profile, nil
}


func (s *UserService) GetProfile(userID uint) (*model.UserProfile, error) {
    return s.userProfileRepo.GetByID(userID)
}

func (s *UserService) SaveSecurity(userID uint, req validation.SaveUserSecurityRequest) error {
    user, err := s.userRepo.GetByID(userID)
    if err != nil {
        return err
    }

    isValidPassword := false
    if user.Password != nil {
        isValidPassword = mainutils.CheckPasswordHash(req.CurrentPassword, *user.Password)
    }

    if !isValidPassword {
        return errors.New("Kata sandi lama anda salah")
    }

    hashedPassword, err := mainutils.HashPassword(req.NewPassword)
    if err != nil {
        return errors.New("Gagal mengenkripsi kata sandi")
    }

    user.Password = &hashedPassword
    if err := s.userRepo.Save(user); err != nil {
        return errors.New("Gagal memperbarui kata sandi")
    }

    return nil
}