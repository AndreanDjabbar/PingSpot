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
	GetReportVoteCount(voteType model.ReportStatus, reportID uint) (int64, error)
	GetReportVoteCountsTX(tx *gorm.DB, reportID uint) (map[model.ReportStatus]int64, error)
	GetHighestVoteTypeTX(tx *gorm.DB, reportID uint) (model.ReportStatus, error)
	GetResolvedVoteCount(reportID uint) (int64, error)
	GetOnProgressVoteCount(reportID uint) (int64, error)
	GetNotResolvedVoteCount(reportID uint) (int64, error)
	GetTotalVoteCountTX(tx *gorm.DB, reportID uint) (int64, error)
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

func (r *reportVoteRepository) GetTotalVoteCountTX(tx *gorm.DB, reportID uint) (int64, error) {
	var count int64
	if err := tx.Model(&model.ReportVote{}).
		Where("report_id = ?", reportID).
		Count(&count).Error; err != nil {
		return 0, err
	}
	return count, nil
}

func (r *reportVoteRepository) GetReportVoteCountsTX(tx *gorm.DB, reportID uint) (map[model.ReportStatus]int64, error) {
	rows, err := tx.Model(&model.ReportVote{}).
		Select("vote_type, COUNT(*) as count").
		Where("report_id = ?", reportID).
		Group("vote_type").
		Rows()
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	counts := map[model.ReportStatus]int64{
		model.RESOLVED:     0,
		model.ON_PROGRESS:  0,
		model.NOT_RESOLVED: 0,
	}
	for rows.Next() {
		var voteType model.ReportStatus
		var count int64
		if err := rows.Scan(&voteType, &count); err != nil {
			return nil, err
		}
		counts[voteType] = count
	}
	return counts, nil
}


func (r *reportVoteRepository) GetByUserReportIDTX(tx *gorm.DB, userID, reportID uint) (*model.ReportVote, error) {
	var vote model.ReportVote
	if err := tx.Where("user_id = ? AND report_id = ?", userID, reportID).First(&vote).Error; err != nil {
		return nil, err
	}
	return &vote, nil
}

func (r *reportVoteRepository) GetHighestVoteTypeTX(tx *gorm.DB, reportID uint) (model.ReportStatus, error) {
	var result struct {
		VoteType model.ReportStatus
		Count    int64
	}
	if err := tx.Model(&model.ReportVote{}).
		Select("vote_type, COUNT(*) as count").
		Where("report_id = ?", reportID).
		Group("vote_type").
		Order("count DESC").
		Limit(1).
		Scan(&result).Error; err != nil {
		return "", err
	}
	return result.VoteType, nil
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

func (r *reportVoteRepository) GetReportVoteCount(voteType model.ReportStatus, reportID uint) (int64, error) {
	var count int64
	if err := r.db.Model(&model.ReportVote{}).
		Where("report_id = ? AND vote_type = ?", reportID, voteType).
		Count(&count).Error; err != nil {
		return 0, err
	}
	return count, nil
}

func (r *reportVoteRepository) GetOnProgressVoteCount(reportID uint) (int64, error) {
	var count int64
	if err := r.db.Model(&model.ReportVote{}).
		Where("report_id = ? AND vote_type = ?", reportID, model.ON_PROGRESS).
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