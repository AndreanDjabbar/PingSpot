package dto

type SearchResponse struct {
	UsersData UserSearchResult	`json:"users_data"`
	ReportsData ReportSearchResult `json:"reports_data"`
}