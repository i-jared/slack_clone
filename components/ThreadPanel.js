import { useEffect, useState, useRef, useContext } from 'react'
import { supabase } from '~/lib/Store'
import Message from './Message'
import UserContext from '~/lib/UserContext'
import MessageInput from './MessageInput'

export default function ThreadPanel({ parentMessageId, onClose }) {
  const { user } = useContext(UserContext)
  const [threadMessages, setThreadMessages] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [parentMessage, setParentMessage] = useState(null)
  const messagesEndRef = useRef(null)

  // Update thread panel styles to match screenshot
  const threadPanelStyles = {
    position: 'fixed',
    top: '0',
    right: '0',
    width: '400px',
    height: '100vh',
    backgroundColor: '#1E1F22',
    borderLeft: '1px solid rgba(45, 45, 46, 0.8)',
    transform: parentMessageId ? 'translateX(0)' : 'translateX(100%)',
    transition: 'transform 0.3s ease-in-out, opacity 0.3s ease-in-out',
    opacity: parentMessageId ? '1' : '0',
    zIndex: 15,
    display: 'flex',
    flexDirection: 'column'
  }

  // Update header styles to match screenshot
  const headerStyles = {
    padding: '12px 16px',
    borderBottom: '1px solid rgba(45, 45, 46, 0.8)',
    backgroundColor: '#1E1F22',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '60px'
  }

  // Update messages container styles
  const messagesContainerStyles = {
    flex: 1,
    overflowY: 'auto',
    backgroundColor: '#1E1F22',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  }

  // Update close button styles
  const closeButtonStyles = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#9B9B9B',
    padding: '8px',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    transition: 'all 0.2s'
  }

  useEffect(() => {
    let isMounted = true
    let subscription

    const fetchParentMessage = async () => {
      try {
        const { data: message, error } = await supabase
          .from('messages')
          .select(`
            id,
            message,
            inserted_at,
            channel_id,
            user:user_id (
              id,
              username,
              avatar_url
            )
          `)
          .eq('id', parentMessageId)
          .single()

        if (error) throw error
        if (isMounted) {
          setParentMessage(message)
        }
      } catch (error) {
        console.error('Error fetching parent message:', error)
      }
    }

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
      subscription = supabase
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

            // Fetch the complete message with user data
            const { data: message, error } = await supabase
              .from('messages')
              .select(`
                id,
                message,
                inserted_at,
                channel_id,
                parent_id,
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
        )
        .subscribe()
    }

    fetchParentMessage()
    fetchThreadMessages()
    setupSubscription()

    return () => {
      isMounted = false
      if (subscription) {
        supabase.removeChannel(subscription)
      }
    }
  }, [parentMessageId])

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [threadMessages])

  // Notify parent components about thread state changes
  useEffect(() => {
    // Dispatch event to notify about thread panel state
    window.dispatchEvent(
      new CustomEvent('threadPanelState', {
        detail: { isOpen: Boolean(parentMessageId) }
      })
    )

    return () => {
      // Clean up by notifying thread panel is closed
      window.dispatchEvent(
        new CustomEvent('threadPanelState', {
          detail: { isOpen: false }
        })
      )
    }
  }, [parentMessageId])

  return (
    <div style={threadPanelStyles}>
      <div style={headerStyles}>
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-yellow-400">Thread</h3>
          {parentMessage && (
            <span className="text-sm text-gray-400">
              in #{parentMessage.channel?.name || 'channel'}
            </span>
          )}
        </div>
        <button 
          onClick={onClose}
          className="p-2 text-gray-400 hover:bg-gray-800/50 rounded-md transition-colors"
          aria-label="Close thread"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div style={messagesContainerStyles} className="scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
        {/* Parent Message */}
        {parentMessage && threadMessages.length > 0 && (
          <div className="px-4 pt-4 pb-4 border-b border-gray-700/30">
            <Message
              message={parentMessage}
              isThread={true}
              isParentMessage={true}
            />
          </div>
        )}

        {/* Thread Messages */}
        <div className="px-4 py-2 space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-yellow-400">Loading replies...</div>
            </div>
          ) : threadMessages.length > 0 ? (
            threadMessages.map((message) => (
              <Message
                key={message.id}
                message={message}
                isThread={true}
              />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-16 text-center">
              <p className="text-gray-400 text-sm mb-2">No replies yet</p>
              <p className="text-gray-500 text-xs">Be the first to reply to this message!</p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-700/30">
        <MessageInput
          channel_id={parentMessage?.channel_id}
          isThread={true}
          parentMessageId={parentMessageId}
        />
      </div>
    </div>
  )
}
