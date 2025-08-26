import { FaPlay, FaPlus } from "react-icons/fa"

interface SessionManagementProps {
  storyTitle: string
  setStoryTitle: (title: string) => void
  joinSessionId: string
  setJoinSessionId: (id: string) => void
  isCreatingSession: boolean
  isJoiningSession: boolean
  currentUserName: string
  onCreateSession: () => void
  onJoinSession: () => void
}

export const SessionManagement = ({
  storyTitle,
  setStoryTitle,
  joinSessionId,
  setJoinSessionId,
  isCreatingSession,
  isJoiningSession,
  currentUserName,
  onCreateSession,
  onJoinSession
}: SessionManagementProps) => {
  return (
    <>
      {/* Create Session */}
      <div className="plasmo-mb-4">
        <h3 className="plasmo-text-md plasmo-font-semibold plasmo-mb-2">
          Create New Session
        </h3>
        <div className="plasmo-mb-3">
          <input
            type="text"
            value={storyTitle}
            onChange={(e) => setStoryTitle(e.target.value)}
            placeholder="Story title"
            className="plasmo-w-full plasmo-p-2 plasmo-bg-gray-800 plasmo-border plasmo-border-gray-600 plasmo-rounded plasmo-text-white"
          />
        </div>
        <button
          onClick={onCreateSession}
          disabled={!currentUserName || isCreatingSession}
          className="plasmo-flex plasmo-items-center plasmo-gap-2 plasmo-bg-blue-600 plasmo-text-white plasmo-px-4 plasmo-py-2 plasmo-rounded plasmo-text-sm hover:plasmo-bg-blue-700 disabled:plasmo-opacity-50 disabled:plasmo-cursor-not-allowed plasmo-w-full plasmo-justify-center">
          <FaPlus />
          {isCreatingSession ? "Creating..." : "Create Session"}
        </button>
      </div>

      {/* Join Session */}
      <div className="plasmo-mb-4 plasmo-border-t plasmo-border-gray-600 plasmo-pt-4">
        <h3 className="plasmo-text-md plasmo-font-semibold plasmo-mb-2">
          Join Existing Session
        </h3>
        <div className="plasmo-mb-3">
          <input
            type="text"
            value={joinSessionId}
            onChange={(e) => setJoinSessionId(e.target.value.toUpperCase())}
            placeholder="Enter session ID (e.g., ABC123)"
            className="plasmo-w-full plasmo-p-2 plasmo-bg-gray-800 plasmo-border plasmo-border-gray-600 plasmo-rounded plasmo-text-white"
            maxLength={6}
          />
        </div>
        <button
          onClick={onJoinSession}
          disabled={
            !currentUserName || !joinSessionId.trim() || isJoiningSession
          }
          className="plasmo-flex plasmo-items-center plasmo-gap-2 plasmo-bg-green-600 plasmo-text-white plasmo-px-4 plasmo-py-2 plasmo-rounded plasmo-text-sm hover:plasmo-bg-green-700 disabled:plasmo-opacity-50 disabled:plasmo-cursor-not-allowed plasmo-w-full plasmo-justify-center">
          <FaPlay />
          {isJoiningSession ? "Joining..." : "Join Session"}
        </button>
      </div>
    </>
  )
}
