package config

import (
	"os"
	"server2/internal/logger"
	"strings"

	"github.com/joho/godotenv"
	"go.uber.org/zap"
)

func LoadEnvConfig() {
	env := strings.ToLower(strings.TrimSpace(os.Getenv("APP_ENV")))
	logger.Info("Loading environment configuration for", zap.String("env", env))
	var envFile string

	switch env {
	case "development":
		logger.Info("Loading development environment configuration")
		envFile = ".env.dev"
	case "production":
		logger.Info("Loading production environment configuration")
		envFile = ".env.prod"
	case "testing":
		logger.Info("Loading testing environment configuration")
		envFile = ".env.test"
	case "staging":
		logger.Info("Loading staging environment configuration")
		envFile = ".env.staging"
	default:
		logger.Info("Loading default environment configuration")
		envFile = ".env.dev"
	}
	if err := godotenv.Load(envFile); err != nil {
		logger.Error("Error loading .env file", zap.String("envFile", envFile), zap.Error(err))
		os.Exit(1)
	}
}
