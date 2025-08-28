import { useEffect, useState } from "react"
import { FaArrowLeft, FaArrowRight, FaCheck, FaRandom } from "react-icons/fa"

import UserCard from "~src/components/UserCard"

type User = {
  id: string
  name: string
}

const DailyStandup = () => {
  const [users, setUsers] = useState<User[]>([])
  const [shuffledUsers, setShuffledUsers] = useState<User[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)

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

  // Clear the shuffled list
  const handleClearShuffledUsers = () => {
    setShuffledUsers([])
    localStorage.removeItem("shuffledUsers")
    setCurrentIndex(0)
  }

  // Navigate to the previous user
  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : shuffledUsers.length - 1))
  }

  // Navigate to the next user
  const handleNext = () => {
    setCurrentIndex((prev) => (prev < shuffledUsers.length - 1 ? prev + 1 : 0))
  }

  return (
    <div className="plasmo-flex plasmo-flex-row plasmo-h-full plasmo-p-4 plasmo-w-full">
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
        <div className="plasmo-mt-4 plasmo-flex plasmo-flex-col plasmo-items-center plasmo-gap-4">
          {shuffledUsers.length > 0 && (
            <>
              <UserCard user={shuffledUsers[currentIndex]} />
              <div className="plasmo-flex plasmo-gap-4">
                <button
                  onClick={() => setCurrentIndex((prev) => prev - 1)}
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
                  onClick={() => setCurrentIndex((prev) => prev + 1)}
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
