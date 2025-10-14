package repository

import (
	"server/internal/domain/model"

	"gorm.io/gorm"
)

type ReportVoteRepository interface {
	GetByUserReportID(userID, reportID uint) (*model.ReportVote, error)
	GetByUserReportIDTX(tx *gorm.DB, userID, reportID uint) (*model.ReportVote, error)
	CreateTX(tx *gorm.DB, vote *model.ReportVote) (*model.ReportVote, error)
	UpdateTX(tx *gorm.DB, vote *model.ReportVote) (*model.ReportVote, error)
	DeleteTX(tx *gorm.DB, vote *model.ReportVote) error
	GetResolvedVoteCount(reportID uint) (int64, error)
	GetNotResolvedVoteCount(reportID uint) (int64, error)
}

type reportVoteRepository struct {
	db *gorm.DB
}

func NewReportVoteRepository(db *gorm.DB) ReportVoteRepository {
	return &reportVoteRepository{db: db}
}

func (r *reportVoteRepository) GetByUserReportID(userID, reportID uint) (*model.ReportVote, error) {
	var vote model.ReportVote
	if err := r.db.Where("user_id = ? AND report_id = ?", userID, reportID).First(&vote).Error; err != nil {
		return nil, err
	}
	return &vote, nil
}

func (r *reportVoteRepository) GetByUserReportIDTX(tx *gorm.DB, userID, reportID uint) (*model.ReportVote, error) {
	var vote model.ReportVote
	if err := tx.Where("user_id = ? AND report_id = ?", userID, reportID).First(&vote).Error; err != nil {
		return nil, err
	}
	return &vote, nil
}

func (r *reportVoteRepository) CreateTX(tx *gorm.DB, vote *model.ReportVote) (*model.ReportVote, error) {
	if err := tx.Create(vote).Error; err != nil {
		return nil, err
	}
	return vote, nil
}

func (r *reportVoteRepository) UpdateTX(tx *gorm.DB, vote *model.ReportVote) (*model.ReportVote, error) {
	if err := tx.Save(vote).Error; err != nil {
		return nil, err
	}
	return vote, nil
}

func (r *reportVoteRepository) DeleteTX(tx *gorm.DB, vote *model.ReportVote) error {
	if err := tx.Delete(vote).Error; err != nil {
		return err
	}
	return nil
}

func (r *reportVoteRepository) GetResolvedVoteCount(reportID uint) (int64, error) {
	var count int64
	if err := r.db.Model(&model.ReportVote{}).
		Where("report_id = ? AND vote_type = ?", reportID, model.RESOLVED).
		Count(&count).Error; err != nil {
		return 0, err
	}
	return count, nil
}

func (r *reportVoteRepository) GetNotResolvedVoteCount(reportID uint) (int64, error) {
	var count int64
	if err := r.db.Model(&model.ReportVote{}).
		Where("report_id = ? AND vote_type = ?", reportID, model.NOT_RESOLVED).
		Count(&count).Error; err != nil {
		return 0, err
	}
	return count, nil
}