package util

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