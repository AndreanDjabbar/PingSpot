package dto

import "server/internal/domain/model"

type ReportLocationResponse struct {
	DetailLocation string  `json:"detailLocation"`
	Latitude       float64 `json:"latitude"`
	Longitude      float64 `json:"longitude"`
	DisplayName    *string `json:"displayName"`
	AddressType    *string `json:"addressType"`
	Country        *string `json:"country"`
	CountryCode    *string `json:"countryCode"`
	Region         *string `json:"region"`
	Road           *string `json:"road"`
	PostCode       *string `json:"postCode"`
	County         *string `json:"county"`
	State          *string `json:"state"`
	Village        *string `json:"village"`
	Suburb         *string `json:"suburb"`
	Geometry       *string `json:"geometry"`
}

type ReportImageResponse struct {
	Image1URL *string `json:"image1URL"`
	Image2URL *string `json:"image2URL"`
	Image3URL *string `json:"image3URL"`
	Image4URL *string `json:"image4URL"`
	Image5URL *string `json:"image5URL"`
}

type CreateReportResponse struct {
	Report         model.Report `json:"report"`
	ReportLocation model.ReportLocation `json:"reportLocation"`
	ReportImages   model.ReportImage `json:"reportImages"`
}

type GetReportResponse struct {
	ID                      uint                   `json:"id"`
	ReportTitle             string                 `json:"reportTitle"`
	ReportType              string                 `json:"reportType"`
	ReportDescription       string                 `json:"reportDescription"`
	ReportCreatedAt         int64                  `json:"reportCreatedAt"`
	UserID                  uint                   `json:"userID"`
	UserName                string                 `json:"userName"`
	FullName                string                 `json:"fullName"`
	ProfilePicture          *string                `json:"profilePicture"`
	Location                ReportLocationResponse `json:"location"`
	Images                  ReportImageResponse    `json:"images"`
	TotalReactions          int64                  `json:"totalReactions"`
	TotalLikeReactions      *int64                 `json:"totalLikeReactions"`
	TotalDislikeReactions   *int64                 `json:"totalDislikeReactions"`
	IsLikedByCurrentUser    bool                   `json:"isLikedByCurrentUser"`
	IsDislikedByCurrentUser bool                   `json:"isDislikedByCurrentUser"`
	ReportReactions         []ReactReportResponse  `json:"reportReactions"`
}

type ReactReportResponse struct {
	ReportID     uint   `json:"reportID"`
	UserID       uint   `json:"userID"`
	ReactionType string `json:"reactionType"`
	CreatedAt    int64  `json:"createdAt"`
	UpdatedAt    int64  `json:"updatedAt"`
}