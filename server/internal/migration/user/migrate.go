package user

import (
	"server/internal/logger"
	"server/internal/model/user"

	"github.com/go-gormigrate/gormigrate/v2"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

func Migrate(db *gorm.DB) error {
	m := gormigrate.New(db, gormigrate.DefaultOptions, []*gormigrate.Migration{
		{
			ID: "24072025_initial_migration",
			Migrate: func(tx *gorm.DB) error {
				return tx.AutoMigrate(&user.User{})
			},
			Rollback: func(tx *gorm.DB) error {
				return tx.Migrator().DropTable(&user.User{})
			},
		},
		{
			ID: "29082025_remove_phone_field",
			Migrate: func(tx *gorm.DB) error {
				if tx.Migrator().HasColumn(&user.User{}, "phone") {
					return tx.Migrator().DropColumn(&user.User{}, "phone")
				}
				return nil
			},
			Rollback: func(tx *gorm.DB) error {
				if !tx.Migrator().HasColumn(&user.User{}, "phone") {
					return tx.Migrator().AddColumn(&user.User{}, "phone")
				}
				return nil
			},
		},
		{
			ID: "29082025_add_user_profile_table",
			Migrate: func(tx *gorm.DB) error {
				return tx.AutoMigrate(&user.UserProfile{})
			},
			Rollback: func(tx *gorm.DB) error {
				return tx.Migrator().DropTable(&user.UserProfile{})
			},
		},
		{
			ID: "04092025_rename_avatar_to_profile_picture",
			Migrate: func(tx *gorm.DB) error {
				if tx.Migrator().HasColumn(&user.UserProfile{}, "avatar") {
					return tx.Migrator().RenameColumn(&user.UserProfile{}, "avatar", "profile_picture")
				}
				return nil
			},
			Rollback: func(tx *gorm.DB) error {
				if tx.Migrator().HasColumn(&user.UserProfile{}, "profile_picture") {
					return tx.Migrator().RenameColumn(&user.UserProfile{}, "profile_picture", "avatar")
				}
				return nil
			},
		},
		{
			ID: "11092025_remove_age_field",
			Migrate: func(tx *gorm.DB) error {
				if tx.Migrator().HasColumn(&user.UserProfile{}, "age") {
					return tx.Migrator().DropColumn(&user.UserProfile{}, "age")
				}
				return nil
			},
			Rollback: func(tx *gorm.DB) error {
				if !tx.Migrator().HasColumn(&user.UserProfile{}, "age") {
					return tx.Migrator().AddColumn(&user.UserProfile{}, "age")
				}
				return nil
			},
		},
		{
			ID: "11092025_add_birthday_field",
			Migrate: func(tx *gorm.DB) error {
				if !tx.Migrator().HasColumn(&user.UserProfile{}, "birthday") {
					return tx.Migrator().AddColumn(&user.UserProfile{}, "birthday")
				}
				return nil
			},
			Rollback: func(tx *gorm.DB) error {
				if tx.Migrator().HasColumn(&user.UserProfile{}, "birthday") {
					return tx.Migrator().DropColumn(&user.UserProfile{}, "birthday")
				}
				return nil
			},
		},
	})

	err := m.Migrate()
	if err != nil {
		logger.Error("Failed to run migrations", zap.Error(err))
		return err
	}
	logger.Info("Migrations ran successfully")
	return nil
}