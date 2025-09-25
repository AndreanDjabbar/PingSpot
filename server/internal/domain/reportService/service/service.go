package service

import (
	"errors"
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
	userRepo 			userRepository.UserRepository
	userProfileRepo 	userRepository.UserProfileRepository
}

type FullReportResult = struct {
	Report         model.Report
	ReportLocation model.ReportLocation
	ReportImages   model.ReportImage
}

func NewreportService(reportRepo reportRepository.ReportRepository, locationRepo reportRepository.ReportLocationRepository, imageRepo reportRepository.ReportImageRepository, userRepo userRepository.UserRepository, userProfileRepo userRepository.UserProfileRepository) *ReportService {
	return &ReportService{
		reportRepo:         reportRepo,
		reportLocationRepo: locationRepo,
		reportImageRepo:    imageRepo,
		userRepo:			userRepo,
		userProfileRepo:	userProfileRepo,
	}
}

func (s *ReportService) CreateReport(db *gorm.DB, userID uint, req dto.CreateReportRequest) (*FullReportResult, error) {
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

	reportResult := &FullReportResult{
		Report:         reportStruct,
		ReportLocation: reportLocationStruct,
		ReportImages:   reportImages,
	}
	return reportResult, nil
}

func (s *ReportService) GetAllReport() ([]any, error) {
	reports, err := s.reportRepo.Get()
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("Laporan tidak ditemukan")
		}
		return nil, err
	}

	var fullReports []any

	for _, report := range *reports {
		location, err := s.reportLocationRepo.GetByReportID(report.ID)
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return nil, errors.New("Lokasi laporan tidak ditemukan")
			}
			return nil, err
		}
		images, err := s.reportImageRepo.GetByReportID(report.ID)
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return nil, errors.New("Gambar laporan tidak ditemukan")
			}
			return nil, err
		}
		
		userProfile, err := s.userProfileRepo.GetByID(report.UserID)
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return nil, errors.New("Profil pengguna tidak ditemukan")
			}
			return nil, err
		}

		fullReports = append(fullReports, dto.GetReportResponse{
			ID:                report.ID,
			ReportTitle:       report.ReportTitle,
			ReportType:        string(report.ReportType),
			ReportDescription: report.ReportDescription,
			ReportCreatedAt:   report.CreatedAt,
			UserID:            report.UserID,
			UserName:          report.User.Username,
			FullName:		   report.User.FullName,
			ProfilePicture:    userProfile.ProfilePicture,
			Location: dto.ReportLocationResponse{
				DetailLocation: location.DetailLocation,
				Latitude:       location.Latitude,
				Longitude:      location.Longitude,
				DisplayName:    location.DisplayName,
				AddressType:    location.AddressType,
				Country:        location.Country,
				CountryCode:    location.CountryCode,
				Region:         location.Region,
				Road:		   location.Road,
				PostCode:       location.PostCode,
				County:         location.County,
				State:          location.State,
				Village:        location.Village,
				Suburb:         location.Suburb,
			},
			Images: dto.ReportImageResponse{
				Image1URL: images.Image1URL,
				Image2URL: images.Image2URL,
				Image3URL: images.Image3URL,
				Image4URL: images.Image4URL,
				Image5URL: images.Image5URL,
			},
		})
	}
	return fullReports, nil
}

func (s *ReportService) GetReportByID(reportID uint) (*FullReportResult, error) {
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

	result := &FullReportResult{
		Report:         *report,
		ReportLocation: *location,
		ReportImages:   *images,
	}
	return result, nil
}