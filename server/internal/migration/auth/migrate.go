package auth

import (
	"server/internal/logger"
	"server/internal/model/auth"

	"github.com/go-gormigrate/gormigrate/v2"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

func Migrate(db *gorm.DB) error {
	m := gormigrate.New(db, gormigrate.DefaultOptions, []*gormigrate.Migration{
		{
			ID: "24072025_initial_migration",
			Migrate: func(tx *gorm.DB) error {
				return tx.AutoMigrate(&auth.User{})
			},
			Rollback: func(tx *gorm.DB) error {
				return tx.Migrator().DropTable(&auth.User{})
			},
		},
		{
			ID: "29082025_remove_phone_field",
			Migrate: func(tx *gorm.DB) error {
				if tx.Migrator().HasColumn(&auth.User{}, "phone") {
					return tx.Migrator().DropColumn(&auth.User{}, "phone")
				}
				return nil
			},
			Rollback: func(tx *gorm.DB) error {
				if !tx.Migrator().HasColumn(&auth.User{}, "phone") {
					return tx.Migrator().AddColumn(&auth.User{}, "phone")
				}
				return nil
			},
		},
		{
			ID: "29082025_add_user_profile_table",
			Migrate: func(tx *gorm.DB) error {
				return tx.AutoMigrate(&auth.UserProfile{})
			},
			Rollback: func(tx *gorm.DB) error {
				return tx.Migrator().DropTable(&auth.UserProfile{})
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