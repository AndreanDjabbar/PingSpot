package worker

import (
	"server/internal/worker/handler"
	"server/pkg/logger"

	"github.com/hibiken/asynq"
	"go.uber.org/zap"
)

type WorkerServer struct {
	server     *asynq.Server
	client     *asynq.Client
	redisAddr  string
}

func NewWorkerServer(redisAddr string) *WorkerServer {
	opt := asynq.RedisClientOpt{Addr: redisAddr}

	return &WorkerServer{
		server: asynq.NewServer(
			opt,
			asynq.Config{
				Concurrency: 10,
				// Queues: map[string]int{
				// 	"default": 6,
				// 	"critical": 4,
				// },
			},
		),
		client:    asynq.NewClient(opt),
		redisAddr: redisAddr,
	}
}

func (w *WorkerServer) Run() error {
	mux := asynq.NewServeMux()

	handler.RegisterAllHandlers(mux)
	if err := w.server.Run(mux); err != nil {
		logger.Error("❌ Asynq server failed to start", zap.Error(err))
		return err
	}

	return nil
}