import { useEffect, useState } from "react"
import { FaClipboardList, FaTasks, FaUsers } from "react-icons/fa" // Import icons

import DailyStandup from "./tabs/DailyStandup"
import StoryGrooming from "./tabs/StoryGrooming"
import UsersList from "./tabs/UsersList"

import "~/src/style.css"

function IndexPopup() {
  const [activeTab, setActiveTab] = useState("users-list")

  // Load the active tab from localStorage on component mount
  useEffect(() => {
    const savedTab = localStorage.getItem("activeTab")
    if (savedTab) {
      setActiveTab(savedTab)
    }
  }, [])

  // Save the active tab to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("activeTab", activeTab)
  }, [activeTab])

  return (
    <div className="plasmo-flex plasmo-flex-col plasmo-w-96 plasmo-h-72 plasmo-bg-gray-900 plasmo-bg-opacity-90 plasmo-text-white plasmo-shadow-lg">
      <div className="plasmo-flex plasmo-justify-around">
        <button
          className={`plasmo-rounded-b-lg plasmo-flex plasmo-items-center plasmo-gap-2 plasmo-px-8 plasmo-py-2 plasmo-transition-all ${
            activeTab === "users-list"
              ? "plasmo-bg-blue-600 plasmo-text-white plasmo-shadow-md plasmo-shadow-blue-400 hover:plasmo-bg-blue-700"
              : "plasmo-bg-gray-800 plasmo-text-gray-400 hover:plasmo-bg-gray-700 hover:plasmo-text-white"
          }`}
          onClick={() => setActiveTab("users-list")}>
          <FaUsers /> Users
        </button>
        <button
          className={`plasmo-rounded-b-lg plasmo-flex plasmo-items-center plasmo-gap-2 plasmo-px-8 plasmo-py-2 plasmo-transition-all ${
            activeTab === "standup"
              ? "plasmo-bg-blue-600 plasmo-text-white plasmo-shadow-md plasmo-shadow-blue-400 hover:plasmo-bg-blue-700"
              : "plasmo-bg-gray-800 plasmo-text-gray-400 hover:plasmo-bg-gray-700 hover:plasmo-text-white"
          }`}
          onClick={() => setActiveTab("standup")}>
          <FaClipboardList /> Standup
        </button>
        <button
          className={`plasmo-rounded-b-lg plasmo-flex plasmo-items-center plasmo-gap-2 plasmo-px-7 plasmo-py-2 plasmo-transition-all ${
            activeTab === "grooming"
              ? "plasmo-bg-blue-600 plasmo-text-white plasmo-shadow-md plasmo-shadow-blue-400 hover:plasmo-bg-blue-700"
              : "plasmo-bg-gray-800 plasmo-text-gray-400 hover:plasmo-bg-gray-700 hover:plasmo-text-white"
          }`}
          onClick={() => setActiveTab("grooming")}>
          <FaTasks /> Grooming
        </button>
      </div>
      <div className="plasmo-flex plasmo-flex-1 plasmo-overflow-auto">
        {activeTab === "users-list" && <UsersList />}
        {activeTab === "standup" && <DailyStandup />}
        {activeTab === "grooming" && <StoryGrooming />}
      </div>
    </div>
  )
}

export default IndexPopup
