import { useContext, useEffect, useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { supabase } from '~/lib/Store'
import UserContext from '~/lib/UserContext'
import MessageReactions from './MessageReactions'
import ThreadPanel from './ThreadPanel'
import UserStatusDot from './UserStatusDot'

export default function Message({ message, isThread = false }) {
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
        <UserStatusDot status={userStatus} className="absolute bottom-0 right-0" />
      </div>

      {/* Message Content */}
      <div className="flex-1 min-w-0">
        {/* Message Header */}
        <div className="flex items-center space-x-2">
          <span className="font-medium text-yellow-400">
            {message.user?.username || 'Unknown User'}
          </span>
          <span className="text-xs text-gray-400">
            {formatDistanceToNow(new Date(message.inserted_at), { addSuffix: true })}
          </span>
          {!isThread && (
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
          {message.message}
        </div>

        {/* Message Reactions */}
        <MessageReactions messageId={message.id} />

        {/* Thread Panel */}
        {showThread && (
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
