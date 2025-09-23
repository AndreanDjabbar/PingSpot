package handler

import (
	"fmt"
	"path/filepath"
	"server/internal/domain/mainService/service"
	"server/internal/domain/mainService/validation"
	"server/internal/infrastructure/database"
	"server/pkg/logger"
	mainutils "server/pkg/utils/mainUtils"
	"server/pkg/utils/response"
	"time"

	"github.com/gofiber/fiber/v2"
	"go.uber.org/zap"
)

type MainHandler struct {
	mainService *service.MainService
}

func NewMainHandler(mainService *service.MainService) *MainHandler {
	return &MainHandler{mainService: mainService}
}

func (h *MainHandler) CreateReportHandler(c *fiber.Ctx) error {
	logger.Info("CREATE REPORT HANDLER")
	form, err := c.MultipartForm()
	if err != nil {
		logger.Error("Failed to parse multipart form", zap.Error(err))
		return response.ResponseError(c, 400, "Format body request tidak valid", "", err.Error())
	}

	reportTitle := c.FormValue("reportTitle")
	reportDescription := c.FormValue("reportDescription")
	reportType := c.FormValue("reportType")
	detailLocation := c.FormValue("detailLocation")
	latitude := c.FormValue("latitude")
	longitude := c.FormValue("longitude")
	displayName := c.FormValue("displayName")
	addressType := c.FormValue("addressType")
	road := c.FormValue("road")
	state := c.FormValue("state")
	country := c.FormValue("country")
	postCode := c.FormValue("postCode")
	region := c.FormValue("region")
	countryCode := c.FormValue("countryCode")
	county := c.FormValue("county")
	village := c.FormValue("village")
	suburb := c.FormValue("suburb")
	totalImageSize := int64(0)
	var images map[int]string = make(map[int]string)

	files := form.File["reportImages"]
	if len(files) > 5 {
		logger.Info("ADA YANG LEBIH DARI 5")
	}
	for i, file := range files {
		if file.Size > 5*1024*1024 {
			logger.Error("Report image file size too large", zap.Int64("size", files[i].Size))
			return response.ResponseError(c, 400, "Ukuran salah satu gambar terlalu besar", "", "Maksimal ukuran gambar 5MB per gambar")
		}
		totalImageSize += file.Size
	}
	if totalImageSize > 25*1024*1024 {
		logger.Error("Total report images size too large", zap.Int64("total_size", totalImageSize))
		return response.ResponseError(c, 400, "Ukuran total gambar terlalu besar", "", "Maksimal ukuran total gambar 25MB")
	}

	for i, file := range files {
		ext := filepath.Ext(file.Filename)
		if ext != ".jpg" && ext != ".jpeg" && ext != ".png" {
			logger.Error("Unsupported profile picture file format", zap.String("extension", ext))
			return response.ResponseError(c, 400, "Format file tidak didukung", "", "Gunakan JPG atau PNG")
		}
		fileName := fmt.Sprintf("%d%s", time.Now().UnixNano(), ext)
		savePath := filepath.Join("uploads/main/report", fileName)
		if err := c.SaveFile(file, savePath); err != nil {
			logger.Error("Failed to save profile picture", zap.Error(err))
			return response.ResponseError(c, 500, "Gagal menyimpan gambar", "", err.Error())
		}
		images[i] = fileName
	}

	floatLatitude, err := mainutils.StringToFloat64(latitude)
	if err != nil {
		logger.Error("Invalid latitude format", zap.String("latitude", latitude), zap.Error(err))
		return response.ResponseError(c, 400, "Format latitude tidak valid", "", "Latitude harus berupa angka desimal")
	}

	floatLongitude, err := mainutils.StringToFloat64(longitude)
	if err != nil {
		logger.Error("Invalid longitude format", zap.String("longitude", longitude), zap.Error(err))
		return response.ResponseError(c, 400, "Format longitude tidak valid", "", "Longitude harus berupa angka desimal")
	}

	req := validation.CreateReportRequest{
		ReportTitle:       reportTitle,
		ReportType:        reportType,
		ReportDescription: reportDescription,
		DetailLocation:    detailLocation,
		Latitude:          floatLatitude,
		Longitude:         floatLongitude,
		DisplayName:       mainutils.StrPtrOrNil(displayName),
		AddressType:       mainutils.StrPtrOrNil(addressType),
		Country:           mainutils.StrPtrOrNil(country),
		CountryCode:       mainutils.StrPtrOrNil(countryCode),
		Region:            mainutils.StrPtrOrNil(region),
		PostCode:          mainutils.StrPtrOrNil(postCode),
		County:            mainutils.StrPtrOrNil(county),
		State:             mainutils.StrPtrOrNil(state),
		Road:              mainutils.StrPtrOrNil(road),
		Village:           mainutils.StrPtrOrNil(village),
		Suburb:            mainutils.StrPtrOrNil(suburb),
		Image1URL:         mainutils.StrPtrOrNil(images[0]),
		Image2URL:         mainutils.StrPtrOrNil(images[1]),
		Image3URL:         mainutils.StrPtrOrNil(images[2]),
		Image4URL:         mainutils.StrPtrOrNil(images[3]),
		Image5URL:         mainutils.StrPtrOrNil(images[4]),
	}

	db := database.GetPostgresDB()
	if err := validation.Validate.Struct(req); err != nil {
		errors := validation.FormatCreateReportValidationErrors(err)
		logger.Error("Validation failed", zap.Error(err))
		return response.ResponseError(c, 400, "Validasi gagal", "errors", errors)
	}

	claims, err := mainutils.GetJWTClaims(c)
	if err != nil {
		logger.Error("Failed to get JWT claims", zap.Error(err))
		return response.ResponseError(c, 401, "Token tidak valid", "", "Anda harus login terlebih dahulu")
	}
	userID := uint(claims["user_id"].(float64))

	result, err := h.mainService.CreateReport(db, userID, req)
	if err != nil {
		logger.Error("Failed to create report", zap.Error(err))
		return response.ResponseError(c, 500, "Gagal membuat laporan", "", err.Error())
	}
	logger.Info("Report created successfully", zap.Uint("report_id", result.Report.ID))

	return response.ResponseSuccess(c, 200, "Laporan berhasil dibuat", "data", result)
}
