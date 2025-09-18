package mainservice

import (
	"errors"
	mainDTO "server/internal/dto/mainService"
	mainModel "server/internal/model/mainService"
	"time"

	"gorm.io/gorm"
)

type CreateReportResult = struct{
	Report mainModel.Report
	ReportLocation mainModel.ReportLocation
	ReportImages mainModel.ReportImage
}

func CreateReport(db *gorm.DB, userID uint, req mainDTO.CreateReportRequest) (*CreateReportResult, error) {
	tx := db.Begin()
	if tx.Error != nil {
		return nil, errors.New("Gagal memulai transaksi") 
	}
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	var report mainModel.Report
	report = mainModel.Report{
		UserID:      userID,
		ReportTitle: req.ReportTitle,
		ReportType: mainModel.ReportType(req.ReportType),
		ReportDescription: req.ReportDescription,
		CreatedAt:  time.Now().Unix(),
	}
	if err := tx.Create(&report).Error; err != nil {
		tx.Rollback()
		return nil, errors.New("Gagal membuat laporan")
	}

	reportID := report.ID

	var reportLocation mainModel.ReportLocation
	reportLocation = mainModel.ReportLocation{
		ReportID:   reportID,
		Latitude:   req.Latitude,
		Longitude:  req.Longitude,
		DetailLocation: req.DetailLocation,
		DisplayName: req.DisplayName,
		AddressType: req.AddressType,
		Country:  req.Country,
		CountryCode: req.CountryCode,
		Region: req.Region,
		Road: req.Road,
		PostCode: req.PostCode,
		County: req.County,
		State: req.State,
		Village: req.Village,
		Suburb: req.Suburb,
	}

	if err := tx.Create(&reportLocation).Error; err != nil {
		tx.Rollback()
		return nil, errors.New("Gagal menyimpan lokasi laporan")
	}

	var reportImages mainModel.ReportImage
	reportImages = mainModel.ReportImage{
		Image1URL: req.Image1URL,
		Image2URL: req.Image2URL,
		Image3URL: req.Image3URL,
		Image4URL: req.Image4URL,
		Image5URL: req.Image5URL,
		ReportID:  reportID,
	}
	if err := tx.Create(&reportImages).Error; err != nil {
		tx.Rollback()
		return nil, errors.New("Gagal menyimpan gambar laporan")
	}
	if err := tx.Commit().Error; err != nil {
		tx.Rollback()
		return nil, errors.New("Gagal menyimpan perubahan")
	}
	
	reportResult := &CreateReportResult{
		Report: report,
		ReportLocation: reportLocation,
		ReportImages: reportImages,
	}
	return reportResult, nil
}