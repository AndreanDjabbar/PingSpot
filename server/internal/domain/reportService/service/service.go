package service

import (
	"errors"
	"fmt"
	"server/internal/domain/model"
	"server/internal/domain/reportService/dto"
	reportRepository "server/internal/domain/reportService/repository"
	"server/internal/domain/reportService/util"
	tasksService"server/internal/domain/taskService/service"
	userRepository "server/internal/domain/userService/repository"
	"server/pkg/utils/env"
	mainutils "server/pkg/utils/mainUtils"
	"time"

	"gorm.io/gorm"
)

type ReportService struct {
	reportRepo         reportRepository.ReportRepository
	reportLocationRepo reportRepository.ReportLocationRepository
	reportImageRepo    reportRepository.ReportImageRepository
	reportReactionRepo reportRepository.ReportReactionRepository
	reportVoteRepo     reportRepository.ReportVoteRepository
	reportProgressRepo reportRepository.ReportProgressRepository
	tasksService      tasksService.TaskService
	userRepo           userRepository.UserRepository
	userProfileRepo    userRepository.UserProfileRepository
}

func NewreportService(reportRepo reportRepository.ReportRepository, locationRepo reportRepository.ReportLocationRepository, reportReaction reportRepository.ReportReactionRepository, imageRepo reportRepository.ReportImageRepository, userRepo userRepository.UserRepository, userProfileRepo userRepository.UserProfileRepository, reportProgressRepo reportRepository.ReportProgressRepository, reportVoteRepo reportRepository.ReportVoteRepository, tasksService tasksService.TaskService) *ReportService {
	return &ReportService{
		reportRepo:         reportRepo,
		reportLocationRepo: locationRepo,
		reportImageRepo:    imageRepo,
		userRepo:           userRepo,
		reportReactionRepo: reportReaction,
		reportProgressRepo: reportProgressRepo,
		userProfileRepo:    userProfileRepo,
		reportVoteRepo:     reportVoteRepo,
		tasksService:      tasksService,
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
		HasProgress:       req.HasProgress,
		ReportStatus: 		model.WAITING,
		ReportType:        model.ReportType(req.ReportType),
		ReportDescription: req.ReportDescription,
		CreatedAt:         time.Now().Unix(),
		UpdatedAt: 			time.Now().Unix(),	
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
		Geometry:       fmt.Sprintf("SRID=4326;POINT(%f %f)", req.Longitude, req.Latitude),
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

func (s *ReportService) EditReport(db *gorm.DB, userID, reportID uint, req dto.EditReportRequest) (*dto.EditReportResponse, error) {
	tx := db.Begin()
	if tx.Error != nil {
		return nil, errors.New("Gagal memulai transaksi")
	}
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	existingReport, err := s.reportRepo.GetByIDTX(tx, reportID)
	if err != nil {
		tx.Rollback()
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("Laporan tidak ditemukan")
		}
		return nil, fmt.Errorf("Gagal mengambil laporan: %w", err)
	}

	if existingReport.UserID != userID {
		tx.Rollback()
		return nil, errors.New("anda tidak memiliki izin untuk mengunggah progres pada laporan ini")
	}

	if existingReport.ReportStatus == model.RESOLVED {
		tx.Rollback()
		return nil, errors.New("laporan sudah selesai, tidak dapat menyunting laporan lagi")
	}

	existingReportLocation := existingReport.ReportLocation
	existingReportImages := existingReport.ReportImages

	switch existingReport.ReportStatus {
	case model.WAITING:
		existingReport.ReportTitle = req.ReportTitle
		existingReport.HasProgress = req.HasProgress
		existingReport.ReportType = model.ReportType(req.ReportType)
		existingReport.ReportDescription = req.ReportDescription

		existingReportLocation.Latitude = req.Latitude
		existingReportLocation.Geometry = fmt.Sprintf("SRID=4326;POINT(%f %f)", req.Longitude, req.Latitude)
		existingReportLocation.Longitude = req.Longitude
		existingReportLocation.DetailLocation = req.DetailLocation
		existingReportLocation.DisplayName = req.DisplayName
		existingReportLocation.AddressType = req.AddressType
		existingReportLocation.Country = req.Country
		existingReportLocation.CountryCode = req.CountryCode
		existingReportLocation.Region = req.Region
		existingReportLocation.Road = req.Road
		existingReportLocation.PostCode = req.PostCode
		existingReportLocation.County = req.County
		existingReportLocation.State = req.State
		existingReportLocation.Village = req.Village
		existingReportLocation.Suburb = req.Suburb

		existingReportImages.Image1URL = req.Image1URL
		existingReportImages.Image2URL = req.Image2URL
		existingReportImages.Image3URL = req.Image3URL
		existingReportImages.Image4URL = req.Image4URL
		existingReportImages.Image5URL = req.Image5URL

	case model.ON_PROGRESS, model.NOT_RESOLVED, model.POTENTIALLY_RESOLVED, model.EXPIRED:
		existingReport.ReportTitle = req.ReportTitle
		existingReport.ReportDescription = req.ReportDescription
		
		existingReportImages.Image1URL = req.Image1URL
		existingReportImages.Image2URL = req.Image2URL
		existingReportImages.Image3URL = req.Image3URL
		existingReportImages.Image4URL = req.Image4URL
		existingReportImages.Image5URL = req.Image5URL
	}

	existingReport.UpdatedAt = time.Now().Unix()

	if _, err := s.reportRepo.UpdateTX(tx, existingReport); err != nil {
		tx.Rollback()
		return nil, errors.New("Gagal memperbarui laporan")
	}

	if _,  err := s.reportLocationRepo.UpdateTX(tx, existingReportLocation); err != nil {
		tx.Rollback()
		return nil, errors.New("Gagal memperbarui lokasi laporan")
	}

	if _, err := s.reportImageRepo.UpdateTX(tx, existingReportImages); err != nil {
		tx.Rollback()
		return nil, errors.New("Gagal memperbarui gambar laporan")
	}

	if err := tx.Commit().Error; err != nil {
		tx.Rollback()
		return nil, errors.New("Gagal menyimpan perubahan")
	}

	reportResult := &dto.EditReportResponse{
		Report:         *existingReport,
		ReportLocation: *existingReportLocation,
		ReportImages:   *existingReportImages,
	}
	return reportResult, nil
}

func (s *ReportService) GetAllReport(userID, limit, cursorID uint, reportType, status, sortBy, hasProgress string, distance dto.Distance) (*dto.GetReportsResponse, error) {
	reports, err := s.reportRepo.GetPaginated(limit, cursorID, reportType, status, sortBy, hasProgress, distance)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("Laporan tidak ditemukan")
		}
		return nil, err
	}

	reportsCount, err := s.reportRepo.GetReportsCount()
	if err != nil {
		return nil, fmt.Errorf("Gagal mendapatkan total laporan: %w", err)
	}

	var fullReports []dto.Report

	for _, report := range *reports {
		likeReactionCount, err := s.reportReactionRepo.GetLikeReactionCount(report.ID)
		if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("Gagal mendapatkan reaksi suka: %w", err)
		}
		dislikeReactionCount, err := s.reportReactionRepo.GetDislikeReactionCount(report.ID)
		if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("Gagal mendapatkan reaksi tidak suka: %w", err)
		}

		var isLikedByCurrentUser, isDislikedByCurrentUser, isResolvedByCurrentUser, isOnProgressByCurrentUser, isNotResolvedByCurrentUser bool

		resolvedVoteCount, err := s.reportVoteRepo.GetResolvedVoteCount(report.ID)
		if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("Gagal mendapatkan suara 'RESOLVED': %w", err)
		}

		onProgressVoteCount, err := s.reportVoteRepo.GetOnProgressVoteCount(report.ID)
		if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("Gagal mendapatkan suara 'ON_PROGRESS': %w", err)
		}

		notResolvedVoteCount, err := s.reportVoteRepo.GetNotResolvedVoteCount(report.ID)
		if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("Gagal mendapatkan suara 'NOT_RESOLVED': %w", err)
		}

		fullReports = append(fullReports, dto.Report{
			ID:                report.ID,
			ReportTitle:       report.ReportTitle,
			ReportType:        string(report.ReportType),
			ReportDescription: report.ReportDescription,
			ReportCreatedAt:   report.CreatedAt,
			UserID:            report.UserID,
			UserName:          report.User.Username,
			FullName:          report.User.FullName,
			ProfilePicture:    report.User.Profile.ProfilePicture,
			Location: dto.ReportLocation{
				DetailLocation: report.ReportLocation.DetailLocation,
				Latitude:       report.ReportLocation.Latitude,
				Longitude:      report.ReportLocation.Longitude,
				DisplayName:    report.ReportLocation.DisplayName,
				AddressType:    report.ReportLocation.AddressType,
				Country:        report.ReportLocation.Country,
				CountryCode:    report.ReportLocation.CountryCode,
				Region:         report.ReportLocation.Region,
				Road:           report.ReportLocation.Road,
				PostCode:       report.ReportLocation.PostCode,
				County:         report.ReportLocation.County,
				State:          report.ReportLocation.State,
				Village:        report.ReportLocation.Village,
				Suburb:         report.ReportLocation.Suburb,
				Geometry:       &report.ReportLocation.Geometry,
			},
			ReportStatus: string(report.ReportStatus),
			HasProgress:  report.HasProgress,
			Images: dto.ReportImage{
				Image1URL: report.ReportImages.Image1URL,
				Image2URL: report.ReportImages.Image2URL,
				Image3URL: report.ReportImages.Image3URL,
				Image4URL: report.ReportImages.Image4URL,
				Image5URL: report.ReportImages.Image5URL,
			},
			TotalLikeReactions:    &likeReactionCount,
			TotalDislikeReactions: &dislikeReactionCount,
			TotalReactions:        likeReactionCount + dislikeReactionCount,
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
			ReportProgress: func() []dto.GetProgressReportResponse {
				var progresses []dto.GetProgressReportResponse
				if report.ReportProgress != nil {
					for _, progress := range *report.ReportProgress {
						progresses = append(progresses, dto.GetProgressReportResponse{
							ReportID:    progress.ReportID,
							Status:      string(progress.Status),
							Notes:       &progress.Notes,
							Attachment1: progress.Attachment1,
							Attachment2: progress.Attachment2,
							CreatedAt:   progress.CreatedAt,
						})
					}
				}
				return progresses
			}(),
			IsLikedByCurrentUser:    isLikedByCurrentUser,
			IsDislikedByCurrentUser: isDislikedByCurrentUser,
			TotalResolvedVotes:      &resolvedVoteCount,
			TotalOnProgressVotes:    &onProgressVoteCount,
			TotalNotResolvedVotes:   &notResolvedVoteCount,
			TotalVotes:              resolvedVoteCount + notResolvedVoteCount + onProgressVoteCount,
			ReportVotes: func() []dto.GetVoteReportResponse {
				var votes []dto.GetVoteReportResponse
				for _, vote := range *report.ReportVotes {
					votes = append(votes, dto.GetVoteReportResponse{
						ID:        vote.ID,
						ReportID:  vote.ReportID,
						UserID:    vote.UserID,
						VoteType:  vote.VoteType,
						CreatedAt: vote.CreatedAt,
						UpdatedAt: vote.UpdatedAt,
					})
					if vote.UserID == userID {
						if vote.VoteType == model.RESOLVED {
							isResolvedByCurrentUser = true
						}
						if vote.VoteType == model.NOT_RESOLVED {
							isNotResolvedByCurrentUser = true
						}
						if vote.VoteType == model.ON_PROGRESS {
							isOnProgressByCurrentUser = true
						}
					}
				}
				return votes
			}(),
			IsResolvedByCurrentUser:    isResolvedByCurrentUser,
			IsNotResolvedByCurrentUser: isNotResolvedByCurrentUser,
			IsOnProgressByCurrentUser:  isOnProgressByCurrentUser,
			MajorityVote:               util.GetMajorityVote(resolvedVoteCount, onProgressVoteCount, notResolvedVoteCount),
			LastUpdatedBy: (*string)(&report.LastUpdatedBy),
			LastUpdatedProgressAt: report.LastUpdatedProgressAt,
			ReportUpdatedAt: report.UpdatedAt,
		})
	}
	reportsData := dto.GetReportsResponse{
		Reports:     fullReports,
		TotalCounts: reportsCount,
	}
	return &reportsData, nil
}

func (s *ReportService) GetReportByID(userID, reportID uint) (*dto.GetReportResponse, error) {
	report, err := s.reportRepo.GetByID(reportID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("Laporan tidak ditemukan")
		}
		return nil, err
	}
	var isLikedByCurrentUser, isDislikedByCurrentUser, isResolvedByCurrentUser, isOnProgressByCurrentUser, isNotResolvedByCurrentUser bool
	likeReactionCount, err := s.reportReactionRepo.GetLikeReactionCount(report.ID)
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, fmt.Errorf("Gagal mendapatkan reaksi suka: %w", err)
	}
	dislikeReactionCount, err := s.reportReactionRepo.GetDislikeReactionCount(report.ID)
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, fmt.Errorf("Gagal mendapatkan reaksi tidak suka: %w", err)
	}
	resolvedVoteCount, err := s.reportVoteRepo.GetResolvedVoteCount(report.ID)
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, fmt.Errorf("Gagal mendapatkan suara 'RESOLVED': %w", err)
	}
	notResolvedVoteCount, err := s.reportVoteRepo.GetNotResolvedVoteCount(report.ID)
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, fmt.Errorf("Gagal mendapatkan suara 'NOT_RESOLVED': %w", err)
	}
	onProgressVoteCount, err := s.reportVoteRepo.GetOnProgressVoteCount(report.ID)
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, fmt.Errorf("Gagal mendapatkan suara 'ON_PROGRESS': %w", err)
	}
	fullReport := dto.Report{
		ID:                report.ID,
		ReportTitle:       report.ReportTitle,
		ReportType:        string(report.ReportType),
		ReportDescription: report.ReportDescription,
		ReportCreatedAt:   report.CreatedAt,
		UserID:            report.UserID,
		UserName:          report.User.Username,
		FullName:          report.User.FullName,
		ProfilePicture:    report.User.Profile.ProfilePicture,
		Location: dto.ReportLocation{
			DetailLocation: report.ReportLocation.DetailLocation,
			Latitude:       report.ReportLocation.Latitude,
			Longitude:      report.ReportLocation.Longitude,
			DisplayName:    report.ReportLocation.DisplayName,
			AddressType:    report.ReportLocation.AddressType,
			Country:        report.ReportLocation.Country,
			CountryCode:    report.ReportLocation.CountryCode,
			Region:         report.ReportLocation.Region,
			Road:           report.ReportLocation.Road,
			PostCode:       report.ReportLocation.PostCode,
			County:         report.ReportLocation.County,
			State:          report.ReportLocation.State,
			Village:        report.ReportLocation.Village,
			Suburb:         report.ReportLocation.Suburb,
			Geometry:       &report.ReportLocation.Geometry,
		},
		ReportStatus: string(report.ReportStatus),
		HasProgress:  report.HasProgress,
		Images: dto.ReportImage{
			Image1URL: report.ReportImages.Image1URL,
			Image2URL: report.ReportImages.Image2URL,
			Image3URL: report.ReportImages.Image3URL,
			Image4URL: report.ReportImages.Image4URL,
			Image5URL: report.ReportImages.Image5URL,
		},
		TotalLikeReactions:    &likeReactionCount,
		TotalDislikeReactions: &dislikeReactionCount,
		TotalReactions:        likeReactionCount + dislikeReactionCount,
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
				if reaction.UserID == report.UserID {
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
		ReportProgress: func() []dto.GetProgressReportResponse {
			var progresses []dto.GetProgressReportResponse
			if report.ReportProgress != nil {
				for _, progress := range *report.ReportProgress {
					progresses = append(progresses, dto.GetProgressReportResponse{
						ReportID:    progress.ReportID,
						Status:      string(progress.Status),
						Notes:       &progress.Notes,
						Attachment1: progress.Attachment1,
						Attachment2: progress.Attachment2,
						CreatedAt:   progress.CreatedAt,
					})
				}
			}
			return progresses
		}(),
		TotalResolvedVotes:    &resolvedVoteCount,
		TotalOnProgressVotes:  &onProgressVoteCount,
		TotalNotResolvedVotes: &notResolvedVoteCount,
		TotalVotes:            resolvedVoteCount + notResolvedVoteCount + onProgressVoteCount,
		ReportVotes: func() []dto.GetVoteReportResponse {
			var votes []dto.GetVoteReportResponse
			for _, vote := range *report.ReportVotes {
				votes = append(votes, dto.GetVoteReportResponse{
					ID:        vote.ID,
					ReportID:  vote.ReportID,
					UserID:    vote.UserID,
					VoteType:  vote.VoteType,
					CreatedAt: vote.CreatedAt,
					UpdatedAt: vote.UpdatedAt,
				})
				if vote.UserID == userID {
					if vote.VoteType == model.RESOLVED {
						isResolvedByCurrentUser = true
					}
					if vote.VoteType == model.NOT_RESOLVED {
						isNotResolvedByCurrentUser = true
					}
					if vote.VoteType == model.ON_PROGRESS {
						isOnProgressByCurrentUser = true
					}
				}
			}
			return votes
		}(),
		IsLikedByCurrentUser:       isLikedByCurrentUser,
		IsDislikedByCurrentUser:    isDislikedByCurrentUser,
		IsResolvedByCurrentUser:    isResolvedByCurrentUser,
		IsNotResolvedByCurrentUser: isNotResolvedByCurrentUser,
		IsOnProgressByCurrentUser:  isOnProgressByCurrentUser,
		MajorityVote:               util.GetMajorityVote(resolvedVoteCount, onProgressVoteCount, notResolvedVoteCount),
		LastUpdatedBy: (*string)(&report.LastUpdatedBy),
		LastUpdatedProgressAt: report.LastUpdatedProgressAt,
		ReportUpdatedAt: report.UpdatedAt,
	}
	result := dto.GetReportResponse{
		Report: fullReport,
	}
	return &result, nil
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

func (s *ReportService) VoteToReport(db *gorm.DB, userID uint, reportID uint, voteType string) (*dto.GetVoteReportResponse, error) {
	tx := db.Begin()
	if tx.Error != nil {
		return nil, errors.New("Gagal memulai transaksi")
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
			return nil, errors.New("Laporan tidak ditemukan")
		}
		return nil, fmt.Errorf("Gagal mengambil laporan: %w", err)
	}

	if report.UserID == userID {
		tx.Rollback()
		return nil, errors.New("Anda tidak dapat memberikan suara pada laporan Anda sendiri")
	}

	if report.ReportStatus == model.RESOLVED {
		tx.Rollback()
		return nil, errors.New("Anda tidak dapat memberikan suara pada laporan yang sudah diselesaikan")
	}

	if report.ReportStatus == model.EXPIRED {
		tx.Rollback()
		return nil, errors.New("Anda tidak dapat memberikan suara pada laporan yang sudah kedaluwarsa")
	}

	if report.HasProgress == nil || !*report.HasProgress {
		tx.Rollback()
		return nil, errors.New("Anda tidak dapat memberikan suara pada laporan tanpa progres (informasi saja)")
	}

	modelVoteType := model.ReportStatus(voteType)
	var resultVote *model.ReportVote

	existingVote, err := s.reportVoteRepo.GetByUserReportIDTX(tx, userID, reportID)
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		tx.Rollback()
		return nil, fmt.Errorf("Gagal mendapatkan suara laporan: %w", err)
	}
	switch {
	case existingVote == nil:
		newVote := model.ReportVote{
			UserID:    userID,
			ReportID:  reportID,
			VoteType:  modelVoteType,
			CreatedAt: time.Now().Unix(),
			UpdatedAt: time.Now().Unix(),
		}
		newReportVote, err := s.reportVoteRepo.CreateTX(tx, &newVote)
		if err != nil {
			tx.Rollback()
			return nil, fmt.Errorf("Gagal menambahkan suara: %w", err)
		}
		resultVote = newReportVote

	case existingVote.VoteType == modelVoteType:
		if err := s.reportVoteRepo.DeleteTX(tx, existingVote); err != nil {
			tx.Rollback()
			return nil, fmt.Errorf("Gagal menghapus suara: %w", err)
		}
		resultVote = nil
	default:
		existingVote.VoteType = modelVoteType
		existingVote.UpdatedAt = time.Now().Unix()
		updatedReportVote, err := s.reportVoteRepo.UpdateTX(tx, existingVote)
		if err != nil {
			tx.Rollback()
			return nil, fmt.Errorf("Gagal memperbarui suara: %w", err)
		}
		resultVote = updatedReportVote
	}
	
	reportVoteCounts, err := s.reportVoteRepo.GetReportVoteCountsTX(tx, reportID)
	if err != nil {
		tx.Rollback()
		return nil, fmt.Errorf("Gagal mendapatkan jumlah suara laporan: %w", err)
	}

	voteTypeCountsOrder := util.GetVoteTypeOrder(reportVoteCounts)

	totalVote, err := s.reportVoteRepo.GetTotalVoteCountTX(tx, reportID)
	if err != nil {
		tx.Rollback()
		return nil, fmt.Errorf("Gagal mendapatkan total suara laporan: %w", err)
	}
	topVote := voteTypeCountsOrder[0]
	secondVote := voteTypeCountsOrder[1]

	marginVote := float64(topVote.Count - secondVote.Count) / float64(totalVote) * 100

	limitTopVote := 2
	if marginVote >= 20.0 && topVote.Count >= limitTopVote {
		if topVote.Type == model.RESOLVED && report.ReportStatus != model.POTENTIALLY_RESOLVED {
			report.ReportStatus = model.POTENTIALLY_RESOLVED
			report.LastUpdatedBy = model.System
			report.LastUpdatedProgressAt = mainutils.Int64PtrOrNil(time.Now().Unix())
			report.PotentiallyResolvedAt = mainutils.Int64PtrOrNil(time.Now().Unix())
			reportLink := fmt.Sprintf("%s/main/reports/%d", env.ClientURL(), report.ID)
			go util.SendPotentiallyResolvedReportEmail(
				report.User.Email,
				report.User.Username,
				report.ReportTitle,
				reportLink,
				7,
			)
			if err := s.tasksService.AutoResolveReportTask(reportID); err != nil {
				tx.Rollback()
				return nil, fmt.Errorf("Gagal membuat tugas penyelesaian otomatis: %w", err)
			}
		} else if topVote.Type == model.ON_PROGRESS && report.ReportStatus != model.ON_PROGRESS {
			report.ReportStatus = model.ON_PROGRESS
			report.LastUpdatedBy = model.System
			report.LastUpdatedProgressAt = mainutils.Int64PtrOrNil(time.Now().Unix())
		} else if topVote.Type == model.NOT_RESOLVED && report.ReportStatus != model.NOT_RESOLVED {
			report.ReportStatus = model.NOT_RESOLVED
			report.LastUpdatedBy = model.System
			report.LastUpdatedProgressAt = mainutils.Int64PtrOrNil(time.Now().Unix())
		}
	}

	if _, err := s.reportRepo.UpdateTX(tx, report); err != nil {
		tx.Rollback()
		return nil, fmt.Errorf("Gagal memperbarui status laporan: %w", err)
	}

	if err := tx.Commit().Error; err != nil {
		tx.Rollback()
		return nil, fmt.Errorf("Gagal menyimpan perubahan: %w", err)
	}

	return &dto.GetVoteReportResponse{
		ID:        resultVote.ID,
		ReportID:  reportID,
		ReportStatus: report.ReportStatus,
		UserID:    userID,
		VoteType:  resultVote.VoteType,
		CreatedAt: resultVote.CreatedAt,
		UpdatedAt: resultVote.UpdatedAt,
		LastUpdatedBy: (*string)(&report.LastUpdatedBy),
		LastUpdatedProgressAt: report.LastUpdatedProgressAt,
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

	defer func() {
		if tx.Error != nil {
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

	if report.HasProgress == nil || !*report.HasProgress {
		tx.Rollback()
		return nil, errors.New("laporan ini tidak memerlukan progres (informasi saja)")
	}

	if report.ReportStatus == model.RESOLVED {
		tx.Rollback()
		return nil, errors.New("laporan sudah selesai, tidak dapat mengunggah progres lagi")
	}

	if req.Status == string(model.RESOLVED) {
		report.ReportStatus = model.RESOLVED
		if _, err := s.reportRepo.UpdateTX(tx, report); err != nil {
			tx.Rollback()
			return nil, fmt.Errorf("gagal memperbarui status laporan: %w", err)
		}
	}

	reportProgress := &model.ReportProgress{
		ReportID:    reportID,
		UserID:      userID,
		Status:      model.ReportStatus(req.Status),
		Notes:       req.Notes,
		Attachment1: req.Attachment1,
		Attachment2: req.Attachment2,
		CreatedAt:   time.Now().Unix(),
	}

	newProgress, err := s.reportProgressRepo.Create(reportProgress, tx)
	if err != nil {
		tx.Rollback()
		return nil, fmt.Errorf("gagal mengunggah progres laporan: %w", err)
	}

	report.ReportStatus = model.ReportStatus(req.Status)
	report.AdminOverride = mainutils.BoolPtrOrNil(true)
	report.LastUpdatedBy = model.Owner
	report.LastUpdatedProgressAt = mainutils.Int64PtrOrNil(time.Now().Unix())
	if _, err := s.reportRepo.UpdateTX(tx, report); err != nil {
		tx.Rollback()
		return nil, fmt.Errorf("gagal memperbarui status laporan: %w", err)
	}

	response := &dto.UploadProgressReportResponse{
		ReportID:    newProgress.ReportID,
		Status:      string(newProgress.Status),
		Notes:       &newProgress.Notes,
		Attachment1: newProgress.Attachment1,
		Attachment2: newProgress.Attachment2,
		CreatedAt:   newProgress.CreatedAt,
		LastUpdatedProgressAt: report.LastUpdatedProgressAt,
	}

	if err := tx.Commit().Error; err != nil {
		tx.Rollback()
		return nil, fmt.Errorf("gagal menyimpan transaksi: %w", err)
	}

	return response, nil
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
