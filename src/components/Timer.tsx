import { useEffect, useState } from "react"
import { FaClock, FaPause, FaPlay, FaRedo } from "react-icons/fa"
import { useTimer } from "react-timer-hook"

interface TimerProps {
  minutes: number
  onExpire?: () => void
  className?: string
  persistKey?: string // Key for localStorage persistence
  onStateChange?: (isRunning: boolean, hasStarted: boolean) => void // Callback for state changes
  onPauseRef?: (pauseFn: () => void) => void // Callback to provide pause function to parent
}

export const Timer = ({
  minutes,
  onExpire,
  className = "",
  persistKey,
  onStateChange,
  onPauseRef
}: TimerProps) => {
  const [isRunning, setIsRunning] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)

  // Calculate expiry time (with persistence support)
  const getExpiryTimestamp = (startTime?: number) => {
    const time = new Date()
    if (startTime) {
      // Restore from saved start time
      time.setTime(startTime + minutes * 60 * 1000)
    } else {
      // New timer
      time.setSeconds(time.getSeconds() + minutes * 60)
    }
    return time
  }

  // Save timer state to localStorage
  const saveTimerState = (
    startTime: number,
    running: boolean,
    pausedAt?: number
  ) => {
    if (persistKey) {
      const timerState = {
        startTime,
        running,
        minutes,
        savedAt: Date.now(),
        pausedAt: pausedAt || null // Time when timer was paused
      }
      localStorage.setItem(`timer_${persistKey}`, JSON.stringify(timerState))
    }
  }

  // Load timer state from localStorage
  const loadTimerState = () => {
    if (persistKey) {
      const saved = localStorage.getItem(`timer_${persistKey}`)
      if (saved) {
        try {
          return JSON.parse(saved)
        } catch (e) {
          console.error("Failed to parse timer state:", e)
        }
      }
    }
    return null
  }

  // Clear timer state from localStorage
  const clearTimerState = () => {
    if (persistKey) {
      localStorage.removeItem(`timer_${persistKey}`)
    }
  }

  const {
    totalSeconds,
    seconds,
    minutes: timerMinutes,
    hours,
    days,
    isRunning: timerIsRunning,
    start,
    pause,
    resume,
    restart
  } = useTimer({
    expiryTimestamp: getExpiryTimestamp(),
    onExpire: () => {
      setIsRunning(false)
      setHasStarted(false)
      clearTimerState()
      onExpire?.()
    },
    autoStart: false
  })

  // Restore timer state on component mount
  useEffect(() => {
    const savedState = loadTimerState()
    if (savedState) {
      const { startTime, running, minutes: savedMinutes, pausedAt } = savedState
      const now = Date.now()
      const totalDuration = savedMinutes * 60

      let elapsed: number
      if (pausedAt && !running) {
        // Timer was paused, calculate elapsed time only up to pause point
        elapsed = (pausedAt - startTime) / 1000
      } else {
        // Timer was running, calculate total elapsed time
        elapsed = (now - startTime) / 1000
      }

      if (elapsed < totalDuration) {
        // Timer is still valid, restore it
        const remainingTime = totalDuration - elapsed
        const newExpiryTime = new Date()
        newExpiryTime.setSeconds(newExpiryTime.getSeconds() + remainingTime)

        setHasStarted(true)
        restart(newExpiryTime, running) // Only auto-start if it was running
        setIsRunning(running)

        console.log(
          `Timer restored: ${Math.floor(remainingTime)}s remaining, running: ${running}`
        )
      } else {
        // Timer has expired while extension was closed
        clearTimerState()
        setHasStarted(false)
        setIsRunning(false)
        // Trigger expiry callback if timer expired while closed
        setTimeout(() => onExpire?.(), 100)
      }
    }
  }, [])

  // Save timer state when it changes
  useEffect(() => {
    if (hasStarted && persistKey) {
      const startTime = Date.now() - (minutes * 60 - totalSeconds) * 1000
      const pausedAt = !isRunning ? Date.now() : undefined
      saveTimerState(startTime, isRunning, pausedAt)
    }
  }, [isRunning, hasStarted, totalSeconds])

  // Notify parent component of state changes
  useEffect(() => {
    onStateChange?.(isRunning, hasStarted)
  }, [isRunning, hasStarted]) // Removed onStateChange from dependencies

  // Format time display
  const formatTime = () => {
    if (timerMinutes > 0 || hours > 0 || days > 0) {
      return `${timerMinutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
    }
    return `${seconds}`
  }

  // Get progress percentage for visual indicator
  const getProgress = () => {
    const totalTime = minutes * 60
    const remainingTime = totalSeconds
    return ((totalTime - remainingTime) / totalTime) * 100
  }

  // Handle play/pause
  const handlePlayPause = () => {
    if (!hasStarted) {
      setHasStarted(true)
      setIsRunning(true)
      start()
      if (persistKey) {
        saveTimerState(Date.now(), true)
      }
    } else if (timerIsRunning) {
      setIsRunning(false)
      pause()
      // Save paused state immediately
      if (persistKey) {
        const startTime = Date.now() - (minutes * 60 - totalSeconds) * 1000
        saveTimerState(startTime, false, Date.now())
      }
    } else {
      setIsRunning(true)
      resume()
    }
  }

  // Handle reset
  const handleReset = () => {
    setIsRunning(false)
    setHasStarted(false)
    restart(getExpiryTimestamp(), false)
    clearTimerState()
  }

  // Force pause timer (for external calls)
  const forcePause = () => {
    if (timerIsRunning && hasStarted) {
      setIsRunning(false)
      pause()
      // Save paused state immediately
      if (persistKey) {
        const startTime = Date.now() - (minutes * 60 - totalSeconds) * 1000
        saveTimerState(startTime, false, Date.now())
      }
      console.log("Timer force paused by parent component")
    }
  }

  // Provide pause function to parent component
  useEffect(() => {
    onPauseRef?.(forcePause)
  }, [onPauseRef, timerIsRunning, hasStarted, totalSeconds])

  // Determine timer state color
  const getTimerColor = () => {
    if (!hasStarted) return "text-gray-400"
    if (totalSeconds < 60) return "text-red-400" // Last minute
    if (totalSeconds < 300) return "text-yellow-400" // Last 5 minutes
    return "text-green-400"
  }

  // Get background color based on state
  const getBackgroundColor = () => {
    if (!hasStarted) return "bg-gray-700"
    if (totalSeconds < 60) return "bg-red-900/30"
    if (totalSeconds < 300) return "bg-yellow-900/30"
    return "bg-green-900/30"
  }

  return (
    <div
      className={`plasmo-flex plasmo-items-center plasmo-gap-1.5 plasmo-p-1.5 plasmo-rounded ${getBackgroundColor()} plasmo-border plasmo-border-gray-600 ${className}`}>
      {/* Timer Display */}
      <div className="plasmo-flex plasmo-items-center plasmo-gap-1.5">
        <FaClock className={`plasmo-w-2.5 plasmo-h-2.5 ${getTimerColor()}`} />
        <span
          className={`plasmo-text-sm plasmo-font-mono plasmo-font-bold ${getTimerColor()}`}>
          {formatTime()}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="plasmo-flex-1 plasmo-h-1 plasmo-bg-gray-600 plasmo-rounded-full plasmo-overflow-hidden plasmo-min-w-8">
        <div
          className={`plasmo-h-full plasmo-transition-all plasmo-duration-1000 ${
            !hasStarted
              ? "plasmo-bg-gray-500"
              : totalSeconds < 30
                ? "plasmo-bg-red-400"
                : totalSeconds < 60
                  ? "plasmo-bg-yellow-400"
                  : "plasmo-bg-green-400"
          }`}
          style={{ width: `${hasStarted ? getProgress() : 0}%` }}
        />
      </div>

      {/* Controls */}
      <div className="plasmo-flex plasmo-gap-0.5">
        <button
          onClick={handlePlayPause}
          className="plasmo-p-1 plasmo-text-gray-400 hover:plasmo-text-white plasmo-transition-colors plasmo-bg-gray-700 plasmo-rounded plasmo-hover:bg-gray-600"
          title={
            !hasStarted
              ? "Start timer"
              : isRunning
                ? "Pause timer"
                : "Resume timer"
          }>
          {!hasStarted || !timerIsRunning ? (
            <FaPlay className="plasmo-w-2.5 plasmo-h-2.5" />
          ) : (
            <FaPause className="plasmo-w-2.5 plasmo-h-2.5" />
          )}
        </button>

        {hasStarted && (
          <button
            onClick={handleReset}
            className="plasmo-p-1 plasmo-text-gray-400 hover:plasmo-text-white plasmo-transition-colors plasmo-bg-gray-700 plasmo-rounded plasmo-hover:bg-gray-600"
            title="Reset timer">
            <FaRedo className="plasmo-w-2.5 plasmo-h-2.5" />
          </button>
        )}
      </div>
    </div>
  )
}
