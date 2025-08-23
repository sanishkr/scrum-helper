const StoryGrooming = () => {
  return (
    <div className="plasmo-flex plasmo-flex-col plasmo-p-4">
      <h2 className="plasmo-text-lg plasmo-font-bold">Story Grooming</h2>
      <div className="plasmo-mt-4 plasmo-grid plasmo-grid-cols-3 plasmo-gap-2">
        {[1, 2, 3, 5, 8, 13].map((point) => (
          <button
            key={point}
            className="plasmo-bg-gray-200 plasmo-px-4 plasmo-py-2 plasmo-rounded plasmo-text-center plasmo-text-black">
            {point}
          </button>
        ))}
      </div>
      <div className="plasmo-mt-4">
        <button className="plasmo-bg-red-500 plasmo-text-white plasmo-px-4 plasmo-py-2 plasmo-rounded">
          Reset Votes
        </button>
      </div>
    </div>
  )
}

export default StoryGrooming
