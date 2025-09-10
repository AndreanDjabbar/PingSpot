package user

import (
	"server/internal/validation"

	"github.com/go-playground/validator/v10"
)

var Validate *validator.Validate

func init() {
	Validate = validator.New()
	validation.RegisterCustomValidations(Validate)
}