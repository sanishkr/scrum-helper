import { useState } from "react"

export const useSessionManagement = () => {
  const [storyTitle, setStoryTitle] = useState<string>("Story Estimation")
  const [joinSessionId, setJoinSessionId] = useState<string>("")
  const [isCreatingSession, setIsCreatingSession] = useState(false)
  const [isJoiningSession, setIsJoiningSession] = useState(false)

  const handleCreateSession = async (
    currentUserName: string,
    createVotingSession: (title: string, userName: string) => Promise<string>
  ) => {
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

  const handleJoinSession = async (
    currentUserName: string,
    joinSession: (sessionId: string, userName: string) => Promise<string>
  ) => {
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

  return {
    storyTitle,
    setStoryTitle,
    joinSessionId,
    setJoinSessionId,
    isCreatingSession,
    isJoiningSession,
    handleCreateSession,
    handleJoinSession
  }
}
