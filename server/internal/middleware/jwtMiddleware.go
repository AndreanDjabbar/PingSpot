package middleware

import (
	"server2/pkg/utils/envUtils"
	"server2/pkg/utils/responseUtils"

	jwtware "github.com/gofiber/contrib/jwt"
	"github.com/gofiber/fiber/v2"
)

func JWTProtected() fiber.Handler {
	return jwtware.New(jwtware.Config{
		SigningKey: jwtware.SigningKey{
			Key: []byte(envUtils.JWTSecret()),
		},
		ErrorHandler: func(c *fiber.Ctx, err error) error {
			return responseUtils.ResponseError(c, 401, "Unauthorized", "", err.Error())
		},
	})
}
