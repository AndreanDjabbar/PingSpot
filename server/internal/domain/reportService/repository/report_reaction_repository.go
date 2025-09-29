package repository

import (
	"server/internal/domain/model"

	"gorm.io/gorm"
)

type ReportReactionRepository interface {
	GetByUserReportID(userID, reportID uint) (*model.ReportReaction, error)
	GetByUserReportIDTX(tx *gorm.DB, userID, reportID uint) (*model.ReportReaction, error)
	CreateTX(tx *gorm.DB, reaction *model.ReportReaction) (*model.ReportReaction, error)
	UpdateTX(tx *gorm.DB, reaction *model.ReportReaction) (*model.ReportReaction, error)
	DeleteTX(tx *gorm.DB, reaction *model.ReportReaction) error
	GetLikeReactionCount(reportID uint) (int64, error)
	GetDislikeReactionCount(reportID uint) (int64, error)
}

type reportReactionRepository struct {
	db *gorm.DB
}

func NewReportReactionRepository(db *gorm.DB) ReportReactionRepository {
	return &reportReactionRepository{db: db}
}

func (r *reportReactionRepository) GetByUserReportID(userID, reportID uint) (*model.ReportReaction, error) {
	var reaction model.ReportReaction
	if err := r.db.Where("user_id = ? AND report_id = ?", userID, reportID).First(&reaction).Error; err != nil {
		return nil, err
	}
	return &reaction, nil
}

func (r *reportReactionRepository) GetByUserReportIDTX(tx *gorm.DB, userID, reportID uint) (*model.ReportReaction, error) {
	var reaction model.ReportReaction
	if err := tx.Where("user_id = ? AND report_id = ?", userID, reportID).First(&reaction).Error; err != nil {
		return nil, err
	}
	return &reaction, nil
}

func (r *reportReactionRepository) CreateTX(tx *gorm.DB, reaction *model.ReportReaction) (*model.ReportReaction, error) {
	if err := tx.Create(reaction).Error; err != nil {
		return nil, err
	}
	return reaction, nil
}

func (r *reportReactionRepository) UpdateTX(tx *gorm.DB, reaction *model.ReportReaction) (*model.ReportReaction, error) {
	if err := tx.Save(reaction).Error; err != nil {
		return nil, err
	}
	return reaction, nil
}

func (r *reportReactionRepository) DeleteTX(tx *gorm.DB, reaction *model.ReportReaction) error {
	if err := tx.Delete(reaction).Error; err != nil {
		return err
	}
	return nil
}

func (r *reportReactionRepository) GetLikeReactionCount(reportID uint) (int64, error) {
	var count int64
	if err := r.db.Model(&model.ReportReaction{}).
		Where("report_id = ? AND type = ?", reportID, model.Like).
		Count(&count).Error; err != nil {
		return 0, err
	}
	return count, nil
}

func (r *reportReactionRepository) GetDislikeReactionCount(reportID uint) (int64, error) {
	var count int64
	if err := r.db.Model(&model.ReportReaction{}).
		Where("report_id = ? AND type = ?", reportID, model.Dislike).
		Count(&count).Error; err != nil {
		return 0, err
	}
	return count, nil
}