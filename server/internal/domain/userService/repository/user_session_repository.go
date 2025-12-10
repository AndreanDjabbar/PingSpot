package repository

import (
	"server/internal/domain/model"

	"gorm.io/gorm"
)

type UserSessionRepository interface {
	CreateTX(tx *gorm.DB, user *model.UserSession) (*model.UserSession, error)
	GetByRefreshTokenID(refreshTokenID string) (*model.UserSession, error)
	Update(userSession *model.UserSession) error
}

type userSessionRepository struct {
	db *gorm.DB
}

func NewUserSessionRepository(db *gorm.DB) UserSessionRepository {
	return &userSessionRepository{db: db}
}

func (r *userSessionRepository) CreateTX(tx *gorm.DB, userSession *model.UserSession) (*model.UserSession, error) {
	if err := tx.Create(userSession).Error; err != nil {
		return nil, err
	}
	return userSession, nil
}

func (r *userSessionRepository) Update(userSession *model.UserSession) error {
	if err := r.db.Save(userSession).Error; err != nil {
		return err
	}
	return nil
}

func (r *userSessionRepository) GetByRefreshTokenID(refreshTokenID string) (*model.UserSession, error) {
	var userSession model.UserSession
	if err := r.db.Where("refresh_token_id = ?", refreshTokenID).First(&userSession).Error; err != nil {
		return nil, err
	}
	return &userSession, nil
}