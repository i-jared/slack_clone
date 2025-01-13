import { useEffect, useState, useContext } from 'react'
import { supabase } from '~/lib/supabaseClient'
import { UserContext } from '~/lib/UserContext'
import Message from './Message'
import MessageInput from './MessageInput'
import { logger } from '~/lib/logger'

const threadLogger = logger.withPrefix('ThreadPanel')

export default function ThreadPanel({ parentMessage, onClose }) {
  const { user } = useContext(UserContext)
  const [replies, setReplies] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!parentMessage) return

    async function loadReplies() {
      setLoading(true)
      try {
        let table = 'messages'
        let filterCol = 'parent_id'
        // If we detect it's a DM
        if (parentMessage.dm_room_id) {
          table = 'direct_messages'
          filterCol = 'parent_id'
        }

        threadLogger.debug('Loading thread replies from table:', table)

        const { data, error } = await supabase
          .from(table)
          .select(`
            id,
            dm_room_id,
            sender_id,
            channel_id,
            user_id,
            workspace_id,
            message_text,
            created_at,
            updated_at,
            parent_id,
            thread_id,
            attachments,
            mentions,
            metadata,
            is_pinned,
            reactions,
            reply_count,
            is_announcement,
            is_ai_generated,
            ai_model,
            ai_prompt,
            ai_response_metadata,
            read_by,
            delivery_status,
            scheduled_for,
            expires_at,
            edited_at,
            edited_by,
            user:users(id, username, avatar_url)
          `)
          .eq(filterCol, parentMessage.id)
          .order('created_at', { ascending: true })

        if (error) {
          threadLogger.error('Error loading thread replies:', error)
          setReplies([])
        } else {
          setReplies(data || [])
        }
      } catch (err) {
        threadLogger.error('Exception in loadReplies:', err)
        setReplies([])
      } finally {
        setLoading(false)
      }
    }

    loadReplies()
  }, [parentMessage])

  if (!parentMessage) return null

  if (loading) {
    return (
      <div className="w-80 bg-gray-900 border-l border-gray-700 text-gray-200 p-4">
        Loading thread...
      </div>
    )
  }

  return (
    <div className="w-80 bg-gray-900 border-l border-gray-700 flex flex-col">
      <div className="p-4 flex items-center justify-between">
        <h2 className="text-yellow-400 font-bold">Thread</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-200">✕</button>
      </div>
      <div className="flex-1 overflow-y-auto px-4 space-y-2">
        <Message message={parentMessage} />
        <div className="border-t border-gray-700 pt-2">
          {replies.map(r => (
            <Message key={r.id} message={r} />
          ))}
        </div>
      </div>
      <div className="border-t border-gray-700 p-2">
        <MessageInput
          isDirect={Boolean(parentMessage.dm_room_id)}
          channel_id={!parentMessage.dm_room_id ? parentMessage.channel_id : null}
          dm_room_id={parentMessage.dm_room_id || null}
          workspace_id={parentMessage.workspace_id}
        />
      </div>
    </div>
  )
}