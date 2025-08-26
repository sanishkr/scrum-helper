import { SessionManagement } from "~src/components/SessionManagement"
import { UserNameInput } from "~src/components/UserNameInput"

interface SessionSetupProps {
  showFirebaseTimeout: boolean
  userNameProps: {
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
  sessionProps: {
    storyTitle: string
    setStoryTitle: (title: string) => void
    joinSessionId: string
    setJoinSessionId: (id: string) => void
    isCreatingSession: boolean
    isJoiningSession: boolean
    onCreateSession: () => void
    onJoinSession: () => void
  }
}

export const SessionSetup = ({
  showFirebaseTimeout,
  userNameProps,
  sessionProps
}: SessionSetupProps) => {
  return (
    <div className="plasmo-flex plasmo-flex-col plasmo-h-full plasmo-p-4">
      <div className="plasmo-mb-4">
        <h2 className="plasmo-text-lg plasmo-font-bold">Planning Poker</h2>
        <div className="plasmo-text-sm plasmo-text-gray-400 plasmo-mt-1">
          Create or join a session
        </div>

        {showFirebaseTimeout && (
          <div className="plasmo-mt-2 plasmo-p-2 plasmo-bg-yellow-900/30 plasmo-border plasmo-border-yellow-600 plasmo-rounded">
            <div className="plasmo-text-yellow-300 plasmo-text-xs">
              ⚠️ Firestore connection issue. Please check your configuration.
            </div>
          </div>
        )}
      </div>

      <UserNameInput {...userNameProps} />

      <SessionManagement
        {...sessionProps}
        currentUserName={userNameProps.currentUserName}
      />

      <div className="plasmo-mt-4 plasmo-p-3 plasmo-bg-blue-900/30 plasmo-border plasmo-border-blue-600 plasmo-rounded">
        <div className="plasmo-text-blue-300 plasmo-text-sm">
          📡 <strong>Real-time collaboration:</strong> Once you create or join a
          session, all team members can vote together in real-time!
        </div>
      </div>

      {showFirebaseTimeout && (
        <div className="plasmo-mt-3 plasmo-p-3 plasmo-bg-red-900/30 plasmo-border plasmo-border-red-600 plasmo-rounded">
          <div className="plasmo-text-red-300 plasmo-text-sm">
            ⚠️ <strong>Firestore not configured:</strong> To enable real-time
            collaboration, please set up Firebase. See FIREBASE_SETUP.md for
            instructions.
          </div>
        </div>
      )}
    </div>
  )
}
