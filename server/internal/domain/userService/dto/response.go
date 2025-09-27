package dto

type SaveUserProfileResponse struct {
	UserID          uint    `json:"userId"`
	FullName        string  `json:"fullName"`
	Bio             *string `json:"bio"`
	ProfilePicture  *string `json:"profilePicture"`
	Username		string  `json:"username"`
	Gender 	   		*string `json:"gender"`
	Birthday   		*string `json:"birthday"`
}