import { useEffect, useState } from "react"

export const useUserName = () => {
  const [currentUserName, setCurrentUserName] = useState<string>("")
  const [isEditingName, setIsEditingName] = useState<boolean>(false)
  const [tempUserName, setTempUserName] = useState<string>("")
  const [isTypingName, setIsTypingName] = useState<boolean>(false)

  // Load user name from localStorage on component mount
  useEffect(() => {
    const storedUserName = localStorage.getItem("currentUserName")
    if (storedUserName) {
      setCurrentUserName(storedUserName)
    }
  }, [])

  const handleEditName = () => {
    setTempUserName(currentUserName)
    setIsEditingName(true)
    setIsTypingName(false)
  }

  const handleSaveName = () => {
    if (tempUserName.trim()) {
      setCurrentUserName(tempUserName.trim())
      localStorage.setItem("currentUserName", tempUserName.trim())
      setIsEditingName(false)
      setIsTypingName(false)
    }
  }

  const handleCancelEdit = () => {
    setTempUserName("")
    setIsEditingName(false)
    setIsTypingName(false)
  }

  const updateUserName = (name: string) => {
    setCurrentUserName(name)
    setIsTypingName(true)
  }

  const saveUserName = () => {
    if (currentUserName.trim()) {
      localStorage.setItem("currentUserName", currentUserName.trim())
      setIsTypingName(false)
    }
  }

  const startTyping = () => setIsTypingName(true)

  return {
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
  }
}
