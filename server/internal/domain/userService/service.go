package userservice

import (
	"errors"
	mainutils "server/pkg/utils/mainUtils"

	"gorm.io/gorm"
)

func UpdateUserByEmail(db *gorm.DB, email string, updatedUser *User) (*User, error) {
	var user User

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

func SaveProfile(db *gorm.DB, userID uint, req saveUserProfileRequest) (*UserProfile, error) {
	tx := db.Begin()
	if tx.Error != nil {
		return nil, errors.New("Gagal memulai transaksi")
	}

	if err := tx.Model(&User{}).
		Where("id = ?", userID).
		Updates(map[string]interface{}{
			"full_name": req.FullName,}).Error; err != nil {
			tx.Rollback()
			return nil, errors.New("Gagal memperbarui data user")
	}
	var profile UserProfile
	if err := tx.Where("user_id = ?", userID).First(&profile).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			profile = UserProfile{
				UserID: userID,
				Bio:    req.Bio,
				ProfilePicture: req.ProfilePicture,
				Birthday: req.Birthday,
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
			"gender": req.Gender,
			"birthday": req.Birthday,
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

func GetProfile(db *gorm.DB, userID uint) (*UserProfile, error) {
	var profile UserProfile

	err := db.Preload("User").Where("user_id = ?", userID).First(&profile).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("profil user tidak ditemukan")
		}
		return nil, err
	}

	return &profile, nil
}

func SaveSecurity(db *gorm.DB, userID uint, req saveUserSecurityRequest) (error) {
	var user User
	err := db.Where("id = ?", userID).First(&user).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("pengguna tidak ditemukan")
		}
		return errors.New("Gagal mengambil data pengguna")
	}

	isValidPassword := false
	if user.Password != nil {
		isValidPassword = mainutils.CheckPasswordHash(req.CurrentPassword, *user.Password)
	}

	if !isValidPassword {
		return errors.New("Kata sandi lama anda salah")
	} else {
		hashedPassword, err := mainutils.HashPassword(req.NewPassword)
		if err != nil {
			return errors.New("Gagal mengenkripsi kata sandi")
		}
		user.Password = &hashedPassword
		if err := db.Save(&user).Error; err != nil {
			return errors.New("Gagal memperbarui kata sandi")
		}
		return nil
	}
}