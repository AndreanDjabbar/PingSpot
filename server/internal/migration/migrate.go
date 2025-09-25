package migration

import (
	"server/internal/domain/model"
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
				return tx.AutoMigrate(&model.User{})
			},
			Rollback: func(tx *gorm.DB) error {
				return tx.Migrator().DropTable(&model.User{})
			},
		},
		{
			ID: "29082025_remove_phone_field",
			Migrate: func(tx *gorm.DB) error {
				if tx.Migrator().HasColumn(&model.User{}, "phone") {
					return tx.Migrator().DropColumn(&model.User{}, "phone")
				}
				return nil
			},
			Rollback: func(tx *gorm.DB) error {
				if !tx.Migrator().HasColumn(&model.User{}, "phone") {
					return tx.Migrator().AddColumn(&model.User{}, "phone")
				}
				return nil
			},
		},
		{
			ID: "29082025_add_user_profile_table",
			Migrate: func(tx *gorm.DB) error {
				return tx.AutoMigrate(&model.UserProfile{})
			},
			Rollback: func(tx *gorm.DB) error {
				return tx.Migrator().DropTable(&model.UserProfile{})
			},
		},
		{
			ID: "04092025_rename_avatar_to_profile_picture",
			Migrate: func(tx *gorm.DB) error {
				if tx.Migrator().HasColumn(&model.UserProfile{}, "avatar") {
					return tx.Migrator().RenameColumn(&model.UserProfile{}, "avatar", "profile_picture")
				}
				return nil
			},
			Rollback: func(tx *gorm.DB) error {
				if tx.Migrator().HasColumn(&model.UserProfile{}, "profile_picture") {
					return tx.Migrator().RenameColumn(&model.UserProfile{}, "profile_picture", "avatar")
				}
				return nil
			},
		},
		{
			ID: "11092025_remove_age_field",
			Migrate: func(tx *gorm.DB) error {
				if tx.Migrator().HasColumn(&model.UserProfile{}, "age") {
					return tx.Migrator().DropColumn(&model.UserProfile{}, "age")
				}
				return nil
			},
			Rollback: func(tx *gorm.DB) error {
				if !tx.Migrator().HasColumn(&model.UserProfile{}, "age") {
					return tx.Migrator().AddColumn(&model.UserProfile{}, "age")
				}
				return nil
			},
		},
		{
			ID: "11092025_add_birthday_field",
			Migrate: func(tx *gorm.DB) error {
				if !tx.Migrator().HasColumn(&model.UserProfile{}, "birthday") {
					return tx.Migrator().AddColumn(&model.UserProfile{}, "birthday")
				}
				return nil
			},
			Rollback: func(tx *gorm.DB) error {
				if tx.Migrator().HasColumn(&model.UserProfile{}, "birthday") {
					return tx.Migrator().DropColumn(&model.UserProfile{}, "birthday")
				}
				return nil
			},
		},
		{
			ID: "18092025_add_report_table",
			Migrate: func(tx *gorm.DB) error {
				return tx.AutoMigrate(&model.Report{})
			},
			Rollback: func(tx *gorm.DB) error {
				return tx.Migrator().DropTable(&model.Report{})
			},
		},
		{
			ID: "18092025_add_report_image_table",
			Migrate: func(tx *gorm.DB) error {
				return tx.AutoMigrate(&model.ReportImage{})
			},
			Rollback: func(tx *gorm.DB) error {
				return tx.Migrator().DropTable(&model.ReportImage{})
			},
		},
		{
			ID: "18092025_add_report_location_table",
			Migrate: func(tx *gorm.DB) error {
				return tx.AutoMigrate(&model.ReportLocation{})
			},
			Rollback: func(tx *gorm.DB) error {
				return tx.Migrator().DropTable(&model.ReportLocation{})
			},
		},
		{
			ID: "18092025_add_road_field",
			Migrate: func(tx *gorm.DB) error {
				if !tx.Migrator().HasColumn(&model.ReportLocation{}, "road") {
					return tx.Migrator().AddColumn(&model.ReportLocation{}, "road")
				}
				return nil
			},
			Rollback: func(tx *gorm.DB) error {
				if tx.Migrator().HasColumn(&model.ReportLocation{}, "road") {
					return tx.Migrator().DropColumn(&model.ReportLocation{}, "road")
				}
				return nil
			},
		},
		{
			ID: "25092025_add_geometry_field",
			Migrate: func(tx *gorm.DB) error {
				if !tx.Migrator().HasColumn(&model.ReportLocation{}, "geometry") {
					return tx.Migrator().AddColumn(&model.ReportLocation{}, "geometry")
				}
				return nil
			},
			Rollback: func(tx *gorm.DB) error {
				if tx.Migrator().HasColumn(&model.ReportLocation{}, "geometry") {
					return tx.Migrator().DropColumn(&model.ReportLocation{}, "geometry")
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
