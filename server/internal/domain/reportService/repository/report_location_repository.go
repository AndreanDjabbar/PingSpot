package repository

import (
	"server/internal/domain/model"

	"gorm.io/gorm"
)

type ReportLocationRepository interface {
	Create(location *model.ReportLocation, tx *gorm.DB) error
	GetByReportID(reportID uint) (*model.ReportLocation, error)
}

type reportLocationRepository struct {
	db *gorm.DB
}

func NewReportLocationRepository(db *gorm.DB) ReportLocationRepository {
	return &reportLocationRepository{db: db}
}

func (r *reportLocationRepository) Create(location *model.ReportLocation, tx *gorm.DB) error {
	if tx != nil {
		return tx.Create(location).Error
	}
	return r.db.Create(location).Error
}

func (r *reportLocationRepository) GetByReportID(reportID uint) (*model.ReportLocation, error) {
	var location model.ReportLocation
	if err := r.db.Where("report_id = ?", reportID).First(&location).Error; err != nil {
		return nil, err
	}
	return &location, nil
}