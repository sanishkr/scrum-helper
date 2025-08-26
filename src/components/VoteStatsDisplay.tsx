import { FaCalculator, FaMedal, FaVoteYea } from "react-icons/fa"

interface VoteStats {
  total: number
  average: number
  mostCommon: string | null
}

interface VoteStatsDisplayProps {
  stats: VoteStats
  isRevealed: boolean
}

export const VoteStatsDisplay = ({
  stats,
  isRevealed
}: VoteStatsDisplayProps) => {
  if (!isRevealed || stats.total === 0) {
    return null
  }

  return (
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
  )
}
