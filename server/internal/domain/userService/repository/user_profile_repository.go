package repository

import (
	"server/internal/domain/model"

	"gorm.io/gorm"
)

type UserProfileRepository interface {
	SaveByID(userID uint, profile *model.UserProfile) (*model.UserProfile, error)
	GetByID(userID uint) (*model.UserProfile, error)
	GetByIDTX(tx *gorm.DB, userID uint) (*model.UserProfile, error)
	CreateTX(tx *gorm.DB, profile *model.UserProfile) (*model.UserProfile, error)
	UpdateTX(tx *gorm.DB, profile *model.UserProfile) (*model.UserProfile, error)
}

type userProfileRepository struct {
    db *gorm.DB
}

func NewUserProfileRepository(db *gorm.DB) UserProfileRepository {
    return &userProfileRepository{db: db}
}

func (r *userProfileRepository) SaveByID(userID uint, profile *model.UserProfile) (*model.UserProfile, error) {
    if err := r.db.Save(profile).Error; err != nil {
        return nil, err
    }
    return profile, nil
}

func (r *userProfileRepository) GetByID(userID uint) (*model.UserProfile, error) {
    var profile model.UserProfile
    if err := r.db.Where("user_id = ?", userID).First(&profile).Error; err != nil {
        return nil, err
    }
    return &profile, nil
}

func (r *userProfileRepository) GetByIDTX(tx *gorm.DB, userID uint) (*model.UserProfile, error) {
	var profile model.UserProfile
	if err := tx.Where("user_id = ?", userID).First(&profile).Error; err != nil {
		return nil, err
	}
	return &profile, nil
}

func (r *userProfileRepository) CreateTX(tx *gorm.DB, profile *model.UserProfile) (*model.UserProfile, error) {
	if err := tx.Create(profile).Error; err != nil {
		return nil, err
	}
	return profile, nil
}

func (r *userProfileRepository) UpdateTX(tx *gorm.DB, profile *model.UserProfile) (*model.UserProfile, error) {
	if err := tx.Save(profile).Error; err != nil {
		return nil, err
	}
	return profile, nil
}