import { useEffect, useState, useContext } from 'react'
import { supabase } from '~/lib/supabaseClient'
import { UserContext } from '~/lib/UserContext'
import Message from './Message'
import MessageInput from './MessageInput'

export default function ThreadPanel({ parentMessage, onClose }) {
  const { user } = useContext(UserContext)
  const [replies, setReplies] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!parentMessage) {
      setLoading(false)
      return
    }
    const loadReplies = async () => {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('messages')
          .select(`
            id,
            message_text,
            user_id,
            workspace_id,
            channel_id,
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
            edited_at,
            edited_by,
            user:users(id,username,display_name,avatar_url)
          `)
          .eq('thread_id', parentMessage.id)
          .order('created_at', { ascending: true })

        if (error) {
          console.error('Error loading thread replies:', error)
        } else {
          setReplies(data || [])
        }
      } catch (err) {
        console.error('Exception in ThreadPanel:', err)
      }
      setLoading(false)
    }
    loadReplies()
  }, [parentMessage])

  if (!parentMessage) return null

  const channelId = parentMessage.channel_id
  const workspaceId = parentMessage.workspace_id

  return (
    <div className="w-80 bg-gray-900 border-l border-gray-700 flex flex-col">
      <div className="p-4 flex items-center justify-between border-b border-gray-700">
        <h2 className="text-yellow-400 font-bold">Thread</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-200 text-sm"
        >
          ✕
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-4 space-y-2 pt-2">
        <Message key={`parent-${parentMessage.id}`} message={parentMessage} />
        <div className="border-t border-gray-700 pt-2">
          {loading ? (
            <div className="text-gray-300">Loading thread replies...</div>
          ) : replies.length === 0 ? (
            <div className="text-gray-500">No replies yet</div>
          ) : (
            replies.map(r => <Message key={r.id} message={r} onThreadClick={()=>{}} />)
          )}
        </div>
      </div>
      <div className="border-t border-gray-700 p-2">
        <MessageInput
          channel_id={channelId}
          workspace_id={workspaceId}
          parent_id={parentMessage.id}
          thread_id={parentMessage.id}
          isDirect={false}
        />
      </div>
    </div>
  )
}