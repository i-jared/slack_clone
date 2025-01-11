import { useState, useContext } from 'react'
import { UserContext } from '../lib/UserContext'
import { sendMessage } from '../lib/Store'

export default function MessageInput({ channel_id, isThread = false }) {
  const { user } = useContext(UserContext)
  const [messageText, setMessageText] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    console.log('🔍 Debug: Starting handleSubmit')
    
    if (!messageText.trim()) return
    
    setIsSending(true)
    setError(null)

    try {
      console.log('🚀 Sending message in background...')
      console.log('📢 Sending channel message to:', channel_id)

      await sendMessage({
        message: messageText.trim(),
        channel_id,
        user_id: user.id
      })

      setMessageText('')
    } catch (error) {
      console.error('❌ Error sending message:', error)
      setError(error.message)
    } finally {
      setIsSending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center p-4 bg-gray-800">
      <input
        type="text"
        placeholder={`Message ${isThread ? 'thread' : 'channel'}...`}
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
