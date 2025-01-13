import { useState, useEffect, useContext } from 'react'
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'
import { supabase } from '~/lib/supabaseClient'
import { UserContext } from '~/lib/UserContext'
import { logger } from '~/lib/logger'

const reactionLogger = logger.withPrefix('MessageReactions')

export default function MessageReactions({ message }) {
  const { user } = useContext(UserContext)
  const [showPicker, setShowPicker] = useState(false)
  const [reactions, setReactions] = useState([])

  useEffect(() => {
    if (!message?.id || !message?.workspace_id) return

    async function loadReactions() {
      try {
        reactionLogger.debug('Loading reactions for message:', message.id)
        const { data, error } = await supabase
          .from('message_reactions')
          .select('*')
          .eq('message_id', message.id)
          .eq('workspace_id', message.workspace_id)
        if (error) {
          reactionLogger.error('Error fetching reactions:', error)
        } else {
          setReactions(data || [])
        }
      } catch (err) {
        reactionLogger.error('Exception in loadReactions:', err)
      }
    }

    loadReactions()
  }, [message?.id, message?.workspace_id])

  const toggleReaction = async (emoji) => {
    if (!user) return
    if (!message?.workspace_id || !message?.id) return

    // check if user has reaction
    const existing = reactions.find(r => r.user_id === user.id && r.emoji === emoji)
    if (existing) {
      // remove
      reactionLogger.debug('Removing existing reaction:', existing)
      const { error } = await supabase
        .from('message_reactions')
        .delete()
        .match({ id: existing.id })
      if (error) {
        reactionLogger.error('Error removing reaction:', error)
      } else {
        setReactions(prev => prev.filter(r => r.id !== existing.id))
      }
    } else {
      // add
      const insertObj = {
        id: crypto.randomUUID(),
        message_id: message.id,
        user_id: user.id,
        workspace_id: message.workspace_id,
        emoji
      }
      reactionLogger.debug('Inserting new reaction:', insertObj)
      const { error } = await supabase
        .from('message_reactions')
        .insert(insertObj)
      if (error) {
        reactionLogger.error('Error inserting reaction:', error)
      } else {
        setReactions(prev => [...prev, insertObj])
      }
    }
  }

  return (
    <div className="flex items-center space-x-2">
      <div className="flex space-x-1">
        {reactions.map(r => (
          <button
            key={r.id}
            onClick={() => toggleReaction(r.emoji)}
            className="px-2 py-1 bg-gray-600 rounded text-sm"
          >
            {r.emoji}
          </button>
        ))}
      </div>
      <button
        className="text-gray-400 hover:text-gray-200"
        onClick={() => setShowPicker(!showPicker)}
      >
        +
      </button>
      {showPicker && (
        <div className="relative z-50">
          <Picker
            data={data}
            onEmojiSelect={(e) => {
              toggleReaction(e.native)
              setShowPicker(false)
            }}
            theme="dark"
          />
        </div>
      )}
    </div>
  )
}