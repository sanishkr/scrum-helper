type User = {
  id: string
  name: string
}

const UserCard = ({ user }: { user: User }) => {
  return (
    <div className="plasmo-flex plasmo-flex-col plasmo-items-center plasmo-justify-center plasmo-w-48 plasmo-h-32 plasmo-border plasmo-rounded-lg plasmo-shadow-md plasmo-bg-gray-200 plasmo-shadow-gray-50">
      <h3 className="plasmo-text-2xl plasmo-font-bold plasmo-mb-2 plasmo-text-purple-800">
        {user.name}
      </h3>
      <p className="plasmo-text-gray-500 plasmo-text-xs">User ID: {user.id}</p>
    </div>
  )
}

export default UserCard
