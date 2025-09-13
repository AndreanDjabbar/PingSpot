package cache

import (
	"context"
	"fmt"
	"time"

	"server/internal/config"
	"server/pkg/logger"

	"github.com/redis/go-redis/v9"
	"go.uber.org/zap"
)

var redisInstance *redis.Client

func InitRedis(cfg config.RedisConfig) error {
	addr := fmt.Sprintf("%s:%s", cfg.Host, cfg.Port)

	client := redis.NewClient(&redis.Options{
		Addr: addr,
		DB:   cfg.DB,
	})

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := client.Ping(ctx).Err(); err != nil {
		logger.Error("Failed to connect to Redis", zap.Error(err))
		return fmt.Errorf("failed to connect to Redis: %w", err)
	}

	logger.Info("Connected to Redis successfully")
	redisInstance = client
	return nil
}

func GetRedis() *redis.Client {
	return redisInstance
}
