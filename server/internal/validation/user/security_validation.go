package user

import "github.com/go-playground/validator/v10"

func FormatSaveUserSecurityValidationErrors(err error) map[string]string {
	errors := map[string]string{}
	if err == nil {
		return errors
	}
	for _, e := range err.(validator.ValidationErrors) {
		switch e.Field() {
		case "CurrentPassword":
			if e.Tag() == "required" {
				errors["currentPassword"] = "Kata Sandi saat ini wajib diisi"
			}
			if e.Tag() == "min" {
				errors["currentPassword"] = "Kata Sandi saat ini minimal 6 karakter"
			}
		case "CurrentPasswordConfirmation":
			if e.Tag() == "required" {
				errors["currentPasswordConfirmation"] = "Konfirmasi Kata Sandi saat ini wajib diisi"
			}
			if e.Tag() == "eqfield" {
				errors["currentPasswordConfirmation"] = "Konfirmasi kata sandi saat ini harus sama dengan kata sandi saat ini"
			}
		case "NewPassword":
			if e.Tag() == "required" {
				errors["newPassword"] = "Kata sandi baru wajib diisi"
			}
			if e.Tag() == "min" {
				errors["newPassword"] = "Kata sandi baru minimal 6 karakter"
			}
		case "NewPasswordConfirmation":
			if e.Tag() == "required" {
				errors["newPasswordConfirmation"] = "Konfirmasi kata sandi baru wajib diisi"
			}
			if e.Tag() == "eqfield" {
				errors["newPasswordConfirmation"] = "Konfirmasi kata sandi baru harus sama dengan kata sandi baru"
			}
		}
	}
	return errors
}