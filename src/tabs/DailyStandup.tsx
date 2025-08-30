import { useCallback, useEffect, useState } from "react"
import {
  FaArrowLeft,
  FaArrowRight,
  FaCheck,
  FaRandom,
  FaTimes
} from "react-icons/fa"

import { Timer } from "~src/components/Timer"
import UserCard from "~src/components/UserCard"

// Constants
const SPEAKING_TIME_MINUTES = 2 // Fixed 2 minute speaking time

type User = {
  id: string
  name: string
}

const DailyStandup = () => {
  const [users, setUsers] = useState<User[]>([])
  const [shuffledUsers, setShuffledUsers] = useState<User[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)

  // Timer state - now we'll track timers for all users
  const [userTimers, setUserTimers] = useState<{
    [userId: string]: { hasTimer: boolean; isRunning: boolean }
  }>({})
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState("")
  const [currentTimerPauseFn, setCurrentTimerPauseFn] = useState<
    (() => void) | null
  >(null)

  // Check for persisted timer when user changes
  useEffect(() => {
    const currentUser = shuffledUsers[currentIndex]
    if (currentUser) {
      const timerKey = `dailystandup_${currentUser.id}`
      const savedTimer = localStorage.getItem(`timer_${timerKey}`)
      if (savedTimer) {
        console.log(`Found persisted timer for user ${currentUser.name}`)
        // Update userTimers state
        setUserTimers((prev) => ({
          ...prev,
          [currentUser.id]: { hasTimer: true, isRunning: false } // Will be updated by Timer component
        }))
      } else {
        // Initialize timer state for user
        setUserTimers((prev) => ({
          ...prev,
          [currentUser.id]: { hasTimer: false, isRunning: false }
        }))
      }
    }
  }, [shuffledUsers, currentIndex])

  // Load users and shuffled users from localStorage on component mount
  useEffect(() => {
    const storedUsers = localStorage.getItem("users")
    const storedShuffledUsers = localStorage.getItem("shuffledUsers")
    const storedCurrentIndex = localStorage.getItem("currentIndex")

    if (storedUsers) {
      setUsers(JSON.parse(storedUsers))
    }

    if (storedShuffledUsers) {
      setShuffledUsers(JSON.parse(storedShuffledUsers))
    }

    if (storedCurrentIndex) {
      setCurrentIndex(parseInt(storedCurrentIndex, 10))
    }
  }, [])

  // Save shuffled users to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("shuffledUsers", JSON.stringify(shuffledUsers))
  }, [shuffledUsers])

  // Save current index to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("currentIndex", currentIndex.toString())
  }, [currentIndex])

  // Shuffle users
  const handleShuffleUsers = () => {
    const shuffled = [...users]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    setShuffledUsers(shuffled)
    setCurrentIndex(0) // Reset to the first user
  }

  // Clear the shuffled list and user timers
  const handleClearShuffledUsers = () => {
    setShuffledUsers([])
    localStorage.removeItem("shuffledUsers")
    setCurrentIndex(0)
    setUserTimers({})
    // clear all timers from localStorage
    users.forEach((user) => {
      localStorage.removeItem(`timer_dailystandup_${user.id}`)
    })
  }

  // Navigate to the previous user
  const handlePrev = () => {
    // Pause current user's timer if running
    pauseCurrentUserTimer()
    setCurrentIndex((prev) => prev - 1)
    // setCurrentIndex((prev) => (prev > 0 ? prev - 1 : shuffledUsers.length - 1))
  }

  // Navigate to the next user
  const handleNext = () => {
    // Pause current user's timer if running
    pauseCurrentUserTimer()
    setCurrentIndex((prev) => prev + 1)
    // setCurrentIndex((prev) => (prev < shuffledUsers.length - 1 ? prev + 1 : 0))
  }

  // Pause current user's timer when switching
  const pauseCurrentUserTimer = () => {
    const currentUser = shuffledUsers[currentIndex]
    if (currentUser) {
      const timerState = userTimers[currentUser.id]
      if (timerState?.isRunning && currentTimerPauseFn) {
        console.log(
          `Auto-pausing timer for ${currentUser.name} when switching users`
        )
        currentTimerPauseFn() // Actually pause the timer
      }
    }
  }

  // Timer functions
  const handleTimerExpire = () => {
    const currentUser = shuffledUsers[currentIndex]

    // Only show toast for current user who actually had a timer
    if (currentUser && userTimers[currentUser.id]?.hasTimer) {
      setToastMessage(`⏰ Time's up for ${currentUser.name}!`)
      setShowToast(true)
      // Auto-hide toast after 3 seconds
      setTimeout(() => setShowToast(false), 3000)

      // Update timer state
      setUserTimers((prev) => ({
        ...prev,
        [currentUser.id]: { hasTimer: false, isRunning: false }
      }))
    }

    console.log(`Timer expired for ${currentUser?.name}`)
  }

  // Callback to update timer state from Timer component
  const handleTimerStateChange = useCallback(
    (isRunning: boolean, hasStarted: boolean) => {
      const currentUser = shuffledUsers[currentIndex]
      if (currentUser) {
        setUserTimers((prev) => ({
          ...prev,
          [currentUser.id]: { hasTimer: hasStarted, isRunning }
        }))
      }
    },
    [shuffledUsers, currentIndex]
  )

  // Callback to receive pause function from Timer component
  const handleTimerPauseRef = useCallback((pauseFn: () => void) => {
    setCurrentTimerPauseFn(() => pauseFn)
  }, [])

  // Get current user's timer key for persistence
  const getCurrentTimerKey = () => {
    const currentUser = shuffledUsers[currentIndex]
    return currentUser ? `dailystandup_${currentUser.id}` : undefined
  }

  return (
    <div className="plasmo-flex plasmo-flex-row plasmo-h-full plasmo-p-4 plasmo-w-full plasmo-relative">
      {/* Toast Notification */}
      {showToast && (
        <div className="plasmo-absolute plasmo-top-4 plasmo-right-4 plasmo-z-50 plasmo-bg-orange-500 plasmo-text-white plasmo-px-4 plasmo-py-2 plasmo-rounded-lg plasmo-shadow-lg plasmo-flex plasmo-items-center plasmo-gap-2 plasmo-animate-bounce">
          <span className="plasmo-text-sm plasmo-font-medium">
            {toastMessage}
          </span>
          <button
            onClick={() => setShowToast(false)}
            className="plasmo-text-white hover:plasmo-text-gray-200 plasmo-ml-2">
            <FaTimes className="plasmo-w-3 plasmo-h-3" />
          </button>
        </div>
      )}

      {/* Left side: Buttons */}
      <div className="plasmo-flex plasmo-flex-col plasmo-gap-4 plasmo-w-1/3 plasmo-pr-4 plasmo-border-r plasmo-border-gray-600">
        <h2 className="plasmo-text-lg plasmo-font-bold">Actions</h2>
        <button
          onClick={handleShuffleUsers}
          className="plasmo-bg-green-600 hover:plasmo-bg-green-700 plasmo-text-white plasmo-px-4 plasmo-py-2 plasmo-rounded plasmo-flex plasmo-items-center plasmo-gap-1 plasmo-text-xs">
          <FaRandom />
          Shuffle
        </button>
        {shuffledUsers.length > 0 && (
          <button
            onClick={handleClearShuffledUsers}
            className="plasmo-bg-red-600 hover:plasmo-bg-red-700 plasmo-text-white plasmo-px-4 plasmo-py-2 plasmo-rounded plasmo-flex plasmo-items-center plasmo-gap-1">
            <FaCheck />
            Done
          </button>
        )}
      </div>

      {/* Right side: List of users */}
      <div className="plasmo-flex plasmo-flex-col plasmo-w-full plasmo-pl-4 plasmo-overflow-y-auto plasmo-items-center">
        <h2 className="plasmo-text-lg plasmo-font-bold">Shuffled Users</h2>

        {/* Timer Display - Always show timer component */}
        {shuffledUsers.length > 0 && (
          <div className="plasmo-mt-2 plasmo-w-full plasmo-max-w-48 plasmo-relative">
            <Timer
              key={getCurrentTimerKey()} // Force remount for each user
              minutes={SPEAKING_TIME_MINUTES}
              onExpire={handleTimerExpire}
              className="plasmo-w-full"
              persistKey={getCurrentTimerKey()}
              onStateChange={handleTimerStateChange}
              onPauseRef={handleTimerPauseRef}
            />
          </div>
        )}

        <div className="plasmo-mt-2 plasmo-flex plasmo-flex-col plasmo-items-center plasmo-gap-3">
          {shuffledUsers.length > 0 && (
            <>
              <UserCard user={shuffledUsers[currentIndex]} />

              <div className="plasmo-flex plasmo-gap-4">
                <button
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                  className={`plasmo-px-4 plasmo-py-2 plasmo-rounded plasmo-flex plasmo-items-center plasmo-gap-1 ${
                    currentIndex === 0
                      ? "plasmo-bg-gray-500 plasmo-text-gray-300"
                      : "plasmo-bg-blue-500 plasmo-text-white hover:plasmo-bg-blue-600"
                  }`}>
                  <FaArrowLeft />
                  {/* Prev */}
                </button>
                <button
                  onClick={handleNext}
                  disabled={currentIndex === shuffledUsers.length - 1}
                  className={`plasmo-px-4 plasmo-py-2 plasmo-rounded plasmo-flex plasmo-items-center plasmo-gap-1 ${
                    currentIndex === shuffledUsers.length - 1
                      ? "plasmo-bg-gray-500 plasmo-text-gray-300"
                      : "plasmo-bg-blue-500 plasmo-text-white hover:plasmo-bg-blue-600"
                  }`}>
                  <FaArrowRight />
                  {/* Next */}
                </button>
              </div>
            </>
          )}
          {shuffledUsers.length === 0 && (
            <div className="plasmo-text-gray-500">No shuffled users yet.</div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DailyStandup
