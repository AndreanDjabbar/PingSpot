package user

import (
	"errors"
	userModel "server/internal/model/user"
	"gorm.io/gorm"
)

func GetUserByEmail(db *gorm.DB, email string) (*userModel.User, error) {
    var user userModel.User
    result := db.Where("email = ?", email).First(&user)

    if result.Error != nil {
        if errors.Is(result.Error, gorm.ErrRecordNotFound) {
            return nil, nil
        }
        return nil, result.Error
    }

    return &user, nil
}