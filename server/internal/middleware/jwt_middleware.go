package middleware

import (
	"context"
	"fmt"
	"server/internal/infrastructure/cache"
	"server/pkg/utils/env"
	"server/pkg/utils/response"
	"strings"

	jwtware "github.com/gofiber/contrib/jwt"
	"github.com/gofiber/fiber/v2"
)

func CheckTokenBlacklist(token string) bool {
	redisClient := cache.GetRedis()
	blacklistKey := fmt.Sprintf("blacklist:%s", token)

	_, err := redisClient.Get(context.Background(), blacklistKey).Result()
	return err == nil
}

func JWTProtected() fiber.Handler {
	return func(c *fiber.Ctx) error {
		authHeader := c.Get("Authorization")
		if authHeader == "" {
			return response.ResponseError(c, 401, "Token tidak ditemukan", "", "Anda harus login terlebih dahulu")
		}

		var token string
		if strings.HasPrefix(authHeader, "Bearer ") {
			token = authHeader[7:]
		} else {
			return response.ResponseError(c, 401, "Format token tidak valid", "", "Token harus menggunakan format Bearer")
		}

		if CheckTokenBlacklist(token) {
			return response.ResponseError(c, 401, "Token sudah tidak valid", "", "Token telah di-logout")
		}

		jwtMiddleware := jwtware.New(jwtware.Config{
			SigningKey: jwtware.SigningKey{
				Key: []byte(env.JWTSecret()),
			},
			ErrorHandler: func(c *fiber.Ctx, err error) error {
				return response.ResponseError(c, 401, "Token tidak valid", "", err.Error())
			},
		})

		return jwtMiddleware(c)
	}
}
