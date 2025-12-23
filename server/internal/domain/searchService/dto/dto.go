package dto

import "server/internal/domain/model"

type UserSearchResult struct {
	Users []model.User `json:"users"`
	Type  string       `json:"type"`
}

type ReportSearchResult struct {
	Reports []model.Report `json:"reports"`
	Type    string         `json:"type"`
}
