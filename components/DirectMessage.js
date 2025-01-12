import { useEffect, useRef } from 'react'
import { useDirectMessages } from '~/lib/Store'
import Message from './Message'
import MessageInput from './MessageInput'
import LoadingScreen from './LoadingScreen'
import { v4 as uuidv4 } from 'uuid'

/*
  NOTE: If you are using the new useDirectMessages from lib/useDirectMessages,
  you'd import that instead of from ~/lib/Store. Adjust accordingly.
*/
export default function DirectMessage({ dmRoomId, recipient }) {
  const { messages, isLoading, addMessage } = useDirectMessages({
    dmRoomId,
    recipientId
  })
  const messagesEndRef = useRef(null)

  useEffect(() => {
    if (messages?.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  if (isLoading) {
    return <LoadingScreen message="Loading conversation..." />
  }

  const displayName = recipient?.username || recipient?.email?.split('@')[0] || 'Unknown User'

  const handleSend = async (content) => {
    const tempId = `temp-${uuidv4()}`
    const tempMessage = {
      id: tempId,
      dm_room_id: dmRoomId,
      sender_id: user.id,
      message_text: content,
      attachments: {},
      mentions: {},
      metadata: {},
      placeholder_1: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    addMessage(tempMessage)
    
    try {
      const confirmedMessage = await sendDirectMessage(content, recipientId)
      window.dispatchEvent(new CustomEvent('messageConfirmed', {
        detail: { tempId, confirmedMessage }
      }))
    } catch (error) {
      console.error('Error sending message:', error)
      window.dispatchEvent(new CustomEvent('messageFailed', {
        detail: { messageId: tempId }
      }))
    }
  }

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
              return (
                <Message 
                  key={`${message.id}-${message.created_at}`}
                  message={{
                    ...message,
                    message_text: message.message_text,
                    user: message.sender // merged from user->sender
                  }}
                />
              )
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <MessageInput dm_room_id={dmRoomId} isDirect />
    </div>
  )
}