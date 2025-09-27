package service

import (
	"errors"
	"server/internal/domain/model"
	"server/internal/domain/userService/dto"
	"server/internal/domain/userService/repository"
	mainutils "server/pkg/utils/mainUtils"

	"gorm.io/gorm"
)

type UserService struct {
    userRepo repository.UserRepository
    userProfileRepo repository.UserProfileRepository
}

func NewUserService(userRepo repository.UserRepository, userProfileRepo repository.UserProfileRepository) *UserService {
    return &UserService{
        userRepo: userRepo,
        userProfileRepo: userProfileRepo,
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

func (s *UserService) SaveProfile(db *gorm.DB, userID uint, req dto.SaveUserProfileRequest) (*dto.SaveUserProfileResponse, error) {
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
            newProfileResponse := dto.SaveUserProfileResponse{
                UserID:         userID,
                Bio:            req.Bio,
                ProfilePicture: req.ProfilePicture,
                Birthday:       req.Birthday,
                Gender:         req.Gender,
                FullName:      req.FullName,
            }
            return &newProfileResponse, nil
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

    profileResponse := dto.SaveUserProfileResponse{
        UserID:         userID,
        Bio:            profile.Bio,
        ProfilePicture: profile.ProfilePicture,
        Birthday:       profile.Birthday,
        Gender:        profile.Gender,
        FullName:      req.FullName,
        Username:      *req.Username,
    }
    return &profileResponse, nil
}


func (s *UserService) GetProfile(userID uint) (*model.User, error) {
    return s.userRepo.GetByID(userID)
}

func (s *UserService) SaveSecurity(userID uint, req dto.SaveUserSecurityRequest) error {
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