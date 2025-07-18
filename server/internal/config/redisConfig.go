package config

import (
	"context"
	"fmt"
	"server2/internal/logger"
	"server2/pkg/utils/envUtils"
	"sync"
	"time"

	"github.com/redis/go-redis/v9"
	"go.uber.org/zap"
)

var (
	redisInstance *redis.Client
	redisOnce     sync.Once
	redisErr      error
)

func InitRedis() error {
	redisOnce.Do(func() {
		addr := fmt.Sprintf("%s:%s", envUtils.RedisHost(), envUtils.RedisPort())
		opt := &redis.Options{
			Addr:     addr,
			DB:       0,
		}
		redisInstance = redis.NewClient(opt)

		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()
		if err := redisInstance.Ping(ctx).Err(); err != nil {
			logger.Error("Failed to connect to Redis", zap.Error(err))
			redisErr = fmt.Errorf("failed to connect to Redis: %w", err)
		} else {
			logger.Info("Connected to Redis successfully")
		}
	})
	return redisErr
}

func GetRedis() *redis.Client {
	return redisInstance
}