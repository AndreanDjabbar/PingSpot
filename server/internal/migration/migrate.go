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
			ID: "12092025_add_user_session_table",
			Migrate: func(tx *gorm.DB) error {
				return tx.AutoMigrate(&model.UserSession{})
			},
			Rollback: func(tx *gorm.DB) error {
				return tx.Migrator().DropTable(&model.UserSession{})
			},
		},
		{
			ID: "12092025_alter_refresh_token_id_to_varchar",
			Migrate: func(tx *gorm.DB) error {
				return tx.Exec("ALTER TABLE user_sessions ALTER COLUMN refresh_token_id TYPE VARCHAR(64)").Error
			},
			Rollback: func(tx *gorm.DB) error {
				return tx.Exec("ALTER TABLE user_sessions ALTER COLUMN refresh_token_id TYPE UUID USING refresh_token_id::UUID").Error
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
