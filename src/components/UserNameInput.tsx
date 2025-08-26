import { FaEdit, FaSave, FaUser } from "react-icons/fa"

interface UserNameInputProps {
  currentUserName: string
  isEditingName: boolean
  tempUserName: string
  isTypingName: boolean
  setTempUserName: (name: string) => void
  handleEditName: () => void
  handleSaveName: () => void
  handleCancelEdit: () => void
  updateUserName: (name: string) => void
  saveUserName: () => void
  startTyping: () => void
}

export const UserNameInput = ({
  currentUserName,
  isEditingName,
  tempUserName,
  isTypingName,
  setTempUserName,
  handleEditName,
  handleSaveName,
  handleCancelEdit,
  updateUserName,
  saveUserName,
  startTyping
}: UserNameInputProps) => {
  return (
    <div className="plasmo-mb-4">
      <label className="plasmo-text-sm plasmo-text-gray-300 plasmo-block plasmo-mb-2">
        <FaUser className="plasmo-inline plasmo-mr-1" />
        Your name:
      </label>
      {isEditingName ? (
        <div className="plasmo-flex plasmo-gap-2">
          <input
            type="text"
            value={tempUserName}
            onChange={(e) => setTempUserName(e.target.value)}
            placeholder="Enter your name"
            className="plasmo-flex-1 plasmo-p-2 plasmo-bg-gray-800 plasmo-border plasmo-border-gray-600 plasmo-rounded plasmo-text-white"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSaveName()
              if (e.key === "Escape") handleCancelEdit()
            }}
          />
          <button
            onClick={handleSaveName}
            disabled={!tempUserName.trim()}
            className="plasmo-p-2 plasmo-bg-green-600 plasmo-text-white plasmo-rounded hover:plasmo-bg-green-700 disabled:plasmo-opacity-50"
            title="Save name">
            <FaSave />
          </button>
          <button
            onClick={handleCancelEdit}
            className="plasmo-p-2 plasmo-bg-gray-600 plasmo-text-white plasmo-rounded hover:plasmo-bg-gray-700"
            title="Cancel">
            ✕
          </button>
        </div>
      ) : (
        <div className="plasmo-flex plasmo-gap-2">
          {currentUserName && !isTypingName ? (
            <div className="plasmo-flex-1 plasmo-p-2 plasmo-bg-gray-800 plasmo-border plasmo-border-gray-600 plasmo-rounded plasmo-text-white">
              {currentUserName}
            </div>
          ) : (
            <input
              type="text"
              value={currentUserName}
              onChange={(e) => updateUserName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && currentUserName.trim()) {
                  saveUserName()
                  e.currentTarget.blur()
                }
              }}
              onBlur={saveUserName}
              onFocus={startTyping}
              placeholder="Enter your name"
              className="plasmo-flex-1 plasmo-p-2 plasmo-bg-gray-800 plasmo-border plasmo-border-gray-600 plasmo-rounded plasmo-text-white"
            />
          )}
          {currentUserName && !isTypingName && (
            <button
              onClick={handleEditName}
              className="plasmo-p-2 plasmo-bg-blue-600 plasmo-text-white plasmo-rounded hover:plasmo-bg-blue-700"
              title="Edit name">
              <FaEdit />
            </button>
          )}
        </div>
      )}
    </div>
  )
}
