import { useEffect, useState } from 'react'
import { supabase } from '~/lib/Store'

/**
 * This component fetches and displays thread messages associated with a "parent" message.
 * For simplicity, we assume we've added a "parent_id" column to "messages" table or
 * some approach for threading. Adjust queries as needed.
 */
export default function ThreadPanel({ parentMessageId, onClose }) {
  const [threadMessages, setThreadMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [newReply, setNewReply] = useState('')

  const fetchThread = async () => {
    try {
      setIsLoading(true)
      // We assume "parent_id" is the column, or we can store "thread_id".
      const { data, error } = await supabase
        .from('messages')
        .select(`
          id,
          message,
          inserted_at,
          user:user_id ( id, username, avatar_url )
        `)
        .eq('parent_id', parentMessageId)
        .order('inserted_at', { ascending: true })

      if (!error && data) {
        setThreadMessages(data)
      }
    } catch (err) {
      console.error('Error fetching thread messages:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const postReply = async () => {
    if (!newReply.trim()) return
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { error } = await supabase
        .from('messages')
        .insert({
          message: newReply.trim(),
          user_id: user.id,
          inserted_at: new Date().toISOString(),
          parent_id: parentMessageId
        })

      if (error) throw error
      setNewReply('')
      fetchThread()
    } catch (err) {
      console.error('Error posting thread reply:', err)
    }
  }

  useEffect(() => {
    if (parentMessageId) {
      fetchThread()
    }
  }, [parentMessageId])

  if (!parentMessageId) return null

  return (
    <div className="w-96 bg-gray-800 border-l border-gray-700 p-4 flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold text-yellow-400">Thread</h2>
        <button onClick={onClose} className="text-gray-300 hover:text-white">Close</button>
      </div>
      <div className="flex-1 overflow-y-auto mb-4 border border-gray-700 rounded p-2">
        {isLoading ? (
          <div className="text-gray-400">Loading thread...</div>
        ) : threadMessages.length === 0 ? (
          <div className="text-gray-500">No replies yet.</div>
        ) : (
          threadMessages.map((msg) => (
            <div key={msg.id} className="mb-2">
              <div className="text-sm text-yellow-300">{msg.user?.username}</div>
              <div className="text-white">{msg.message}</div>
            </div>
          ))
        )}
      </div>
      <div className="mt-auto">
        <textarea
          value={newReply}
          onChange={(e) => setNewReply(e.target.value)}
          className="w-full bg-gray-700 text-white rounded p-2 mb-2"
          rows={3}
          placeholder="Reply to thread..."
        />
        <button
          onClick={postReply}
          className="px-4 py-2 bg-yellow-500 text-gray-900 rounded hover:bg-yellow-400 transition"
        >
          Send
        </button>
      </div>
    </div>
  )
}
