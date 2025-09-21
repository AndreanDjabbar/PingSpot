package mainservice

import (
	"errors"
	"time"

	"gorm.io/gorm"
)

type CreateReportResult = struct{
	Report Report
	ReportLocation ReportLocation
	ReportImages ReportImage
}

func CreateReport(db *gorm.DB, userID uint, req createReportRequest) (*CreateReportResult, error) {
	tx := db.Begin()
	if tx.Error != nil {
		return nil, errors.New("Gagal memulai transaksi") 
	}
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	var reportStruct Report
	reportStruct = Report{
		UserID:      userID,
		ReportTitle: req.ReportTitle,
		ReportType: reportType(req.ReportType),
		ReportDescription: req.ReportDescription,
		CreatedAt:  time.Now().Unix(),
	}
	if err := tx.Create(&reportStruct).Error; err != nil {
		tx.Rollback()
		return nil, errors.New("Gagal membuat laporan")
	}

	reportID := reportStruct.ID

	var reportLocationStruct ReportLocation
	reportLocationStruct = ReportLocation{
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

	if err := tx.Create(&reportLocationStruct).Error; err != nil {
		tx.Rollback()
		return nil, errors.New("Gagal menyimpan lokasi laporan")
	}

	var reportImages ReportImage
	reportImages = ReportImage{
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
		Report: reportStruct,
		ReportLocation: reportLocationStruct,
		ReportImages: reportImages,
	}
	return reportResult, nil
}