package dto

type ReportLocationResponse struct {
	DetailLocation string  `json:"detailLocation"`
	Latitude       float64 `json:"latitude"`
	Longitude      float64 `json:"longitude"`
	DisplayName    *string `json:"displayName"`
	AddressType    *string `json:"addressType"`
	Country        *string `json:"country"`
	CountryCode    *string `json:"countryCode"`
	Region         *string `json:"region"`
	Road		   *string `json:"road"`
	PostCode       *string `json:"postCode"`
	County         *string `json:"county"`
	State          *string `json:"state"`
	Village        *string `json:"village"`
	Suburb         *string `json:"suburb"`
}

type ReportImageResponse struct {
	Image1URL *string `json:"image1Url"`
	Image2URL *string `json:"image2Url"`
	Image3URL *string `json:"image3Url"`
	Image4URL *string `json:"image4Url"`
	Image5URL *string `json:"image5Url"`
}

type GetReportResponse struct {
	ID				uint    `json:"id"`
	ReportTitle     string  `json:"reportTitle"`
	ReportType      string  `json:"reportType"`
	ReportDescription string `json:"reportDescription"`
	ReportCreatedAt       int64   `json:"reportCreatedAt"`
	UserID          uint    `json:"userId"`
	UserName        string  `json:"userName"`
	FullName		string  `json:"fullName"`
	ProfilePicture *string `json:"profilePicture"`
	Location        ReportLocationResponse `json:"location"`
	Images          ReportImageResponse    `json:"images"`
}