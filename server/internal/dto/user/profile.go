package user

type SaveUserProfileRequest struct {
	FullName 		  string  `json:"fullName" validate:"required"`
	Bio    	 		 *string `json:"bio" validate:"omitempty,max=255"`
	ProfilePicture   *string `json:"profilePicture" validate:"omitempty,max=255"`
	Age      		 *uint   `json:"age" validate:"omitempty,gte=0"`
	Gender   		 *string `json:"gender" validate:"omitempty,oneof=male female"`
}
