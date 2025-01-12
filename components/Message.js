import { useState, useContext, useEffect } from 'react'
import { formatDistanceToNow, format } from 'date-fns'
import { supabase, useStore } from '~/lib/Store'
import { UserContext } from '../lib/UserContext'
import MessageReactions from './MessageReactions'
import ThreadPanel from './ThreadPanel'
import classNames from 'classnames'
import Avatar from './Avatar'
import { createLogger } from '~/lib/logger'
import { DotsHorizontalIcon, ReplyIcon, StarIcon } from '@heroicons/react/outline'

const logger = createLogger('Message')

const formatDate = (date) => {
  try {
    const messageDate = new Date(date)
    const now = new Date()
    const isToday = messageDate.toDateString() === now.toDateString()
    
    if (isToday) {
      return format(messageDate, 'h:mm a')
    } else {
      return format(messageDate, 'MMM d, h:mm a')
    }
  } catch (error) {
    logger.error('Error formatting date:', error)
    return 'Unknown time'
  }
}

export default function Message({ message, showThread = false, onThreadClick }) {
  const { user } = useContext(UserContext)
  const { users } = useStore()
  const [replyCount, setReplyCount] = useState(message.reply_count || 0)
  const [isThreadVisible, setIsThreadVisible] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [showActions, setShowActions] = useState(false)
  const [messageUser, setMessageUser] = useState(null)

  logger.debug('Rendering message:', {
    messageId: message.id,
    userId: message.user?.id,
    username: message.user?.username,
    displayName: message.user?.display_name,
    messageUserId: message.user_id,
    isAnnouncement: message.is_announcement,
    isAiGenerated: message.is_ai_generated,
    isPinned: message.is_pinned,
    hasThread: !!message.thread_id,
    replyCount,
    fullMessage: message
  })

  useEffect(() => {
    const fetchMessageUser = async () => {
      // First check if the user is in the users list from the store
      const storeUser = users.find(u => u.id === message.user_id)
      if (storeUser) {
        setMessageUser(storeUser)
        logger.info('Found user in store:', storeUser)
        return
      }

      // If not in store and no user data in message, fetch from database
      if (message.user_id && (!message.user || (!message.user.username && !message.user.display_name))) {
        try {
          const { data, error } = await supabase
            .from('users')
            .select('id, username, display_name, avatar_url, email')
            .eq('id', message.user_id)
            .single()

          if (error) throw error
          if (data) {
            setMessageUser(data)
            logger.info('Fetched message user:', data)
          }
        } catch (error) {
          logger.error('Error fetching message user:', error)
        }
      }
    }

    fetchMessageUser()
  }, [message.user_id, message.user, users])

  // Subscribe to user updates
  useEffect(() => {
    if (!message.user_id) return

    const userSubscription = supabase
      .channel(`user-${message.user_id}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'users',
        filter: `id=eq.${message.user_id}`
      }, (payload) => {
        logger.info('User updated:', payload.new)
        setMessageUser(payload.new)
      })
      .subscribe()

    return () => {
      supabase.removeChannel(userSubscription)
    }
  }, [message.user_id])

  useEffect(() => {
    if (message.read_by && !message.read_by.includes(user.id)) {
      logger.info('Marking message as read:', {
        messageId: message.id,
        userId: user.id,
        currentReadBy: message.read_by
      })

      const newReadBy = [...(message.read_by || []), user.id]
      supabase
        .from('messages')
        .update({ read_by: newReadBy })
        .eq('id', message.id)
        .then(({ error }) => {
          if (error) {
            logger.error('Error marking message as read:', error)
          } else {
            logger.info('Message marked as read successfully', {
              messageId: message.id,
              newReadBy
            })
          }
        })
    }
  }, [message.id, message.read_by, user.id])

  const messageClasses = classNames(
    'message-container group px-6 py-3 hover:bg-gray-800/30 transition-all duration-200',
    {
      'bg-yellow-500/5 hover:bg-yellow-500/10': message.is_announcement,
      'bg-blue-500/5 hover:bg-blue-500/10': message.is_ai_generated,
      'bg-green-500/5 hover:bg-green-500/10': message.is_pinned,
      'opacity-75': message.edited_at,
      'opacity-50': message.delivery_status === 'pending',
      'bg-red-500/5 hover:bg-red-500/10': message.delivery_status === 'failed'
    }
  )

  const handleThreadClick = () => {
    logger.debug('Thread button clicked', {
      messageId: message.id,
      threadId: message.thread_id,
      wasVisible: isThreadVisible
    })
    
    setIsThreadVisible(!isThreadVisible)
    if (onThreadClick) {
      onThreadClick(message)
    }
  }

  const displayUser = messageUser || message.user || users.find(u => u.id === message.user_id)
  const displayName = displayUser?.display_name || displayUser?.username || displayUser?.email || 'Unknown User'

  return (
    <div 
      className={messageClasses}
      onMouseEnter={() => {
        setIsHovered(true)
        setShowActions(true)
        logger.debug('Message hovered', { messageId: message.id })
      }}
      onMouseLeave={() => {
        setIsHovered(false)
        setShowActions(false)
        logger.debug('Message unhovered', { messageId: message.id })
      }}
    >
      <div className="flex items-start space-x-4">
        <Avatar url={displayUser?.avatar_url} className="mt-0.5 w-10 h-10" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <span className="font-medium text-yellow-400 hover:text-yellow-300 cursor-pointer transition-colors">
              {displayName}
            </span>
            <span className="text-xs text-gray-400 font-medium">
              {formatDate(message.created_at)}
            </span>
            {message.edited_at && (
              <span className="text-xs text-gray-500 italic">(edited)</span>
            )}
            {message.is_announcement && (
              <span className="px-2 py-0.5 text-xs bg-yellow-500/20 text-yellow-400 rounded-full font-medium">
                Announcement
              </span>
            )}
            {message.is_pinned && (
              <StarIcon className="w-4 h-4 text-yellow-400" />
            )}
          </div>
          
          <div className="mt-1">
            {message.is_ai_generated && (
              <div className="text-xs text-blue-400 mb-1.5 flex items-center font-medium">
                <span className="mr-1.5">🤖</span>
                Generated by {message.ai_model || 'AI'}
              </div>
            )}
            <div className="text-gray-100 whitespace-pre-wrap break-words leading-relaxed">
              {message.message_text}
            </div>
            {message.attachments && Object.keys(message.attachments).length > 0 && (
              <div className="mt-3 space-y-2">
                {/* Render attachments */}
              </div>
            )}
            {message.mentions && Object.keys(message.mentions).length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {/* Render mentions */}
              </div>
            )}
          </div>

          <div className="mt-3 flex items-center space-x-4">
            <MessageReactions message={message} />
            {message.thread_id && (
              <button 
                className="inline-flex items-center space-x-1.5 text-sm text-gray-400 hover:text-gray-200 transition-colors group"
                onClick={handleThreadClick}
              >
                <ReplyIcon className="w-4 h-4 group-hover:text-yellow-400 transition-colors" />
                <span>{replyCount} {replyCount === 1 ? 'reply' : 'replies'}</span>
              </button>
            )}
            {message.delivery_status === 'failed' && (
              <span className="text-sm text-red-400 flex items-center space-x-1">
                <span>•</span>
                <span>Failed to send. Please try again.</span>
              </span>
            )}
            {showActions && (
              <div className="ml-auto flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-1 rounded-lg hover:bg-gray-700/50 text-gray-400 hover:text-gray-200 transition-colors">
                  <DotsHorizontalIcon className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {showThread && isThreadVisible && message.thread_id && (
        <div className="mt-4 ml-14 pl-4 border-l-2 border-yellow-500/10">
          <ThreadPanel messageId={message.thread_id} />
        </div>
      )}
    </div>
  )
}