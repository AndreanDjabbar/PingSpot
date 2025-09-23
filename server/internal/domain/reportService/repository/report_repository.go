package repository

import (
	"server/internal/domain/reportService/model"

	"gorm.io/gorm"
)

type ReportRepository interface {
	Create(report *model.Report, tx *gorm.DB) error
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
