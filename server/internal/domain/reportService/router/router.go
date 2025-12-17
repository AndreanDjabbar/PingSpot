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
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/hibiken/asynq"
)

func RegisterReportRoutes(app *fiber.App) {
	postgreDB := database.GetPostgresDB()
	mongoDB := database.GetMongoDB()

	reportRepo := reportRepository.NewReportRepository(postgreDB)
	reportLocationRepo := reportRepository.NewReportLocationRepository(postgreDB)
	reportImageRepo := reportRepository.NewReportImageRepository(postgreDB)
	reportReactionRepo := reportRepository.NewReportReactionRepository(postgreDB)
	reportVoteRepo := reportRepository.NewReportVoteRepository(postgreDB)
	reportProgressRepo := reportRepository.NewReportProgressRepository(postgreDB)
	userProfileRepo := userRepository.NewUserProfileRepository(postgreDB)
	userRepo := userRepository.NewUserRepository(postgreDB)
	reportCommentRepository := reportRepository.NewReportCommentRepository(mongoDB)

	redisAddress := fmt.Sprintf("%s:%s", env.RedisHost(), env.RedisPort())
	client := asynq.NewClient(asynq.RedisClientOpt{Addr: redisAddress})
	tasksService := service.NewTaskService(client, reportRepo)

	reportService := reportService.NewreportService(reportRepo, reportLocationRepo, reportReactionRepo, reportImageRepo, userRepo, userProfileRepo, reportProgressRepo, reportVoteRepo, *tasksService, reportCommentRepository)

	reportHandler := handler.NewReportHandler(reportService)

	reportRoute := app.Group("/pingspot/api/report", middleware.ValidateAccessToken())
	reportRoute.Post("/", middleware.TimeoutMiddleware(20*time.Second), reportHandler.CreateReportHandler)
	reportRoute.Put("/:reportID", middleware.TimeoutMiddleware(20*time.Second), reportHandler.EditReportHandler)
	reportRoute.Get("/", middleware.TimeoutMiddleware(15*time.Second), reportHandler.GetReportHandler)
	reportRoute.Post("/:reportID/reaction", middleware.TimeoutMiddleware(5*time.Second), reportHandler.ReactionReportHandler)
	reportRoute.Post("/:reportID/vote", middleware.TimeoutMiddleware(5*time.Second), reportHandler.VoteReportHandler)
	reportRoute.Post("/:reportID/progress", middleware.TimeoutMiddleware(15*time.Second), reportHandler.UploadProgressReportHandler)
	reportRoute.Get("/:reportID/progress", middleware.TimeoutMiddleware(10*time.Second), reportHandler.GetProgressReportHandler)
	reportRoute.Delete("/:reportID", middleware.TimeoutMiddleware(10*time.Second), reportHandler.DeleteReportHandler)
	reportRoute.Post("/:reportID/comment", middleware.TimeoutMiddleware(8*time.Second), reportHandler.CreateReportCommentHandler)
	reportRoute.Get("/:reportID/comment", middleware.TimeoutMiddleware(15*time.Second), reportHandler.GetReportCommentsHandler)
}
