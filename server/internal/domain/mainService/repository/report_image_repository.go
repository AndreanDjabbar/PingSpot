package repository

import (
	"server/internal/domain/mainService/model"

	"gorm.io/gorm"
)

type ReportImageRepository interface {
	Create(images *model.ReportImage, tx *gorm.DB) error
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