package service

import (
	"context"
	"errors"
	"fmt"
	"server/internal/domain/model"
	"server/internal/domain/reportService/dto"
	reportRepository "server/internal/domain/reportService/repository"
	"server/internal/domain/reportService/util"
	tasksService "server/internal/domain/taskService/service"
	userRepository "server/internal/domain/userService/repository"
	apperror "server/pkg/appError"
	"server/pkg/utils/env"
	mainutils "server/pkg/utils/mainUtils"
	"time"

	"go.mongodb.org/mongo-driver/v2/mongo"
	"gorm.io/gorm"
)

type ReportService struct {
	reportRepo         reportRepository.ReportRepository
	reportLocationRepo reportRepository.ReportLocationRepository
	reportImageRepo    reportRepository.ReportImageRepository
	reportReactionRepo reportRepository.ReportReactionRepository
	reportVoteRepo     reportRepository.ReportVoteRepository
	reportProgressRepo reportRepository.ReportProgressRepository
	tasksService       tasksService.TaskService
	userRepo           userRepository.UserRepository
	userProfileRepo    userRepository.UserProfileRepository
	reportCommentRepo  reportRepository.ReportCommentRepository
}

func NewreportService(
	reportRepo reportRepository.ReportRepository,
	locationRepo reportRepository.ReportLocationRepository,
	reportReaction reportRepository.ReportReactionRepository,
	imageRepo reportRepository.ReportImageRepository,
	userRepo userRepository.UserRepository,
	userProfileRepo userRepository.UserProfileRepository,
	reportProgressRepo reportRepository.ReportProgressRepository,
	reportVoteRepo reportRepository.ReportVoteRepository,
	tasksService tasksService.TaskService,
	reportCommentRepo reportRepository.ReportCommentRepository,
) *ReportService {
	return &ReportService{
		reportRepo:         reportRepo,
		reportLocationRepo: locationRepo,
		reportImageRepo:    imageRepo,
		userRepo:           userRepo,
		reportReactionRepo: reportReaction,
		reportProgressRepo: reportProgressRepo,
		userProfileRepo:    userProfileRepo,
		reportVoteRepo:     reportVoteRepo,
		tasksService:       tasksService,
		reportCommentRepo:  reportCommentRepo,
	}
}

func (s *ReportService) CreateReport(db *gorm.DB, userID uint, req dto.CreateReportRequest) (*dto.CreateReportResponse, error) {
	tx := db.Begin()
	if tx.Error != nil {
		return nil, apperror.New(500, "TRANSACTION_START_FAILED", "Gagal memulai transaksi")
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
		ReportStatus:      model.WAITING,
		ReportType:        model.ReportType(req.ReportType),
		ReportDescription: req.ReportDescription,
		CreatedAt:         time.Now().Unix(),
		UpdatedAt:         time.Now().Unix(),
	}
	if err := s.reportRepo.Create(&reportStruct, tx); err != nil {
		tx.Rollback()
		return nil, apperror.New(500, "REPORT_CREATE_FAILED", "Gagal membuat laporan")
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
		MapZoom: 		req.MapZoom,	
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
		return nil, apperror.New(500, "REPORT_LOCATION_CREATE_FAILED", "Gagal menyimpan lokasi laporan")
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
		return nil, apperror.New(500, "REPORT_IMAGE_CREATE_FAILED", "Gagal menyimpan gambar laporan")
	}
	if err := tx.Commit().Error; err != nil {
		tx.Rollback()
		return nil, apperror.New(500, "TRANSACTION_COMMIT_FAILED", "Gagal menyimpan perubahan")
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
		return nil, apperror.New(500, "TRANSACTION_START_FAILED", "Gagal memulai transaksi")
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
			return nil, apperror.New(404, "REPORT_NOT_FOUND", "Laporan tidak ditemukan")
		}
		return nil, apperror.New(500, "REPORT_FETCH_FAILED", "Gagal mengambil laporan")
	}

	if existingReport.UserID != userID {
		tx.Rollback()
		return nil, apperror.New(403, "FORBIDDEN", "anda tidak memiliki izin untuk mengunggah progres pada laporan ini")
	}

	if existingReport.ReportStatus == model.RESOLVED {
		tx.Rollback()
		return nil, apperror.New(400, "REPORT_ALREADY_RESOLVED", "laporan sudah selesai, tidak dapat menyunting laporan lagi")
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
		existingReportLocation.MapZoom = req.MapZoom

		existingReportImages.Image1URL = req.Image1URL
		existingReportImages.Image2URL = req.Image2URL
		existingReportImages.Image3URL = req.Image3URL
		existingReportImages.Image4URL = req.Image4URL
		existingReportImages.Image5URL = req.Image5URL

	case model.ON_PROGRESS, model.NOT_RESOLVED, model.POTENTIALLY_RESOLVED, model.EXPIRED:
		existingReport.ReportDescription = req.ReportDescription
		
		existingReportLocation.MapZoom = req.MapZoom
		existingReportImages.Image1URL = req.Image1URL
		existingReportImages.Image2URL = req.Image2URL
		existingReportImages.Image3URL = req.Image3URL
		existingReportImages.Image4URL = req.Image4URL
		existingReportImages.Image5URL = req.Image5URL
	}

	existingReport.UpdatedAt = time.Now().Unix()

	if _, err := s.reportRepo.UpdateTX(tx, existingReport); err != nil {
		tx.Rollback()
		return nil, apperror.New(500, "REPORT_UPDATE_FAILED", "Gagal memperbarui laporan")
	}

	if _, err := s.reportLocationRepo.UpdateTX(tx, existingReportLocation); err != nil {
		tx.Rollback()
		return nil, apperror.New(500, "REPORT_LOCATION_UPDATE_FAILED", "Gagal memperbarui lokasi laporan")
	}

	if _, err := s.reportImageRepo.UpdateTX(tx, existingReportImages); err != nil {
		tx.Rollback()
		return nil, apperror.New(500, "REPORT_IMAGE_UPDATE_FAILED", "Gagal memperbarui gambar laporan")
	}

	if err := tx.Commit().Error; err != nil {
		tx.Rollback()
		return nil, apperror.New(500, "TRANSACTION_COMMIT_FAILED", "Gagal menyimpan perubahan")
	}

	reportResult := &dto.EditReportResponse{
		Report:         *existingReport,
		ReportLocation: *existingReportLocation,
		ReportImages:   *existingReportImages,
	}
	return reportResult, nil
}

func (s *ReportService) DeleteReport(db *gorm.DB, userID, reportID uint, deleteType string) error {
	tx := db.Begin()
	if tx.Error != nil {
		return apperror.New(500, "TRANSACTION_START_FAILED", "Gagal memulai transaksi")
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
			return apperror.New(404, "REPORT_NOT_FOUND", "Laporan tidak ditemukan")
		}
		return apperror.New(500, "REPORT_FETCH_FAILED", "Gagal mengambil laporan")
	}
	if existingReport.UserID != userID {
		tx.Rollback()
		return apperror.New(403, "FORBIDDEN", "anda tidak memiliki izin untuk menghapus laporan ini")
	}

	currentTime := time.Now().Unix()
	switch deleteType {
	case "soft":
		isDeleted := true
		existingReport.IsDeleted = &isDeleted
		existingReport.DeletedAt = &currentTime
		if _, err := s.reportRepo.UpdateTX(tx, existingReport); err != nil {
			tx.Rollback()
			return apperror.New(500, "REPORT_DELETE_FAILED", "Gagal menghapus laporan")
		}
	case "hard":
		if _, err := s.reportRepo.DeleteTX(tx, existingReport); err != nil {
			tx.Rollback()
			return apperror.New(500, "REPORT_DELETE_FAILED", "Gagal menghapus laporan")
		}
	}
	if err := tx.Commit().Error; err != nil {
		tx.Rollback()
		return apperror.New(500, "TRANSACTION_COMMIT_FAILED", "Gagal menyimpan perubahan")
	}
	return nil
}

func (s *ReportService) GetAllReport(userID, cursorID uint, reportType, status, sortBy, hasProgress string, distance dto.Distance) (*dto.GetReportsResponse, error) {
	isDeleted := false
	limit := 5

	reports, err := s.reportRepo.GetByIsDeletedPaginated(uint(limit), cursorID, reportType, status, sortBy, hasProgress, distance, isDeleted)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, apperror.New(404, "REPORT_NOT_FOUND", "Laporan tidak ditemukan")
		}
		return nil, apperror.New(500, "REPORT_FETCH_FAILED", "Gagal mengambil laporan")
	}

	reportsCount, err := s.reportRepo.GetReportsCount()
	if err != nil {
		return nil, apperror.New(500, "REPORT_COUNT_FAILED", "Gagal mendapatkan total laporan")
	}

	var fullReports []dto.Report

	for _, report := range *reports {
		likeReactionCount, err := s.reportReactionRepo.GetLikeReactionCount(report.ID)
		if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, apperror.New(500, "REACTION_COUNT_FAILED", "Gagal mendapatkan reaksi suka")
		}
		dislikeReactionCount, err := s.reportReactionRepo.GetDislikeReactionCount(report.ID)
		if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, apperror.New(500, "REACTION_COUNT_FAILED", "Gagal mendapatkan reaksi tidak suka")
		}

		var isLikedByCurrentUser, isDislikedByCurrentUser, isResolvedByCurrentUser, isOnProgressByCurrentUser, isNotResolvedByCurrentUser bool

		resolvedVoteCount, err := s.reportVoteRepo.GetResolvedVoteCount(report.ID)
		if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, apperror.New(500, "VOTE_COUNT_FAILED", "Gagal mendapatkan suara 'RESOLVED'")
		}

		onProgressVoteCount, err := s.reportVoteRepo.GetOnProgressVoteCount(report.ID)
		if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, apperror.New(500, "VOTE_COUNT_FAILED", "Gagal mendapatkan suara 'ON_PROGRESS'")
		}

		notResolvedVoteCount, err := s.reportVoteRepo.GetNotResolvedVoteCount(report.ID)
		if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, apperror.New(500, "VOTE_COUNT_FAILED", "Gagal mendapatkan suara 'NOT_RESOLVED'")
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
				MapZoom:  		report.ReportLocation.MapZoom,
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
			LastUpdatedBy:              (*string)(&report.LastUpdatedBy),
			LastUpdatedProgressAt:      report.LastUpdatedProgressAt,
			ReportUpdatedAt:            report.UpdatedAt,
		})
	}
	reportsData := dto.GetReportsResponse{
		Reports:     fullReports,
		TotalCounts: reportsCount,
	}
	return &reportsData, nil
}

func (s *ReportService) GetReportByID(userID, reportID uint) (*dto.GetReportResponse, error) {
	isDeleted := false
	report, err := s.reportRepo.GetByIDIsDeleted(reportID, isDeleted)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, apperror.New(404, "REPORT_NOT_FOUND", "Laporan tidak ditemukan")
		}
		return nil, apperror.New(500, "REPORT_FETCH_FAILED", "Gagal mengambil laporan")
	}
	var isLikedByCurrentUser, isDislikedByCurrentUser, isResolvedByCurrentUser, isOnProgressByCurrentUser, isNotResolvedByCurrentUser bool
	likeReactionCount, err := s.reportReactionRepo.GetLikeReactionCount(report.ID)
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, apperror.New(500, "REACTION_COUNT_FAILED", "Gagal mendapatkan reaksi suka")
	}
	dislikeReactionCount, err := s.reportReactionRepo.GetDislikeReactionCount(report.ID)
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, apperror.New(500, "REACTION_COUNT_FAILED", "Gagal mendapatkan reaksi tidak suka")
	}
	resolvedVoteCount, err := s.reportVoteRepo.GetResolvedVoteCount(report.ID)
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, apperror.New(500, "VOTE_COUNT_FAILED", "Gagal mendapatkan suara 'RESOLVED'")
	}
	notResolvedVoteCount, err := s.reportVoteRepo.GetNotResolvedVoteCount(report.ID)
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, apperror.New(500, "VOTE_COUNT_FAILED", "Gagal mendapatkan suara 'NOT_RESOLVED'")
	}
	onProgressVoteCount, err := s.reportVoteRepo.GetOnProgressVoteCount(report.ID)
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, apperror.New(500, "VOTE_COUNT_FAILED", "Gagal mendapatkan suara 'ON_PROGRESS'")
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
		LastUpdatedBy:              (*string)(&report.LastUpdatedBy),
		LastUpdatedProgressAt:      report.LastUpdatedProgressAt,
		ReportUpdatedAt:            report.UpdatedAt,
	}
	result := dto.GetReportResponse{
		Report: fullReport,
	}
	return &result, nil
}

func (s *ReportService) ReactToReport(db *gorm.DB, userID uint, reportID uint, reactionType string) (*dto.ReactReportResponse, error) {
	tx := db.Begin()
	if tx.Error != nil {
		return nil, apperror.New(500, "TRANSACTION_START_FAILED", "Gagal memulai transaksi")
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
		return nil, apperror.New(500, "REACTION_FETCH_FAILED", "Gagal mendapatkan reaksi laporan")
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
			return nil, apperror.New(500, "REACTION_CREATE_FAILED", "Gagal menambahkan reaksi")
		}
		resultReaction = newReportreaction

	case existingReport.Type == modelReactionType:
		if err := s.reportReactionRepo.DeleteTX(tx, existingReport); err != nil {
			tx.Rollback()
			return nil, apperror.New(500, "REACTION_DELETE_FAILED", "Gagal menghapus reaksi")
		}
		resultReaction = nil

	default:
		existingReport.Type = modelReactionType
		existingReport.UpdatedAt = time.Now().Unix()
		updatedReportReaction, err := s.reportReactionRepo.UpdateTX(tx, existingReport)
		if err != nil {
			tx.Rollback()
			return nil, apperror.New(500, "REACTION_UPDATE_FAILED", "Gagal memperbarui reaksi")
		}
		resultReaction = updatedReportReaction
	}

	if err := tx.Commit().Error; err != nil {
		tx.Rollback()
		return nil, apperror.New(500, "TRANSACTION_COMMIT_FAILED", "Gagal menyimpan perubahan")
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
		return nil, apperror.New(500, "TRANSACTION_START_FAILED", "Gagal memulai transaksi")
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
			return nil, apperror.New(404, "REPORT_NOT_FOUND", "Laporan tidak ditemukan")
		}
		return nil, apperror.New(500, "REPORT_FETCH_FAILED", "Gagal mengambil laporan")
	}

	if report.UserID == userID {
		tx.Rollback()
		return nil, apperror.New(400, "CANNOT_VOTE_OWN_REPORT", "Anda tidak dapat memberikan suara pada laporan Anda sendiri")
	}

	if report.ReportStatus == model.RESOLVED {
		tx.Rollback()
		return nil, apperror.New(400, "REPORT_ALREADY_RESOLVED", "Anda tidak dapat memberikan suara pada laporan yang sudah diselesaikan")
	}

	if report.ReportStatus == model.EXPIRED {
		tx.Rollback()
		return nil, apperror.New(400, "REPORT_EXPIRED", "Anda tidak dapat memberikan suara pada laporan yang sudah kedaluwarsa")
	}

	if report.HasProgress == nil || !*report.HasProgress {
		tx.Rollback()
		return nil, apperror.New(400, "REPORT_NO_PROGRESS", "Anda tidak dapat memberikan suara pada laporan tanpa progres (informasi saja)")
	}

	modelVoteType := model.ReportStatus(voteType)
	var resultVote *model.ReportVote

	existingVote, err := s.reportVoteRepo.GetByUserReportIDTX(tx, userID, reportID)
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		tx.Rollback()
		return nil, apperror.New(500, "VOTE_FETCH_FAILED", "Gagal mendapatkan suara laporan")
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
			return nil, apperror.New(500, "VOTE_CREATE_FAILED", "Gagal menambahkan suara")
		}
		resultVote = newReportVote

	case existingVote.VoteType == modelVoteType:
		if err := s.reportVoteRepo.DeleteTX(tx, existingVote); err != nil {
			tx.Rollback()
			return nil, apperror.New(500, "VOTE_DELETE_FAILED", "Gagal menghapus suara")
		}
		resultVote = nil
	default:
		existingVote.VoteType = modelVoteType
		existingVote.UpdatedAt = time.Now().Unix()
		updatedReportVote, err := s.reportVoteRepo.UpdateTX(tx, existingVote)
		if err != nil {
			tx.Rollback()
			return nil, apperror.New(500, "VOTE_UPDATE_FAILED", "Gagal memperbarui suara")
		}
		resultVote = updatedReportVote
	}

	if resultVote != nil {
		reportVoteCounts, err := s.reportVoteRepo.GetReportVoteCountsTX(tx, reportID)
		if err != nil {
			tx.Rollback()
			return nil, apperror.New(500, "VOTE_COUNT_FAILED", "Gagal mendapatkan jumlah suara laporan")
		}

		voteTypeCountsOrder := util.GetVoteTypeOrder(reportVoteCounts)

		totalVote, err := s.reportVoteRepo.GetTotalVoteCountTX(tx, reportID)
		if err != nil {
			tx.Rollback()
			return nil, apperror.New(500, "VOTE_COUNT_FAILED", "Gagal mendapatkan total suara laporan")
		}
		topVote := voteTypeCountsOrder[0]
		secondVote := voteTypeCountsOrder[1]

		marginVote := float64(topVote.Count-secondVote.Count) / float64(totalVote) * 100

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
					return nil, apperror.New(500, "AUTO_RESOLVE_TASK_FAILED", "Gagal membuat tugas penyelesaian otomatis")
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
			return nil, apperror.New(500, "REPORT_UPDATE_FAILED", "Gagal memperbarui status laporan")
		}
	}

	if err := tx.Commit().Error; err != nil {
		tx.Rollback()
		return nil, apperror.New(500, "TRANSACTION_COMMIT_FAILED", "Gagal menyimpan perubahan")
	}

	return &dto.GetVoteReportResponse{
		ID:                    resultVote.ID,
		ReportID:              reportID,
		ReportStatus:          report.ReportStatus,
		UserID:                userID,
		VoteType:              resultVote.VoteType,
		CreatedAt:             resultVote.CreatedAt,
		UpdatedAt:             resultVote.UpdatedAt,
		LastUpdatedBy:         (*string)(&report.LastUpdatedBy),
		LastUpdatedProgressAt: report.LastUpdatedProgressAt,
	}, nil
}

func (s *ReportService) UploadProgressReport(db *gorm.DB, userID, reportID uint, req dto.UploadProgressReportRequest) (*dto.UploadProgressReportResponse, error) {
	tx := db.Begin()
	if tx.Error != nil {
		return nil, apperror.New(500, "TRANSACTION_START_FAILED", "gagal memulai transaksi")
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
			return nil, apperror.New(404, "REPORT_NOT_FOUND", "laporan tidak ditemukan")
		}
		return nil, apperror.New(500, "REPORT_FETCH_FAILED", "gagal mengambil laporan")
	}

	if report.UserID != userID {
		tx.Rollback()
		return nil, apperror.New(403, "FORBIDDEN", "anda tidak memiliki izin untuk mengunggah progres pada laporan ini")
	}

	if report.HasProgress == nil || !*report.HasProgress {
		tx.Rollback()
		return nil, apperror.New(400, "REPORT_NO_PROGRESS", "laporan ini tidak memerlukan progres (informasi saja)")
	}

	if report.ReportStatus == model.RESOLVED {
		tx.Rollback()
		return nil, apperror.New(400, "REPORT_ALREADY_RESOLVED", "laporan sudah selesai, tidak dapat mengunggah progres lagi")
	}

	if req.Status == string(model.RESOLVED) {
		report.ReportStatus = model.RESOLVED
		if _, err := s.reportRepo.UpdateTX(tx, report); err != nil {
			tx.Rollback()
			return nil, apperror.New(500, "REPORT_UPDATE_FAILED", "gagal memperbarui status laporan")
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
		return nil, apperror.New(500, "PROGRESS_CREATE_FAILED", "gagal mengunggah progres laporan")
	}

	report.ReportStatus = model.ReportStatus(req.Status)
	report.AdminOverride = mainutils.BoolPtrOrNil(true)
	report.LastUpdatedBy = model.Owner
	report.LastUpdatedProgressAt = mainutils.Int64PtrOrNil(time.Now().Unix())
	if _, err := s.reportRepo.UpdateTX(tx, report); err != nil {
		tx.Rollback()
		return nil, apperror.New(500, "REPORT_UPDATE_FAILED", "gagal memperbarui status laporan")
	}

	response := &dto.UploadProgressReportResponse{
		ReportID:              newProgress.ReportID,
		Status:                string(newProgress.Status),
		Notes:                 &newProgress.Notes,
		Attachment1:           newProgress.Attachment1,
		Attachment2:           newProgress.Attachment2,
		CreatedAt:             newProgress.CreatedAt,
		LastUpdatedProgressAt: report.LastUpdatedProgressAt,
	}

	if err := tx.Commit().Error; err != nil {
		tx.Rollback()
		return nil, apperror.New(500, "TRANSACTION_COMMIT_FAILED", "gagal menyimpan transaksi")
	}

	return response, nil
}

func (s *ReportService) GetProgressReports(reportID uint) ([]dto.GetProgressReportResponse, error) {
	reportProgresses, err := s.reportProgressRepo.GetByReportID(reportID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, apperror.New(404, "PROGRESS_NOT_FOUND", "progres laporan tidak ditemukan")
		}
		return nil, apperror.New(500, "PROGRESS_FETCH_FAILED", "gagal mengambil progres laporan")
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

func (s *ReportService) CreateReportComment(db *mongo.Client, userID, reportID uint, req dto.CreateReportCommentRequest) (*dto.CreateReportCommentResponse, error) {
	ctx := context.Background()

	report, err := s.reportRepo.GetByID(reportID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, apperror.New(404, "REPORT_NOT_FOUND", "Laporan tidak ditemukan")
		}
		return nil, apperror.New(500, "REPORT_FETCH_FAILED", "Gagal mengambil laporan")
	}

	if report.IsDeleted != nil && *report.IsDeleted {
		return nil, apperror.New(400, "REPORT_DELETED", "Tidak dapat menambahkan komentar pada laporan yang telah dihapus")
	}

	if report.ReportStatus == model.EXPIRED {
		return nil, apperror.New(400, "REPORT_EXPIRED", "Tidak dapat menambahkan komentar pada laporan yang telah kedaluwarsa")
	}

	parentCommentIDObj, err := mainutils.StringPtrToObjectIDPtr(req.ParentCommentID)
	if err != nil {
		return nil, apperror.New(400, "INVALID_PARENT_COMMENT_ID", "ID komentar induk tidak valid")
	}

	var commentMedia model.CommentMedia

	if req.MediaType != nil {
		commentMediaType := model.CommentMediaType(*req.MediaType)
		if req.MediaURL == nil {
			return nil, apperror.New(400, "MEDIA_URL_REQUIRED", "URL media diperlukan saat tipe media disediakan")
		}
		commentMedia = model.CommentMedia{
			URL:    *req.MediaURL,
			Type:   commentMediaType,
			Width:  req.MediaWidth,
			Height: req.MediaHeight,
		}
	}

	// for _, userMentioned := range req.Mentions {
	// 	user, err := s.userRepo.GetByID(userMentioned)
	// 	if err != nil {
	// 		if errors.Is(err, gorm.ErrRecordNotFound) {
	// 			continue
	// 		}
	// 		return nil, apperror.New(500, "USER_FETCH_FAILED", "Gagal mengambil data pengguna yang disebutkan")
	// 	}

	// }

	var reportComment model.ReportComment
	reportComment = model.ReportComment{
		ReportID:        reportID,
		UserID:          userID,
		Content:         req.Content,
		CreatedAt:       time.Now().Unix(),
		Media:           &commentMedia,
		UpdatedAt:       mainutils.Int64PtrOrNil(time.Now().Unix()),
		ParentCommentID: parentCommentIDObj,
	}

	reportCommentCreated, err := s.reportCommentRepo.Create(ctx, &reportComment)
	if err != nil {
		return nil, apperror.New(500, "COMMENT_CREATE_FAILED", "Gagal membuat komentar laporan")
	}
	newCommentID := reportCommentCreated.ID.Hex()

	var parentCommentIDStr *string
	if reportCommentCreated.ParentCommentID != nil {
		hexValue := reportCommentCreated.ParentCommentID.Hex()
		parentCommentIDStr = &hexValue
	}
	return &dto.CreateReportCommentResponse{
		CommentID:       newCommentID,
		ReportID:        reportCommentCreated.ReportID,
		UserID:          reportCommentCreated.UserID,
		CreatedAt:       reportComment.CreatedAt,
		Content:         reportComment.Content,
		ParentCommentID: parentCommentIDStr,
	}, nil
}

func (s *ReportService) GetReportComments(reportID uint, cursorID *string) (*dto.GetReportCommentsResponse, error) {
	ctx := context.Background()
	limit := 10

	primitiveCursor, err := mainutils.StringPtrToObjectIDPtr(cursorID)
	if err != nil {
		return nil, apperror.New(400, "INVALID_CURSOR_ID", "ID kursor tidak valid")
	}

	commentsFromDB, err := s.reportCommentRepo.GetPaginatedByReportID(ctx, reportID, primitiveCursor, limit)
	if err != nil {
		return nil, apperror.New(500, "COMMENT_FETCH_FAILED", "Gagal mengambil komentar laporan")
	}

	userIDs := make([]uint, 0)
	userIDMap := make(map[uint]struct{})

	for _, c := range commentsFromDB {
		if _, exists := userIDMap[c.UserID]; !exists {
			userIDMap[c.UserID] = struct{}{}
			userIDs = append(userIDs, c.UserID)
		}
	}

	users, err := s.userRepo.GetByIDs(userIDs)
	if err != nil {
		return nil, apperror.New(500, "USER_FETCH_FAILED", "Gagal mengambil data pengguna komentar")
	}

	userMap := make(map[uint]*model.User)
	for i := range users {
		userMap[users[i].ID] = &users[i]
	}

	comments := util.OrganizeComments(commentsFromDB, userMap)

	resp := dto.GetReportCommentsResponse{
		Comments: comments,
	}

	total, _ := s.reportCommentRepo.GetCountsByReportID(ctx, reportID)
	resp.TotalCounts = total

	return &resp, nil
}
