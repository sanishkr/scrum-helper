import { useEffect, useRef, useState } from "react"
import { FaEdit, FaTrash } from "react-icons/fa"

type User = {
  id: string
  name: string
}

const UsersList = () => {
  const [users, setUsers] = useState<User[]>([])
  const [newUserName, setNewUserName] = useState("")
  const [editingUserId, setEditingUserId] = useState<string | null>(null)

  // Load users from localStorage on component mount
  useEffect(() => {
    const storedUsers = localStorage.getItem("users")
    if (storedUsers) {
      setUsers(JSON.parse(storedUsers))
    }
  }, [])

  // Save users to localStorage whenever the user list changes
  const isFirstRender = useRef(true)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    if (users.length > 0) {
      localStorage.setItem("users", JSON.stringify(users))
    } else {
      localStorage.removeItem("users")
    }
  }, [users])

  const handleAddUser = () => {
    if (!newUserName.trim()) return

    if (editingUserId) {
      // Update existing user
      setUsers((prev) =>
        prev.map((user) =>
          user.id === editingUserId ? { ...user, name: newUserName } : user
        )
      )
      setEditingUserId(null)
    } else {
      // Add new user
      setUsers((prev) => [
        ...prev,
        { id: Date.now().toString(), name: newUserName }
      ])
    }

    setNewUserName("")
  }

  const handleEditUser = (id: string) => {
    const user = users.find((user) => user.id === id)
    if (user) {
      setNewUserName(user.name)
      setEditingUserId(id)
    }
  }

  const handleRemoveUser = (id: string) => {
    setUsers((prev) => prev.filter((user) => user.id !== id))
  }

  return (
    <div className="plasmo-flex plasmo-flex-col plasmo-p-4">
      <h2 className="plasmo-text-lg plasmo-font-bold">Users List</h2>
      <div className="plasmo-mt-4 plasmo-flex plasmo-gap-2">
        <input
          type="text"
          value={newUserName}
          onChange={(e) => setNewUserName(e.target.value)}
          placeholder="Enter user name"
          className="plasmo-border plasmo-p-2 plasmo-rounded plasmo-flex-1 plasmo-text-black"
        />
        <button
          onClick={handleAddUser}
          className="plasmo-bg-blue-600 hover:plasmo-bg-blue-700 plasmo-text-white plasmo-px-4 plasmo-py-2 plasmo-rounded">
          {editingUserId ? "Update" : "Add"}
        </button>
      </div>
      <div className="plasmo-mt-4 plasmo-flex plasmo-flex-col plasmo-gap-2">
        {users.map((user) => (
          <div
            key={user.id}
            className="plasmo-flex plasmo-justify-between plasmo-items-center plasmo-border plasmo-p-2 plasmo-rounded">
            <span>{user.name}</span>
            <div>
              <button
                onClick={() => handleEditUser(user.id)}
                className="plasmo-mr-2 plasmo-text-blue-600 hover:plasmo-text-blue-700">
                <FaEdit />
              </button>
              <button
                onClick={() => handleRemoveUser(user.id)}
                className="plasmo-text-red-600 hover:plasmo-text-red-700">
                <FaTrash />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default UsersList
