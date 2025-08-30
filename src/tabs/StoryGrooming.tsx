import { useEffect, useState } from "react"
import { FaExclamationTriangle, FaSpinner, FaWifi } from "react-icons/fa"

import { SessionSetup } from "~src/components/SessionSetup"
import { VotingInterface } from "~src/components/VotingInterface"
import { useFirestoreVoting } from "~src/firebase/useFirestoreVoting"
import { useSessionManagement } from "~src/hooks/useSessionManagement"
import { useUserName } from "~src/hooks/useUserName"
import { useVoteStats } from "~src/hooks/useVoteStats"

const StoryGrooming = () => {
  const [showFirebaseTimeout, setShowFirebaseTimeout] = useState(false)
  const [retryAttempts, setRetryAttempts] = useState(0)

  // Custom hooks
  const userNameHook = useUserName()
  const sessionHook = useSessionManagement()
  const { getVoteStats, getUserVote, getParticipants } = useVoteStats()

  const {
    votingSession,
    loading,
    error,
    currentSessionId,
    createVotingSession,
    joinSession,
    leaveSession,
    removeParticipant,
    castVote,
    revealVotes,
    resetVotes
  } = useFirestoreVoting()

  const storyPoints = [1, 2, 3, 5, 8, 13, 21, "?"]

  // Retry connection function
  const handleRetryConnection = () => {
    setRetryAttempts((prev) => prev + 1)
    setShowFirebaseTimeout(false)
    window.location.reload()
  }

  // Continue in offline mode
  const handleOfflineMode = () => {
    setShowFirebaseTimeout(true)
  }

  // Add timeout for Firestore loading
  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading && !votingSession && !error) {
        console.log("Firestore connection timeout - showing fallback UI")
        setShowFirebaseTimeout(true)
      }
    }, 5000) // 5 second timeout

    return () => clearTimeout(timer)
  }, [loading, votingSession, error])

  // Session management handlers
  const handleCreateSession = () => {
    sessionHook.handleCreateSession(
      userNameHook.currentUserName,
      createVotingSession
    )
  }

  const handleJoinSession = () => {
    sessionHook.handleJoinSession(userNameHook.currentUserName, joinSession)
  }

  const handleLeaveSession = async () => {
    if (!userNameHook.currentUserName) return

    try {
      await leaveSession(userNameHook.currentUserName)
    } catch (error) {
      console.error("Failed to leave session:", error)
      alert("Failed to leave session")
    }
  }

  const copySessionId = () => {
    if (currentSessionId) {
      navigator.clipboard.writeText(currentSessionId)
      alert("Session ID copied to clipboard!")
    }
  }

  const handleVote = async (points: number | string) => {
    if (!userNameHook.currentUserName) {
      alert("Please enter your name first!")
      return
    }

    try {
      await castVote(
        userNameHook.currentUserName,
        userNameHook.currentUserName,
        Number(points)
      )
    } catch (error) {
      console.error("Failed to cast vote:", error)
    }
  }

  const handleRevealVotes = async () => {
    try {
      await revealVotes()
    } catch (error) {
      console.error("Failed to reveal votes:", error)
    }
  }

  const handleResetVotes = async () => {
    try {
      await resetVotes()
    } catch (error) {
      console.error("Failed to reset votes:", error)
    }
  }

  const handleRemoveParticipant = async (userName: string) => {
    try {
      await removeParticipant(userName)
    } catch (error) {
      console.error("Failed to remove participant:", error)
      alert("Failed to remove participant")
    }
  }

  // Loading state
  if (loading && !showFirebaseTimeout) {
    return (
      <div className="plasmo-flex plasmo-flex-col plasmo-items-center plasmo-justify-center plasmo-h-full plasmo-p-4">
        <div className="plasmo-flex plasmo-items-center plasmo-mb-4">
          <FaSpinner className="plasmo-animate-spin plasmo-text-blue-400 plasmo-text-2xl plasmo-mr-3" />
          <div className="plasmo-text-lg plasmo-text-gray-300">
            Connecting to your team...
          </div>
        </div>

        <div className="plasmo-text-sm plasmo-text-gray-400 plasmo-text-center plasmo-max-w-xs plasmo-mb-4">
          Setting up real-time collaboration for your planning session
        </div>

        <div className="plasmo-flex plasmo-space-x-3">
          <button
            onClick={handleOfflineMode}
            className="plasmo-px-4 plasmo-py-2 plasmo-text-xs plasmo-text-gray-400 plasmo-bg-gray-700 plasmo-rounded plasmo-hover:bg-gray-600 plasmo-transition-colors">
            Continue Offline
          </button>
        </div>

        <div className="plasmo-text-xs plasmo-text-gray-500 plasmo-mt-4 plasmo-text-center">
          Taking longer than usual? Check your internet connection
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="plasmo-flex plasmo-flex-col plasmo-items-center plasmo-justify-center plasmo-h-full plasmo-p-4">
        <div className="plasmo-flex plasmo-items-center plasmo-mb-4">
          <FaExclamationTriangle className="plasmo-text-yellow-400 plasmo-text-2xl plasmo-mr-3" />
          <div className="plasmo-text-lg plasmo-text-gray-300">
            Something not right!
          </div>
        </div>

        <div className="plasmo-text-sm plasmo-text-gray-400 plasmo-text-center plasmo-max-w-sm plasmo-mb-6">
          We're having trouble connecting to the collaboration service. You can
          still use the extension in offline mode for daily standups or try
          reconnecting.
        </div>

        <div className="plasmo-flex plasmo-flex-col plasmo-space-y-3 plasmo-w-full plasmo-max-w-xs">
          <button
            onClick={handleRetryConnection}
            className="plasmo-flex plasmo-items-center plasmo-justify-center plasmo-px-4 plasmo-py-3 plasmo-bg-blue-600 plasmo-text-white plasmo-rounded plasmo-hover:bg-blue-700 plasmo-transition-colors">
            <FaWifi className="plasmo-mr-2" />
            Try Again {retryAttempts > 0 && `(${retryAttempts})`}
          </button>

          {/* <button
            onClick={handleOfflineMode}
            className="plasmo-px-4 plasmo-py-3 plasmo-bg-gray-600 plasmo-text-gray-200 plasmo-rounded plasmo-hover:bg-gray-700 plasmo-transition-colors">
            Continue Offline
          </button> */}
        </div>

        <details className="plasmo-mt-6 plasmo-w-full plasmo-max-w-sm">
          <summary className="plasmo-text-xs plasmo-text-gray-500 plasmo-cursor-pointer plasmo-hover:text-gray-400">
            Technical Details
          </summary>
          <div className="plasmo-mt-2 plasmo-p-3 plasmo-bg-gray-800 plasmo-rounded plasmo-text-xs plasmo-text-gray-400">
            <div className="plasmo-mb-2">Error: {error}</div>
            <div className="plasmo-text-gray-500">
              This usually means the story grooming session you are trying to
              join is unavailable or expired.
            </div>
          </div>
        </details>
      </div>
    )
  }

  // Session setup state
  if (!votingSession || showFirebaseTimeout) {
    return (
      <div className="plasmo-flex plasmo-flex-col plasmo-h-full">
        {showFirebaseTimeout && (
          <div className="plasmo-bg-yellow-900 plasmo-border-l-4 plasmo-border-yellow-400 plasmo-p-3 plasmo-mb-4">
            <div className="plasmo-flex plasmo-items-center">
              <FaExclamationTriangle className="plasmo-text-yellow-400 plasmo-mr-2" />
              <div className="plasmo-text-sm plasmo-text-yellow-200">
                <strong>Offline Mode:</strong> Real-time collaboration is
                unavailable. You can still manage your local team and sessions.
              </div>
            </div>
            <button
              onClick={handleRetryConnection}
              className="plasmo-text-xs plasmo-text-yellow-300 plasmo-underline plasmo-mt-1 plasmo-hover:text-yellow-100">
              Try connecting again
            </button>
          </div>
        )}

        <SessionSetup
          showFirebaseTimeout={showFirebaseTimeout}
          userNameProps={userNameHook}
          sessionProps={{
            ...sessionHook,
            onCreateSession: handleCreateSession,
            onJoinSession: handleJoinSession
          }}
        />
      </div>
    )
  }

  // Calculate data for voting interface
  const stats = getVoteStats(votingSession.votes)
  const currentUserVote = getUserVote(
    userNameHook.currentUserName,
    votingSession.votes
  )
  const participants = getParticipants(
    votingSession.participants || [],
    votingSession.votes,
    userNameHook.currentUserName
  )

  // Active voting session
  return (
    <VotingInterface
      votingSession={votingSession}
      currentSessionId={currentSessionId}
      currentUserName={userNameHook.currentUserName}
      currentUserVote={currentUserVote}
      storyPoints={storyPoints}
      stats={stats}
      participants={participants}
      onCopySessionId={copySessionId}
      onLeaveSession={handleLeaveSession}
      onVote={handleVote}
      onRevealVotes={handleRevealVotes}
      onResetVotes={handleResetVotes}
      onRemoveParticipant={handleRemoveParticipant}
    />
  )
}

export default StoryGrooming
