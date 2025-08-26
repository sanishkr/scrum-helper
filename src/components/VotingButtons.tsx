interface VotingButtonsProps {
  storyPoints: (number | string)[]
  currentUserVote?: { storyPoints: number }
  currentUserName: string
  onVote: (points: number | string) => void
}

export const VotingButtons = ({
  storyPoints,
  currentUserVote,
  currentUserName,
  onVote
}: VotingButtonsProps) => {
  return (
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
              onClick={() => onVote(point)}
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
  )
}
