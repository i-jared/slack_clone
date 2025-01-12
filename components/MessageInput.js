import { useState, useContext } from 'react'
import { UserContext } from '../lib/UserContext'
import { sendMessage, sendDirectMessage } from '../lib/Store'

export default function MessageInput({ channel_id, dm_room_id, isDirect = false, recipient_id }) {
  const { user } = useContext(UserContext)
  const [messageText, setMessageText] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!messageText.trim()) return
    if (!user) {
      setError('Not authenticated')
      return
    }

    setIsSending(true)
    setError(null)

    try {
      if (isDirect) {
        if (!recipient_id && !dm_room_id) {
          throw new Error('Need a recipient or dm_room_id for a direct message.')
        }
        await sendDirectMessage(messageText.trim(), recipient_id)
      } else {
        if (!channel_id) {
          throw new Error('No channel_id provided.')
        }
        await sendMessage({
          message: messageText.trim(),
          channel_id,
          user_id: user.id
        })
      }
      setMessageText('')
    } catch (err) {
      console.error('❌ Error sending message:', err)
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
        onChange={(e) => setMessageText(e.target.value)}
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