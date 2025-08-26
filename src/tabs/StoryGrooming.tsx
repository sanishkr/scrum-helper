import { useEffect, useState } from "react"

import { SessionSetup } from "~src/components/SessionSetup"
import { VotingInterface } from "~src/components/VotingInterface"
import { useFirestoreVoting } from "~src/firebase/useFirestoreVoting"
import { useSessionManagement } from "~src/hooks/useSessionManagement"
import { useUserName } from "~src/hooks/useUserName"
import { useVoteStats } from "~src/hooks/useVoteStats"

const StoryGrooming = () => {
  const [showFirebaseTimeout, setShowFirebaseTimeout] = useState(false)

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
    castVote,
    revealVotes,
    resetVotes
  } = useFirestoreVoting()

  const storyPoints = [1, 2, 3, 5, 8, 13, 21, "?"]

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

  // Loading state
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

  // Error state
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

  // Session setup state
  if (!votingSession || showFirebaseTimeout) {
    return (
      <SessionSetup
        showFirebaseTimeout={showFirebaseTimeout}
        userNameProps={userNameHook}
        sessionProps={{
          ...sessionHook,
          onCreateSession: handleCreateSession,
          onJoinSession: handleJoinSession
        }}
      />
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
    />
  )
}

export default StoryGrooming
