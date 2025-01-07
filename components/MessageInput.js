import { useState, useContext } from 'react'
import { supabase, sendMessage } from '~/lib/Store'
import UserContext from '~/lib/UserContext'

export default function MessageInput({ channel_id, recipient_id, isDirect = false }) {
  const [content, setContent] = useState('')
  const [isSending, setIsSending] = useState(false)
  const { user } = useContext(UserContext)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!content.trim()) return

    try {
      setIsSending(true)
      
      if (isDirect) {
        // Handle direct message
        const { error } = await supabase.from('direct_messages').insert([{
          message: content.trim(),
          sender_id: user.id,
          recipient_id: recipient_id
        }])
        if (error) throw error
      } else {
        // Handle channel message using the sendMessage function
        await sendMessage(content.trim(), channel_id)
      }

      setContent('')
    } catch (error) {
      console.error('Error sending message:', error)
      alert('Failed to send message. Please try again.')
    } finally {
      setIsSending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-gray-800/90">
      <div className="flex space-x-2">
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 bg-gray-700 text-white rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
          disabled={isSending}
        />
        <button
          type="submit"
          disabled={!content.trim() || isSending}
          className={`px-4 py-2 rounded font-orbitron ${
            !content.trim() || isSending
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
              : 'bg-yellow-500 hover:bg-yellow-600 text-black'
          }`}
        >
          Send
        </button>
      </div>
    </form>
  )
}
