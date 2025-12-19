package middleware

import (
	"context"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

type contextKey string

const RequestIDKey contextKey = "request_id"

func RequestIDMiddleware() fiber.Handler {
	return func(c *fiber.Ctx) error {
		requestID := uuid.New().String()
		c.Locals("RequestID", requestID)
		ctx := context.WithValue(c.Context(), RequestIDKey, requestID)
		c.SetUserContext(ctx)

		c.Set("X-Request-ID", requestID)
		return c.Next()
	}
}
