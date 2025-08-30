package user

type ForgotPasswordEmailVerificationRequest struct {
	Email string `json:"email" validate:"required,email"`
}

type ForgotPasswordResetPasswordRequest struct {
	Password string `json:"password" validate:"required,min=6"`
	PasswordConfirmation string `json:"passwordConfirmation" validate:"required,eqfield=Password"`
	Email string `json:"email" validate:"required,email"`
}