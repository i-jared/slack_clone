import { useContext, useState, useEffect } from 'react'
import UserContext from '~/lib/UserContext'
import { deleteMessage, addReaction, removeReaction } from '~/lib/Store'
import TrashIcon from '~/components/TrashIcon'
import { replaceEmojis } from './StarWarsEmoji'

const formatTime = (timestamp) => {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  })
}

// Emoji reaction button that appears on hover
const ReactionButton = ({ onClick }) => (
  <button 
    onClick={onClick}
    className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-yellow-400"
    title="Add reaction"
  >
    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
      <line x1="9" y1="9" x2="9.01" y2="9"></line>
      <line x1="15" y1="9" x2="15.01" y2="9"></line>
    </svg>
  </button>
)

// Emoji picker popup
const EmojiPicker = ({ onSelect, onClose }) => {
  const commonEmojis = ['👍', '❤️', '😂', '🎉', '🚀', '👀', '👋']
  
  return (
    <div className="absolute bottom-full mb-2 bg-gray-700 rounded shadow-lg p-2 z-10 sw-modal">
      <div className="flex space-x-2">
        {commonEmojis.map(emoji => (
          <button
            key={emoji}
            onClick={() => {
              onSelect(emoji)
              onClose()
            }}
            className="hover:bg-gray-600 p-1 rounded"
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  )
}

const Message = ({ message }) => {
  const { user } = useContext(UserContext)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [localMessage, setLocalMessage] = useState(message)
  const isAuthor = user?.id === message.user_id
  const canDelete = isAuthor || ['admin', 'moderator'].includes(user?.appRole)

  // Update local message when prop changes
  useEffect(() => {
    setLocalMessage(message)
  }, [message])

  const timestamp = new Date(message.inserted_at).toLocaleTimeString()
  const username = message.author?.username || 'Unknown User'
  const initials = username
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()

  // Group reactions by emoji
  const reactionGroups = (localMessage.reactions || []).reduce((groups, reaction) => {
    if (!groups[reaction.emoji]) {
      groups[reaction.emoji] = []
    }
    groups[reaction.emoji].push(reaction)
    return groups
  }, {})

  const handleEmojiSelect = async (emoji) => {
    try {
      console.log('Handling emoji select:', {
        messageId: localMessage.id,
        emoji,
        userId: user.id,
        currentReactions: localMessage.reactions
      })

      // Check if user has already reacted with this emoji
      const existingReaction = localMessage.reactions?.find(
        r => r.user_id === user.id && r.emoji === emoji
      )

      // Update local state immediately
      const currentReactions = localMessage.reactions || []
      let newReactions

      if (existingReaction) {
        console.log('Removing existing reaction:', existingReaction)
        // Remove reaction locally
        newReactions = currentReactions.filter(
          r => !(r.user_id === user.id && r.emoji === emoji)
        )
        // Remove from database
        await removeReaction(localMessage.id, emoji, user.id)
      } else {
        console.log('Adding new reaction')
        // Add reaction locally
        const newReaction = {
          emoji,
          user_id: user.id,
          user: {
            id: user.id,
            username: user.email.split('@')[0]
          }
        }
        newReactions = [...currentReactions, newReaction]
        // Add to database
        await addReaction(localMessage.id, emoji, user.id)
      }

      // Update local state
      setLocalMessage(prev => ({
        ...prev,
        reactions: newReactions
      }))

    } catch (error) {
      console.error('Error handling reaction:', error)
      // Revert local state on error
      setLocalMessage(message)
    }
  }

  const renderAttachment = (attachment) => {
    const isImage = attachment.type?.startsWith('image/')
    const isVideo = attachment.type?.startsWith('video/')
    const isAudio = attachment.type?.startsWith('audio/')

    if (isImage) {
      return (
        <div className="relative max-w-sm group">
          <img 
            src={attachment.url} 
            alt={attachment.name}
            className="rounded shadow-lg hover:shadow-xl transition-shadow"
          />
          <a 
            href={attachment.url}
            download
            className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded cursor-pointer"
            onClick={(e) => {
              e.preventDefault();
              // Create a temporary anchor element
              const link = document.createElement('a');
              link.href = attachment.url;
              link.download = attachment.name; // Set the download filename
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
          >
            <svg 
              className="w-8 h-8 text-white" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
          </a>
        </div>
      )
    }

    if (isVideo) {
      return (
        <video 
          controls 
          className="max-w-sm rounded shadow-lg"
        >
          <source src={attachment.url} type={attachment.type} />
          Your browser does not support the video tag.
        </video>
      )
    }

    if (isAudio) {
      return (
        <audio 
          controls 
          className="max-w-sm"
        >
          <source src={attachment.url} type={attachment.type} />
          Your browser does not support the audio tag.
        </audio>
      )
    }

    // Default file attachment with download button
    return (
      <div className="flex items-center gap-2 bg-gray-700 rounded p-2 group hover:bg-gray-600 transition-colors">
        <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
        <span className="text-sm truncate flex-1">{attachment.name}</span>
        <a 
          href={attachment.url}
          download={attachment.name}
          className="px-2 py-1 bg-gray-600 rounded text-sm hover:bg-gray-500 transition-colors"
          target="_blank"
          rel="noopener noreferrer"
        >
          Download
        </a>
      </div>
    )
  }

  const renderMessageContent = (content) => {
    const starWarsContent = replaceEmojis(content)
    return (
      <div className="message-content">
        {starWarsContent.split('\n').map((line, i) => (
          <div key={i} className="message-line">{line}</div>
        ))}
      </div>
    )
  }

  return (
    <div className="py-1 group hover:bg-gray-700/50 px-4">
      <div className="flex items-start space-x-3">
        {message.author?.dbUser?.avatar_url ? (
          <img 
            src={message.author.dbUser.avatar_url}
            alt={username}
            className="w-9 h-9 rounded object-cover flex-shrink-0 sw-profile-icon"
            title={username}
          />
        ) : (
          <div 
            className="w-9 h-9 rounded bg-gray-600 flex items-center justify-center text-sm font-medium text-white flex-shrink-0"
            title={username}
          >
            {initials}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <span className="font-medium text-yellow-400">{username}</span>
            <span className="text-xs text-gray-400">{formatTime(message.inserted_at)}</span>
          </div>
          <div className="mt-1 text-gray-100">
            {renderMessageContent(message.message)}
            {message.attachments?.map((attachment, index) => (
              <div key={index} className="mt-2">
                {renderAttachment(attachment)}
              </div>
            ))}
          </div>
          {/* Reactions */}
          {Object.keys(reactionGroups).length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {Object.entries(reactionGroups).map(([emoji, reactions]) => (
                <button
                  key={emoji}
                  onClick={() => handleEmojiSelect(emoji)}
                  className={`
                    flex items-center space-x-1 text-sm px-2 py-0.5 rounded 
                    ${reactions.some(r => r.user_id === user?.id)
                      ? 'bg-yellow-500/20 text-yellow-400'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }
                  `}
                  title={reactions.map(r => r.user?.username).join(', ')}
                >
                  <span>{emoji}</span>
                  <span>{reactions.length}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <ReactionButton onClick={() => setShowEmojiPicker(!showEmojiPicker)} />
            {showEmojiPicker && (
              <EmojiPicker
                onSelect={handleEmojiSelect}
                onClose={() => setShowEmojiPicker(false)}
              />
            )}
          </div>
          {canDelete && (
            <button
              onClick={() => deleteMessage(message.id)}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-400"
              title="Delete message"
            >
              <TrashIcon />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default Message
