package main

import (
	"fmt"
	"server2/internal/config"
	"server2/internal/infrastructure/cache"
	"server2/internal/infrastructure/database"
	"server2/internal/logger"
	"server2/internal/migration"
	"server2/internal/server"
	"server2/pkg/utils/envUtils"
	"strconv"

	"go.uber.org/zap"

	_ "github.com/joho/godotenv/autoload"
)

func main() {
	if err := config.LoadEnvConfig(); err != nil {
		panic(fmt.Sprintf("failed to load env config: %v", err))
	}

	err := logger.InitLogger("")
	defer logger.Logger.Sync()
	if err != nil {
		panic(fmt.Sprintf("failed to initialize logger: %v", err))
	}

	postgresConfig := config.LoadPostgresConfig()
	if err := database.InitPostgres(postgresConfig); err != nil {
		logger.Error("Failed to initialize PostgreSQL", zap.Error(err))
		panic(fmt.Sprintf("failed to initialize PostgreSQL: %v", err))
	}

	redisConfig := config.LoadRedisConfig()
	if err := cache.InitRedis(redisConfig); err != nil {
		logger.Error("Failed to initialize Redis", zap.Error(err))
		panic(fmt.Sprintf("failed to initialize Redis: %v", err))
	}

	if err := config.InitGoogleAuth(); err != nil {
		logger.Error("Failed to initialize Google Auth", zap.Error(err))
		panic(fmt.Sprintf("failed to initialize Google Auth: %v", err))
	}

	db := database.GetDB()
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
