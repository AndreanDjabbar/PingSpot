package repository

import (
	"server/internal/domain/mainService/model"

	"gorm.io/gorm"
)

type ReportLocationRepository interface {
	Create(location *model.ReportLocation, tx *gorm.DB) error
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