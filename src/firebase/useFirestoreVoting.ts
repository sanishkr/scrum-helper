import { collection, deleteDoc, doc, getDoc, getDocs, onSnapshot, query, setDoc, updateDoc, where } from "firebase/firestore";
import { useEffect, useState } from "react";



import { firestore } from "./config";


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
  expiresAt: number
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

    // Note: Removed automatic cleanup to save Firestore reads
    // Cleanup will happen naturally when users try to access expired sessions
  }, [currentSessionId])

  // Function to extend session expiry (reset to 10 days from now)
  // Only call this sparingly to save writes
  const extendSessionExpiry = async (sessionId: string) => {
    try {
      const sessionRef = doc(firestore, "voting-sessions", sessionId)
      const tenDaysInMs = 10 * 24 * 60 * 60 * 1000
      await updateDoc(sessionRef, {
        expiresAt: Date.now() + tenDaysInMs
      })
    } catch (error) {
      console.error("Error extending session expiry:", error)
      // Don't throw error as this is a background operation
    }
  }

  // Manual cleanup function - only call when needed to save reads
  const cleanupExpiredSessions = async () => {
    try {
      const now = Date.now()
      const sessionsRef = collection(firestore, "voting-sessions")
      const expiredSessionsQuery = query(
        sessionsRef,
        where("expiresAt", "<=", now)
      )

      const querySnapshot = await getDocs(expiredSessionsQuery)
      const deletePromises = querySnapshot.docs.map((doc) => deleteDoc(doc.ref))

      if (deletePromises.length > 0) {
        await Promise.all(deletePromises)
        console.log(`Cleaned up ${deletePromises.length} expired sessions`)
      }
    } catch (error) {
      console.error("Error cleaning up expired sessions:", error)
      // Don't throw error as this is a background cleanup operation
    }
  }

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
          const sessionData = { id: currentSessionId, ...data } as VotingSession

          // Check if session has expired
          if (sessionData.expiresAt && sessionData.expiresAt <= Date.now()) {
            console.log("Session has expired, removing from localStorage")
            localStorage.removeItem("currentSessionId")
            setCurrentSessionId(null)
            setVotingSession(null)
            // Optionally delete the expired session
            deleteDoc(snapshot.ref).catch(console.error)
          } else {
            console.log("Setting voting session data:", sessionData)
            setVotingSession(sessionData)
          }
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
      const now = Date.now()
      const tenDaysInMs = 10 * 24 * 60 * 60 * 1000 // 10 days in milliseconds
      const newSession: Omit<VotingSession, "id"> = {
        storyTitle,
        isRevealed: false,
        votes: {},
        createdAt: now,
        createdBy,
        participants: [createdBy],
        expiresAt: now + tenDaysInMs
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
    if (!userName.trim()) return

    setLoading(true)
    try {
      const sessionRef = doc(firestore, "voting-sessions", sessionId)
      const sessionSnap = await getDoc(sessionRef)

      if (!sessionSnap.exists()) {
        setError("Session not found")
        return
      }

      const sessionData = sessionSnap.data() as VotingSession

      // Client-side expiry check to avoid unnecessary writes
      if (sessionData.expiresAt && isSessionExpired(sessionData.expiresAt)) {
        setError("Session has expired")
        return
      }

      // Add user to participants if not already there
      if (!sessionData.participants.includes(userName)) {
        await updateDoc(sessionRef, {
          expiresAt: Date.now() + 10 * 24 * 60 * 60 * 1000, // Extend expiry by 10 days
          participants: [...sessionData.participants, userName]
        })
      }

      setCurrentSessionId(sessionId)
      localStorage.setItem("currentSessionId", sessionId)
      return sessionId
    } catch (err) {
      console.error("Error joining session:", err)
      setError(err instanceof Error ? err.message : "Failed to join session")
    } finally {
      setLoading(false)
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
          expiresAt: Date.now() + 10 * 24 * 60 * 60 * 1000, // Extend expiry by 10 days
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

      // Client-side expiry check to avoid unnecessary writes
      if (
        votingSession?.expiresAt &&
        isSessionExpired(votingSession.expiresAt)
      ) {
        setError("Session has expired")
        throw new Error("Session has expired")
      }

      const vote: Omit<Vote, "id"> = {
        userId,
        userName,
        storyPoints,
        timestamp: Date.now()
      }

      // Update the votes field with the new vote
      await updateDoc(sessionRef, {
        expiresAt: Date.now() + 10 * 24 * 60 * 60 * 1000, // Extend expiry by 10 days
        [`votes.${userId}`]: vote
      })

      // Note: Removed automatic expiry extension to save writes
      // The session expiry is set for 10 days which should be sufficient
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
        expiresAt: Date.now() + 10 * 24 * 60 * 60 * 1000, // Extend expiry by 10 days
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
        expiresAt: Date.now() + 10 * 24 * 60 * 60 * 1000, // Extend expiry by 10 days
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

  // Utility function to get days until expiry
  const getDaysUntilExpiry = (expiresAt: number): number => {
    const now = Date.now()
    const msUntilExpiry = expiresAt - now
    return Math.ceil(msUntilExpiry / (24 * 60 * 60 * 1000))
  }

  // Utility function to check if session is expired (client-side check)
  const isSessionExpired = (expiresAt: number): boolean => {
    return expiresAt <= Date.now()
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
    deleteSession,
    getDaysUntilExpiry,
    isSessionExpired,
    cleanupExpiredSessions, // Export for manual cleanup if needed
    extendSessionExpiry // Export for manual extension if needed
  }
}