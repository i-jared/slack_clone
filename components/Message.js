import { useContext } from 'react'
import UserContext from '~/lib/UserContext'
import { formatDistanceToNow } from 'date-fns'

export default function Message({ message }) {
  const { user } = useContext(UserContext)
  const isCurrentUser = message.sender_id === user?.id || message.user_id === user?.id
  const messageUser = message.sender || message.user || { username: 'Unknown User' }
  
  // Ensure timestamp is valid
  const getTimeAgo = (timestamp) => {
    try {
      if (!timestamp) return 'Just now'
      const date = new Date(timestamp)
      if (isNaN(date.getTime())) return 'Just now'
      return formatDistanceToNow(date, { addSuffix: true })
    } catch (error) {
      console.error('Error formatting timestamp:', error)
      return 'Just now'
    }
  }

  return (
    <div className={`px-4 py-2 hover:bg-gray-800/50 ${isCurrentUser ? 'ml-auto' : ''}`}>
      <div className={`flex items-start gap-3 max-w-2xl ${isCurrentUser ? 'ml-auto flex-row-reverse' : ''}`}>
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
          {messageUser.avatar_url ? (
            <img
              src={messageUser.avatar_url}
              alt={messageUser.username}
              className="w-10 h-10 rounded-full"
            />
          ) : (
            <span className="text-xl text-yellow-400">
              {messageUser.username?.[0]?.toUpperCase() || '?'}
            </span>
          )}
        </div>
        <div className={`flex-1 ${isCurrentUser ? 'text-right' : ''}`}>
          <div className={`flex items-center gap-2 mb-1 ${isCurrentUser ? 'justify-end' : ''}`}>
            <span className="font-orbitron text-yellow-400">
              {messageUser.username}
            </span>
            <span className="text-xs text-gray-400">
              {getTimeAgo(message.inserted_at)}
            </span>
          </div>
          <div className={`text-gray-100 ${isCurrentUser ? 'bg-yellow-500/10' : 'bg-gray-800'} rounded-lg p-3 inline-block max-w-full`}>
            {message.message}
          </div>
        </div>
      </div>
    </div>
  )
}
