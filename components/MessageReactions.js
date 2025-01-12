import { useState, useEffect, useContext } from 'react'
import { supabase } from '../lib/Store'
import { UserContext } from '../lib/UserContext'
import { v4 as uuidv4 } from 'uuid'

const EMOJI_LIST = ['👍', '❤️', '😂', '🎉', '🚀', '👏']

export default function MessageReactions({ message }) {
  const { user } = useContext(UserContext)
  const [reactions, setReactions] = useState(message.reactions || {})
  const [showPicker, setShowPicker] = useState(false)

  useEffect(() => {
    const subscription = supabase
      .channel(`message-reactions-${message.id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'message_reactions',
        filter: `message_id=eq.${message.id}`
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const { reaction_type, user_id, skin_tone, reaction_score } = payload.new
          setReactions(prev => {
            const key = skin_tone ? `${reaction_type}:${skin_tone}` : reaction_type
            const existing = prev[key] || { users: [], score: 0 }
            return {
              ...prev,
              [key]: {
                users: [...existing.users, user_id],
                score: existing.score + (reaction_score || 1)
              }
            }
          })
        } else if (payload.eventType === 'DELETE') {
          const { reaction_type, user_id, skin_tone, reaction_score } = payload.old
          setReactions(prev => {
            const key = skin_tone ? `${reaction_type}:${skin_tone}` : reaction_type
            const existing = prev[key]
            if (!existing) return prev
            
            const newUsers = existing.users.filter(id => id !== user_id)
            if (newUsers.length === 0) {
              const { [key]: _, ...rest } = prev
              return rest
            }
            return {
              ...prev,
              [key]: {
                users: newUsers,
                score: existing.score - (reaction_score || 1)
              }
            }
          })
        }
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [message.id])

  const toggleReaction = async (emoji, skinTone = null) => {
    const key = skinTone ? `${emoji}:${skinTone}` : emoji
    const existing = reactions[key]
    const hasReacted = existing?.users.includes(user.id)

    try {
      if (hasReacted) {
        await supabase
          .from('message_reactions')
          .delete()
          .match({
            message_id: message.id,
            user_id: user.id,
            reaction_type: emoji,
            skin_tone: skinTone
          })
      } else {
        await supabase
          .from('message_reactions')
          .insert([{
            message_id: message.id,
            user_id: user.id,
            reaction_type: emoji,
            skin_tone: skinTone,
            reaction_score: 1,
            is_ai_generated: false
          }])
      }
    } catch (error) {
      console.error('Error toggling reaction:', error)
    }
  }

  const getReactionCount = (emoji, skinTone = null) => {
    const key = skinTone ? `${emoji}:${skinTone}` : emoji
    return reactions[key]?.users.length || 0
  }

  const getReactionScore = (emoji, skinTone = null) => {
    const key = skinTone ? `${emoji}:${skinTone}` : emoji
    return reactions[key]?.score || 0
  }

  const hasUserReacted = (emoji, skinTone = null) => {
    const key = skinTone ? `${emoji}:${skinTone}` : emoji
    return reactions[key]?.users.includes(user.id) || false
  }

  return (
    <div className="reactions-container">
      {Object.entries(reactions).map(([key, data]) => {
        const [emoji, skinTone] = key.split(':')
        const count = data.users.length
        const score = data.score || count
        
        return (
          <button
            key={key}
            className={`reaction-button ${hasUserReacted(emoji, skinTone) ? 'active' : ''}`}
            onClick={() => toggleReaction(emoji, skinTone)}
          >
            {emoji}{skinTone ? `:${skinTone}` : ''} {count}
            {score !== count && <span className="score">+{score}</span>}
          </button>
        )
      })}
      
      <button
        className="add-reaction-button"
        onClick={() => setShowPicker(!showPicker)}
      >
        Add Reaction
      </button>

      {showPicker && (
        <div className="emoji-picker">
          {/* Your emoji picker implementation */}
        </div>
      )}
    </div>
  )
}