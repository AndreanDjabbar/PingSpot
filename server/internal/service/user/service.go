package user

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"server/internal/infrastructure/cache"
	"server/internal/logger"
	userModel "server/internal/model/user"
	userDto "server/internal/dto/user"
	"server/pkg/utils/envUtils"
	mainutils "server/pkg/utils/mainUtils"
	"time"

	"go.uber.org/zap"
	"gorm.io/gorm"
)

func Register(db *gorm.DB, req userDto.RegisterRequest, isVerified bool) (*userModel.User, error) {
	var existing userModel.User
	if err := db.Where("email = ? OR username = ?", req.Email, req.Username).First(&existing).Error; err == nil {
		return nil, errors.New("Email atau username sudah terdaftar")
	} else if err != gorm.ErrRecordNotFound {
		return nil, errors.New("Terjadi kesalahan saat cek data user")
	}

	hashedPassword, err := mainutils.HashPassword(req.Password)
	if err != nil {
		return nil, errors.New("Gagal mengenkripsi password")
	}

	user := userModel.User{
		Username:   req.Username,
		Email:      req.Email,
		Password:   &hashedPassword,
		FullName:   req.FullName,
		Provider:   userModel.Provider(req.Provider),
		ProviderID: req.ProviderID,
		IsVerified: isVerified,
	}
	if err := db.Create(&user).Error; err != nil {
		return nil, errors.New("Terjadi kesalahan saat registrasi")
	}

	return &user, nil
}

func Login(db *gorm.DB, req userDto.LoginRequest) (*userModel.User, string, error) {
	var user userModel.User
	if err := db.Where("email = ?", req.Email).First(&user).Error; err != nil {
		return nil, "", errors.New("Email atau password salah")
	}

	if user.Password == nil || !mainutils.CheckPasswordHash(req.Password, *user.Password) {
		return nil, "", errors.New("Email atau password salah")
	}

	if !user.IsVerified {
		randomCode1, err := mainutils.GenerateRandomCode(150)
		if err != nil {
			logger.Error("Failed to generate random code", zap.Error(err))
			return nil, "", errors.New("Gagal membuat kode acak")
		}
		randomCode2, err := mainutils.GenerateRandomCode(150)
		if err != nil {
			logger.Error("Failed to generate random code", zap.Error(err))
			return nil, "", errors.New("Gagal membuat kode acak")
		}
		verificationLink := fmt.Sprintf("%s/auth/verify-account/%s/%d/%s", envUtils.ClientURL(), randomCode1, user.ID, randomCode2)

		redisClient := cache.GetRedis()
		linkData := map[string]string{
			"link1": randomCode1,
			"link2": randomCode2,
		}
		linkJSON, err := json.Marshal(linkData)
		if err != nil {
			logger.Error("Failed to marshal verification link data", zap.Error(err))
			return nil, "", errors.New("Gagal menyimpan kode verifikasi")
		}
		redisKey := fmt.Sprintf("link:%d", user.ID)
		err = redisClient.Set(context.Background(), redisKey, linkJSON, 300*time.Second).Err()
		if err != nil {
			logger.Error("Failed to save verification link to Redis", zap.Error(err))
			return nil, "", errors.New("Gagal menyimpan kode verifikasi ke Redis")
		}
		go func(email, username, link string) {
			if err := mainutils.SendEmail(email, username, "Pingspot - Verifikasi Akun", link); err != nil {
				logger.Error("Failed to send verification email (background)", zap.Error(err))
			}
		}(user.Email, user.Username, verificationLink)
		return nil, "", errors.New("Akun belum diverifikasi, silakan cek email untuk verifikasi")
	}

	token, err := mainutils.GenerateJWT(user.ID, []byte(envUtils.JWTSecret()), user.Email, user.Username, user.FullName)
	if err != nil {
		return nil, "", errors.New("Gagal membuat token JWT")
	}

	return &user, token, nil
}

func VerifyUser(db *gorm.DB, userID uint) (*userModel.User, error) {
	var user userModel.User

	if err := db.First(&user, userID).Error; err != nil {
		return nil, errors.New("User tidak ditemukan")
	}

	if user.IsVerified {
		return nil, errors.New("Akun sudah diverifikasi")
	}

	user.IsVerified = true
	if err := db.Save(&user).Error; err != nil {
		return nil, errors.New("Gagal memverifikasi akun")
	}

	return &user, nil
}

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
			"avatar": req.ProfilePicture,
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
