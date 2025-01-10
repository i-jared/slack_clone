import { useEffect, useState, useRef, useContext } from 'react'
import { supabase } from '~/lib/Store'
import Message from './Message'
import UserContext from '~/lib/UserContext'

/**
 * This component fetches and displays thread messages associated with a "parent" message.
 * For simplicity, we assume we've added a "parent_id" column to "messages" table or
 * some approach for threading. Adjust queries as needed.
 */
export default function ThreadPanel({ parentMessageId, onClose }) {
  const { user } = useContext(UserContext)
  const [threadMessages, setThreadMessages] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [newReply, setNewReply] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [pendingMessages, setPendingMessages] = useState(new Set())
  const messagesEndRef = useRef(null)

  // Handle optimistic updates
  const addMessage = (message) => {
    setThreadMessages(prev => {
      // Create new message with status
      const newMessage = {
        ...message,
        status: message.id.startsWith('temp-') ? 'pending' : 'confirmed',
        timestamp: message.inserted_at || new Date().toISOString()
      }
      
      // Add to pending if temporary
      if (newMessage.status === 'pending') {
        setPendingMessages(prev => new Set(prev).add(message.id))
      }

      return [...prev, newMessage].sort((a, b) => 
        new Date(a.timestamp) - new Date(b.timestamp)
      )
    })
  }

  // Handle message confirmation
  const confirmMessage = (tempId, confirmedMessage) => {
    setThreadMessages(prev => prev.map(msg => 
      msg.id === tempId ? { ...confirmedMessage, status: 'confirmed' } : msg
    ))
    setPendingMessages(prev => {
      const newSet = new Set(prev)
      newSet.delete(tempId)
      return newSet
    })
  }

  // Handle message removal (for failed sends)
  const removeMessage = (messageId) => {
    setThreadMessages(prev => prev.filter(msg => msg.id !== messageId))
    setPendingMessages(prev => {
      const newSet = new Set(prev)
      newSet.delete(messageId)
      return newSet
    })
  }

  useEffect(() => {
    let isMounted = true
    let subscription

    // Handle optimistic updates
    const handleNewMessage = (event) => {
      const message = event.detail
      // Only add if it's for this thread
      if (message.parent_id === parentMessageId) {
        addMessage(message)
      }
    }

    const handleMessageConfirmed = (event) => {
      const { tempId, confirmedMessage } = event.detail
      if (pendingMessages.has(tempId)) {
        confirmMessage(tempId, confirmedMessage)
      }
    }

    const handleMessageFailed = (event) => {
      const { messageId } = event.detail
      if (pendingMessages.has(messageId)) {
        removeMessage(messageId)
      }
    }

    // Listen for optimistic updates
    window.addEventListener('newThreadMessage', handleNewMessage)
    window.addEventListener('threadMessageConfirmed', handleMessageConfirmed)
    window.addEventListener('threadMessageFailed', handleMessageFailed)

    const fetchThreadMessages = async () => {
      try {
        setIsLoading(true)
        const { data: messages, error } = await supabase
          .from('messages')
          .select(`
            id,
            message,
            inserted_at,
            channel_id,
            parent_id,
            attachments,
            reactions:message_reactions(*),
            user:user_id (
              id,
              username,
              avatar_url
            )
          `)
          .eq('parent_id', parentMessageId)
          .order('inserted_at', { ascending: true })

        if (error) throw error

        if (isMounted) {
          setThreadMessages(messages || [])
          setIsLoading(false)
        }
      } catch (error) {
        console.error('Error fetching thread messages:', error)
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    const setupSubscription = () => {
      // Subscribe to message changes
      const messageSubscription = supabase
        .channel(`thread:${parentMessageId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'messages',
            filter: `parent_id=eq.${parentMessageId}`
          },
          async (payload) => {
            if (!isMounted) return

            // Fetch the complete message with user data and reactions
            const { data: message, error } = await supabase
              .from('messages')
              .select(`
                id,
                message,
                inserted_at,
                channel_id,
                parent_id,
                attachments,
                reactions:message_reactions(*),
                user:user_id (
                  id,
                  username,
                  avatar_url
                )
              `)
              .eq('id', payload.new.id)
              .single()

            if (error) {
              console.error('Error fetching updated message:', error)
              return
            }

            if (payload.eventType === 'DELETE') {
              setThreadMessages(prev => prev.filter(m => m.id !== payload.old.id))
            } else {
              setThreadMessages(prev => {
                const exists = prev.some(m => m.id === message.id)
                if (exists) {
                  return prev.map(m => m.id === message.id ? message : m)
                } else {
                  return [...prev, message].sort((a, b) => 
                    new Date(a.inserted_at) - new Date(b.inserted_at)
                  )
                }
              })
            }
          }
        )
        .subscribe()

      // Subscribe to reaction changes
      const reactionSubscription = supabase
        .channel(`thread-reactions:${parentMessageId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'message_reactions'
          },
          async (payload) => {
            if (!isMounted) return

            // Fetch the updated message with reactions
            const messageId = payload.new?.message_id || payload.old?.message_id
            const { data: message, error } = await supabase
              .from('messages')
              .select(`
                id,
                message,
                inserted_at,
                channel_id,
                parent_id,
                attachments,
                reactions:message_reactions(*),
                user:user_id (
                  id,
                  username,
                  avatar_url
                )
              `)
              .eq('id', messageId)
              .single()

            if (error) {
              console.error('Error fetching message after reaction change:', error)
              return
            }

            setThreadMessages(prev => 
              prev.map(m => m.id === messageId ? message : m)
            )
          }
        )
        .subscribe()

      return () => {
        messageSubscription.unsubscribe()
        reactionSubscription.unsubscribe()
      }
    }

    fetchThreadMessages()
    const cleanup = setupSubscription()

    return () => {
      isMounted = false
      if (cleanup) cleanup()
      // Clean up event listeners
      window.removeEventListener('newThreadMessage', handleNewMessage)
      window.removeEventListener('threadMessageConfirmed', handleMessageConfirmed)
      window.removeEventListener('threadMessageFailed', handleMessageFailed)
    }
  }, [parentMessageId])

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      postReply()
    }
  }

  const postReply = async () => {
    if (!newReply.trim() || isSending) return

    // Create temporary message
    const tempId = `temp-${Date.now()}`
    const optimisticMessage = {
      id: tempId,
      message: newReply.trim(),
      parent_id: parentMessageId,
      inserted_at: new Date().toISOString(),
      user: {
        id: user.id,
        username: user.email?.split('@')[0],
        avatar_url: user.user_metadata?.avatar_url
      }
    }

    // Show optimistic update
    window.dispatchEvent(new CustomEvent('newThreadMessage', { 
      detail: optimisticMessage 
    }))

    // Clear input immediately
    setNewReply('')
    
    try {
      setIsSending(true)
      const { data: message, error } = await supabase
        .from('messages')
        .insert([{
          message: optimisticMessage.message,
          parent_id: parentMessageId,
          user_id: user.id
        }])
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
        .single()

      if (error) throw error

      // Dispatch confirmation event
      window.dispatchEvent(new CustomEvent('threadMessageConfirmed', {
        detail: {
          tempId,
          confirmedMessage: message
        }
      }))
    } catch (error) {
      console.error('Error posting thread reply:', error)
      
      // Dispatch failure event
      window.dispatchEvent(new CustomEvent('threadMessageFailed', {
        detail: { messageId: tempId }
      }))
    } finally {
      setIsSending(false)
    }
  }

  // Scroll to bottom when messages change
  useEffect(() => {
    if (threadMessages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [threadMessages])

  return (
    <div className={`fixed top-0 right-0 h-screen w-96 bg-gray-900 shadow-xl transform transition-transform duration-300 ease-in-out border-l border-gray-800 z-30`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <h3 className="text-lg font-semibold text-yellow-400">Thread</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white"
        >
          ✕
        </button>
      </div>

      {/* Thread Messages */}
      <div className="flex-1 overflow-y-auto p-4 h-[calc(100vh-8rem)]">
        {isLoading ? (
          <div className="text-gray-400">Loading thread...</div>
        ) : threadMessages.length === 0 ? (
          <div className="text-gray-500">No replies yet.</div>
        ) : (
          <div className="space-y-4">
            {threadMessages.map((msg) => (
              <Message 
                key={msg.id} 
                message={msg}
                isThread={true}
              />
            ))}
            <div ref={messagesEndRef} /> {/* Scroll anchor */}
          </div>
        )}
      </div>

      {/* Reply Input */}
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
