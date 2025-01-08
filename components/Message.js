import { useContext, useEffect } from 'react'
import { formatDistanceToNow } from 'date-fns'
import UserContext from '~/lib/UserContext'
import MessageReactions from './MessageReactions'

export default function Message({ message }) {
  const { user } = useContext(UserContext)
  
  // Log the incoming message data
  useEffect(() => {
    console.log('📩 Message component received:', {
      messageId: message.id,
      message: message.message,
      sender: message.sender || message.user,
      currentUser: user,
      isDirect: message.isDirect
    })
  }, [message, user])

  const isCurrentUser = message.user?.id === user?.id || message.sender?.id === user?.id
  
  // Handle timestamp display
  const timestamp = message.inserted_at
  const formattedTimestamp = timestamp ? 
    formatDistanceToNow(new Date(timestamp), { addSuffix: true }) : 
    'Just now'

  // Get the correct user display name
  const displayName = message.user?.username || 
    message.sender?.username || 
    message.user?.email?.split('@')[0] || 
    message.sender?.email?.split('@')[0] || 
    'Unknown User'

  console.log('🎨 Rendering Message:', {
    messageId: message.id,
    senderId: message.sender?.id || message.user?.id,
    currentUserId: user?.id,
    isCurrentUser,
    displayName,
    timestamp: formattedTimestamp
  })

  return (
    <div className={`flex items-start gap-3 max-w-2xl px-4 ${isCurrentUser ? 'ml-auto flex-row-reverse' : ''}`}>
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
        {message.user?.avatar_url || message.sender?.avatar_url ? (
          <img
            src={message.user?.avatar_url || message.sender?.avatar_url}
            alt={displayName}
            className="w-10 h-10 rounded-full"
          />
        ) : (
          <span className="text-lg text-yellow-400">
            {displayName.charAt(0).toUpperCase()}
          </span>
        )}
      </div>
      <div className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`}>
        <div className="flex items-center gap-2">
          <span className="text-sm text-yellow-400 font-orbitron">{displayName}</span>
          <span className="text-xs text-gray-500">{formattedTimestamp}</span>
        </div>
        <div className={`mt-1 px-4 py-2 rounded-lg ${
          isCurrentUser 
            ? 'bg-yellow-500 text-black' 
            : 'bg-gray-700 text-white'
        }`}>
          {message.message}
        </div>
        <MessageReactions messageId={message.id} />
      </div>
    </div>
  )
}
