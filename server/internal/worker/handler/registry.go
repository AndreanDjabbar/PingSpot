package handler

import (
	"server/internal/domain/reportService/repository"
	taskHandler "server/internal/domain/taskService/handler"
	"server/internal/domain/taskService/tasks"
	"server/internal/infrastructure/database"

	"github.com/hibiken/asynq"
)

func RegisterAllHandlers(mux *asynq.ServeMux) {
	db := database.GetPostgresDB()
	reportRepo := repository.NewReportRepository(db)
	taskHandler := taskHandler.NewTaskHandler(db, reportRepo)

	mux.HandleFunc(tasks.TaskAutoResolveReport, taskHandler.AutoResolveReportHandler)
}
