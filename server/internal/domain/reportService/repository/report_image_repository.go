package repository

import (
	"server/internal/domain/model"

	"gorm.io/gorm"
)

type ReportImageRepository interface {
	Create(images *model.ReportImage, tx *gorm.DB) error
	GetByReportID(reportID uint) (*model.ReportImage, error)
}

type reportImageRepository struct {
	db *gorm.DB
}

func NewReportImageRepository(db *gorm.DB) ReportImageRepository {
	return &reportImageRepository{db: db}
}

func (r *reportImageRepository) Create(images *model.ReportImage, tx *gorm.DB) error {
	if tx != nil {
		return tx.Create(images).Error
	}
	return r.db.Create(images).Error
}

func (r *reportImageRepository) GetByReportID(reportID uint) (*model.ReportImage, error) {
	var images model.ReportImage
	if err := r.db.Where("report_id = ?", reportID).First(&images).Error; err != nil {
		return nil, err
	}
	return &images, nil
}