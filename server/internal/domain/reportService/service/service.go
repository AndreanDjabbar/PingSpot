package service

import (
	"errors"
	"fmt"
	"server/internal/domain/model"
	"server/internal/domain/reportService/dto"
	reportRepository "server/internal/domain/reportService/repository"
	userRepository "server/internal/domain/userService/repository"
	"time"

	"gorm.io/gorm"
)

type ReportService struct {
	reportRepo         reportRepository.ReportRepository
	reportLocationRepo reportRepository.ReportLocationRepository
	reportImageRepo    reportRepository.ReportImageRepository
	reportReactionRepo reportRepository.ReportReactionRepository
	reportProgressRepo reportRepository.ReportProgressRepository
	userRepo 			userRepository.UserRepository
	userProfileRepo 	userRepository.UserProfileRepository
}

func NewreportService(reportRepo reportRepository.ReportRepository, locationRepo reportRepository.ReportLocationRepository, reportReaction reportRepository.ReportReactionRepository, imageRepo reportRepository.ReportImageRepository, userRepo userRepository.UserRepository, userProfileRepo userRepository.UserProfileRepository, reportProgressRepo reportRepository.ReportProgressRepository) *ReportService {
	return &ReportService{
		reportRepo:         reportRepo,
		reportLocationRepo: locationRepo,
		reportImageRepo:    imageRepo,
		userRepo:			userRepo,
		reportReactionRepo: reportReaction,
		reportProgressRepo: reportProgressRepo,
		userProfileRepo:	userProfileRepo,
	}
}

func (s *ReportService) CreateReport(db *gorm.DB, userID uint, req dto.CreateReportRequest) (*dto.CreateReportResponse, error) {
	tx := db.Begin()
	if tx.Error != nil {
		return nil, errors.New("Gagal memulai transaksi")
	}
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	var reportStruct model.Report
	reportStruct = model.Report{
		UserID:            userID,
		ReportTitle:       req.ReportTitle,
		ReportType:        model.ReportType(req.ReportType),
		ReportDescription: req.ReportDescription,
		CreatedAt:         time.Now().Unix(),
	}
	if err := s.reportRepo.Create(&reportStruct, tx); err != nil {
		tx.Rollback()
		return nil, errors.New("Gagal membuat laporan")
	}

	reportID := reportStruct.ID

	var reportLocationStruct model.ReportLocation
	reportLocationStruct = model.ReportLocation{
		ReportID:       reportID,
		Latitude:       req.Latitude,
		Longitude:      req.Longitude,
		Geometry: 	 fmt.Sprintf("SRID=4326;POINT(%f %f)", req.Longitude, req.Latitude),
		DetailLocation: req.DetailLocation,
		DisplayName:    req.DisplayName,
		AddressType:    req.AddressType,
		Country:        req.Country,
		CountryCode:    req.CountryCode,
		Region:         req.Region,
		Road:           req.Road,
		PostCode:       req.PostCode,
		County:         req.County,
		State:          req.State,
		Village:        req.Village,
		Suburb:         req.Suburb,
	}

	if err := s.reportLocationRepo.Create(&reportLocationStruct, tx); err != nil {
		tx.Rollback()
		return nil, errors.New("Gagal menyimpan lokasi laporan")
	}

	var reportImages model.ReportImage
	reportImages = model.ReportImage{
		Image1URL: req.Image1URL,
		Image2URL: req.Image2URL,
		Image3URL: req.Image3URL,
		Image4URL: req.Image4URL,
		Image5URL: req.Image5URL,
		ReportID:  reportID,
	}
	if err := s.reportImageRepo.Create(&reportImages, tx); err != nil {
		tx.Rollback()
		return nil, errors.New("Gagal menyimpan gambar laporan")
	}
	if err := tx.Commit().Error; err != nil {
		tx.Rollback()
		return nil, errors.New("Gagal menyimpan perubahan")
	}

	reportResult := &dto.CreateReportResponse{
		Report:         reportStruct,
		ReportLocation: reportLocationStruct,
		ReportImages:   reportImages,
	}
	return reportResult, nil
}

func (s *ReportService) GetAllReport(userID uint) ([]dto.GetReportResponse, error) {
	reports, err := s.reportRepo.Get()
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("Laporan tidak ditemukan")
		}
		return nil, err
	}

	var fullReports []dto.GetReportResponse

	for _, report := range *reports {
		likeReactionCount, err := s.reportReactionRepo.GetLikeReactionCount(report.ID)
		if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("Gagal mendapatkan reaksi suka: %w", err)
		}
		dislikeReactionCount, err := s.reportReactionRepo.GetDislikeReactionCount(report.ID)
		if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("Gagal mendapatkan reaksi tidak suka: %w", err)
		}
		
		var isLikedByCurrentUser, isDislikedByCurrentUser bool

		fullReports = append(fullReports, dto.GetReportResponse{
			ID:                report.ID,
			ReportTitle:       report.ReportTitle,
			ReportType:        string(report.ReportType),
			ReportDescription: report.ReportDescription,
			ReportCreatedAt:   report.CreatedAt,
			UserID:            report.UserID,
			UserName:          report.User.Username,
			FullName:		   report.User.FullName,
			ProfilePicture:    report.User.Profile.ProfilePicture,
			Location: dto.ReportLocationResponse{
				DetailLocation: report.ReportLocation.DetailLocation,
				Latitude:       report.ReportLocation.Latitude,
				Longitude:      report.ReportLocation.Longitude,
				DisplayName:    report.ReportLocation.DisplayName,
				AddressType:    report.ReportLocation.AddressType,
				Country:        report.ReportLocation.Country,
				CountryCode:    report.ReportLocation.CountryCode,
				Region:         report.ReportLocation.Region,
				Road:		    report.ReportLocation.Road,
				PostCode:       report.ReportLocation.PostCode,
				County:         report.ReportLocation.County,
				State:          report.ReportLocation.State,
				Village:        report.ReportLocation.Village,
				Suburb:         report.ReportLocation.Suburb,
				Geometry: 	 	&report.ReportLocation.Geometry,
			},
			Images: dto.ReportImageResponse{
				Image1URL: report.ReportImages.Image1URL,
				Image2URL: report.ReportImages.Image2URL,
				Image3URL: report.ReportImages.Image3URL,
				Image4URL: report.ReportImages.Image4URL,
				Image5URL: report.ReportImages.Image5URL,
			},
			TotalLikeReactions: &likeReactionCount,
			TotalDislikeReactions: &dislikeReactionCount,
			TotalReactions:    likeReactionCount + dislikeReactionCount,
			ReportReactions: func() []dto.ReactReportResponse {
				var reactions []dto.ReactReportResponse
				for _, reaction := range *report.ReportReactions {
					reactions = append(reactions, dto.ReactReportResponse{
						ReportID:     reaction.ReportID,
						UserID:       reaction.UserID,
						ReactionType: string(reaction.Type),
						CreatedAt:    reaction.CreatedAt,
						UpdatedAt:    reaction.UpdatedAt,
					})
					if reaction.UserID == userID {
						if reaction.Type == model.Like {
							isLikedByCurrentUser = true
						}
						if reaction.Type == model.Dislike {
							isDislikedByCurrentUser = true
						}
					}
				}
				return reactions
			}(),
			IsLikedByCurrentUser:    isLikedByCurrentUser,
			IsDislikedByCurrentUser: isDislikedByCurrentUser,
		})
	}
	return fullReports, nil
}

func (s *ReportService) GetReportByID(reportID uint) (*dto.CreateReportResponse, error) {
	report, err := s.reportRepo.GetByID(reportID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("Laporan tidak ditemukan")
		}
		return nil, err
	}
	location, err := s.reportLocationRepo.GetByReportID(reportID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("Lokasi laporan tidak ditemukan")
		}
		return nil, err
	}
	images, err := s.reportImageRepo.GetByReportID(reportID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("Gambar laporan tidak ditemukan")
		}
		return nil, err
	}

	result := &dto.CreateReportResponse{
		Report:         *report,
		ReportLocation: *location,
		ReportImages:   *images,
	}
	return result, nil
}

func (s *ReportService) ReactToReport(db *gorm.DB, userID uint, reportID uint, reactionType string) (*dto.ReactReportResponse, error) {
	tx := db.Begin()
	if tx.Error != nil {
		return nil, errors.New("Gagal memulai transaksi")
	}
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()


	modelReactionType := model.ReactionType(reactionType)
	var resultReaction *model.ReportReaction

	existingReport, err := s.reportReactionRepo.GetByUserReportIDTX(tx, userID, reportID)
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		tx.Rollback()
		return nil, fmt.Errorf("Gagal mendapatkan reaksi laporan: %w", err)
	}

	switch {
	case existingReport == nil:
		newReaction := model.ReportReaction{
			UserID:   userID,
			ReportID: reportID,
			Type:     modelReactionType,
		}
		newReportreaction, err := s.reportReactionRepo.CreateTX(tx, &newReaction)
		if err != nil {
			tx.Rollback()
			return nil, fmt.Errorf("Gagal menambahkan reaksi: %w", err)
		}
		resultReaction = newReportreaction

	case existingReport.Type == modelReactionType:
		if err := s.reportReactionRepo.DeleteTX(tx, existingReport); err != nil {
			tx.Rollback()
			return nil, fmt.Errorf("Gagal menghapus reaksi: %w", err)
		}
		resultReaction = nil

	default:
		existingReport.Type = modelReactionType
		existingReport.UpdatedAt = time.Now().Unix()
		updatedReportReaction, err := s.reportReactionRepo.UpdateTX(tx, existingReport)
		if err != nil {
			tx.Rollback()
			return nil, fmt.Errorf("Gagal memperbarui reaksi: %w", err)
		}
		resultReaction = updatedReportReaction
	}

	if err := tx.Commit().Error; err != nil {
		tx.Rollback()
		return nil, fmt.Errorf("Gagal menyimpan perubahan: %w", err)
	}

	return &dto.ReactReportResponse{
		ReportID:     reportID,
		UserID:       userID,
		ReactionType: string(resultReaction.Type),
		CreatedAt:    resultReaction.CreatedAt,
		UpdatedAt:    resultReaction.UpdatedAt,
	}, nil
}

func (s *ReportService) UploadProgressReport(db *gorm.DB, userID, reportID uint, req dto.UploadProgressReportRequest) (*dto.UploadProgressReportResponse, error) {
	tx := db.Begin()
	if tx.Error != nil {
		return nil, fmt.Errorf("gagal memulai transaksi: %w", tx.Error)
	}
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	report, err := s.reportRepo.GetByID(reportID)
	if err != nil {
		tx.Rollback()
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("laporan tidak ditemukan")
		}
		return nil, fmt.Errorf("gagal mengambil laporan: %w", err)
	}

	if report.UserID != userID {
		tx.Rollback()
		return nil, errors.New("anda tidak memiliki izin untuk mengunggah progres pada laporan ini")
	}

	reportProgress := &model.ReportProgress{
		ReportID:  reportID,
		UserID:    userID,
		Status:    model.ReportStatus(req.Status),
		Notes:     req.Notes,
		CreatedAt: time.Now().Unix(),
		Attachment1: req.Attachment1,
		Attachment2: req.Attachment2,
	}

	newReport, err := s.reportProgressRepo.Create(reportProgress, tx)
	if err != nil {
		tx.Rollback()
		return nil, fmt.Errorf("gagal mengunggah progres laporan: %w", err)
	}

	if err := tx.Commit().Error; err != nil {
		tx.Rollback()
		return nil, fmt.Errorf("gagal menyimpan transaksi: %w", err)
	}

	return &dto.UploadProgressReportResponse{
		ReportID:    newReport.ReportID,
		Status:      string(newReport.Status),
		Notes:       &newReport.Notes,
		Attachment1: newReport.Attachment1,
		Attachment2: newReport.Attachment2,
		CreatedAt:   newReport.CreatedAt,
	}, nil
}

func (s *ReportService) GetProgressReports(reportID uint) ([]dto.GetProgressReportResponse, error) {
	reportProgresses, err := s.reportProgressRepo.GetByReportID(reportID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("progres laporan tidak ditemukan")
		}
		return nil, fmt.Errorf("gagal mengambil progres laporan: %w", err)
	}
	var response []dto.GetProgressReportResponse
	for _, progress := range reportProgresses {
		response = append(response, dto.GetProgressReportResponse{
			ReportID:    progress.ReportID,
			Status:      string(progress.Status),
			Notes:       &progress.Notes,
			Attachment1: progress.Attachment1,
			Attachment2: progress.Attachment2,
			CreatedAt:   progress.CreatedAt,
		})
	}
	return response, nil
}