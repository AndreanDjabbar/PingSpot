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
			ID: "11142025_initial_migration",
			Migrate: func(tx *gorm.DB) error {
				return tx.AutoMigrate(
					&model.User{}, 
					&model.UserProfile{},
					&model.Report{}, 
					&model.ReportLocation{}, 
					&model.ReportImage{},
					&model.ReportReaction{}, 
					&model.ReportProgress{}, 
					&model.ReportVote{},
				)
			},
			Rollback: func(tx *gorm.DB) error {
				return tx.Migrator().DropTable(&model.User{})
			},
		},
		{
			ID: "11212025_add_is_deleted_field_to_report",
			Migrate: func(tx *gorm.DB) error {
				return tx.Migrator().AddColumn(&model.Report{}, "is_deleted")
			},
			Rollback: func(tx *gorm.DB) error {
				return tx.Migrator().DropColumn(&model.Report{}, "is_deleted")
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
