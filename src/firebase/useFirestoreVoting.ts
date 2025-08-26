import {
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  setDoc,
  updateDoc
} from "firebase/firestore"
import { useEffect, useState } from "react"

import { firestore } from "./config"

export interface Vote {
  id: string
  userId: string
  userName: string
  storyPoints: number
  timestamp: number
}

export interface VotingSession {
  id: string
  storyTitle: string
  isRevealed: boolean
  votes: { [key: string]: Vote }
  createdAt: number
  createdBy: string
  participants: string[]
}

export const useFirestoreVoting = (initialSessionId: string | null = null) => {
  const [votingSession, setVotingSession] = useState<VotingSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(
    initialSessionId
  )

  // Restore session from localStorage on mount
  useEffect(() => {
    const savedSessionId = localStorage.getItem("currentSessionId")
    if (savedSessionId && !currentSessionId) {
      console.log("Restoring session from localStorage:", savedSessionId)
      setCurrentSessionId(savedSessionId)
    } else if (!savedSessionId) {
      setLoading(false)
    }
  }, [currentSessionId])

  useEffect(() => {
    if (!currentSessionId) {
      setLoading(false)
      setVotingSession(null)
      return
    }

    console.log("Setting up Firestore listener for session:", currentSessionId)
    const sessionRef = doc(firestore, "voting-sessions", currentSessionId)

    const unsubscribe = onSnapshot(
      sessionRef,
      (snapshot) => {
        console.log(
          "Firestore snapshot received:",
          snapshot.exists(),
          snapshot.data()
        )

        if (snapshot.exists()) {
          const data = snapshot.data()
          console.log("Setting voting session data:", {
            id: currentSessionId,
            ...data
          })
          setVotingSession({ id: currentSessionId, ...data } as VotingSession)
        } else {
          console.log("No voting session data, setting to null")
          setVotingSession(null)
        }
        console.log("Setting loading to false")
        setLoading(false)
      },
      (error) => {
        console.error("Firestore error:", error)
        setError(error.message)
        setLoading(false)
      }
    )

    return () => {
      console.log("Cleaning up Firestore listener")
      unsubscribe()
    }
  }, [currentSessionId])

  const createVotingSession = async (storyTitle: string, createdBy: string) => {
    try {
      // Generate a random 6-character session ID
      const newSessionId = Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase()
      console.log("Creating voting session:", newSessionId, storyTitle)

      const sessionRef = doc(firestore, "voting-sessions", newSessionId)
      const newSession: Omit<VotingSession, "id"> = {
        storyTitle,
        isRevealed: false,
        votes: {},
        createdAt: Date.now(),
        createdBy,
        participants: [createdBy]
      }
      await setDoc(sessionRef, newSession)
      console.log("Voting session created successfully")

      // Save session ID to localStorage for persistence
      localStorage.setItem("currentSessionId", newSessionId)
      setCurrentSessionId(newSessionId)

      return newSessionId
    } catch (error) {
      console.error("Error creating voting session:", error)
      setError(error.message)
      throw error
    }
  }

  const joinSession = async (sessionId: string, userName: string) => {
    try {
      console.log("Joining session:", sessionId, userName)
      const sessionRef = doc(firestore, "voting-sessions", sessionId)

      // Check if session exists
      const sessionSnap = await getDoc(sessionRef)
      if (!sessionSnap.exists()) {
        throw new Error("Session not found")
      }

      // Add user to participants if not already there
      const sessionData = sessionSnap.data() as VotingSession
      if (!sessionData.participants.includes(userName)) {
        await updateDoc(sessionRef, {
          participants: [...sessionData.participants, userName]
        })
      }

      // Save session ID to localStorage for persistence
      localStorage.setItem("currentSessionId", sessionId)
      setCurrentSessionId(sessionId)

      return sessionId
    } catch (error) {
      console.error("Error joining session:", error)
      setError(error.message)
      throw error
    }
  }

  const leaveSession = async (userName: string) => {
    try {
      if (!currentSessionId) return

      console.log("Leaving session:", currentSessionId, userName)
      const sessionRef = doc(firestore, "voting-sessions", currentSessionId)

      // Remove user from participants and their vote
      const sessionSnap = await getDoc(sessionRef)
      if (sessionSnap.exists()) {
        const sessionData = sessionSnap.data() as VotingSession
        const updatedParticipants = sessionData.participants.filter(
          (p) => p !== userName
        )

        // Remove user's vote
        const updatedVotes = { ...sessionData.votes }
        const userVoteKey = Object.keys(updatedVotes).find(
          (key) => updatedVotes[key].userName === userName
        )
        if (userVoteKey) {
          delete updatedVotes[userVoteKey]
        }

        await updateDoc(sessionRef, {
          participants: updatedParticipants,
          votes: updatedVotes
        })
      }

      // Clear session from localStorage
      localStorage.removeItem("currentSessionId")
      setCurrentSessionId(null)
      setVotingSession(null)
    } catch (error) {
      console.error("Error leaving session:", error)
      setError(error.message)
      throw error
    }
  }

  const castVote = async (
    userId: string,
    userName: string,
    storyPoints: number
  ) => {
    try {
      if (!currentSessionId) throw new Error("No active session")

      const sessionRef = doc(firestore, "voting-sessions", currentSessionId)
      const vote: Omit<Vote, "id"> = {
        userId,
        userName,
        storyPoints,
        timestamp: Date.now()
      }

      // Update the votes field with the new vote
      await updateDoc(sessionRef, {
        [`votes.${userId}`]: vote
      })
    } catch (error) {
      console.error("Error casting vote:", error)
      setError(error.message)
      throw error
    }
  }

  const revealVotes = async () => {
    try {
      if (!currentSessionId) throw new Error("No active session")

      const sessionRef = doc(firestore, "voting-sessions", currentSessionId)
      // Toggle the isRevealed state
      const currentRevealed = votingSession?.isRevealed || false
      await updateDoc(sessionRef, {
        isRevealed: !currentRevealed
      })
    } catch (error) {
      console.error("Error toggling vote visibility:", error)
      setError(error.message)
      throw error
    }
  }

  const resetVotes = async () => {
    try {
      if (!currentSessionId) throw new Error("No active session")

      const sessionRef = doc(firestore, "voting-sessions", currentSessionId)
      await updateDoc(sessionRef, {
        votes: {},
        isRevealed: false
      })
    } catch (error) {
      console.error("Error resetting votes:", error)
      setError(error.message)
      throw error
    }
  }

  const deleteSession = async () => {
    try {
      if (!currentSessionId) throw new Error("No active session")

      const sessionRef = doc(firestore, "voting-sessions", currentSessionId)
      await deleteDoc(sessionRef)

      // Clear session from localStorage
      localStorage.removeItem("currentSessionId")
      setCurrentSessionId(null)
      setVotingSession(null)
    } catch (error) {
      console.error("Error deleting session:", error)
      setError(error.message)
      throw error
    }
  }

  return {
    votingSession,
    loading,
    error,
    currentSessionId,
    createVotingSession,
    joinSession,
    leaveSession,
    castVote,
    revealVotes,
    resetVotes,
    deleteSession
  }
}
