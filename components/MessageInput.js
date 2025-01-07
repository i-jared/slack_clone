import { useState, useContext, useRef } from 'react'
import UserContext from '~/lib/UserContext'
import { addMessage, uploadFile } from '~/lib/Store'

const MessageInput = ({ channel_id }) => {
  const { user } = useContext(UserContext)
  const [messageText, setMessageText] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [attachments, setAttachments] = useState([])
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!messageText.trim() && attachments.length === 0) return

    try {
      setIsSending(true)
      const message = await addMessage(messageText, channel_id, user.id, attachments)
      setMessageText('')
      setAttachments([])
    } catch (error) {
      console.error('Error sending message:', error)
      alert('Failed to send message. Please try again.')
    } finally {
      setIsSending(false)
    }
  }

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    try {
      setUploading(true)
      const uploadedFiles = await Promise.all(
        files.map(async (file) => {
          const fileData = await uploadFile(file, user.id)
          return fileData
        })
      )
      setAttachments(prev => [...prev, ...uploadedFiles])
    } catch (error) {
      console.error('Error uploading files:', error)
      alert('Failed to upload files. Please try again.')
    } finally {
      setUploading(false)
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="p-4 bg-gray-900 bg-opacity-90">
      {/* File attachments preview */}
      {attachments.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {attachments.map((file, index) => (
            <div 
              key={index}
              className="flex items-center gap-1 bg-gray-800 rounded px-2 py-1 border border-yellow-400/30"
            >
              <span className="text-sm text-yellow-400">{file.name}</span>
              <button
                onClick={() => removeAttachment(index)}
                className="text-gray-400 hover:text-yellow-400 ml-1"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          multiple
          className="hidden"
        />
        
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="p-2 text-gray-400 hover:text-yellow-400 disabled:opacity-50"
          title="Attach files"
        >
          <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none">
            <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
          </svg>
        </button>

        <input
          type="text"
          placeholder="Send a message..."
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          className="flex-1 bg-gray-800 text-white rounded px-4 py-2 sw-input"
          disabled={isSending}
        />

        <button
          type="submit"
          disabled={isSending || (!messageText.trim() && attachments.length === 0)}
          className={`sw-button px-4 py-2 rounded ${
            isSending || (!messageText.trim() && attachments.length === 0)
              ? 'opacity-50 cursor-not-allowed'
              : ''
          }`}
        >
          {isSending ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  )
}

export default MessageInput
