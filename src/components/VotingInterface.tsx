import { ParticipantsList } from "~src/components/ParticipantsList";
import { VoteStatsDisplay } from "~src/components/VoteStatsDisplay";
import { VotingButtons } from "~src/components/VotingButtons";
import { VotingSessionHeader } from "~src/components/VotingSessionHeader";





interface VotingInterfaceProps {
  votingSession: any // VotingSession type
  currentSessionId?: string
  currentUserName: string
  currentUserVote?: { storyPoints: number }
  storyPoints: (number | string)[]
  stats: { total: number; average: number; mostCommon: string | null }
  participants: Array<{
    name: string
    hasVoted: boolean
    vote?: number | string
    isCurrentUser: boolean
  }>
  onCopySessionId: () => void
  onLeaveSession: () => void
  onVote: (points: number | string) => void
  onRevealVotes: () => void
  onResetVotes: () => void
  onRemoveParticipant?: (participantName: string) => void
}

export const VotingInterface = ({
  votingSession,
  currentSessionId,
  currentUserName,
  currentUserVote,
  storyPoints,
  stats,
  participants,
  onCopySessionId,
  onLeaveSession,
  onVote,
  onRevealVotes,
  onResetVotes,
  onRemoveParticipant
}: VotingInterfaceProps) => {
  // Check if current user is the session creator
  const isSessionCreator = votingSession?.createdBy === currentUserName
  return (
    <div className="plasmo-flex plasmo-h-full plasmo-p-4 plasmo-w-full">
      {/* Left Panel - Voting Interface */}
      <div className="plasmo-flex plasmo-flex-col plasmo-pr-4 plasmo-border-r plasmo-border-gray-600 plasmo-min-w-0 plasmo-w-2/3">
        <VotingSessionHeader
          storyTitle={votingSession?.storyTitle}
          currentSessionId={currentSessionId}
          currentUserName={currentUserName}
          currentUserVote={currentUserVote}
          isRevealed={votingSession?.isRevealed}
          onCopySessionId={onCopySessionId}
          onLeaveSession={onLeaveSession}
          onRevealVotes={onRevealVotes}
          onResetVotes={onResetVotes}
        />

        <VotingButtons
          storyPoints={storyPoints}
          currentUserVote={currentUserVote}
          currentUserName={currentUserName}
          onVote={onVote}
        />

        <VoteStatsDisplay
          stats={stats}
          isRevealed={votingSession?.isRevealed}
        />
      </div>

      {/* Right Panel - Participants */}
      <ParticipantsList
        participants={participants}
        isRevealed={votingSession?.isRevealed}
        isSessionCreator={isSessionCreator}
        onRemoveParticipant={onRemoveParticipant}
      />
    </div>
  )
}