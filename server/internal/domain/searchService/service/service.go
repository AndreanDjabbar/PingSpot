package service

import (
	"context"
	"errors"
	reportRepository "server/internal/domain/reportService/repository"
	"server/internal/domain/searchService/dto"
	userRepository "server/internal/domain/userService/repository"
	apperror "server/pkg/appError"
	"server/pkg/logger"
	contextutils "server/pkg/utils/contextUtils"
	"strings"

	"go.uber.org/zap"
	"gorm.io/gorm"
)

type SearchService struct {
	userRepo   userRepository.UserRepository
	reportRepo reportRepository.ReportRepository
}

func NewSearchService(
	userRepo userRepository.UserRepository,
	reportRepo reportRepository.ReportRepository,
) *SearchService {
	return &SearchService{
		userRepo:   userRepo,
		reportRepo: reportRepo,
	}
}

func (s *SearchService) SearchData(ctx context.Context, searchQuery string, limit int) (*dto.SearchResponse, error) {
	requestID := contextutils.GetRequestID(ctx)
	logger.Info("Performing search",
		zap.String("request_id", requestID),
		zap.String("search_query", searchQuery),
		zap.Int("limit", limit),
	)

	usersData, err := s.userRepo.FullTextSearchUsers(ctx, strings.ToLower(searchQuery), limit)
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		logger.Error("Failed to search users",
			zap.String("request_id", requestID),
			zap.String("search_query", searchQuery),
			zap.Error(err),
		)
		return nil, apperror.New(500, "USER_SEARCH_FAILED", "Gagal mencari data pengguna", err.Error())
	}

	reportsData, err := s.reportRepo.FullTextSearchReports(ctx, strings.ToLower(searchQuery), limit)
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		logger.Error("Failed to search reports",
			zap.String("request_id", requestID),
			zap.String("search_query", searchQuery),
			zap.Error(err),
		)
		return nil, apperror.New(500, "REPORT_SEARCH_FAILED", "Gagal mencari data laporan", err.Error())
	}

	searchResponse := dto.SearchResponse{
		UsersData:   dto.UserSearchResult{Users: *usersData, Type: "users"},
		ReportsData: dto.ReportSearchResult{Reports: *reportsData, Type: "reports"},
	}

	logger.Info("Search completed successfully",
		zap.String("request_id", requestID),
		zap.Int("users_found", len(*usersData)),
		zap.Int("reports_found", len(*reportsData)),
	)

	return &searchResponse, nil
}
