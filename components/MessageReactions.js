import { useState, useEffect, useContext } from 'react'
import { supabase } from '~/lib/Store'
import UserContext from '~/lib/UserContext'

const EMOJI_LIST = ['👍', '❤️', '😂', '🎉', '🚀', '👏']

export default function MessageReactions({ messageId, message }) {
  const { user } = useContext(UserContext)
  const [reactions, setReactions] = useState([])
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [isConfirmed, setIsConfirmed] = useState(!messageId.toString().startsWith('temp-'))

  // Listen for message confirmation
  useEffect(() => {
    const handleMessageConfirmed = (event) => {
      const { tempId, confirmedMessage } = event.detail
      if (messageId === tempId) {
        setIsConfirmed(true)
        // Update messageId to the confirmed one
        messageId = confirmedMessage.id
        // Fetch reactions for the confirmed message
        fetchReactions()
      }
    }

    window.addEventListener('messageConfirmed', handleMessageConfirmed)
    window.addEventListener('channelMessageConfirmed', handleMessageConfirmed)

    return () => {
      window.removeEventListener('messageConfirmed', handleMessageConfirmed)
      window.removeEventListener('channelMessageConfirmed', handleMessageConfirmed)
    }
  }, [messageId])

  useEffect(() => {
    if (!isConfirmed) {
      setReactions([])
      return
    }

    fetchReactions()
    
    // Subscribe to reaction changes
    const channel = supabase
      .channel(`message-reactions-${messageId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'message_reactions',
          filter: `message_id=eq.${messageId}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setReactions(prev => {
              // Check if reaction already exists to prevent duplicates
              const exists = prev.some(r => 
                r.user_id === payload.new.user_id && 
                r.emoji === payload.new.emoji
              )
              if (exists) return prev
              return [...prev, payload.new]
            })
          } else if (payload.eventType === 'DELETE') {
            setReactions(prev => prev.filter(r => r.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [messageId, isConfirmed])

  const fetchReactions = async () => {
    if (!isConfirmed) return

    const { data, error } = await supabase
      .from('message_reactions')
      .select('*')
      .eq('message_id', messageId)

    if (!error && data) {
      setReactions(data)
    }
  }

  const toggleReaction = async (emoji) => {
    if (!isConfirmed) {
      console.log('Cannot add reactions to unconfirmed messages')
      return
    }

    const existingReaction = reactions.find(
      r => r.user_id === user.id && r.emoji === emoji
    )

    if (existingReaction) {
      // Optimistically remove reaction
      setReactions(prev => prev.filter(r => r.id !== existingReaction.id))
      
      try {
        const { error } = await supabase
          .from('message_reactions')
          .delete()
          .match({ id: existingReaction.id })

        if (error) throw error
      } catch (error) {
        console.error('Error removing reaction:', error)
        // Revert optimistic update on error
        setReactions(prev => [...prev, existingReaction])
      }
    } else {
      // Create optimistic reaction
      const optimisticReaction = {
        id: `temp-${Date.now()}`,
        message_id: messageId,
        user_id: user.id,
        emoji: emoji
      }

      // Optimistically add reaction
      setReactions(prev => {
        // Check if reaction already exists
        const exists = prev.some(r => 
          r.user_id === user.id && 
          r.emoji === emoji
        )
        if (exists) return prev
        return [...prev, optimisticReaction]
      })
      
      try {
        const { data, error } = await supabase
          .from('message_reactions')
          .insert({
            message_id: messageId,
            user_id: user.id,
            emoji: emoji
          })
          .select()
          .single()

        if (error) throw error

        if (data) {
          setReactions(prev => 
            prev.map(r => r.id === optimisticReaction.id ? data : r)
          )
        }
      } catch (error) {
        console.error('Error adding reaction:', error)
        // Revert optimistic update on error
        setReactions(prev => prev.filter(r => r.id !== optimisticReaction.id))
      }
    }
  }

  const getReactionCount = (emoji) => {
    return reactions.filter(r => r.emoji === emoji).length
  }

  const hasUserReacted = (emoji) => {
    return reactions.some(r => r.user_id === user.id && r.emoji === emoji)
  }

  return (
    <div className="flex flex-wrap gap-1 mt-1">
      {/* Display existing reactions */}
      {EMOJI_LIST.map(emoji => {
        const count = getReactionCount(emoji)
        if (count > 0) {
          return (
            <button
              key={emoji}
              onClick={() => toggleReaction(emoji)}
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-sm
                ${hasUserReacted(emoji) 
                  ? 'bg-yellow-500/20 text-yellow-400' 
                  : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
                }`}
            >
              <span>{emoji}</span>
              <span className="text-xs">{count}</span>
            </button>
          )
        }
        return null
      })}

      {/* Add reaction button */}
      <div className="relative group">
        <button
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-700/50 text-gray-300 hover:bg-gray-700 text-sm"
        >
          +
        </button>
        
        {/* Emoji picker */}
        {showEmojiPicker && (
          <div 
            className={`absolute mb-2 p-2 bg-gray-800 rounded-lg shadow-lg flex gap-1 z-50 ${
              message?.user_id === user?.id 
                ? 'right-full mr-2 bottom-0' // For user's own messages (right side)
                : 'left-full ml-2 bottom-0'  // For other users' messages (left side)
            }`}
          >
            {EMOJI_LIST.map(emoji => (
              <button
                key={emoji}
                onClick={() => {
                  toggleReaction(emoji)
                  setShowEmojiPicker(false)
                }}
                className="p-1 hover:bg-gray-700 rounded"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 