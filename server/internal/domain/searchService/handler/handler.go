package handler

import (
	"server/internal/domain/searchService/service"
	"server/pkg/logger"
	contextutils "server/pkg/utils/contextUtils"
	"server/pkg/utils/response"

	"github.com/gofiber/fiber/v2"
	"go.uber.org/zap"
)

type SearchHandler struct {
	searchService *service.SearchService
}

func NewSearchHandler(searchService *service.SearchService) *SearchHandler {
	return &SearchHandler{searchService: searchService}
}

func (h *SearchHandler) HandleSearch(c *fiber.Ctx) error {
	const defaultLimit = 20
	ctx := c.UserContext()
	requestID := contextutils.GetRequestID(ctx)

	searchQuery := c.Query("searchQuery", "")
	if len(searchQuery) < 3 {
		logger.Warn("Search query too short",
			zap.String("request_id", requestID),
			zap.String("search_query", searchQuery),
		)
		return response.ResponseError(c, 400, "Panjang search query minimal 3 karakter", "", nil)
	}

	searchData, err := h.searchService.SearchData(ctx, searchQuery, defaultLimit)
	if err != nil {
		logger.Error("Search failed",
			zap.String("request_id", requestID),
			zap.String("search_query", searchQuery),
			zap.Error(err),
		)
		return response.ResponseError(c, 500, "Gagal melakukan pencarian", err.Error(), nil)
	}

	logger.Info("Search request completed successfully",
		zap.String("request_id", requestID),
		zap.String("search_query", searchQuery),
	)

	return response.ResponseSuccess(c, 200, "Pencarian berhasil", "data", searchData)
}
