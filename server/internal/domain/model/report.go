package model

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
	User              User `gorm:"foreignKey:UserID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
	ReportTitle       string     `gorm:"size:255;not null"`
	ReportType        ReportType `gorm:"type:varchar(30);not null"`
	ReportDescription string     `gorm:"type:text;not null"`
	CreatedAt         int64      `gorm:"autoCreateTime"`
	ReportStatus      string     `gorm:"type:varchar(50);default:'PENDING';not null"`

	ReportLocation *ReportLocation `gorm:"foreignKey:ReportID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
	ReportImages   *ReportImage    `gorm:"foreignKey:ReportID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
	ReportReactions   *[]ReportReaction `gorm:"foreignKey:ReportID"`
}