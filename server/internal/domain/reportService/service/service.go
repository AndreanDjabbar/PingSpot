package service

import (
	"errors"
	"server/internal/domain/reportService/model"
	"server/internal/domain/reportService/repository"
	"server/internal/domain/reportService/validation"
	"time"

	"gorm.io/gorm"
)

type ReportService struct {
	reportRepo         repository.ReportRepository
	reportLocationRepo repository.ReportLocationRepository
	reportImageRepo    repository.ReportImageRepository
	db                 *gorm.DB
}

type CreateReportResult = struct {
	Report         model.Report
	ReportLocation model.ReportLocation
	ReportImages   model.ReportImage
}

func NewreportService(reportRepo repository.ReportRepository, locationRepo repository.ReportLocationRepository, imageRepo repository.ReportImageRepository, db *gorm.DB) *ReportService {
	return &ReportService{
		reportRepo:         reportRepo,
		reportLocationRepo: locationRepo,
		reportImageRepo:    imageRepo,
		db:                 db,
	}
}

func (s *ReportService) CreateReport(db *gorm.DB, userID uint, req validation.CreateReportRequest) (*CreateReportResult, error) {
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

	reportResult := &CreateReportResult{
		Report:         reportStruct,
		ReportLocation: reportLocationStruct,
		ReportImages:   reportImages,
	}
	return reportResult, nil
}
