import { useEffect, useRef, useContext } from 'react'
import { useDirectMessages } from '~/lib/Store'
import Message from './Message'
import MessageInput from './MessageInput'
import LoadingScreen from './LoadingScreen'
import { v4 as uuidv4 } from 'uuid'
import { UserContext } from '~/lib/UserContext'
import { createLogger } from '~/lib/logger'

const logger = createLogger('DirectMessage')

export default function DirectMessage({ dmRoomId, recipient }) {
  const { user } = useContext(UserContext)
  const { messages, isLoading, addMessage } = useDirectMessages({
    dmRoomId,
    recipientId: recipient?.id
  })
  const messagesEndRef = useRef(null)

  logger.debug('DirectMessage mounted:', {
    dmRoomId,
    recipientId: recipient?.id,
    recipientEmail: recipient?.email,
    recipientUsername: recipient?.username,
    messagesCount: messages?.length
  })

  useEffect(() => {
    if (messages?.length > 0) {
      logger.debug('Scrolling to bottom:', {
        messageCount: messages.length,
        lastMessageId: messages[messages.length - 1].id
      })
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  if (isLoading) {
    logger.debug('Loading conversation')
    return <LoadingScreen message="Loading conversation..." />
  }

  const displayName = recipient?.username || recipient?.email?.split('@')[0] || 'Unknown User'
  logger.debug('Resolved display name:', { displayName, recipient })

  const handleSend = async (content) => {
    const tempId = `temp-${uuidv4()}`
    logger.debug('Preparing to send message:', {
      tempId,
      dmRoomId,
      senderId: user?.id,
      contentLength: content.length
    })

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
    
    logger.debug('Adding temporary message:', { tempId, dmRoomId })
    addMessage(tempMessage)
    
    try {
      logger.debug('Sending direct message:', {
        tempId,
        recipientId: recipient?.id,
        contentLength: content.length
      })

      const confirmedMessage = await sendDirectMessage(content, recipient.id)
      logger.info('Message confirmed:', {
        tempId,
        confirmedId: confirmedMessage.id
      })

      window.dispatchEvent(new CustomEvent('messageConfirmed', {
        detail: { tempId, confirmedMessage }
      }))
    } catch (error) {
      logger.error('Error sending message:', error, {
        tempId,
        dmRoomId,
        recipientId: recipient?.id
      })
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
              logger.debug('Rendering message:', {
                messageId: message.id,
                senderId: message.sender_id,
                timestamp: message.created_at
              })
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
      <MessageInput dm_room_id={dmRoomId} isDirect recipient_id={recipient?.id} />
    </div>
  )
}