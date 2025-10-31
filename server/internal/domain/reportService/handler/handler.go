package handler

import (
	"fmt"
	"path/filepath"
	"server/internal/domain/reportService/dto"
	"server/internal/domain/reportService/service"
	"server/internal/domain/reportService/validation"
	"server/internal/infrastructure/database"
	"server/pkg/logger"
	mainutils "server/pkg/utils/mainUtils"
	"server/pkg/utils/response"
	"time"

	"github.com/gofiber/fiber/v2"
	"go.uber.org/zap"
)

type ReportHandler struct {
	reportService *service.ReportService
}

func NewReportHandler(reportService *service.ReportService) *ReportHandler {
	return &ReportHandler{reportService: reportService}
}

func (h *ReportHandler) CreateReportHandler(c *fiber.Ctx) error {
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
	hasProgressStr := c.FormValue("hasProgress")
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
		logger.Error("Too many report images", zap.Int("count", len(files)))
		return response.ResponseError(c, 400, "Terlalu banyak gambar", "", "Maksimal 5 gambar")
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

	hasProgress, err := mainutils.StringToBool(hasProgressStr)
	if err != nil && hasProgressStr != "" {
		logger.Error("Invalid hasProgress format", zap.String("hasProgress", hasProgressStr), zap.Error(err))
	}

	req := dto.CreateReportRequest{
		ReportTitle:       reportTitle,
		ReportType:        reportType,
		ReportDescription: reportDescription,
		DetailLocation:    detailLocation,
		HasProgress:       hasProgress,
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

	result, err := h.reportService.CreateReport(db, userID, req)
	if err != nil {
		logger.Error("Failed to create report", zap.Error(err))
		return response.ResponseError(c, 500, "Gagal membuat laporan", "", err.Error())
	}
	logger.Info("Report created successfully", zap.Uint("report_id", result.Report.ID))

	return response.ResponseSuccess(c, 200, "Laporan berhasil dibuat", "data", result)
}

func (h *ReportHandler) GetReportHandler(c *fiber.Ctx) error {
	logger.Info("GET REPORT HANDLER")
	reportID := c.Query("reportID")
	cursorID := c.Query("cursorID")
	reportType := c.Query("reportType")
	status := c.Query("status")
	sortBy := c.Query("sortBy")
	hasProgress := c.Query("hasProgress")
	limit := 5

	cursorIDUint, err := mainutils.StringToUint(cursorID)
	if err != nil && cursorID != "" {
		logger.Error("Invalid afterID format", zap.String("afterID", cursorID), zap.Error(err))
		return response.ResponseError(c, 400, "Format afterID tidak valid", "", "afterID harus berupa angka")
	}

	claims, err := mainutils.GetJWTClaims(c)
	if err != nil {
		logger.Error("Failed to get JWT claims", zap.Error(err))
		return response.ResponseError(c, 401, "Token tidak valid", "", "Anda harus login terlebih dahulu")
	}
	userID := uint(claims["user_id"].(float64))

	if reportID == "" {
		reports, err := h.reportService.GetAllReport(userID, uint(limit), cursorIDUint, reportType, status, sortBy, hasProgress)
		if err != nil {
			logger.Error("Failed to get all reports", zap.Error(err))
		}
		var nextCursor *uint = nil
		if len(reports) > 0 {
			lastReport := reports[len(reports)-1]
			nextCursor = &lastReport.ID
		}
		mappedData := fiber.Map{
			"reports":    reports,
			"nextCursor": nextCursor,
		}
		return response.ResponseSuccess(c, 200, "Get all reports success", "data", mappedData)
	} else {
		uintReportID, err := mainutils.StringToUint(reportID)
		if err != nil {
			logger.Error("Invalid reportID format", zap.String("reportID", reportID), zap.Error(err))
			return response.ResponseError(c, 400, "Format reportID tidak valid", "", "reportID harus berupa angka")
		}

		report, err := h.reportService.GetReportByID(userID, uintReportID)
		if err != nil {
			logger.Error("Failed to get report by ID", zap.Uint("reportID", uintReportID), zap.Error(err))
			return response.ResponseError(c, 500, "Gagal mendapatkan laporan", "", err.Error())
		}
		mappedData := fiber.Map{
			"report": report,
		}
		return response.ResponseSuccess(c, 200, "Get report success", "data", mappedData)
	}
}

func (h *ReportHandler) ReactionReportHandler(c *fiber.Ctx) error {
	logger.Info("REACTION REPORT HANDLER")
	reportIDParam := c.Params("reportID")
	uintReportID, err := mainutils.StringToUint(reportIDParam)
	if err != nil {
		logger.Error("Invalid reportID format", zap.String("reportID", reportIDParam), zap.Error(err))
		return response.ResponseError(c, 400, "Format reportID tidak valid", "", "reportID harus berupa angka")
	}

	var req dto.ReactionReportRequest
	if err := c.BodyParser(&req); err != nil {
		logger.Error("Failed to parse request body", zap.Error(err))
		return response.ResponseError(c, 400, "Format body request tidak valid", "", err.Error())
	}
	if err := validation.Validate.Struct(req); err != nil {
		errors := validation.FormatReactionReportValidationErrors(err)
		logger.Error("Validation failed", zap.Error(err))
		return response.ResponseError(c, 400, "Validasi gagal", "errors", errors)
	}

	claims, err := mainutils.GetJWTClaims(c)
	if err != nil {
		logger.Error("Failed to get JWT claims", zap.Error(err))
		return response.ResponseError(c, 401, "Token tidak valid", "", "Anda harus login terlebih dahulu")
	}
	userID := uint(claims["user_id"].(float64))
	db := database.GetPostgresDB()

	reaction, err := h.reportService.ReactToReport(db, userID, uintReportID, req.ReactionType)
	if err != nil {
		logger.Error("Failed to react to report", zap.Uint("reportID", uintReportID), zap.Uint("userID", userID), zap.Error(err))
		return response.ResponseError(c, 500, "Gagal mereaksi laporan", "", err.Error())
	}
	return response.ResponseSuccess(c, 200, "Reaksi laporan berhasil", "", reaction)
}

func (h *ReportHandler) VoteReportHandler(c *fiber.Ctx) error {
	logger.Info("VOTE REPORT HANDLER")
	reportIDParam := c.Params("reportID")
	uintReportID, err := mainutils.StringToUint(reportIDParam)
	if err != nil {
		logger.Error("Invalid reportID format", zap.String("reportID", reportIDParam), zap.Error(err))
		return response.ResponseError(c, 400, "Format reportID tidak valid", "", "reportID harus berupa angka")
	}
	var req dto.VoteReportRequest
	if err := c.BodyParser(&req); err != nil {
		logger.Error("Failed to parse request body", zap.Error(err))
		return response.ResponseError(c, 400, "Format body request tidak valid", "", err.Error())
	}

	if err := validation.Validate.Struct(req); err != nil {
		errors := validation.FormatVoteReportValidationErrors(err)
		logger.Error("Validation failed", zap.Error(err))
		return response.ResponseError(c, 400, "Validasi gagal", "errors", errors)
	}
	claims, err := mainutils.GetJWTClaims(c)
	if err != nil {
		logger.Error("Failed to get JWT claims", zap.Error(err))
		return response.ResponseError(c, 401, "Token tidak valid", "", "Anda harus login terlebih dahulu")
	}
	userID := uint(claims["user_id"].(float64))
	db := database.GetPostgresDB()
	vote, err := h.reportService.VoteToReport(db, userID, uintReportID, req.VoteType)
	if err != nil {
		logger.Error("Failed to vote to report", zap.Uint("reportID", uintReportID), zap.Uint("userID", userID), zap.Error(err))
		return response.ResponseError(c, 500, "Gagal vote laporan", "", err.Error())
	}
	return response.ResponseSuccess(c, 200, "Vote laporan berhasil", "", vote)
}

func (h *ReportHandler) UploadProgressReportHandler(c *fiber.Ctx) error {
	logger.Info("UPLOAD PROGRESS REPORT HANDLER")
	reportIDParam := c.Params("reportID")
	uintReportID, err := mainutils.StringToUint(reportIDParam)
	if err != nil {
		logger.Error("Invalid reportID format", zap.String("reportID", reportIDParam), zap.Error(err))
		return response.ResponseError(c, 400, "Format reportID tidak valid", "", "reportID harus berupa angka")
	}

	form, err := c.MultipartForm()
	if err != nil {
		logger.Error("Failed to parse multipart form", zap.Error(err))
		return response.ResponseError(c, 400, "Format body request tidak valid", "", err.Error())
	}

	var images map[int]string = make(map[int]string)
	status := c.FormValue("progressStatus")
	notes := c.FormValue("progressNotes")

	files := form.File["progressAttachments"]
	if len(files) > 2 {
		logger.Error("Too many progress attachments", zap.Int("count", len(files)))
		return response.ResponseError(c, 400, "Terlalu banyak lampiran", "", "Maksimal 2 lampiran")
	}

	totalImageSize := int64(0)
	for i, file := range files {
		if file.Size > 5*1024*1024 {
			logger.Error("Report image file size too large", zap.Int64("size", files[i].Size))
			return response.ResponseError(c, 400, "Ukuran salah satu gambar terlalu besar", "", "Maksimal ukuran gambar 5MB per gambar")
		}
		totalImageSize += file.Size
	}

	if totalImageSize > 10*1024*1024 {
		logger.Error("Total progress attachments size too large", zap.Int64("total_size", totalImageSize))
		return response.ResponseError(c, 400, "Ukuran total lampiran terlalu besar", "", "Maksimal ukuran total lampiran 10MB")
	}

	if len(files) > 0 {
		for i, file := range files {
			ext := filepath.Ext(file.Filename)
			if ext != ".jpg" && ext != ".jpeg" && ext != ".png" && ext != ".pdf" {
				logger.Error("Unsupported progress attachment file format", zap.String("extension", ext))
				return response.ResponseError(c, 400, "Format file tidak didukung", "", "Gunakan JPG, PNG, atau PDF")
			}
			fileName := fmt.Sprintf("%d%s", time.Now().UnixNano(), ext)
			savePath := filepath.Join("uploads/main/report/progress", fileName)
			if err := c.SaveFile(file, savePath); err != nil {
				logger.Error("Failed to save progress attachment", zap.Error(err))
				return response.ResponseError(c, 500, "Gagal menyimpan lampiran", "", err.Error())
			}
			images[i] = fileName
		}
	}

	req := dto.UploadProgressReportRequest{
		Status:      status,
		Notes:       notes,
		Attachment1: mainutils.StrPtrOrNil(images[0]),
		Attachment2: mainutils.StrPtrOrNil(images[1]),
	}

	if err := validation.Validate.Struct(req); err != nil {
		errors := validation.FormatUploadProgressReportValidationErrors(err)
		logger.Error("Validation failed", zap.Error(err))
		return response.ResponseError(c, 400, "Validasi gagal", "errors", errors)
	}

	claims, err := mainutils.GetJWTClaims(c)
	if err != nil {
		logger.Error("Failed to get JWT claims", zap.Error(err))
		return response.ResponseError(c, 401, "Token tidak valid", "", "Anda harus login terlebih dahulu")
	}
	userID := uint(claims["user_id"].(float64))

	db := database.GetPostgresDB()

	newProgress, err := h.reportService.UploadProgressReport(db, userID, uintReportID, req)
	if err != nil {
		logger.Error("Failed to upload progress report", zap.Uint("reportID", uintReportID), zap.Uint("userID", userID), zap.Error(err))
		return response.ResponseError(c, 500, "Gagal mengunggah progres laporan", "", err.Error())
	}
	return response.ResponseSuccess(c, 200, "Progres laporan berhasil diunggah", "data", newProgress)
}

func (h *ReportHandler) GetProgressReportHandler(c *fiber.Ctx) error {
	logger.Info("GET PROGRESS REPORT HANDLER")
	reportIDParam := c.Params("reportID")
	uintReportID, err := mainutils.StringToUint(reportIDParam)
	if err != nil {
		logger.Error("Invalid reportID format", zap.String("reportID", reportIDParam), zap.Error(err))
		return response.ResponseError(c, 400, "Format reportID tidak valid", "", "reportID harus berupa angka")
	}

	progressList, err := h.reportService.GetProgressReports(uintReportID)
	if err != nil {
		logger.Error("Failed to get progress reports", zap.Uint("reportID", uintReportID), zap.Error(err))
		return response.ResponseError(c, 500, "Gagal mendapatkan progres laporan", "", err.Error())
	}
	return response.ResponseSuccess(c, 200, "Get progress reports success", "data", progressList)
}
