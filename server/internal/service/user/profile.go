package user

import (
	"errors"
	userModel "server/internal/model/user"
	userDto "server/internal/dto/user"
	"gorm.io/gorm"
)

func UpdateUserByEmail(db *gorm.DB, email string, updatedUser *userModel.User) (*userModel.User, error) {
	var user userModel.User

	if err := db.Where("email = ?", email).First(&user).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("User tidak ditemukan")
		}
		return nil, errors.New("Gagal mencari user")
	}

	if err := db.Model(&user).Updates(updatedUser).Error; err != nil {
		return nil, errors.New("Gagal memperbarui data user")
	}

	if err := db.Where("email = ?", email).First(&user).Error; err != nil {
		return nil, errors.New("Gagal mengambil data user yang telah diperbarui")
	}

	return &user, nil
}

func SaveProfile(db *gorm.DB, userID uint, req userDto.SaveUserProfileRequest) (*userModel.UserProfile, error) {
	tx := db.Begin()
	if tx.Error != nil {
		return nil, errors.New("Gagal memulai transaksi")
	}

	if err := tx.Model(&userModel.User{}).
		Where("id = ?", userID).
		Updates(map[string]interface{}{
			"full_name": req.FullName,}).Error; err != nil {
			tx.Rollback()
			return nil, errors.New("Gagal memperbarui data user")
	}
	var profile userModel.UserProfile
	if err := tx.Where("user_id = ?", userID).First(&profile).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			profile = userModel.UserProfile{
				UserID: userID,
				Bio:    req.Bio,
				ProfilePicture: req.ProfilePicture,
				Age: func() uint { 
						if req.Age != nil {
							return *req.Age
						} else {
							return 0
						}
					}(),
			}
			if err := tx.Create(&profile).Error; err != nil {
				tx.Rollback()
				return nil, errors.New("Gagal membuat profil user")
			}
		} else {
			tx.Rollback()
			return nil, errors.New("Gagal mengambil data profil user")
		}
	} else {
		if err := tx.Model(&profile).Updates(map[string]interface{}{
			"bio":    req.Bio,
			"profile_picture": req.ProfilePicture,
			"age":	req.Age,
			"gender": req.Gender,
		}).Error; err != nil {
			tx.Rollback()
			return nil, errors.New("Gagal memperbarui profil user")
		}
	}
	if err := tx.Commit().Error; err != nil {
		tx.Rollback()
		return nil, errors.New("Gagal menyimpan perubahan")
	}
	return &profile, nil
}

func GetMyProfile(db *gorm.DB, userID uint) (*userModel.UserProfile, error) {
	var profile userModel.UserProfile

	err := db.Preload("User").Where("user_id = ?", userID).First(&profile).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("profil user tidak ditemukan")
		}
		return nil, err
	}

	return &profile, nil
}