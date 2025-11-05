package router

import (
	"fmt"
	"server/internal/domain/reportService/handler"
	reportRepository "server/internal/domain/reportService/repository"
	reportService "server/internal/domain/reportService/service"
	"server/internal/domain/taskService/service"
	userRepository "server/internal/domain/userService/repository"
	"server/internal/infrastructure/database"
	"server/internal/middleware"
	"server/pkg/utils/env"

	"github.com/gofiber/fiber/v2"
	"github.com/hibiken/asynq"
)

func RegisterReportRoutes(app *fiber.App) {
	database := database.GetPostgresDB()
	reportRepo := reportRepository.NewReportRepository(database)
	reportLocationRepo := reportRepository.NewReportLocationRepository(database)
	reportImageRepo := reportRepository.NewReportImageRepository(database)
	reportReactionRepo := reportRepository.NewReportReactionRepository(database)
	reportVoteRepo := reportRepository.NewReportVoteRepository(database)
	reportProgressRepo := reportRepository.NewReportProgressRepository(database)
	userProfileRepo := userRepository.NewUserProfileRepository(database)
	userRepo := userRepository.NewUserRepository(database)

	redisAddress := fmt.Sprintf("%s:%s", env.RedisHost(), env.RedisPort())
	client := asynq.NewClient(asynq.RedisClientOpt{Addr: redisAddress})
	tasksService := service.NewTaskService(client, reportRepo)

	reportService := reportService.NewreportService(reportRepo, reportLocationRepo, reportReactionRepo, reportImageRepo, userRepo, userProfileRepo, reportProgressRepo, reportVoteRepo, *tasksService)

	reportHandler := handler.NewReportHandler(reportService)

	reportRoute := app.Group("/pingspot/api/report", middleware.JWTProtected())
	reportRoute.Post("/", reportHandler.CreateReportHandler)
	reportRoute.Get("/", reportHandler.GetReportHandler)
	reportRoute.Post("/:reportID/reaction", reportHandler.ReactionReportHandler)
	reportRoute.Post("/:reportID/vote", reportHandler.VoteReportHandler)
	reportRoute.Post("/:reportID/progress", reportHandler.UploadProgressReportHandler)
	reportRoute.Get("/:reportID/progress", reportHandler.GetProgressReportHandler)
}
