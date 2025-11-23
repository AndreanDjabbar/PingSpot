package repository

import (
	"server/internal/domain/model"
	"server/internal/domain/reportService/dto"

	"gorm.io/gorm"
)

type ReportRepository interface {
	Create(report *model.Report, tx *gorm.DB) error
	UpdateTX(tx *gorm.DB, report *model.Report) (*model.Report, error)
	DeleteTX(tx *gorm.DB, report *model.Report) (*model.Report, error)
	GetByID(reportID uint) (*model.Report, error)
	GetByIDTX(tx *gorm.DB, reportID uint) (*model.Report, error)
	Get() (*[]model.Report, error)
	GetByReportStatus(status ...string) (*[]model.Report, error)
	GetByIDIsDeleted(reportID uint, isDeleted bool) (*model.Report, error)
	GetByIsDeletedPaginated(limit, cursorID uint, reportType, status, sortBy, hasProgress string, distance dto.Distance, isDeleted bool) (*[]model.Report, error)
	GetPaginated(limit, cursorID uint, reportType, status, sortBy, hasProgress string, distance dto.Distance) (*[]model.Report, error)
	GetReportsCount() (*dto.TotalReportCount, error)
}

type reportRepository struct {
	db *gorm.DB
}

func NewReportRepository(db *gorm.DB) ReportRepository {
	return &reportRepository{db: db}
}

func (r *reportRepository) GetReportsCount() (*dto.TotalReportCount, error) {
	var grouped []struct {
		ReportType string
		Total      int64
	}

	if err := r.db.Model(&model.Report{}).
		Select("report_type, COUNT(*) as total").
		Group("report_type").
		Scan(&grouped).Error; err != nil {
		return nil, err
	}

	var result dto.TotalReportCount
	for _, g := range grouped {
		switch g.ReportType {
		case "INFRASTRUCTURE":
			result.TotalInfrastructureReports = g.Total
		case "ENVIRONMENT":
			result.TotalEnvironmentReports = g.Total
		case "SAFETY":
			result.TotalSafetyReports = g.Total
		case "TRAFFIC":
			result.TotalTrafficReports = g.Total
		case "PUBLIC_FACILITY":
			result.TotalPublicFacilityReports = g.Total
		case "WASTE":
			result.TotalWasteReports = g.Total
		case "WATER":
			result.TotalWaterReports = g.Total
		case "ELECTRICITY":
			result.TotalElectricityReports = g.Total
		case "HEALTH":
			result.TotalHealthReports = g.Total
		case "SOCIAL":
			result.TotalSocialReports = g.Total
		case "EDUCATION":
			result.TotalEducationReports = g.Total
		case "ADMINISTRATIVE":
			result.TotalAdministrativeReports = g.Total
		case "DISASTER":
			result.TotalDisasterReports = g.Total
		case "OTHER":
			result.TotalOtherReports = g.Total
		}
		result.TotalReports += g.Total
	}

	return &result, nil
}

func (r *reportRepository) GetByReportStatus(status ...string) (*[]model.Report, error) {
	var reports []model.Report
	if err := r.db.
		Preload("User").
		Preload("User.Profile").
		Where("report_status IN ?", status).
		Find(&reports).Error; err != nil {
		return nil, err
	}
	return &reports, nil
}

func (r *reportRepository) Create(report *model.Report, tx *gorm.DB) error {
	if tx != nil {
		return tx.Create(report).Error
	}
	return r.db.Create(report).Error
}

func (r *reportRepository) Get() (*[]model.Report, error) {
	var reports []model.Report
	if err := r.db.
		Preload("User.Profile").
		Preload("ReportLocation").
		Preload("ReportImages").
		Preload("ReportReactions").
		Preload("ReportVotes").
		Preload("ReportProgress", func(db *gorm.DB) *gorm.DB {
			return db.Order("created_at DESC")
		}).
		Order("reports.created_at DESC").
		Find(&reports).Error; err != nil {
		return nil, err
	}
	return &reports, nil
}

func (r *reportRepository) GetPaginated(limit, cursorID uint, reportType, status, sortBy, hasProgress string, distance dto.Distance) (*[]model.Report, error) {
	var reportIDs []int64
	var reports []model.Report

	subQuery := r.db.Table("reports")

	if reportType != "" && reportType != "all" {
		subQuery = subQuery.Where("reports.report_type = ?", reportType)
	}

	if status != "" && status != "all" {
		subQuery = subQuery.Where("reports.report_status = ?", status)
	}

	if distance.Distance != "" && distance.Distance != "all" {
		straightDistance := 0
		switch distance.Distance {
			case "1000":
				straightDistance = 1000
			case "5000":
				straightDistance = 5000
			case "10000":
				straightDistance = 10000
		}
		if straightDistance > 0 {
			subQuery = subQuery.
				Joins("JOIN report_locations ON report_locations.report_id = reports.id").
				Where(`
					ST_DWithin(
						report_locations.geometry::geography,
						ST_SetSRID(ST_MakePoint(?, ?), 4326)::geography,
						?
					)
				`, distance.Lng, distance.Lat, straightDistance)
		}
	}

	if hasProgress != "" && hasProgress != "all" {
		if hasProgress == "true" {
			subQuery = subQuery.Where("reports.has_progress = ?", true)
		} else if hasProgress == "false" {
			subQuery = subQuery.Where("reports.has_progress = ?", false)
		}
	}

	switch sortBy {
	case "latest":
		subQuery = subQuery.Order("reports.id DESC")
	case "oldest":
		subQuery = subQuery.Order("reports.id ASC")
	case "most_liked":
		subQuery = subQuery.
			Joins("LEFT JOIN report_reactions ON reports.id = report_reactions.report_id AND report_reactions.type = 'LIKE'").
			Group("reports.id").
			Order("COUNT(report_reactions.id) DESC")
	case "least_liked":
		subQuery = subQuery.
			Joins("LEFT JOIN report_reactions ON reports.id = report_reactions.report_id AND report_reactions.type = 'LIKE'").
			Group("reports.id").
			Order("COUNT(report_reactions.id) ASC")
	default:
		subQuery = subQuery.Order("reports.id DESC")
	}

	if cursorID != 0 {
		if sortBy == "oldest" || sortBy == "least_liked" {
			subQuery = subQuery.Where("reports.id > ?", cursorID)
		} else {
			subQuery = subQuery.Where("reports.id < ?", cursorID)
		}
	}

	subQuery = subQuery.Limit(int(limit))

	if err := subQuery.Select("reports.id").Pluck("id", &reportIDs).Error; err != nil {
		return nil, err
	}

	if len(reportIDs) == 0 {
		return &reports, nil
	}

	query := r.db.
		Preload("User.Profile").
		Preload("ReportLocation").
		Preload("ReportImages").
		Preload("ReportReactions").
		Preload("ReportVotes").
		Preload("ReportProgress", func(db *gorm.DB) *gorm.DB {
			return db.Order("created_at DESC")
		}).
		Where("id IN ?", reportIDs)

	switch sortBy {
	case "oldest", "least_liked":
		query = query.Order("id ASC")
	default:
		query = query.Order("id DESC")
	}

	if err := query.Find(&reports).Error; err != nil {
		return nil, err
	}

	return &reports, nil
}

func (r *reportRepository) GetByIsDeletedPaginated(limit, cursorID uint, reportType, status, sortBy, hasProgress string, distance dto.Distance, isDeleted bool) (*[]model.Report, error) {
	var reportIDs []int64
	var reports []model.Report

	subQuery := r.db.Table("reports")

	if reportType != "" && reportType != "all" {
		subQuery = subQuery.Where("reports.report_type = ?", reportType)
	}

	if status != "" && status != "all" {
		subQuery = subQuery.Where("reports.report_status = ?", status)
	}

	if distance.Distance != "" && distance.Distance != "all" {
		straightDistance := 0
		switch distance.Distance {
			case "1000":
				straightDistance = 1000
			case "5000":
				straightDistance = 5000
			case "10000":
				straightDistance = 10000
		}
		if straightDistance > 0 {
			subQuery = subQuery.
				Joins("JOIN report_locations ON report_locations.report_id = reports.id").
				Where(`
					ST_DWithin(
						report_locations.geometry::geography,
						ST_SetSRID(ST_MakePoint(?, ?), 4326)::geography,
						?
					)
				`, distance.Lng, distance.Lat, straightDistance)
		}
	}

	if hasProgress != "" && hasProgress != "all" {
		if hasProgress == "true" {
			subQuery = subQuery.Where("reports.has_progress = ?", true)
		} else if hasProgress == "false" {
			subQuery = subQuery.Where("reports.has_progress = ?", false)
		}
	}

	switch sortBy {
	case "latest":
		subQuery = subQuery.Order("reports.id DESC")
	case "oldest":
		subQuery = subQuery.Order("reports.id ASC")
	case "most_liked":
		subQuery = subQuery.
			Joins("LEFT JOIN report_reactions ON reports.id = report_reactions.report_id AND report_reactions.type = 'LIKE'").
			Group("reports.id").
			Order("COUNT(report_reactions.id) DESC")
	case "least_liked":
		subQuery = subQuery.
			Joins("LEFT JOIN report_reactions ON reports.id = report_reactions.report_id AND report_reactions.type = 'LIKE'").
			Group("reports.id").
			Order("COUNT(report_reactions.id) ASC")
	default:
		subQuery = subQuery.Order("reports.id DESC")
	}

	if cursorID != 0 {
		if sortBy == "oldest" || sortBy == "least_liked" {
			subQuery = subQuery.Where("reports.id > ?", cursorID)
		} else {
			subQuery = subQuery.Where("reports.id < ?", cursorID)
		}
	}

	subQuery = subQuery.Limit(int(limit))

	if err := subQuery.Select("reports.id").Pluck("id", &reportIDs).Error; err != nil {
		return nil, err
	}

	if len(reportIDs) == 0 {
		return &reports, nil
	}

	query := r.db.
		Preload("User.Profile").
		Preload("ReportLocation").
		Preload("ReportImages").
		Preload("ReportReactions").
		Preload("ReportVotes").
		Preload("ReportProgress", func(db *gorm.DB) *gorm.DB {
			return db.Order("created_at DESC")
		}).
		Where("id IN ?", reportIDs).
		Where("is_deleted = ?", isDeleted)

	switch sortBy {
	case "oldest", "least_liked":
		query = query.Order("id ASC")
	default:
		query = query.Order("id DESC")
	}

	if err := query.Find(&reports).Error; err != nil {
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

func (r *reportRepository) DeleteTX(tx *gorm.DB, report *model.Report) (*model.Report, error) {
	if err := tx.Delete(report).Error; err != nil {
		return nil, err
	}
	return report, nil
}

func (r *reportRepository) GetByID(reportID uint) (*model.Report, error) {
	var report model.Report

	if err := r.db.
		Preload("User.Profile").
		Preload("ReportLocation").
		Preload("ReportImages").
		Preload("ReportReactions").
		Preload("ReportVotes").
		Preload("ReportProgress", func(db *gorm.DB) *gorm.DB {
			return db.Order("created_at DESC")
		}).
		First(&report, "reports.id = ?", reportID).Error; err != nil {
		return nil, err
	}

	return &report, nil
}

func (r *reportRepository) GetByIDIsDeleted(reportID uint, isDeleted bool) (*model.Report, error) {
	var report model.Report

	if err := r.db.
		Preload("User.Profile").
		Preload("ReportLocation").
		Preload("ReportImages").
		Preload("ReportReactions").
		Preload("ReportVotes").
		Preload("ReportProgress", func(db *gorm.DB) *gorm.DB {
			return db.Order("created_at DESC")
		}).
		Where("is_deleted = ?", isDeleted).
		First(&report, "reports.id = ?", reportID).
		Error; err != nil {
		return nil, err
	}

	return &report, nil
}

func (r *reportRepository) GetByIDTX(tx *gorm.DB, reportID uint) (*model.Report, error) {
	var report model.Report
	if err := tx.
		Preload("User.Profile").
		Preload("ReportLocation").
		Preload("ReportImages").
		Preload("ReportReactions").
		Preload("ReportVotes").
		Preload("ReportProgress", func(db *gorm.DB) *gorm.DB {
			return db.Order("created_at DESC")
		}).
		First(&report, "reports.id = ?", reportID).Error; err != nil {
		return nil, err
	}
	return &report, nil
}
