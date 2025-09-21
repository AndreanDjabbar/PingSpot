package authservice

import (
	"time"
)

type provider string

const (
	ProviderEmail    provider = "EMAIL"
	ProviderGoogle   provider = "GOOGLE"
	ProviderFacebook provider = "FACEBOOK"
)

type User struct {
	ID         uint      `gorm:"primaryKey;autoIncrement"`
	Username   string    `gorm:"size:30;unique;not null"`
	Email      string    `gorm:"size:100;unique;not null"`
	Password   *string   `gorm:"size:255"`
	FullName   string    `gorm:"size:100;not null"`
	Provider   provider  `gorm:"type:varchar(20);default:EMAIL;not null"`
	IsVerified bool      `gorm:"default:false;not null"`
	ProviderID *string   `gorm:"size:100"`
	CreatedAt  time.Time `gorm:"autoCreateTime"`
	UpdatedAt  time.Time `gorm:"autoUpdateTime"`
}