import { useContext, useEffect, useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { supabase } from '~/lib/Store'
import UserContext from '~/lib/UserContext'
import MessageReactions from './MessageReactions'
import ThreadPanel from './ThreadPanel'

export default function Message({ message }) {
  const { user } = useContext(UserContext)
  const [showThread, setShowThread] = useState(false)
  const [replyCount, setReplyCount] = useState(0)
  
  useEffect(() => {
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
    const subscription = supabase
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
      subscription.unsubscribe()
    }
  }, [message.id])

  const isCurrentUser = message.user?.id === user?.id || message.sender?.id === user?.id
  
  const timestamp = message.inserted_at
  const formattedTimestamp = timestamp
    ? formatDistanceToNow(new Date(timestamp), { addSuffix: true })
    : 'Just now'

  const displayName =
    message.user?.username ||
    message.sender?.username ||
    'Unknown User'

  return (
    <>
      <div className={`flex items-start gap-3 max-w-2xl px-4 ${isCurrentUser ? 'ml-auto flex-row-reverse' : ''}`} id={`message-${message.id}`}>
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
          {(message.user?.avatar_url || message.sender?.avatar_url) ? (
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
          {/* Thread Button */}
          <div className="text-xs mt-1">
            <button
              className="text-blue-400 hover:text-blue-300 flex items-center gap-1"
              onClick={() => setShowThread(true)}
            >
              {replyCount > 0 ? (
                <>
                  <span>{replyCount} repl{replyCount === 1 ? 'y' : 'ies'}</span>
                </>
              ) : (
                'Start thread'
              )}
            </button>
          </div>
        </div>
      </div>
      {showThread && (
        <ThreadPanel
          parentMessageId={message.id}
          onClose={() => setShowThread(false)}
        />
      )}
    </>
  )
}
