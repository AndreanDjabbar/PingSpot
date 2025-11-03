package util

import (
	"server/internal/domain/model"
	"sort"
)

func GetMajorityVote(resolvedVote, onProgressVote, notResolvedVote int64) *string {
	if resolvedVote >= onProgressVote && resolvedVote >= notResolvedVote {
		vote := "RESOLVED"
		return &vote
	}
	if onProgressVote >= resolvedVote && onProgressVote >= notResolvedVote {
		vote := "ON_PROGRESS"
		return &vote
	}
	if notResolvedVote >= resolvedVote && notResolvedVote >= onProgressVote {
		vote := "NOT_RESOLVED"
		return &vote
	}
	return nil
}

func GetVoteTypeOrder(voteCount map[model.ReportStatus]int64) []struct {
	Type  model.ReportStatus
	Count int
} {
	votes := []struct {
		Type  model.ReportStatus
		Count int
	}{
		{model.RESOLVED, int(voteCount[model.RESOLVED])},
		{model.ON_PROGRESS, int(voteCount[model.ON_PROGRESS])},
		{model.NOT_RESOLVED, int(voteCount[model.NOT_RESOLVED])},
	}

	sort.Slice(votes, func(i, j int) bool {
		return votes[i].Count > votes[j].Count
	})

	return votes
}
