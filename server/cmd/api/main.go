package main

import (
	"fmt"
	"server2/internal/config"
	"server2/internal/logger"
	"server2/internal/migration"
	"server2/internal/server"
	"server2/pkg/utils/envUtils"
	"strconv"

	"go.uber.org/zap"

	_ "github.com/joho/godotenv/autoload"
)

func main() {
	config.LoadEnvConfig()

	err := logger.InitLogger("")
	defer logger.Logger.Sync()
	if err != nil {
		panic(fmt.Sprintf("failed to initialize logger: %v", err))
	}

	if err := config.InitPostgre(); err != nil {
		logger.Error("Failed to initialize PostgreSQL", zap.Error(err))
		panic(fmt.Sprintf("failed to initialize PostgreSQL: %v", err))
	}

	if err := config.InitRedis(); err != nil {
		logger.Error("Failed to initialize Redis", zap.Error(err))
		panic(fmt.Sprintf("failed to initialize Redis: %v", err))
	}

	db := config.GetDB()
	if err := migration.Migrate(db); err != nil {
		logger.Error("Failed to run migrations", zap.Error(err))
		panic(fmt.Sprintf("failed to run migrations: %v", err))
	}

	server := server.New()

	server.RegisterFiberRoutes()

	port, _ := strconv.Atoi(envUtils.Port())
	host := envUtils.Host()
	logger.Info("Starting server on port", zap.Int("port", port), zap.String("host", host))
	err = server.Listen(fmt.Sprintf("%s:%d", host, port))
	if err != nil {
		logger.Error("Failed to start server", zap.Error(err))
		panic(fmt.Sprintf("http server error: %s", err))
	}

	logger.Info("Server stopped.")
}
