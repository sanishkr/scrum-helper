type User = {
  id: string
  name: string
}

const UserCard = ({ user }: { user: User }) => {
  return (
    <div className="plasmo-flex plasmo-flex-col plasmo-items-center plasmo-justify-center plasmo-w-48 plasmo-h-24 plasmo-border plasmo-rounded-lg plasmo-shadow-md plasmo-bg-gray-800 plasmo-border-gray-600 plasmo-flex-shrink-0">
      <h3 className="plasmo-text-lg plasmo-font-bold plasmo-mb-1 plasmo-text-white plasmo-text-center plasmo-px-2 plasmo-truncate plasmo-w-full">
        {user.name}
      </h3>
      <p className="plasmo-text-gray-400 plasmo-text-xs plasmo-truncate">ID: {user.id}</p>
    </div>
  )
}

export default UserCard
