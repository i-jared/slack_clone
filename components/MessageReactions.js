import { useState, useEffect, useContext, useRef } from 'react'
import { supabase } from '../lib/Store'
import { UserContext } from '../lib/UserContext'
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'
import { createLogger } from '~/lib/logger'

const logger = createLogger('MessageReactions')

const QUICK_REACTIONS = ['👍', '❤️', '😂', '🎉', '🚀', '👏']

export default function MessageReactions({ message }) {
  const { user } = useContext(UserContext)
  const [reactions, setReactions] = useState({})
  const [showPicker, setShowPicker] = useState(false)
  const pickerRef = useRef(null)

  logger.debug('Initializing MessageReactions', {
    messageId: message.id,
    userId: user?.id,
    initialReactions: message.reactions
  })

  // Initialize reactions from message
  useEffect(() => {
    if (message.reactions) {
      logger.info('Setting initial reactions from message', message.reactions)
      setReactions(message.reactions)
    }
  }, [message.reactions])

  // Handle clicks outside emoji picker
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        logger.debug('Clicked outside emoji picker, closing')
        setShowPicker(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Subscribe to reaction changes
  useEffect(() => {
    logger.info('Setting up reaction subscription for message:', message.id)

    const subscription = supabase
      .channel(`message-reactions-${message.id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'message_reactions',
        filter: `message_id=eq.${message.id}`
      }, (payload) => {
        logger.debug('Received reaction change', {
          eventType: payload.eventType,
          data: payload.new || payload.old
        })

        if (payload.eventType === 'INSERT') {
          const { emoji, user_id } = payload.new
          logger.info('Adding new reaction', { emoji, userId: user_id })
          
          setReactions(prev => {
            const existing = prev[emoji] || { users: [] }
            return {
              ...prev,
              [emoji]: {
                users: [...existing.users, user_id]
              }
            }
          })
        } else if (payload.eventType === 'DELETE') {
          const { emoji, user_id } = payload.old
          logger.info('Removing reaction', { emoji, userId: user_id })
          
          setReactions(prev => {
            const existing = prev[emoji]
            if (!existing) return prev
            
            const newUsers = existing.users.filter(id => id !== user_id)
            if (newUsers.length === 0) {
              const { [emoji]: _, ...rest } = prev
              return rest
            }
            return {
              ...prev,
              [emoji]: { users: newUsers }
            }
          })
        }
      })
      .subscribe()

    return () => {
      logger.info('Cleaning up reaction subscription')
      subscription.unsubscribe()
    }
  }, [message.id])

  const toggleReaction = async (emoji) => {
    logger.debug('Toggling reaction', { emoji, userId: user.id })
    
    const existing = reactions[emoji]
    const hasReacted = existing?.users.includes(user.id)

    try {
      if (hasReacted) {
        logger.info('Removing existing reaction', { emoji })
        await supabase
          .from('message_reactions')
          .delete()
          .match({
            message_id: message.id,
            user_id: user.id,
            emoji
          })
      } else {
        logger.info('Adding new reaction', { emoji })
        await supabase
          .from('message_reactions')
          .insert([{
            id: crypto.randomUUID(),
            message_id: message.id,
            user_id: user.id,
            emoji,
            message_type: 'channel',
            metadata: {
              client: 'web',
              timestamp: new Date().toISOString()
            }
          }])
      }
    } catch (error) {
      logger.error('Error toggling reaction:', error)
      console.error('Error toggling reaction:', error)
    }
  }

  const onEmojiSelect = (emoji) => {
    logger.debug('Emoji selected from picker', emoji)
    toggleReaction(emoji.native)
    setShowPicker(false)
  }

  const hasUserReacted = (emoji) => {
    return reactions[emoji]?.users.includes(user.id) || false
  }

  return (
    <div className="flex items-center space-x-2">
      {/* Quick Reactions */}
      <div className="flex items-center space-x-1">
        {Object.entries(reactions).map(([emoji, data]) => {
          const count = data.users.length
          const hasReacted = hasUserReacted(emoji)
          
          return (
            <button
              key={emoji}
              onClick={() => toggleReaction(emoji)}
              className={`
                inline-flex items-center space-x-1 px-2 py-1 rounded-lg text-sm
                transition-all duration-200 hover:bg-gray-700/50
                ${hasReacted ? 'bg-yellow-500/10 text-yellow-400' : 'bg-gray-800/50 text-gray-400'}
              `}
            >
              <span>{emoji}</span>
              <span className="font-medium">{count}</span>
            </button>
          )
        })}
      </div>

      {/* Add Reaction Button */}
      <button
        onClick={() => {
          logger.debug('Toggling emoji picker')
          setShowPicker(!showPicker)
        }}
        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-200 hover:bg-gray-700/50 transition-all duration-200"
      >
        <span className="text-lg">😊</span>
      </button>

      {/* Emoji Picker */}
      {showPicker && (
        <div 
          ref={pickerRef}
          className="absolute z-50 bottom-full mb-2 shadow-2xl rounded-xl overflow-hidden"
          style={{ transform: 'scale(0.8)', transformOrigin: 'bottom left' }}
        >
          <Picker
            data={data}
            onEmojiSelect={onEmojiSelect}
            theme="dark"
            previewPosition="none"
            skinTonePosition="none"
            searchPosition="none"
            navPosition="none"
            perLine={8}
            maxFrequentRows={1}
          />
        </div>
      )}
    </div>
  )
}