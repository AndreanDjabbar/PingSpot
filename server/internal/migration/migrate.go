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
		{
			ID: "29092025_add_report_status_field",
			Migrate: func(tx *gorm.DB) error {
				if !tx.Migrator().HasColumn(&model.Report{}, "") {
					return tx.Migrator().AddColumn(&model.Report{}, "report_status")
				}
				return nil
			},
			Rollback: func(tx *gorm.DB) error {
				if tx.Migrator().HasColumn(&model.Report{}, "report_status") {
					return tx.Migrator().DropColumn(&model.Report{}, "report_status")
				}
				return nil
			},
		},
		{
			ID: "18092025_add_report_reaction_table",
			Migrate: func(tx *gorm.DB) error {
				return tx.AutoMigrate(&model.ReportReaction{})
			},
			Rollback: func(tx *gorm.DB) error {
				return tx.Migrator().DropTable(&model.ReportReaction{})
			},
		},
		{
			ID: "29092025_add_updated_at_field_report_reaction",
			Migrate: func(tx *gorm.DB) error {
				if !tx.Migrator().HasColumn(&model.ReportReaction{}, "") {
					return tx.Migrator().AddColumn(&model.ReportReaction{}, "updated_at")
				}
				return nil
			},
			Rollback: func(tx *gorm.DB) error {
				if tx.Migrator().HasColumn(&model.ReportReaction{}, "updated_at") {
					return tx.Migrator().DropColumn(&model.ReportReaction{}, "updated_at")
				}
				return nil
			},
		},
		{
			ID: "07102025_add_report_progress_table",
			Migrate: func(tx *gorm.DB) error {
				return tx.AutoMigrate(&model.ReportProgress{})
			},
			Rollback: func(tx *gorm.DB) error {
				return tx.Migrator().DropTable(&model.ReportProgress{})
			},
		},
		{
			ID: "07102025_add_user_id_field_report_progress",
			Migrate: func(tx *gorm.DB) error {
				if !tx.Migrator().HasColumn(&model.ReportProgress{}, "") {
					return tx.Migrator().AddColumn(&model.ReportProgress{}, "user_id")
				}
				return nil
			},
			Rollback: func(tx *gorm.DB) error {
				if tx.Migrator().HasColumn(&model.ReportProgress{}, "user_id") {
					return tx.Migrator().DropColumn(&model.ReportProgress{}, "user_id")
				}
				return nil
			},
		},
		{
			ID: "13102025_add_has_progress_field_report",
			Migrate: func(tx *gorm.DB) error {
				if !tx.Migrator().HasColumn(&model.Report{}, "") {
					return tx.Migrator().AddColumn(&model.Report{}, "has_progress")
				}
				return nil
			},
			Rollback: func(tx *gorm.DB) error {
				if tx.Migrator().HasColumn(&model.Report{}, "has_progress") {
					return tx.Migrator().DropColumn(&model.Report{}, "has_progress")
				}
				return nil
			},
		},
		{
			ID: "13102025_add_report_vote_table",
			Migrate: func(tx *gorm.DB) error {
				return tx.AutoMigrate(&model.ReportVote{})
			},
			Rollback: func(tx *gorm.DB) error {
				return tx.Migrator().DropTable(&model.ReportVote{})
			},
		},
		{
			ID: "31102025_add_cascade_delete_report_reactions",
			Migrate: func(tx *gorm.DB) error {
				if err := tx.Exec("ALTER TABLE report_reactions DROP CONSTRAINT IF EXISTS fk_report_reactions_report").Error; err != nil {
					return err
				}
				return tx.Exec(`
					ALTER TABLE report_reactions 
					ADD CONSTRAINT fk_report_reactions_report 
					FOREIGN KEY (report_id) 
					REFERENCES reports(id) 
					ON UPDATE CASCADE 
					ON DELETE CASCADE
				`).Error
			},
			Rollback: func(tx *gorm.DB) error {
				if err := tx.Exec("ALTER TABLE report_reactions DROP CONSTRAINT IF EXISTS fk_report_reactions_report").Error; err != nil {
					return err
				}
				return tx.Exec(`
					ALTER TABLE report_reactions 
					ADD CONSTRAINT fk_report_reactions_report 
					FOREIGN KEY (report_id) 
					REFERENCES reports(id)
				`).Error
			},
		},
		{
			ID: "04112025_add_updaterd_at_field_report",
			Migrate: func(tx *gorm.DB) error {
				if !tx.Migrator().HasColumn(&model.Report{}, "") {
					return tx.Migrator().AddColumn(&model.Report{}, "updated_at")
				}
				return nil
			},
			Rollback: func(tx *gorm.DB) error {
				if tx.Migrator().HasColumn(&model.Report{}, "updated_at") {
					return tx.Migrator().DropColumn(&model.Report{}, "updated_at")
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
