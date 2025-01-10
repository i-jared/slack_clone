import { useContext, useEffect, useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { supabase } from '~/lib/Store'
import UserContext from '~/lib/UserContext'
import MessageReactions from './MessageReactions'
import ThreadPanel from './ThreadPanel'
import UserStatusDot from './UserStatusDot'

export default function Message({ message, isThread = false, isParentMessage = false }) {
  const { user } = useContext(UserContext)
  const [showThread, setShowThread] = useState(false)
  const [replyCount, setReplyCount] = useState(0)
  const [userStatus, setUserStatus] = useState('OFFLINE')

  // Message container styles
  const messageStyles = {
    display: 'flex',
    padding: '8px 0',
    position: 'relative',
    transition: 'background-color 0.15s ease',
    ':hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.02)'
    }
  }

  useEffect(() => {
    let isSubscribed = true;
    let subscription;

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
          const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
          
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

    // Set up real-time subscription for reply count
    const setupReplyCountSubscription = () => {
      subscription = supabase
        .channel(`message:${message.id}`)
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
    }

    // Fetch reply count
    const fetchReplyCount = async () => {
      if (!message.id || isThread) return;
      
      try {
        const { count, error } = await supabase
          .from('messages')
          .select('id', { count: 'exact' })
          .eq('parent_id', message.id)

        if (error) throw error;
        if (isSubscribed) setReplyCount(count || 0);
      } catch (error) {
        console.error('Error fetching reply count:', error);
      }
    }

    fetchInitialStatus();
    if (!isThread) {
      fetchReplyCount();
      setupReplyCountSubscription();
    }
    
    const statusInterval = setInterval(fetchInitialStatus, 30000);

    return () => {
      isSubscribed = false;
      clearInterval(statusInterval);
      if (subscription) {
        supabase.removeChannel(subscription);
      }
    }
  }, [message.id, message.user?.id, isThread]);

  return (
    <div style={messageStyles} className="group">
      <div className="flex-shrink-0 w-10 h-10 rounded-full overflow-hidden mr-3">
        {message.user?.avatar_url ? (
          <img
            src={message.user.avatar_url}
            alt={message.user.username}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-700 flex items-center justify-center text-yellow-400">
            {message.user?.username?.[0]?.toUpperCase() || '?'}
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-yellow-400 font-orbitron">
            {message.user?.username || 'Unknown user'}
          </span>
          <UserStatusDot status={userStatus} />
          <span className="text-xs text-gray-500">
            {formatDistanceToNow(new Date(message.inserted_at), { addSuffix: true })}
          </span>
        </div>

        <div className="text-gray-100 whitespace-pre-wrap break-words">
          {message.message}
        </div>

        <div className="flex items-center gap-4 mt-2">
          <MessageReactions message={message} />
          
          {!isThread && (
            <button
              onClick={() => setShowThread(true)}
              className="text-xs text-yellow-400/70 hover:text-yellow-400 flex items-center gap-1 transition-colors duration-150"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              {replyCount > 0 ? `${replyCount} ${replyCount === 1 ? 'reply' : 'replies'}` : 'Reply'}
            </button>
          )}
        </div>
      </div>

      {showThread && (
        <ThreadPanel
          parentMessageId={message.id}
          onClose={() => setShowThread(false)}
        />
      )}
    </div>
  )
}
