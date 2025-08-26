import { FaCopy, FaEye, FaEyeSlash, FaRedo, FaUser } from "react-icons/fa"

interface VotingSessionHeaderProps {
  storyTitle?: string
  currentSessionId?: string
  currentUserName: string
  currentUserVote?: { storyPoints: number }
  isRevealed: boolean
  onCopySessionId: () => void
  onLeaveSession: () => void
  onRevealVotes: () => void
  onResetVotes: () => void
}

export const VotingSessionHeader = ({
  storyTitle,
  currentSessionId,
  currentUserName,
  currentUserVote,
  isRevealed,
  onCopySessionId,
  onLeaveSession,
  onRevealVotes,
  onResetVotes
}: VotingSessionHeaderProps) => {
  return (
    <>
      {/* Header */}
      <div className="plasmo-mb-3">
        <h2 className="plasmo-text-md plasmo-font-bold">Planning Poker</h2>
        <div className="plasmo-text-xs plasmo-text-gray-400 plasmo-mt-1 plasmo-truncate">
          {storyTitle}
        </div>

        {/* Session ID Display */}
        <div className="plasmo-flex plasmo-items-center plasmo-justify-between plasmo-mt-2">
          <div className="plasmo-flex plasmo-items-center plasmo-gap-1">
            <span className="plasmo-text-xs plasmo-text-gray-500">ID:</span>
            <code className="plasmo-bg-gray-800 plasmo-px-1 plasmo-py-0.5 plasmo-rounded plasmo-text-xs plasmo-text-blue-300">
              {currentSessionId}
            </code>
            <button
              onClick={onCopySessionId}
              className="plasmo-p-0.5 plasmo-text-gray-400 hover:plasmo-text-white plasmo-transition-colors"
              title="Copy session ID">
              <FaCopy className="plasmo-w-3 plasmo-h-3" />
            </button>
          </div>
          <button
            onClick={onLeaveSession}
            className="plasmo-text-xs plasmo-text-red-400 hover:plasmo-text-red-300 plasmo-underline"
            title="Leave session">
            Leave
          </button>
        </div>
      </div>

      {/* Current User Display */}
      <div className="plasmo-mb-3">
        <div className="plasmo-text-xs plasmo-text-gray-300 plasmo-mb-1">
          <FaUser className="plasmo-inline plasmo-mr-1" />
          Voting as:
        </div>
        <div className="plasmo-flex plasmo-items-center plasmo-gap-2">
          <div className="plasmo-p-2 plasmo-bg-gray-800 plasmo-border plasmo-border-gray-600 plasmo-rounded plasmo-text-white plasmo-flex-1 plasmo-min-w-0">
            <div className="plasmo-flex plasmo-items-center plasmo-justify-between">
              <span className="plasmo-truncate plasmo-text-sm">
                {currentUserName}
              </span>
              {currentUserVote && (
                <span className="plasmo-text-xs plasmo-text-green-400 plasmo-ml-2 plasmo-flex-shrink-0">
                  ✓ Voted
                </span>
              )}
            </div>
          </div>
          {/* Edit name button removed - name cannot be changed during active session */}
        </div>
      </div>

      {/* Controls */}
      <div className="plasmo-flex plasmo-gap-1.5 plasmo-mb-3">
        <button
          onClick={onRevealVotes}
          className="plasmo-flex plasmo-items-center plasmo-gap-1 plasmo-bg-green-600 plasmo-text-white plasmo-px-2 plasmo-py-1.5 plasmo-rounded plasmo-text-xs hover:plasmo-bg-green-700">
          {isRevealed ? (
            <FaEyeSlash className="plasmo-w-3 plasmo-h-3" />
          ) : (
            <FaEye className="plasmo-w-3 plasmo-h-3" />
          )}
          {isRevealed ? "Hide" : "Reveal"}
        </button>
        <button
          onClick={onResetVotes}
          className="plasmo-flex plasmo-items-center plasmo-gap-1 plasmo-bg-red-600 plasmo-text-white plasmo-px-2 plasmo-py-1.5 plasmo-rounded plasmo-text-xs hover:plasmo-bg-red-700">
          <FaRedo className="plasmo-w-3 plasmo-h-3" />
          Reset
        </button>
      </div>
    </>
  )
}