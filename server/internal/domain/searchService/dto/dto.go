package dto

import "server/internal/domain/model"

type UsersSearch struct {
	UserID          uint    `json:"userID"`
	FullName        string  `json:"fullName"`
	Bio             *string `json:"bio"`
	ProfilePicture  *string `json:"profilePicture"`
	Username		string  `json:"username"`
	Birthday   		*string `json:"birthday"`
	Gender 	   		*string `json:"gender"`
	Email			string  `json:"email"`	
}

type UserSearchResult struct {
	Users []UsersSearch `json:"users"`
	Type  string       `json:"type"`
}

type ReportSearchResult struct {
	Reports []model.Report `json:"reports"`
	Type    string         `json:"type"`
}
