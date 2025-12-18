package middleware

import (
	"server/pkg/logger"
	"time"

	"github.com/gofiber/fiber/v2"
	"go.uber.org/zap"
)

func LoggingMiddleware() fiber.Handler {
	return func(c *fiber.Ctx) error {
		start := time.Now()
		err := c.Next()
		duration := time.Since(start)

		logger.Info("HTTP Request",
			zap.String("method", c.Method()),
			zap.String("path", c.Path()),
			zap.Int("status", c.Response().StatusCode()),
			zap.Duration("duration", duration),
			zap.String("ip", c.IP()),
			zap.String("user_agent", c.Get("User-Agent")),
		)

		if err != nil {
			logger.Error("HTTP Request Error",
				zap.String("method", c.Method()),
				zap.String("path", c.Path()),
				zap.Error(err),
			)
		}
		return err
	}
}