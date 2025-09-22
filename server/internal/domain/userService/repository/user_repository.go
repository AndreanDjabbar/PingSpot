package repository

import (
	"server/internal/domain/userService/model"

	"gorm.io/gorm"
)

type UserRepository interface {
	UpdateByEmail(email string, updatedUser *model.User) (*model.User, error)
	GetByID(userID uint) (*model.User, error)
	GetByEmail(email string) (*model.User, error)
	Save(user *model.User) error
	Create(user *model.User) error
}

type userRepository struct {
    db *gorm.DB
}

func NewUserRepository(db *gorm.DB) UserRepository {
    return &userRepository{db: db}
}

func (r *userRepository) GetByEmail(email string) (*model.User, error) {
    var user model.User
    if err := r.db.Where("email = ?", email).First(&user).Error; err != nil {
        return nil, err
    }
    return &user, nil
}

func (r *userRepository) UpdateByEmail(email string, updatedUser *model.User) (*model.User, error) {
    var user model.User
    if err := r.db.Model(&user).Updates(updatedUser).Error; err != nil {
        return nil, err
    }
    return &user, nil
}

func (r *userRepository) GetByID(userID uint) (*model.User, error) {
    var user model.User
    if err := r.db.First(&user, userID).Error; err != nil {
        return nil, err
    }
    return &user, nil
}

func (r *userRepository) Create(user *model.User) error {
    return r.db.Create(user).Error
}

func (r *userRepository) Save(user *model.User) error {
    return r.db.Save(user).Error
}
