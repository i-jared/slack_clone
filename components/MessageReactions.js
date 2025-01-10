import { useState, useEffect, useContext } from 'react'
import { supabase } from '~/lib/Store'
import UserContext from '~/lib/UserContext'

const EMOJI_LIST = ['👍', '❤️', '😂', '🎉', '🚀', '👏']

export default function MessageReactions({ messageId }) {
  const { user } = useContext(UserContext)
  const [reactions, setReactions] = useState([])
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)

  useEffect(() => {
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
              const exists = prev.some(r => r.id === payload.new.id)
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
  }, [messageId])

  const fetchReactions = async () => {
    const { data, error } = await supabase
      .from('message_reactions')
      .select('*')
      .eq('message_id', messageId)

    if (!error && data) {
      setReactions(data)
    }
  }

  const toggleReaction = async (emoji) => {
    const existingReaction = reactions.find(
      r => r.user_id === user.id && r.emoji === emoji
    )

    if (existingReaction) {
      // Remove reaction
      const { error } = await supabase
        .from('message_reactions')
        .delete()
        .match({ id: existingReaction.id })

      if (error) {
        console.error('Error removing reaction:', error)
      } else {
        // Optimistically update the UI
        setReactions(prev => prev.filter(r => r.id !== existingReaction.id))
      }
    } else {
      // Add reaction
      const { data, error } = await supabase
        .from('message_reactions')
        .insert([
          {
            message_id: messageId,
            user_id: user.id,
            emoji: emoji
          }
        ])
        .select()

      if (error) {
        console.error('Error adding reaction:', error)
      } else if (data?.[0]) {
        // Optimistically update the UI
        setReactions(prev => [...prev, data[0]])
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
      <div className="relative">
        <button
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-700/50 text-gray-300 hover:bg-gray-700 text-sm"
        >
          +
        </button>
        
        {/* Emoji picker */}
        {showEmojiPicker && (
          <div className="absolute bottom-full right-0 mb-2 p-2 bg-gray-800 rounded-lg shadow-lg flex gap-1 z-50">
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