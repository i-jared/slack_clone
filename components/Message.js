import { useContext, useEffect, useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { supabase } from '~/lib/Store'
import UserContext from '~/lib/UserContext'
import MessageReactions from './MessageReactions'
import ThreadPanel from './ThreadPanel'
import UserStatusDot from './UserStatusDot'

export default function Message({ message }) {
  const { user } = useContext(UserContext)
  const [showThread, setShowThread] = useState(false)
  const [replyCount, setReplyCount] = useState(0)
  const [userStatus, setUserStatus] = useState('OFFLINE')
  
  useEffect(() => {
    let isSubscribed = true;

    // Initial status fetch
    const fetchInitialStatus = async () => {
      if (!message.user?.id) return;
      
      try {
        const { data: userData, error } = await supabase
          .from('users')
          .select('status, updated_at')
          .eq('id', message.user.id)
          .single()
        
        if (error) throw error;
        
        if (userData && isSubscribed) {
          const lastUpdate = userData.updated_at ? new Date(userData.updated_at) : null;
          const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000); // More strict: 2 minutes
          
          // Only show as online if status is ONLINE and updated within last 2 minutes
          setUserStatus(
            userData.status === 'ONLINE' && lastUpdate && lastUpdate > twoMinutesAgo 
              ? 'ONLINE' 
              : 'OFFLINE'
          );
        }
      } catch (error) {
        console.error('Error fetching user status:', error);
        if (isSubscribed) setUserStatus('OFFLINE');
      }
    }

    fetchInitialStatus();
    const fetchInterval = setInterval(fetchInitialStatus, 30000); // Refresh every 30 seconds

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

    // Subscribe to user status changes
    const statusSubscription = supabase
      .channel(`user-status-${message.user?.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'users',
          filter: `id=eq.${message.user?.id}`
        },
        (payload) => {
          if (!isSubscribed) return;
          
          const lastUpdate = payload.new.updated_at ? new Date(payload.new.updated_at) : null;
          const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
          
          setUserStatus(
            payload.new.status === 'ONLINE' && lastUpdate && lastUpdate > twoMinutesAgo 
              ? 'ONLINE' 
              : 'OFFLINE'
          );
        }
      )
      .subscribe()

    return () => {
      isSubscribed = false;
      clearInterval(fetchInterval);
      threadSubscription.unsubscribe();
      statusSubscription.unsubscribe();
    }
  }, [message.id, message.user?.id])

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
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center relative">
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
          <div className="absolute bottom-0 right-0 transform translate-x-1/4 translate-y-1/4">
            <UserStatusDot status={userStatus} />
          </div>
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
