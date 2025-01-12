import { useEffect, useState, useRef, useContext, useCallback } from 'react'
import { supabase } from '~/lib/supabaseClient'
import Message from './Message'
import UserContext from '~/lib/UserContext'
import { v4 as uuidv4 } from 'uuid'
import { logger } from '~/lib/logger'

const threadLogger = logger.withPrefix('ThreadPanel')

export default function ThreadPanel({ parentMessageId, onClose }) {
  const { user } = useContext(UserContext)
  const [threadMessages, setThreadMessages] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [newReply, setNewReply] = useState('')
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    let subscription
    let isMounted = true

    const fetchThreadMessages = async () => {
      try {
        setIsLoading(true)
        threadLogger.debug('Fetching thread messages', { parentMessageId })
        const { data: children, error } = await supabase
          .from('messages')
          .select('*')
          .eq('parent_id', parentMessageId)
          .order('created_at', { ascending: true })

        if (error) {
          threadLogger.error('Error fetching thread messages:', error)
          setIsLoading(false)
          return
        }
        setThreadMessages(children || [])
        setIsLoading(false)
      } catch (err) {
        threadLogger.error('Error loading thread:', err)
        setIsLoading(false)
      }
    }

    const setupSubscription = () => {
      subscription = supabase
        .channel(`thread:${parentMessageId}`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `parent_id=eq.${parentMessageId}`
        }, (payload) => {
          threadLogger.debug('Thread subscription event', { eventType: payload.eventType, data: payload.new || payload.old })
          fetchThreadMessages()
        })
        .subscribe()
    }

    fetchThreadMessages()
    setupSubscription()

    return () => {
      isMounted = false
      if (subscription) subscription.unsubscribe()
    }
  }, [parentMessageId])

  useEffect(() => {
    if (threadMessages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [threadMessages])

  const postReply = async () => {
    if (!newReply.trim() || isSending) {
      threadLogger.warn('Ignoring empty or sending state in postReply')
      return
    }
    if (!user) {
      threadLogger.error('No user to post thread reply')
      return
    }

    setIsSending(true)
    threadLogger.debug('Posting thread reply', { parentMessageId, newReply })

    try {
      // fetch parent message
      const { data: parentMsg, error: parentErr } = await supabase
        .from('messages')
        .select('channel_id')
        .eq('id', parentMessageId)
        .single()

      if (parentErr || !parentMsg) {
        threadLogger.error('Parent message not found or error', parentErr)
        setIsSending(false)
        return
      }

      const newId = uuidv4()
      const now = new Date().toISOString()
      const payload = {
        id: newId,
        channel_id: parentMsg.channel_id,
        user_id: user.id,
        parent_id: parentMessageId,
        message_text: newReply.trim(),
        created_at: now,
        updated_at: now
      }

      const { data: inserted, error: insertErr } = await supabase
        .from('messages')
        .insert([payload])
        .select()
        .single()

      if (insertErr) {
        threadLogger.error('Error inserting thread message:', insertErr)
        setIsSending(false)
        return
      }

      threadLogger.info('Thread message posted', { messageId: inserted.id })
      setNewReply('')
    } catch (err) {
      threadLogger.error('Error posting thread reply:', err)
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

  return (
    <div className="fixed top-0 right-0 h-screen w-96 bg-gray-900 shadow-xl border-l border-gray-800 z-30">
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <h3 className="text-lg font-semibold text-yellow-400">Thread</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white"
        >
          ✕
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 h-[calc(100vh-8rem)]">
        {isLoading ? (
          <div className="text-gray-400">Loading thread...</div>
        ) : threadMessages.length === 0 ? (
          <div className="text-gray-500">No replies yet.</div>
        ) : (
          <div className="space-y-4">
            {threadMessages.map(msg => (
              <Message
                key={msg.id}
                message={msg}
                isThread
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      <div className="absolute bottom-0 left-0 right-0 bg-[#1a1d21] border-t border-gray-700 p-4">
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
          disabled={isSending || !newReply.trim()}
          className={`px-4 py-2 bg-yellow-500 text-gray-900 rounded hover:bg-yellow-400 transition ${
            isSending || !newReply.trim() ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isSending ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  )
}