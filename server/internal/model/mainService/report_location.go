package mainservice

type ReportLocation struct {
	ID          	uint    `gorm:"primaryKey"`
	ReportID    	uint    `gorm:"not null"`
	Report      	Report `gorm:"foreignKey:ReportID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
	DetailLocation  string `gorm:"type:text;not null"`
	Latitude    	float64 `gorm:"not null"`
	Longitude   	float64 `gorm:"not null"`
	DisplayName 	*string `gorm:"type:text"`
	AddressType 	*string `gorm:"size:100"`
	Country     	*string `gorm:"size:100"`
	CountryCode 	*string `gorm:"size:10"`
	Region	    	*string `gorm:"size:100"`
	Road			*string `gorm:"size:200"`
	PostCode		*string `gorm:"size:20"`
	County   		*string `gorm:"size:200"`
	State   		*string `gorm:"size:200"`
	Village   		*string `gorm:"size:200"`
	Suburb   		*string `gorm:"size:200"`
}