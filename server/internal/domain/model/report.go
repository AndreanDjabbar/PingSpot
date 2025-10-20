package model

type ReportType string
type ReportStatus string

const (
	Infrastructure ReportType = "INFRASTRUCTURE"
	Environment    ReportType = "ENVIRONMENT"
	SocialIssue    ReportType = "SOCIAL_ISSUE"
	Safety         ReportType = "SAFETY"
	Other          ReportType = "OTHER"

	RESOLVED     ReportStatus = "RESOLVED"
	NOT_RESOLVED ReportStatus = "NOT_RESOLVED"
)

type Report struct {
	ID                uint         `gorm:"primaryKey"`
	UserID            uint         `gorm:"not null"`
	User              User         `gorm:"foreignKey:UserID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
	ReportTitle       string       `gorm:"size:255;not null"`
	ReportType        ReportType   `gorm:"type:varchar(30);not null"`
	ReportDescription string       `gorm:"type:text;not null"`
	CreatedAt         int64        `gorm:"autoCreateTime"`
	ReportStatus      ReportStatus `gorm:"type:varchar(50);default:'NOT_RESOLVED'"`
	HasProgress       *bool        `gorm:"default:true"`

	ReportLocation  *ReportLocation   `gorm:"foreignKey:ReportID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
	ReportImages    *ReportImage      `gorm:"foreignKey:ReportID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
	ReportReactions *[]ReportReaction `gorm:"foreignKey:ReportID"`
	ReportProgress  *[]ReportProgress `gorm:"foreignKey:ReportID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
	ReportVotes     *[]ReportVote     `gorm:"foreignKey:ReportID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
}
