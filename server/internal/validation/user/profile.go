package user

import "github.com/go-playground/validator/v10"

func FormatSaveUserProfileValidationErrors(err error) map[string]string {
	errors := map[string]string{}
	if err == nil {
		return errors
	}
	for _, e := range err.(validator.ValidationErrors) {
		switch e.Field() {
		case "FullName":
			if e.Tag() == "required" {
				errors["fullName"] = "Full name wajib diisi"
			}
		case "Bio":
			if e.Tag() == "max" {
				errors["bio"] = "Bio maksimal 255 karakter"
			}
		case "ProfilePicture":
			if e.Tag() == "max" {
				errors["avatar"] = "Avatar maksimal 255 karakter"
			}
		case "Gender":
			if e.Tag() == "max" {
				errors["gender"] = "Gender maksimal 20 karakter"
			}
			if e.Tag() == "oneof" {
				errors["gender"] = "Gender harus salah satu antara male atau female"
			}
		case "Age":
			if e.Tag() == "gte" {
				errors["age"] = "Age harus lebih besar atau sama dengan 0"
			}
		}
	}
	return errors
}