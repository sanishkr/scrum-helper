import { FaInfoCircle } from "react-icons/fa"

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
          <div className="plasmo-bg-blue-900 plasmo-border plasmo-border-blue-600 plasmo-rounded plasmo-p-3 plasmo-mb-4">
            <div className="plasmo-flex plasmo-items-start">
              <FaInfoCircle className="plasmo-text-blue-400 plasmo-mr-2 plasmo-mt-0.5 plasmo-flex-shrink-0" />
              <div className="plasmo-text-sm plasmo-text-blue-200">
                <strong>Offline Mode Active:</strong> You can still use the
                extension for daily standups, but real-time collaboration with
                remote team members for story grooming won't work until
                connection is restored.
              </div>
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

      {/* {showFirebaseTimeout && (
        <div className="plasmo-mt-3 plasmo-p-3 plasmo-bg-orange-900/30 plasmo-border plasmo-border-orange-600 plasmo-rounded">
          <div className="plasmo-text-orange-300 plasmo-text-sm">
            🔧 <strong>Setup needed:</strong> To enable real-time collaboration
            with your team, Firebase configuration is required. See
            FIREBASE_SETUP.md for setup instructions.
          </div>
        </div>
      )} */}
    </div>
  )
}
