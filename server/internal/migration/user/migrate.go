package user

import (
	mainModel "server/internal/model/mainService"
	userModel "server/internal/model/user"
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
				return tx.AutoMigrate(&userModel.User{})
			},
			Rollback: func(tx *gorm.DB) error {
				return tx.Migrator().DropTable(&userModel.User{})
			},
		},
		{
			ID: "29082025_remove_phone_field",
			Migrate: func(tx *gorm.DB) error {
				if tx.Migrator().HasColumn(&userModel.User{}, "phone") {
					return tx.Migrator().DropColumn(&userModel.User{}, "phone")
				}
				return nil
			},
			Rollback: func(tx *gorm.DB) error {
				if !tx.Migrator().HasColumn(&userModel.User{}, "phone") {
					return tx.Migrator().AddColumn(&userModel.User{}, "phone")
				}
				return nil
			},
		},
		{
			ID: "29082025_add_user_profile_table",
			Migrate: func(tx *gorm.DB) error {
				return tx.AutoMigrate(&userModel.UserProfile{})
			},
			Rollback: func(tx *gorm.DB) error {
				return tx.Migrator().DropTable(&userModel.UserProfile{})
			},
		},
		{
			ID: "04092025_rename_avatar_to_profile_picture",
			Migrate: func(tx *gorm.DB) error {
				if tx.Migrator().HasColumn(&userModel.UserProfile{}, "avatar") {
					return tx.Migrator().RenameColumn(&userModel.UserProfile{}, "avatar", "profile_picture")
				}
				return nil
			},
			Rollback: func(tx *gorm.DB) error {
				if tx.Migrator().HasColumn(&userModel.UserProfile{}, "profile_picture") {
					return tx.Migrator().RenameColumn(&userModel.UserProfile{}, "profile_picture", "avatar")
				}
				return nil
			},
		},
		{
			ID: "11092025_remove_age_field",
			Migrate: func(tx *gorm.DB) error {
				if tx.Migrator().HasColumn(&userModel.UserProfile{}, "age") {
					return tx.Migrator().DropColumn(&userModel.UserProfile{}, "age")
				}
				return nil
			},
			Rollback: func(tx *gorm.DB) error {
				if !tx.Migrator().HasColumn(&userModel.UserProfile{}, "age") {
					return tx.Migrator().AddColumn(&userModel.UserProfile{}, "age")
				}
				return nil
			},
		},
		{
			ID: "11092025_add_birthday_field",
			Migrate: func(tx *gorm.DB) error {
				if !tx.Migrator().HasColumn(&userModel.UserProfile{}, "birthday") {
					return tx.Migrator().AddColumn(&userModel.UserProfile{}, "birthday")
				}
				return nil
			},
			Rollback: func(tx *gorm.DB) error {
				if tx.Migrator().HasColumn(&userModel.UserProfile{}, "birthday") {
					return tx.Migrator().DropColumn(&userModel.UserProfile{}, "birthday")
				}
				return nil
			},
		},
		{
			ID: "18092025_add_report_table",
			Migrate: func(tx *gorm.DB) error {
				return tx.AutoMigrate(&mainModel.Report{})
			},
			Rollback: func(tx *gorm.DB) error {
				return tx.Migrator().DropTable(&mainModel.Report{})
			},
		},
		{
			ID: "18092025_add_report_image_table",
			Migrate: func(tx *gorm.DB) error {
				return tx.AutoMigrate(&mainModel.ReportImage{})
			},
			Rollback: func(tx *gorm.DB) error {
				return tx.Migrator().DropTable(&mainModel.ReportImage{})
			},
		},
		{
			ID: "18092025_add_report_location_table",
			Migrate: func(tx *gorm.DB) error {
				return tx.AutoMigrate(&mainModel.ReportLocation{})
			},
			Rollback: func(tx *gorm.DB) error {
				return tx.Migrator().DropTable(&mainModel.ReportLocation{})
			},
		},
		{
			ID: "18092025_add_road_field",
			Migrate: func(tx *gorm.DB) error {
				if !tx.Migrator().HasColumn(&mainModel.ReportLocation{}, "road") {
					return tx.Migrator().AddColumn(&mainModel.ReportLocation{}, "road")
				}
				return nil
			},
			Rollback: func(tx *gorm.DB) error {
				if tx.Migrator().HasColumn(&mainModel.ReportLocation{}, "road") {
					return tx.Migrator().DropColumn(&mainModel.ReportLocation{}, "road")
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
