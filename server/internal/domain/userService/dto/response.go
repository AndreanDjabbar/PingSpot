package dto

type SaveUserProfileResponse struct {
	UserID          uint    `json:"userID"`
	FullName        string  `json:"fullName"`
	Bio             *string `json:"bio"`
	ProfilePicture  *string `json:"profilePicture"`
	Username		string  `json:"username"`
	Gender 	   		*string `json:"gender"`
	Birthday   		*string `json:"birthday"`
}

type GetProfileResponse struct {
	UserID          uint    `json:"userID"`
	FullName        string  `json:"fullName"`
	Bio             *string `json:"bio"`
	ProfilePicture  *string `json:"profilePicture"`
	Username		string  `json:"username"`
	Birthday   		*string `json:"birthday"`
	Gender 	   		*string `json:"gender"`
	Email			string  `json:"email"`	
}