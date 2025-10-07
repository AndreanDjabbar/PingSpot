package repository

import (
	"server/internal/domain/model"

	"gorm.io/gorm"
)

type ReportProgressRepository interface {
	Create(progress *model.ReportProgress, tx *gorm.DB) (*model.ReportProgress, error)
}

type reporProgressRepository struct {
	db *gorm.DB
}

func NewReportProgressRepository(db *gorm.DB) ReportProgressRepository {
	return &reporProgressRepository{db: db}
}

func (r *reporProgressRepository) Create(progress *model.ReportProgress, tx *gorm.DB) (*model.ReportProgress, error) {
	if err := r.db.Create(progress).Error; err != nil {
		return nil, err
	}
	return progress, nil
}