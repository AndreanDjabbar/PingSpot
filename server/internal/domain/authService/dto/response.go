package dto

type LoginResponse struct {
	Token string `json:"token"`
}

type VerificationResponse struct {
	Username string `json:"username"`
	Email    string `json:"email"`
	FullName string `json:"fullName"`
}

type ForgotPasswordLinkVerificationResponse struct {
	Email string `json:"email"`
}