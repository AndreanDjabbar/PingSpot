package database

import (
    "fmt"
    "sync"

    "server2/internal/config"
    "server2/internal/logger"

    "go.uber.org/zap"
    "gorm.io/driver/postgres"
    "gorm.io/gorm"
)

var (
    dbInstance *gorm.DB
    dbOnce     sync.Once
    dbErr      error
)

func InitPostgres(cfg config.PostgresConfig) error {
    dbOnce.Do(func() {
        dsn := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
            cfg.Host, cfg.Port, cfg.User, cfg.Password, cfg.DBName, cfg.SSLMode,
        )

        logger.Info("Connecting to PostgreSQL",
            zap.String("host", cfg.Host),
            zap.String("port", cfg.Port),
            zap.String("user", cfg.User),
            zap.String("dbname", cfg.DBName),
        )

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