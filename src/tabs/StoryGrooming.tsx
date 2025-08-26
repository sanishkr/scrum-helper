import { useEffect, useState } from "react"
import {
  FaCalculator,
  FaCopy,
  FaEdit,
  FaEye,
  FaEyeSlash,
  FaMedal,
  FaPlay,
  FaPlus,
  FaRedo,
  FaSave,
  FaUser,
  FaVoteYea
} from "react-icons/fa"

import { useFirestoreVoting, type Vote } from "~src/firebase/useFirestoreVoting"

const StoryGrooming = () => {
  const [currentUserName, setCurrentUserName] = useState<string>("")
  const [isEditingName, setIsEditingName] = useState<boolean>(false)
  const [tempUserName, setTempUserName] = useState<string>("")
  const [isTypingName, setIsTypingName] = useState<boolean>(false)
  const [storyTitle, setStoryTitle] = useState<string>("Story Estimation")
  const [joinSessionId, setJoinSessionId] = useState<string>("")
  const [isCreatingSession, setIsCreatingSession] = useState(false)
  const [isJoiningSession, setIsJoiningSession] = useState(false)
  const [showFirebaseTimeout, setShowFirebaseTimeout] = useState(false)

  const {
    votingSession,
    loading,
    error,
    currentSessionId,
    createVotingSession,
    joinSession,
    leaveSession,
    castVote,
    revealVotes,
    resetVotes
  } = useFirestoreVoting()

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

  console.log({
    loading,
    error,
    votingSession: !!votingSession,
    votingSessionData: votingSession
  })

  const storyPoints = [1, 2, 3, 5, 8, 13, 21, "?"]

  // Load user name from localStorage on component mount
  useEffect(() => {
    const storedUserName = localStorage.getItem("currentUserName")
    if (storedUserName) {
      setCurrentUserName(storedUserName)
      // Don't set isTypingName to false here, let it remain false by default
    }
  }, [])

  // Only save to localStorage when explicitly requested (not on every keystroke)

  const handleEditName = () => {
    setTempUserName(currentUserName)
    setIsEditingName(true)
    setIsTypingName(false) // Not typing in main input when in edit mode
  }

  const handleSaveName = () => {
    if (tempUserName.trim()) {
      setCurrentUserName(tempUserName.trim())
      localStorage.setItem("currentUserName", tempUserName.trim())
      setIsEditingName(false)
      setIsTypingName(false)
    }
  }

  const handleCancelEdit = () => {
    setTempUserName("")
    setIsEditingName(false)
    setIsTypingName(false)
  }

  // Remove the automatic session creation
  // useEffect(() => {
  //   if (!loading && !votingSession && !error) {
  //     createVotingSession(storyTitle)
  //   }
  // }, [loading, votingSession, error, createVotingSession, storyTitle])

  const handleCreateSession = async () => {
    if (!currentUserName) {
      alert("Please select a user first!")
      return
    }

    try {
      setIsCreatingSession(true)
      await createVotingSession(storyTitle, currentUserName)
    } catch (error) {
      console.error("Failed to create session:", error)
      alert("Failed to create session")
    } finally {
      setIsCreatingSession(false)
    }
  }

  const handleJoinSession = async () => {
    if (!currentUserName) {
      alert("Please select a user first!")
      return
    }

    if (!joinSessionId.trim()) {
      alert("Please enter a session ID!")
      return
    }

    try {
      setIsJoiningSession(true)
      await joinSession(joinSessionId.toUpperCase(), currentUserName)
      setJoinSessionId("")
    } catch (error) {
      console.error("Failed to join session:", error)
      alert("Failed to join session: " + error.message)
    } finally {
      setIsJoiningSession(false)
    }
  }

  const handleLeaveSession = async () => {
    if (!currentUserName) return

    try {
      await leaveSession(currentUserName)
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
    if (!currentUserName) {
      alert("Please enter your name first!")
      return
    }

    try {
      // Use currentUserName as userId for simplicity
      await castVote(currentUserName, currentUserName, Number(points))
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

  const getUserVote = (userName: string) => {
    if (!votingSession?.votes) return null
    return (
      Object.values(votingSession.votes).find(
        (vote) => vote.userName === userName
      ) || null
    )
  }

  const getVoteStats = () => {
    if (!votingSession?.votes) return { total: 0, average: 0, mostCommon: null }

    const votes = Object.values(votingSession.votes) as Vote[]
    const total = votes.length

    if (total === 0) return { total: 0, average: 0, mostCommon: null }

    const numericVotes = votes.filter((v) => typeof v.storyPoints === "number")
    const average =
      numericVotes.length > 0
        ? numericVotes.reduce((sum, v) => sum + v.storyPoints, 0) /
          numericVotes.length
        : 0

    // Find most common vote
    const voteCounts: { [key: string]: number } = {}
    votes.forEach((vote) => {
      const key = vote.storyPoints.toString()
      voteCounts[key] = (voteCounts[key] || 0) + 1
    })

    const mostCommon = Object.entries(voteCounts).sort(
      ([, a], [, b]) => b - a
    )[0]?.[0]

    return { total, average: Math.round(average * 10) / 10, mostCommon }
  }

  if (loading && !showFirebaseTimeout) {
    return (
      <div className="plasmo-flex plasmo-flex-col plasmo-items-center plasmo-justify-center plasmo-h-full">
        <div className="plasmo-text-gray-400 plasmo-mb-2">
          Connecting to Firestore...
        </div>
        <div className="plasmo-text-xs plasmo-text-gray-500 plasmo-text-center plasmo-max-w-sm">
          If this takes too long, check your Firebase configuration in
          .env.local
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="plasmo-flex plasmo-flex-col plasmo-items-center plasmo-justify-center plasmo-h-full plasmo-text-red-400">
        <div>Firestore Error: {error}</div>
        <div className="plasmo-text-sm plasmo-mt-2 plasmo-text-center">
          Please check your Firebase configuration in{" "}
          <code className="plasmo-bg-gray-800 plasmo-px-1 plasmo-rounded">
            .env.local
          </code>
          <br />
          <span className="plasmo-text-xs plasmo-text-gray-400">
            See FIREBASE_SETUP.md for setup instructions
          </span>
        </div>
      </div>
    )
  }

  // Show session creation UI if no session is active OR if Firebase timed out
  if (!votingSession || showFirebaseTimeout) {
    return (
      <div className="plasmo-flex plasmo-flex-col plasmo-h-full plasmo-p-4">
        <div className="plasmo-mb-4">
          <h2 className="plasmo-text-lg plasmo-font-bold">Planning Poker</h2>
          <div className="plasmo-text-sm plasmo-text-gray-400 plasmo-mt-1">
            Create or join a session
          </div>

          {showFirebaseTimeout && (
            <div className="plasmo-mt-2 plasmo-p-2 plasmo-bg-yellow-900/30 plasmo-border plasmo-border-yellow-600 plasmo-rounded">
              <div className="plasmo-text-yellow-300 plasmo-text-xs">
                ⚠️ Firestore connection issue. Please check your configuration.
              </div>
            </div>
          )}
        </div>

        {/* User Name Input */}
        <div className="plasmo-mb-4">
          <label className="plasmo-text-sm plasmo-text-gray-300 plasmo-block plasmo-mb-2">
            <FaUser className="plasmo-inline plasmo-mr-1" />
            Your name:
          </label>
          {isEditingName ? (
            <div className="plasmo-flex plasmo-gap-2">
              <input
                type="text"
                value={tempUserName}
                onChange={(e) => setTempUserName(e.target.value)}
                placeholder="Enter your name"
                className="plasmo-flex-1 plasmo-p-2 plasmo-bg-gray-800 plasmo-border plasmo-border-gray-600 plasmo-rounded plasmo-text-white"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveName()
                  if (e.key === "Escape") handleCancelEdit()
                }}
              />
              <button
                onClick={handleSaveName}
                disabled={!tempUserName.trim()}
                className="plasmo-p-2 plasmo-bg-green-600 plasmo-text-white plasmo-rounded hover:plasmo-bg-green-700 disabled:plasmo-opacity-50"
                title="Save name">
                <FaSave />
              </button>
              <button
                onClick={handleCancelEdit}
                className="plasmo-p-2 plasmo-bg-gray-600 plasmo-text-white plasmo-rounded hover:plasmo-bg-gray-700"
                title="Cancel">
                ✕
              </button>
            </div>
          ) : (
            <div className="plasmo-flex plasmo-gap-2">
              {currentUserName && !isTypingName ? (
                <div className="plasmo-flex-1 plasmo-p-2 plasmo-bg-gray-800 plasmo-border plasmo-border-gray-600 plasmo-rounded plasmo-text-white">
                  {currentUserName}
                </div>
              ) : (
                <input
                  type="text"
                  value={currentUserName}
                  onChange={(e) => {
                    setCurrentUserName(e.target.value)
                    setIsTypingName(true)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && currentUserName.trim()) {
                      localStorage.setItem(
                        "currentUserName",
                        currentUserName.trim()
                      )
                      setIsTypingName(false)
                      e.currentTarget.blur()
                    }
                  }}
                  onBlur={() => {
                    if (currentUserName.trim()) {
                      localStorage.setItem(
                        "currentUserName",
                        currentUserName.trim()
                      )
                      setIsTypingName(false)
                    }
                  }}
                  onFocus={() => setIsTypingName(true)}
                  placeholder="Enter your name"
                  className="plasmo-flex-1 plasmo-p-2 plasmo-bg-gray-800 plasmo-border plasmo-border-gray-600 plasmo-rounded plasmo-text-white"
                />
              )}
              {currentUserName && !isTypingName && (
                <button
                  onClick={handleEditName}
                  className="plasmo-p-2 plasmo-bg-blue-600 plasmo-text-white plasmo-rounded hover:plasmo-bg-blue-700"
                  title="Edit name">
                  <FaEdit />
                </button>
              )}
            </div>
          )}
        </div>

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
            onClick={handleCreateSession}
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
            onClick={handleJoinSession}
            disabled={
              !currentUserName || !joinSessionId.trim() || isJoiningSession
            }
            className="plasmo-flex plasmo-items-center plasmo-gap-2 plasmo-bg-green-600 plasmo-text-white plasmo-px-4 plasmo-py-2 plasmo-rounded plasmo-text-sm hover:plasmo-bg-green-700 disabled:plasmo-opacity-50 disabled:plasmo-cursor-not-allowed plasmo-w-full plasmo-justify-center">
            <FaPlay />
            {isJoiningSession ? "Joining..." : "Join Session"}
          </button>
        </div>

        <div className="plasmo-mt-4 plasmo-p-3 plasmo-bg-blue-900/30 plasmo-border plasmo-border-blue-600 plasmo-rounded">
          <div className="plasmo-text-blue-300 plasmo-text-sm">
            📡 <strong>Real-time collaboration:</strong> Once you create or join
            a session, all team members can vote together in real-time!
          </div>
        </div>

        {showFirebaseTimeout && (
          <div className="plasmo-mt-3 plasmo-p-3 plasmo-bg-red-900/30 plasmo-border plasmo-border-red-600 plasmo-rounded">
            <div className="plasmo-text-red-300 plasmo-text-sm">
              ⚠️ <strong>Firestore not configured:</strong> To enable real-time
              collaboration, please set up Firebase. See FIREBASE_SETUP.md for
              instructions.
            </div>
          </div>
        )}
      </div>
    )
  }

  const stats = getVoteStats()
  const currentUserVote = getUserVote(currentUserName)

  // Get all participants with their vote status
  const getParticipants = () => {
    if (!votingSession) return []

    const participants = votingSession.participants || []
    return participants.map((participantName) => {
      const vote = getUserVote(participantName)
      return {
        name: participantName,
        hasVoted: !!vote,
        vote: vote?.storyPoints,
        isCurrentUser: participantName === currentUserName
      }
    })
  }

  const participants = getParticipants()

  return (
    <div className="plasmo-flex plasmo-h-full plasmo-p-4 plasmo-w-full">
      {/* Left Panel - Voting Interface */}
      <div className="plasmo-flex plasmo-flex-col plasmo-pr-4 plasmo-border-r plasmo-border-gray-600 plasmo-min-w-0 plasmo-w-2/3">
        {/* Header */}
        <div className="plasmo-mb-3">
          <h2 className="plasmo-text-md plasmo-font-bold">Planning Poker</h2>
          <div className="plasmo-text-xs plasmo-text-gray-400 plasmo-mt-1 plasmo-truncate">
            {votingSession?.storyTitle}
          </div>

          {/* Session ID Display */}
          <div className="plasmo-flex plasmo-items-center plasmo-justify-between plasmo-mt-2">
            <div className="plasmo-flex plasmo-items-center plasmo-gap-1">
              <span className="plasmo-text-xs plasmo-text-gray-500">ID:</span>
              <code className="plasmo-bg-gray-800 plasmo-px-1 plasmo-py-0.5 plasmo-rounded plasmo-text-xs plasmo-text-blue-300">
                {currentSessionId}
              </code>
              <button
                onClick={copySessionId}
                className="plasmo-p-0.5 plasmo-text-gray-400 hover:plasmo-text-white plasmo-transition-colors"
                title="Copy session ID">
                <FaCopy className="plasmo-w-3 plasmo-h-3" />
              </button>
            </div>
            <button
              onClick={handleLeaveSession}
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
            <button
              onClick={handleEditName}
              className="plasmo-p-1.5 plasmo-bg-blue-600 plasmo-text-white plasmo-rounded hover:plasmo-bg-blue-700"
              title="Change name">
              <FaEdit className="plasmo-w-3 plasmo-h-3" />
            </button>
          </div>
        </div>

        {/* Voting Buttons */}
        <div className="plasmo-mb-3">
          <div className="plasmo-text-xs plasmo-text-gray-300 plasmo-mb-2">
            Story Points:
          </div>
          <div className="plasmo-grid plasmo-grid-cols-4 plasmo-gap-1.5">
            {storyPoints.map((point) => {
              const isSelected = currentUserVote?.storyPoints === Number(point)
              return (
                <button
                  key={point}
                  onClick={() => handleVote(point)}
                  disabled={!currentUserName}
                  className={`plasmo-px-2 plasmo-py-1.5 plasmo-rounded plasmo-text-center plasmo-font-bold plasmo-text-sm plasmo-transition-all ${
                    isSelected
                      ? "plasmo-bg-blue-600 plasmo-text-white plasmo-ring-1 plasmo-ring-blue-400"
                      : "plasmo-bg-gray-700 plasmo-text-gray-200 hover:plasmo-bg-gray-600"
                  } ${!currentUserName ? "plasmo-opacity-50 plasmo-cursor-not-allowed" : "plasmo-cursor-pointer"}`}>
                  {point}
                </button>
              )
            })}
          </div>
        </div>

        {/* Controls */}
        <div className="plasmo-flex plasmo-gap-1.5 plasmo-mb-3">
          <button
            onClick={handleRevealVotes}
            className="plasmo-flex plasmo-items-center plasmo-gap-1 plasmo-bg-green-600 plasmo-text-white plasmo-px-2 plasmo-py-1.5 plasmo-rounded plasmo-text-xs hover:plasmo-bg-green-700">
            {votingSession?.isRevealed ? (
              <FaEyeSlash className="plasmo-w-3 plasmo-h-3" />
            ) : (
              <FaEye className="plasmo-w-3 plasmo-h-3" />
            )}
            {votingSession?.isRevealed ? "Hide" : "Reveal"}
          </button>
          <button
            onClick={handleResetVotes}
            className="plasmo-flex plasmo-items-center plasmo-gap-1 plasmo-bg-red-600 plasmo-text-white plasmo-px-2 plasmo-py-1.5 plasmo-rounded plasmo-text-xs hover:plasmo-bg-red-700">
            <FaRedo className="plasmo-w-3 plasmo-h-3" />
            Reset
          </button>
        </div>

        {/* Vote Statistics */}
        {votingSession?.isRevealed && stats.total > 0 && (
          <div className="plasmo-mb-3 plasmo-p-2 plasmo-bg-gray-800 plasmo-rounded">
            <div className="plasmo-text-xs plasmo-text-gray-300 plasmo-mb-1.5">
              Results:
            </div>
            <div className="plasmo-grid plasmo-grid-cols-3 plasmo-gap-2 plasmo-text-xs">
              <div className="plasmo-flex plasmo-items-center plasmo-gap-1">
                <FaVoteYea
                  className="plasmo-w-3 plasmo-h-3 plasmo-text-blue-400"
                  title="Total number of votes cast"
                />
                <span>{stats.total}</span>
              </div>
              <div className="plasmo-flex plasmo-items-center plasmo-gap-1">
                <FaCalculator
                  className="plasmo-w-3 plasmo-h-3 plasmo-text-green-400"
                  title="Average story points (excluding non-numeric votes)"
                />
                <span>{stats.average}</span>
              </div>
              <div className="plasmo-flex plasmo-items-center plasmo-gap-1">
                <FaMedal
                  className="plasmo-w-3 plasmo-h-3 plasmo-text-yellow-400"
                  title="Most common vote among all participants"
                />
                <span>{stats.mostCommon}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Right Panel - Participants */}
      <div className="plasmo-flex plasmo-flex-col plasmo-pl-4">
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

                <div className="plasmo-flex plasmo-items-center plasmo-flex-shrink-0 plasmo-ml-2">
                  {votingSession?.isRevealed ? (
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
                      className="plasmo-w-2 plasmo-h-2 plasmo-bg-green-500 plasmo-rounded-full"
                      title="Voted"
                    />
                  ) : (
                    <div
                      className="plasmo-w-2 plasmo-h-2 plasmo-bg-gray-500 plasmo-rounded-full"
                      title="Not voted"
                    />
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
    </div>
  )
}

export default StoryGrooming
