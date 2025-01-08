import { useEffect, useRef } from 'react'
import { useDirectMessages } from '~/lib/Store'
import Message from './Message'
import MessageInput from './MessageInput'
import LoadingScreen from './LoadingScreen'

export default function DirectMessage({ recipientId, recipient }) {
  const { messages, isLoading } = useDirectMessages({ recipientId })
  const messagesEndRef = useRef(null)

  // Log initial props and state
  useEffect(() => {
    console.log('🔄 DirectMessage mounted/updated:', {
      recipientId,
      recipient,
      hasMessages: messages?.length > 0,
      isLoading
    })
  }, [recipientId, recipient, messages, isLoading])

  // Scroll to bottom when messages change
  useEffect(() => {
    console.log('📜 Messages updated in DirectMessage:', {
      count: messages?.length,
      messages: messages
    })
    if (messages?.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  if (isLoading) {
    console.log('⏳ DirectMessage showing loading screen')
    return <LoadingScreen message="Loading conversation..." />
  }

  console.log('🎨 DirectMessage rendering:', {
    recipientId,
    recipientName: recipient?.username,
    messagesCount: messages?.length,
    isLoading
  })

  const displayName = recipient?.username || recipient?.email?.split('@')[0] || 'Unknown User'

  return (
    <div className="relative h-screen flex flex-col">
      <div className="px-4 py-2 border-b border-gray-700 bg-gray-800/90">
        <h2 className="text-2xl font-orbitron text-yellow-400">
          {displayName}
        </h2>
        <p className="text-sm text-gray-400 font-orbitron">
          Private conversation
        </p>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
        <div className="py-4 space-y-2">
          {messages?.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No messages yet. Start the conversation!
            </div>
          ) : (
            messages?.map((message) => {
              console.log('📝 Rendering message in DirectMessage:', {
                messageId: message.id,
                senderId: message.sender?.id,
                recipientId: message.recipient?.id,
                content: message.content
              })
              return (
                <Message 
                  key={`${message.id}-${message.inserted_at}`}
                  message={{
                    ...message,
                    message: message.content,
                    user: message.sender,
                    isDirect: true
                  }}
                />
              )
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <MessageInput recipient_id={recipientId} isDirect={true} />
    </div>
  )
} 