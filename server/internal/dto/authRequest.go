package dto

type RegisterRequest struct {
	Username   string  `json:"username" validate:"required,min=3"`
	Email      string  `json:"email" validate:"required,email"`
	Password   string  `json:"password" validate:"required,min=6"`
	FullName   string  `json:"fullName" validate:"required"`
	Phone      string  `json:"phone" validate:"required,phoneid"`
	Provider   string  `json:"provider" validate:"required,oneof=EMAIL GOOGLE GITHUB"`
	ProviderID *string `json:"providerId"`
}

type LoginRequest struct {
	Email      string  `json:"email" validate:"required,email"`
	Password   string  `json:"password" validate:"required,min=6"`
}