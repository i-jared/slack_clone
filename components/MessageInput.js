import { useState, useContext } from 'react'
import { supabase } from '~/lib/supabaseClient'
import { logger } from '~/lib/logger'
import { UserContext } from '~/lib/UserContext'
import { v4 as uuidv4 } from 'uuid'

const messageInputLogger = logger.withPrefix('MessageInput')

export default function MessageInput({ channel_id, dm_room_id, isDirect, recipient_id }) {
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState(null)
  const { session } = useContext(UserContext)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!message.trim()) {
      messageInputLogger.warn('Ignoring empty message submit')
      return
    }

    messageInputLogger.debug('handleSubmit triggered', {
      messageLength: message.length,
      channel_id,
      dm_room_id,
      isDirect,
      recipient_id
    })

    setSending(true)
    setError(null)

    try {
      if (!session?.user) {
        messageInputLogger.error('Not authenticated, cannot send message')
        throw new Error('Not authenticated')
      }

      if (isDirect) {
        messageInputLogger.debug('Sending direct message flow')
        const { data, error: dmError } = await supabase
          .from('direct_messages')
          .insert([{
            id: uuidv4(),
            dm_room_id,
            sender_id: session.user.id,
            message_text: message.trim(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])

        if (dmError) {
          messageInputLogger.error('Error sending direct message:', dmError)
          throw dmError
        }
        messageInputLogger.info('Direct message sent successfully', { dmRoomId: dm_room_id })
      } else {
        messageInputLogger.debug('Sending channel message flow')
        const { data, error: chanError } = await supabase
          .from('messages')
          .insert([{
            id: uuidv4(),
            message_text: message.trim(),
            user_id: session.user.id,
            channel_id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])

        if (chanError) {
          messageInputLogger.error('Error sending channel message:', chanError)
          throw chanError
        }
        messageInputLogger.info('Channel message sent successfully', { channel_id })
      }

      setMessage('')
    } catch (err) {
      messageInputLogger.error('Error sending message:', err)
      setError(err.message)
    } finally {
      setSending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center p-4 bg-gray-800">
      <input
        type="text"
        placeholder={`Message ${isDirect ? 'this user' : 'channel'}...`}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-l focus:outline-none focus:ring-2 focus:ring-yellow-500"
        disabled={sending}
      />
      <button
        type="submit"
        disabled={sending || !message.trim()}
        className="px-4 py-2 bg-yellow-500 text-gray-900 rounded-r hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {sending ? 'Sending...' : 'Send'}
      </button>
      {error && (
        <div className="text-red-500 text-sm ml-2">
          {error}
        </div>
      )}
    </form>
  )
}