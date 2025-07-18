package config

import (
	"fmt"
	"server2/internal/logger"
	"server2/pkg/utils/envUtils"
	"sync"

	"go.uber.org/zap"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var (
	dbInstance *gorm.DB
	dbOnce     sync.Once
	dbErr      error
)

func InitPostgre() error {
	dbOnce.Do(func() {
		dsn := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
			envUtils.PostgreHost(),
			envUtils.PostgrePort(),
			envUtils.PostgreUser(),
			envUtils.PostgrePassword(),
			envUtils.PostgreDB(),
		)
		logger.Info("Connecting to PostgreSQL", zap.String("host", envUtils.PostgreHost()), zap.String("port", envUtils.PostgrePort()), zap.String("user", envUtils.PostgreUser()), zap.String("dbname", envUtils.PostgreDB()))

		var err error
		dbInstance, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
		if err != nil {
			logger.Error("Failed to connect to PostgreSQL", zap.Error(err))
			dbErr = fmt.Errorf("failed to connect to PostgreSQL: %w", err)
		} else {
			logger.Info("Connected to PostgreSQL successfully")
		}
	})
	return dbErr
}

func GetDB() *gorm.DB {
	return dbInstance
}