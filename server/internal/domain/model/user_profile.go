package model

type UserProfile struct {
	ID     			uint    `gorm:"primaryKey"`
	UserID 			uint    `gorm:"unique;not null"`
	User   			User    `gorm:"foreignKey:UserID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
	Bio    		   *string `gorm:"type:text"`
	ProfilePicture *string `gorm:"size:255"`
	Gender 		   *string `gorm:"size:20"`
	Birthday	   *string `gorm:"type:date"`
}