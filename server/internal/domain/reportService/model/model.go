package model

import "server/internal/domain/userService/model"

type ReportType string

const (
	Infrastructure ReportType = "INFRASTRUCTURE"
	Environment    ReportType = "ENVIRONMENT"
	SocialIssue    ReportType = "SOCIAL_ISSUE"
	Safety         ReportType = "SAFETY"
	Other          ReportType = "OTHER"
)

type Report struct {
	ID                uint       `gorm:"primaryKey"`
	UserID            uint       `gorm:"not null"`
	User              model.User `gorm:"foreignKey:UserID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
	ReportTitle       string     `gorm:"size:255;not null"`
	ReportType        ReportType `gorm:"type:varchar(30);not null"`
	ReportDescription string     `gorm:"type:text;not null"`
	CreatedAt         int64      `gorm:"autoCreateTime"`
}

type ReportImage struct {
	ID        uint    `gorm:"primaryKey"`
	ReportID  uint    `gorm:"not null"`
	Report    Report  `gorm:"foreignKey:ReportID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
	Image1URL *string `gorm:"size:255"`
	Image2URL *string `gorm:"size:255"`
	Image3URL *string `gorm:"size:255"`
	Image4URL *string `gorm:"size:255"`
	Image5URL *string `gorm:"size:255"`
}

type ReportLocation struct {
	ID             uint    `gorm:"primaryKey"`
	ReportID       uint    `gorm:"not null"`
	Report         Report  `gorm:"foreignKey:ReportID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
	DetailLocation string  `gorm:"type:text;not null"`
	Latitude       float64 `gorm:"not null"`
	Longitude      float64 `gorm:"not null"`
	DisplayName    *string `gorm:"type:text"`
	AddressType    *string `gorm:"size:100"`
	Country        *string `gorm:"size:100"`
	CountryCode    *string `gorm:"size:10"`
	Region         *string `gorm:"size:100"`
	Road           *string `gorm:"size:200"`
	PostCode       *string `gorm:"size:20"`
	County         *string `gorm:"size:200"`
	State          *string `gorm:"size:200"`
	Village        *string `gorm:"size:200"`
	Suburb         *string `gorm:"size:200"`
}