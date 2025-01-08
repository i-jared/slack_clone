import { useState, useContext } from 'react'
import { supabase, sendMessage, sendDirectMessage, uploadFile } from '~/lib/Store'
import UserContext from '~/lib/UserContext'

export default function MessageInput({ channel_id, recipient_id, isDirect = false }) {
  const [content, setContent] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState(null)
  const { user } = useContext(UserContext)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!content.trim() || isSending) return

    try {
      setIsSending(true)
      setError(null)
      
      if (isDirect && recipient_id) {
        await sendDirectMessage(content.trim(), recipient_id)
      } else if (!isDirect && channel_id) {
        await sendMessage(content.trim(), channel_id)
      } else {
        throw new Error(isDirect ? 'Recipient not specified' : 'Channel not specified')
      }

      setContent('')
    } catch (error) {
      console.error('Error sending message:', error)
      setError(error.message || 'Failed to send message')
    } finally {
      setIsSending(false)
    }
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Reset error state
    setError(null)

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB in bytes
    if (file.size > maxSize) {
      setError('File size must be less than 5MB')
      return
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf']
    if (!allowedTypes.includes(file.type)) {
      setError('Only images (JPEG, PNG, GIF) and PDF files are allowed')
      return
    }

    try {
      setIsUploading(true)
      setError(null)

      const result = await uploadFile(file, 'message_attachments')
      const fileMessage = `[File: ${file.name}](${result.url})`
      
      if (isDirect && recipient_id) {
        await sendDirectMessage(fileMessage, recipient_id)
      } else if (!isDirect && channel_id) {
        await sendMessage(fileMessage, channel_id)
      } else {
        throw new Error(isDirect ? 'Recipient not specified' : 'Channel not specified')
      }
    } catch (error) {
      console.error('Error uploading file:', error)
      setError(error.message || 'Failed to upload file')
      // Reset file input
      e.target.value = ''
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-gray-800/90">
      {error && (
        <div className="mb-2 text-red-400 text-sm">
          {error}
        </div>
      )}
      <div className="flex space-x-2">
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={isDirect ? "Send a direct message..." : "Type your message..."}
          className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
          disabled={isSending || isUploading}
        />
        <label className={`px-4 py-2 bg-gray-700 text-white rounded-lg cursor-pointer hover:bg-gray-600 
          ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
          <input
            type="file"
            onChange={handleFileUpload}
            className="hidden"
            accept="image/jpeg,image/png,image/gif,application/pdf"
            disabled={isSending || isUploading}
          />
          {isUploading ? '📤 Uploading...' : '📎'}
        </label>
        <button
          type="submit"
          disabled={isSending || isUploading || !content.trim()}
          className={`px-4 py-2 bg-yellow-500 text-gray-900 rounded-lg font-medium
            ${(isSending || isUploading || !content.trim()) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-yellow-400'}`}
        >
          {isSending ? 'Sending...' : 'Send'}
        </button>
      </div>
    </form>
  )
}
