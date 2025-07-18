package authValidation

import "github.com/go-playground/validator/v10"

func FormatRegisterValidationErrors(err error) map[string]string {
	errors := map[string]string{}
	if err == nil {
		return errors
	}
	for _, e := range err.(validator.ValidationErrors) {
		switch e.Field() {
		case "Username":
			if e.Tag() == "required" {
				errors["username"] = "Username wajib diisi"
			}
			if e.Tag() == "min" {
				errors["username"] = "Username minimal 3 karakter"
			}
		case "Email":
			if e.Tag() == "required" {
				errors["email"] = "Email wajib diisi"
			}
			if e.Tag() == "email" {
				errors["email"] = "Email tidak valid"
			}
		case "Password":
			if e.Tag() == "required" {
				errors["password"] = "Password wajib diisi"
			}
			if e.Tag() == "min" {
				errors["password"] = "Password minimal 6 karakter"
			}
		case "FullName":
			if e.Tag() == "required" {
				errors["fullName"] = "Fullname wajib diisi"
			}
		case "Phone":
			if e.Tag() == "required" {
				errors["phone"] = "Nomor telepon wajib diisi"
			}
			if e.Tag() == "phoneid" {
				errors["phone"] = "Nomor telepon harus dimulai dengan 0 dan berisi 10–13 digit"
			}
		case "Provider":
			if e.Tag() == "required" {
				errors["provider"] = "Provider wajib diisi"
			}
			if e.Tag() == "oneof" {
				errors["provider"] = "Provider harus salah satu dari EMAIL, GOOGLE, atau GITHUB"
			}
		}
	}
	return errors
}

func FormatLoginValidationErrors(err error) map[string]string {
	errors := map[string]string{}
	if err == nil {
		return errors
	}
	for _, e := range err.(validator.ValidationErrors) {
		switch e.Field() {
		case "Email":
			if e.Tag() == "required" {
				errors["email"] = "Email wajib diisi"
			}
			if e.Tag() == "email" {
				errors["email"] = "Email tidak valid"
			}
		case "Password":
			if e.Tag() == "required" {
				errors["password"] = "Password wajib diisi"
			}
			if e.Tag() == "min" {
				errors["password"] = "Password minimal 6 karakter"
			}
		}
	}
	return errors
}