package migration

import (
	mainservice "server/internal/domain/mainService"
	userservice "server/internal/domain/userService"
	"server/pkg/logger"

	"github.com/go-gormigrate/gormigrate/v2"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

func Migrate(db *gorm.DB) error {
	m := gormigrate.New(db, gormigrate.DefaultOptions, []*gormigrate.Migration{
		{
			ID: "24072025_initial_migration",
			Migrate: func(tx *gorm.DB) error {
				return tx.AutoMigrate(&userservice.User{})
			},
			Rollback: func(tx *gorm.DB) error {
				return tx.Migrator().DropTable(&userservice.User{})
			},
		},
		{
			ID: "29082025_remove_phone_field",
			Migrate: func(tx *gorm.DB) error {
				if tx.Migrator().HasColumn(&userservice.User{}, "phone") {
					return tx.Migrator().DropColumn(&userservice.User{}, "phone")
				}
				return nil
			},
			Rollback: func(tx *gorm.DB) error {
				if !tx.Migrator().HasColumn(&userservice.User{}, "phone") {
					return tx.Migrator().AddColumn(&userservice.User{}, "phone")
				}
				return nil
			},
		},
		{
			ID: "29082025_add_user_profile_table",
			Migrate: func(tx *gorm.DB) error {
				return tx.AutoMigrate(&userservice.UserProfile{})
			},
			Rollback: func(tx *gorm.DB) error {
				return tx.Migrator().DropTable(&userservice.UserProfile{})
			},
		},
		{
			ID: "04092025_rename_avatar_to_profile_picture",
			Migrate: func(tx *gorm.DB) error {
				if tx.Migrator().HasColumn(&userservice.UserProfile{}, "avatar") {
					return tx.Migrator().RenameColumn(&userservice.UserProfile{}, "avatar", "profile_picture")
				}
				return nil
			},
			Rollback: func(tx *gorm.DB) error {
				if tx.Migrator().HasColumn(&userservice.UserProfile{}, "profile_picture") {
					return tx.Migrator().RenameColumn(&userservice.UserProfile{}, "profile_picture", "avatar")
				}
				return nil
			},
		},
		{
			ID: "11092025_remove_age_field",
			Migrate: func(tx *gorm.DB) error {
				if tx.Migrator().HasColumn(&userservice.UserProfile{}, "age") {
					return tx.Migrator().DropColumn(&userservice.UserProfile{}, "age")
				}
				return nil
			},
			Rollback: func(tx *gorm.DB) error {
				if !tx.Migrator().HasColumn(&userservice.UserProfile{}, "age") {
					return tx.Migrator().AddColumn(&userservice.UserProfile{}, "age")
				}
				return nil
			},
		},
		{
			ID: "11092025_add_birthday_field",
			Migrate: func(tx *gorm.DB) error {
				if !tx.Migrator().HasColumn(&userservice.UserProfile{}, "birthday") {
					return tx.Migrator().AddColumn(&userservice.UserProfile{}, "birthday")
				}
				return nil
			},
			Rollback: func(tx *gorm.DB) error {
				if tx.Migrator().HasColumn(&userservice.UserProfile{}, "birthday") {
					return tx.Migrator().DropColumn(&userservice.UserProfile{}, "birthday")
				}
				return nil
			},
		},
		{
			ID: "18092025_add_report_table",
			Migrate: func(tx *gorm.DB) error {
				return tx.AutoMigrate(&mainservice.Report{})
			},
			Rollback: func(tx *gorm.DB) error {
				return tx.Migrator().DropTable(&mainservice.Report{})
			},
		},
		{
			ID: "18092025_add_report_image_table",
			Migrate: func(tx *gorm.DB) error {
				return tx.AutoMigrate(&mainservice.ReportImage{})
			},
			Rollback: func(tx *gorm.DB) error {
				return tx.Migrator().DropTable(&mainservice.ReportImage{})
			},
		},
		{
			ID: "18092025_add_report_location_table",
			Migrate: func(tx *gorm.DB) error {
				return tx.AutoMigrate(&mainservice.ReportLocation{})
			},
			Rollback: func(tx *gorm.DB) error {
				return tx.Migrator().DropTable(&mainservice.ReportLocation{})
			},
		},
		{
			ID: "18092025_add_road_field",
			Migrate: func(tx *gorm.DB) error {
				if !tx.Migrator().HasColumn(&mainservice.ReportLocation{}, "road") {
					return tx.Migrator().AddColumn(&mainservice.ReportLocation{}, "road")
				}
				return nil
			},
			Rollback: func(tx *gorm.DB) error {
				if tx.Migrator().HasColumn(&mainservice.ReportLocation{}, "road") {
					return tx.Migrator().DropColumn(&mainservice.ReportLocation{}, "road")
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
