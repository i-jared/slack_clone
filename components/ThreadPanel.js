import { useEffect, useState, useRef } from 'react'
import { supabase } from '~/lib/Store'
import Message from './Message'

/**
 * This component fetches and displays thread messages associated with a "parent" message.
 * For simplicity, we assume we've added a "parent_id" column to "messages" table or
 * some approach for threading. Adjust queries as needed.
 */
export default function ThreadPanel({ parentMessageId, onClose }) {
  const [threadMessages, setThreadMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [newReply, setNewReply] = useState('')
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    console.log('📜 Attempting to scroll to bottom')
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (threadMessages.length > 0) {
      console.log('🔄 Messages updated, scrolling to bottom')
      scrollToBottom()
    }
  }, [threadMessages])

  const fetchThread = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('messages')
        .select(`
          id,
          message,
          inserted_at,
          channel_id,
          parent_id,
          attachments,
          user:user_id (
            id,
            username,
            avatar_url
          )
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
    if (!newReply.trim() || isSending) return
    try {
      console.log('🚀 Starting to post reply...')
      console.log('📝 Reply content:', newReply.trim())
      console.log('👆 Parent message ID:', parentMessageId)
      
      setIsSending(true)
      const { data: { user } } = await supabase.auth.getUser()
      console.log('👤 Current user:', user?.id)
      
      if (!user) throw new Error('User not authenticated')

      // First fetch the parent message to get its channel_id
      const { data: parentMessage, error: parentError } = await supabase
        .from('messages')
        .select('channel_id')
        .eq('id', parentMessageId)
        .single()

      if (parentError) {
        console.error('❌ Error fetching parent message:', parentError)
        throw parentError
      }

      console.log('📨 Parent message data:', parentMessage)

      const messageData = {
        message: newReply.trim(),
        user_id: user.id,
        inserted_at: new Date().toISOString(),
        parent_id: parentMessageId,
        channel_id: parentMessage.channel_id // Add the channel_id from parent message
      }
      console.log('📦 Message data to send:', messageData)

      const { error } = await supabase
        .from('messages')
        .insert(messageData)

      if (error) {
        console.error('❌ Error details:', error)
        throw error
      }
      
      console.log('✅ Reply posted successfully')
      setNewReply('')
      await fetchThread()
    } catch (err) {
      console.error('Error posting thread reply:', err)
      console.error('Full error details:', {
        name: err.name,
        message: err.message,
        code: err.code,
        details: err.details,
        hint: err.hint
      })
    } finally {
      setIsSending(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      postReply()
    }
  }

  useEffect(() => {
    if (parentMessageId) {
      fetchThread()

      // Subscribe to new messages in this thread
      const subscription = supabase
        .channel('thread-messages')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `parent_id=eq.${parentMessageId}`
          },
          (payload) => {
            fetchThread()
          }
        )
        .subscribe()

      return () => {
        subscription.unsubscribe()
      }
    }
  }, [parentMessageId])

  if (!parentMessageId) return null

  return (
    <div className="fixed inset-y-0 right-0 flex justify-end z-50" onClick={() => onClose()}>
      <div className="h-full flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="w-96 bg-[#1a1d21] flex flex-col h-full">
          {/* Thread Header */}
          <div className="sticky top-0 z-20 bg-[#1a1d21] border-b border-gray-700 p-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-yellow-400">Thread</h2>
            <button onClick={onClose} className="text-gray-300 hover:text-white">Close</button>
          </div>

          {/* Thread Messages */}
          <div className="flex-1 overflow-y-auto p-4">
            {isLoading ? (
              <div className="text-gray-400">Loading thread...</div>
            ) : threadMessages.length === 0 ? (
              <div className="text-gray-500">No replies yet.</div>
            ) : (
              <div className="space-y-4">
                {threadMessages.map((msg) => (
                  <Message key={msg.id} message={msg} />
                ))}
                <div ref={messagesEndRef} /> {/* Scroll anchor */}
              </div>
            )}
          </div>

          {/* Reply Input */}
          <div className="sticky bottom-0 bg-[#1a1d21] border-t border-gray-700 p-4">
            <textarea
              value={newReply}
              onChange={(e) => setNewReply(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full bg-gray-700 text-white rounded p-2 mb-2 resize-none focus:outline-none focus:ring-1 focus:ring-yellow-400"
              rows={3}
              placeholder="Reply to thread..."
              disabled={isSending}
            />
            <button
              onClick={postReply}
              disabled={isSending}
              className={`px-4 py-2 bg-yellow-500 text-gray-900 rounded hover:bg-yellow-400 transition ${
                isSending ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isSending ? 'Sending...' : 'Send'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
