import { useState, useContext } from 'react'
import { UserContext } from '../lib/UserContext'
import { sendMessage, sendDirectMessage } from '../lib/Store'
import { createLogger } from '~/lib/logger'

const logger = createLogger('MessageInput')

export default function MessageInput({ channel_id, dm_room_id, isDirect = false, recipient_id }) {
  const { user } = useContext(UserContext)
  const [messageText, setMessageText] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState(null)

  logger.debug('MessageInput mounted:', {
    channel_id,
    dm_room_id,
    isDirect,
    recipient_id,
    userId: user?.id
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    const trimmedMessage = messageText.trim()

    logger.debug('Handling message submit:', {
      messageLength: trimmedMessage.length,
      isDirect,
      channel_id,
      dm_room_id,
      recipient_id
    })

    if (!trimmedMessage) {
      logger.debug('Empty message, skipping send')
      return
    }

    if (!user) {
      logger.error('Attempted to send message while not authenticated')
      setError('Not authenticated')
      return
    }

    setIsSending(true)
    setError(null)

    try {
      if (isDirect) {
        if (!recipient_id && !dm_room_id) {
          logger.error('Missing recipient info for DM:', { recipient_id, dm_room_id })
          throw new Error('Need a recipient or dm_room_id for a direct message.')
        }

        logger.debug('Sending direct message:', {
          messageLength: trimmedMessage.length,
          recipient_id,
          dm_room_id
        })

        await sendDirectMessage({
          message: trimmedMessage,
          room_id: dm_room_id,
          sender_id: user.id,
          recipient_id
        })

        logger.info('Direct message sent successfully')
      } else {
        if (!channel_id) {
          logger.error('Missing channel_id for channel message')
          throw new Error('No channel_id provided.')
        }

        logger.debug('Sending channel message:', {
          messageLength: trimmedMessage.length,
          channel_id,
          user_id: user.id
        })

        await sendMessage({
          message: trimmedMessage,
          channel_id,
          user_id: user.id
        })

        logger.info('Channel message sent successfully')
      }

      setMessageText('')
    } catch (err) {
      logger.error('Error sending message:', err, {
        isDirect,
        channel_id,
        dm_room_id,
        recipient_id
      })
      setError(err.message)
    } finally {
      setIsSending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center p-4 bg-gray-800">
      <input
        type="text"
        placeholder={`Message ${isDirect ? 'this user' : 'channel'}...`}
        value={messageText}
        onChange={(e) => {
          const newValue = e.target.value
          logger.debug('Message input changed:', { 
            length: newValue.length,
            isEmpty: !newValue.trim()
          })
          setMessageText(newValue)
        }}
        className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-l focus:outline-none focus:ring-2 focus:ring-yellow-500"
        disabled={isSending}
      />
      <button
        type="submit"
        disabled={isSending || !messageText.trim()}
        className="px-4 py-2 bg-yellow-500 text-gray-900 rounded-r hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSending ? 'Sending...' : 'Send'}
      </button>
      {error && (
        <div className="text-red-500 text-sm ml-2">
          {error}
        </div>
      )}
    </form>
  )
}