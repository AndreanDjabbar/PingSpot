package user

import (
	"errors"
	userDto "server/internal/dto/user"
	userModel "server/internal/model/user"
	mainutils "server/pkg/utils/mainUtils"

	"gorm.io/gorm"
)

func SaveSecurity(db *gorm.DB, userID uint, req userDto.SaveUserSecurityRequest) (error) {
	var user userModel.User
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