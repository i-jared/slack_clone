import { useState, useContext } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { supabase } from '~/lib/Store'
import { UserContext } from '../lib/UserContext'
import MessageReactions from './MessageReactions'
import ThreadPanel from './ThreadPanel'

export default function Message({ message, isThread = false }) {
  const { user } = useContext(UserContext)
  const [showThread, setShowThread] = useState(false)
  const [replyCount, setReplyCount] = useState(0)
  
  useEffect(() => {
    let isSubscribed = true;

    // Fetch reply count when message loads
    const fetchReplyCount = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('id', { count: 'exact' })
        .eq('parent_id', message.id)

      if (!error && data) {
        setReplyCount(data.length)
      }
    }

    fetchReplyCount()

    // Subscribe to changes in replies
    const threadSubscription = supabase
      .channel(`thread-count-${message.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `parent_id=eq.${message.id}`
        },
        () => {
          fetchReplyCount()
        }
      )
      .subscribe()

    return () => {
      isSubscribed = false;
      threadSubscription.unsubscribe();
    }
  }, [message.id])

  const isCurrentUser = message.user?.id === user?.id || message.sender?.id === user?.id
  
  const timestamp = message.inserted_at
  const formattedTimestamp = timestamp
    ? formatDistanceToNow(new Date(timestamp), { addSuffix: true })
    : 'Just now'

  const displayName =
    message.user?.display_name ||
    message.user?.username ||
    message.sender?.display_name ||
    message.sender?.username ||
    'Unknown User'

  const handleThreadClick = () => {
    // First, dispatch an event to close any open thread
    window.dispatchEvent(new CustomEvent('threadPanelState', { 
      detail: { isOpen: false }
    }))

    // Small delay to allow the previous thread to close
    setTimeout(() => {
      setShowThread(true)
      // Then dispatch event to show this thread
      window.dispatchEvent(new CustomEvent('threadPanelState', { 
        detail: { isOpen: true }
      }))
    }, 100)
  }

  return (
    <div 
      id={`message-${message.id}`}
      className={`group flex space-x-3 px-2 py-1 hover:bg-gray-800/50 rounded-lg transition-colors duration-150 ${
        message.status === 'pending' ? 'opacity-50' : ''
      }`}
    >
      {/* User Avatar */}
      <div className="relative flex-shrink-0">
        <div className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden">
          {message.user?.avatar_url && (
            <img 
              src={message.user.avatar_url} 
              alt={message.user?.username || 'User'} 
              className="w-full h-full object-cover"
            />
          )}
        </div>
      </div>

      {/* Message Content */}
      <div className="flex-1 min-w-0">
        {/* Message Header */}
        <div className="flex items-center space-x-2">
          <span className="font-medium text-yellow-400">
            {displayName}
          </span>
          <span className="text-xs text-gray-400">
            {formatDistanceToNow(new Date(message.inserted_at), { addSuffix: true })}
          </span>
          {!isThread && !message.parent_id && (
            <button
              onClick={handleThreadClick}
              className="text-xs text-gray-400 hover:text-yellow-400 transition-colors"
            >
              {replyCount > 0 ? `${replyCount} replies` : 'Start thread'}
            </button>
          )}
        </div>

        {/* Message Text */}
        <div className="text-gray-100 whitespace-pre-wrap break-words">
          {message.message_text.startsWith('[File:') ? (
            <div className="mt-2">
              <a 
                href={message.message_text.match(/\((.*?)\)/)?.[1]} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block hover:opacity-90 transition-opacity"
              >
                <img 
                  src={message.message_text.match(/\((.*?)\)/)?.[1]} 
                  alt={message.message_text.match(/\[(File: .*?)\]/)?.[1]} 
                  className="max-w-md rounded-lg shadow-lg cursor-pointer"
                />
              </a>
            </div>
          ) : (
            message.message_text
          )}
        </div>

        {/* Message Reactions */}
        {!message.parent_id && <MessageReactions messageId={message.id} />}

        {/* Thread Panel */}
        {showThread && !message.parent_id && (
          <ThreadPanel
            parentMessageId={message.id}
            onClose={() => {
              setShowThread(false)
              window.dispatchEvent(new CustomEvent('threadPanelState', { 
                detail: { isOpen: false }
              }))
            }}
          />
        )}
      </div>
    </div>
  )
}
