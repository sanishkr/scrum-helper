import { FaMinus, FaUser } from "react-icons/fa"

interface Participant {
  name: string
  hasVoted: boolean
  vote?: number | string
  isCurrentUser: boolean
}

interface ParticipantsListProps {
  participants: Participant[]
  isRevealed: boolean
  isSessionCreator?: boolean
  onRemoveParticipant?: (participantName: string) => void
}

export const ParticipantsList = ({
  participants,
  isRevealed,
  isSessionCreator = false,
  onRemoveParticipant
}: ParticipantsListProps) => {
  return (
    <div className="plasmo-flex plasmo-flex-col plasmo-pl-4 plasmo-min-w-36">
      <div className="plasmo-mb-3">
        <h3 className="plasmo-text-sm plasmo-font-semibold">
          Participants ({participants.length})
        </h3>
      </div>

      <div className="plasmo-flex-1 plasmo-overflow-y-auto">
        <div className="plasmo-space-y-1.5">
          {participants.map((participant) => (
            <div
              key={participant.name}
              className={`plasmo-flex plasmo-justify-between plasmo-items-center plasmo-p-2 plasmo-rounded plasmo-border ${
                participant.isCurrentUser
                  ? "plasmo-bg-blue-900/30 plasmo-border-blue-600"
                  : "plasmo-bg-gray-800 plasmo-border-gray-600"
              }`}>
              <div className="plasmo-flex plasmo-items-center plasmo-gap-1.5 plasmo-min-w-0 plasmo-flex-1">
                <FaUser className="plasmo-w-3 plasmo-h-3 plasmo-text-gray-400 plasmo-flex-shrink-0" />
                <span
                  className={`plasmo-text-xs plasmo-truncate ${
                    participant.isCurrentUser
                      ? "plasmo-text-blue-300"
                      : "plasmo-text-white"
                  }`}
                  title={participant.name}>
                  {participant.name}
                  {participant.isCurrentUser && (
                    <span className="plasmo-text-xs plasmo-text-blue-400 plasmo-ml-1">
                      (You)
                    </span>
                  )}
                </span>
              </div>

              <div className="plasmo-flex plasmo-items-center plasmo-flex-shrink-0 plasmo-ml-2 plasmo-gap-1">
                {isRevealed ? (
                  // Show actual vote when revealed
                  participant.hasVoted ? (
                    <span className="plasmo-font-bold plasmo-text-green-400 plasmo-bg-green-900/30 plasmo-px-1.5 plasmo-py-0.5 plasmo-rounded plasmo-text-xs">
                      {participant.vote}
                    </span>
                  ) : (
                    <span className="plasmo-text-gray-500 plasmo-text-xs">
                      -
                    </span>
                  )
                ) : // Show vote status when not revealed
                participant.hasVoted ? (
                  <div
                    className="plasmo-w-2.5 plasmo-h-2.5 plasmo-bg-green-500 plasmo-rounded-full"
                    title="Voted"
                  />
                ) : (
                  <div
                    className="plasmo-w-2.5 plasmo-h-2.5 plasmo-bg-gray-500 plasmo-rounded-full"
                    title="Not voted"
                  />
                )}

                {/* Remove button for session creator (only for other participants, not themselves) */}
                {isSessionCreator &&
                  !participant.isCurrentUser &&
                  onRemoveParticipant && (
                    <button
                      onClick={() => onRemoveParticipant(participant.name)}
                      className="plasmo-w-2.5 plasmo-h-2.5 plasmo-ml-1 plasmo-bg-red-600 plasmo-text-white plasmo-rounded-full plasmo-flex plasmo-items-center plasmo-justify-center hover:plasmo-bg-red-700 plasmo-transition-colors"
                      title={`Remove ${participant.name}`}>
                      <FaMinus className="plasmo-w-2.5 plasmo-h-2.5" />
                    </button>
                  )}
              </div>
            </div>
          ))}

          {participants.length === 0 && (
            <div className="plasmo-text-gray-500 plasmo-text-xs plasmo-text-center plasmo-py-4">
              No participants yet
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
