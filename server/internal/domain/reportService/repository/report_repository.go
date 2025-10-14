package repository

import (
	"server/internal/domain/model"

	"gorm.io/gorm"
)

type ReportRepository interface {
	Create(report *model.Report, tx *gorm.DB) error
	UpdateTX(tx *gorm.DB, report *model.Report) (*model.Report, error)
	GetByID(reportID uint) (*model.Report, error)
	Get() (*[]model.Report, error)
}

type reportRepository struct {
	db *gorm.DB
}

func NewReportRepository(db *gorm.DB) ReportRepository {
	return &reportRepository{db: db}
}

func (r *reportRepository) Create(report *model.Report, tx *gorm.DB) error {
	if tx != nil {
		return tx.Create(report).Error
	}
	return r.db.Create(report).Error
}

func (r *reportRepository) Get() (*[]model.Report, error) {
	var reports []model.Report
	if err := r.db.Preload("User.Profile").Preload("ReportLocation").Preload("ReportImages").Preload("ReportReactions").Preload("ReportVotes").Preload("ReportProgress").Find(&reports).Error; err != nil {
		return nil, err
	}
	return &reports, nil
}

func (r *reportRepository) UpdateTX(tx *gorm.DB, report *model.Report) (*model.Report, error) {
	if err := tx.Save(report).Error; err != nil {
		return nil, err
	}
	return report, nil
}

func (r *reportRepository) GetByID(reportID uint) (*model.Report, error) {
	var report model.Report
	if err := r.db.Preload("User").First(&report, reportID).Error; err != nil {
		return nil, err
	}
	return &report, nil
}