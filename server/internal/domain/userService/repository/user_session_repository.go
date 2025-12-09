package repository

import (
	"server/internal/domain/model"

	"gorm.io/gorm"
)

type UserSessionRepository interface {
	CreateTX(tx *gorm.DB, user *model.UserSession) (*model.UserSession, error)
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