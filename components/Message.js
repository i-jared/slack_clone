import { useState, useContext, useEffect, useRef } from 'react'
import { formatDistanceToNow, format } from 'date-fns'
import { supabase } from '~/lib/supabaseClient'
import { useStore } from '~/lib/Store'
import { UserContext } from '../lib/UserContext'
import MessageReactions from './MessageReactions'
import ThreadPanel from './ThreadPanel'
import classNames from 'classnames'
import Avatar from './Avatar'
import { logger } from '~/lib/logger'
import { DotsHorizontalIcon, ReplyIcon, StarIcon } from '@heroicons/react/outline'

const messageLogger = logger.withPrefix('Message')

const formatDate = (date) => {
  try {
    const messageDate = new Date(date)
    const now = new Date()
    const isToday = messageDate.toDateString() === now.toDateString()
    
    const formattedDate = isToday 
      ? format(messageDate, 'h:mm a')
      : format(messageDate, 'MMM d, h:mm a')
    
    return formattedDate
  } catch (error) {
    messageLogger.error('Error formatting date:', error, { date })
    return 'Unknown time'
  }
}

export default function Message({ message, showThread = false, onThreadClick }) {
  const { user } = useContext(UserContext)
  const [messageUser, setMessageUser] = useState(message.sender)
  const [editor, setEditor] = useState(message.editor)
  const messageLogger = useLogger('Message')

  const messageClasses = classNames(
    'px-4 py-2 hover:bg-gray-800/50 relative group',
    {
      'bg-yellow-900/10': message.is_announcement,
      'border-l-4 border-yellow-400': message.is_pinned,
      'opacity-75': message.delivery_status === 'pending'
    }
  )

  const handleReaction = async (emoji) => {
    try {
      const existingReaction = message.reactions?.[user.id]
      if (existingReaction === emoji) {
        // Remove reaction
        const newReactions = { ...message.reactions }
        delete newReactions[user.id]
        await supabase
          .from('messages')
          .update({ reactions: newReactions })
          .eq('id', message.id)
      } else {
        // Add/update reaction
        const newReactions = { 
          ...message.reactions,
          [user.id]: emoji
        }
        await supabase
          .from('messages')
          .update({ reactions: newReactions })
          .eq('id', message.id)
      }
    } catch (error) {
      messageLogger.error('Error updating reaction:', error)
    }
  }

  // Subscribe to user updates
  useEffect(() => {
    if (!message.user_id) {
      messageLogger.debug('No user_id for subscription')
      return
    }

    messageLogger.debug('Setting up user subscription:', { userId: message.user_id })

    const userSubscription = supabase
      .channel(`user-${message.user_id}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'users',
        filter: `id=eq.${message.user_id}`
      }, (payload) => {
        messageLogger.info('User update received:', {
          userId: message.user_id,
          changes: payload.new
        })
        setMessageUser(payload.new)
      })
      .subscribe()

    return () => {
      messageLogger.debug('Cleaning up user subscription:', { userId: message.user_id })
      supabase.removeChannel(userSubscription)
    }
  }, [message.user_id])

  // Mark message as read
  useEffect(() => {
    if (message.read_by && !message.read_by.includes(user.id)) {
      messageLogger.info('Marking message as read:', {
        messageId: message.id,
        userId: user.id,
        currentReadBy: message.read_by
      })

      const newReadBy = [...(message.read_by || []), user.id]
      supabase
        .from('messages')
        .update({ read_by: newReadBy })
        .eq('id', message.id)
        .then(({ data, error }) => {
          if (error) {
            messageLogger.error('Error marking message as read:', error)
          } else {
            messageLogger.info('Message marked as read successfully:', {
              messageId: message.id,
              newReadBy,
              response: data
            })
          }
        })
    }
  }, [message.id, message.read_by, user.id])

  return (
    <div className={messageClasses}>
      <div className="flex items-start space-x-3">
        {/* Avatar */}
        <img
          src={messageUser?.avatar_url || '/default-avatar.png'}
          alt={messageUser?.display_name || 'User'}
          className="w-10 h-10 rounded-full"
        />

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center space-x-2">
            <span className="font-bold text-yellow-400">
              {messageUser?.display_name || messageUser?.username || 'Unknown User'}
            </span>
            {messageUser?.is_bot && (
              <span className="px-1.5 py-0.5 text-xs bg-blue-500/20 text-blue-300 rounded">
                BOT
              </span>
            )}
            {message.is_announcement && (
              <span className="px-1.5 py-0.5 text-xs bg-yellow-500/20 text-yellow-300 rounded">
                ANNOUNCEMENT
              </span>
            )}
            <span className="text-xs text-gray-400">
              {new Date(message.created_at).toLocaleTimeString()}
            </span>
            {message.edited_at && (
              <span className="text-xs text-gray-500 italic">
                (edited by {editor?.display_name || editor?.username || 'Unknown'})
              </span>
            )}
          </div>

          {/* Message Content */}
          <div className="mt-1 text-gray-300 whitespace-pre-wrap break-words">
            {message.message_text}
          </div>

          {/* Attachments */}
          {message.attachments && Object.keys(message.attachments).length > 0 && (
            <div className="mt-2 space-y-2">
              {Object.entries(message.attachments).map(([id, attachment]) => (
                <div key={id} className="flex items-center space-x-2">
                  <DocumentIcon className="w-5 h-5 text-gray-400" />
                  <a
                    href={attachment.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline"
                  >
                    {attachment.name}
                  </a>
                </div>
              ))}
            </div>
          )}

          {/* Thread Info */}
          {message.reply_count > 0 && !showThread && (
            <button
              onClick={() => onThreadClick?.(message)}
              className="mt-2 flex items-center space-x-1 text-sm text-gray-400 hover:text-gray-300"
            >
              <ChatIcon className="w-4 h-4" />
              <span>{message.reply_count} replies</span>
            </button>
          )}

          {/* Reactions */}
          <div className="mt-2">
            <MessageReactions message={message} />
          </div>
        </div>

        {/* Actions */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          {message.user_id === user.id && (
            <button
              onClick={() => onThreadClick?.(message)}
              className="p-1 hover:bg-gray-700 rounded"
            >
              <ChatIcon className="w-4 h-4 text-gray-400" />
            </button>
          )}
          {message.is_pinned && (
            <PinIcon className="w-4 h-4 text-yellow-400 ml-2" />
          )}
        </div>
      </div>
    </div>
  )
}