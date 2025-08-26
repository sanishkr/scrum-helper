import { type Vote } from "~src/firebase/useFirestoreVoting"

export const useVoteStats = () => {
  const getVoteStats = (votes?: { [key: string]: Vote }) => {
    if (!votes) return { total: 0, average: 0, mostCommon: null }

    const voteArray = Object.values(votes) as Vote[]
    const total = voteArray.length

    if (total === 0) return { total: 0, average: 0, mostCommon: null }

    const numericVotes = voteArray.filter(
      (v) => typeof v.storyPoints === "number"
    )
    const average =
      numericVotes.length > 0
        ? numericVotes.reduce((sum, v) => sum + v.storyPoints, 0) /
          numericVotes.length
        : 0

    // Find most common vote
    const voteCounts: { [key: string]: number } = {}
    voteArray.forEach((vote) => {
      const key = vote.storyPoints.toString()
      voteCounts[key] = (voteCounts[key] || 0) + 1
    })

    const mostCommon = Object.entries(voteCounts).sort(
      ([, a], [, b]) => b - a
    )[0]?.[0]

    return { total, average: Math.round(average * 10) / 10, mostCommon }
  }

  const getUserVote = (userName: string, votes?: { [key: string]: Vote }) => {
    if (!votes) return null
    return (
      Object.values(votes).find((vote) => vote.userName === userName) || null
    )
  }

  const getParticipants = (
    participants: string[] = [],
    votes: { [key: string]: Vote } | undefined,
    currentUserName: string
  ) => {
    return participants.map((participantName) => {
      const vote = getUserVote(participantName, votes)
      return {
        name: participantName,
        hasVoted: !!vote,
        vote: vote?.storyPoints,
        isCurrentUser: participantName === currentUserName
      }
    })
  }

  return {
    getVoteStats,
    getUserVote,
    getParticipants
  }
}
