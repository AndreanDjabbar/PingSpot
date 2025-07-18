package validation

import (
	"regexp"
	"github.com/go-playground/validator/v10"
)

func PhoneID(fl validator.FieldLevel) bool {
	phone := fl.Field().String()
	re := regexp.MustCompile(`^0[0-9]{9,12}$`)
	return re.MatchString(phone)
}

func RegisterCustomValidations(v *validator.Validate) {
	v.RegisterValidation("phoneid", PhoneID)
}