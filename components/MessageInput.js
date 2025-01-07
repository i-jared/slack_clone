import { useContext, useRef, useState } from 'react'
import UserContext from '~/lib/UserContext'
import { addMessage, uploadFile } from '~/lib/Store'

const MessageInput = ({ channel_id }) => {
  const { user } = useContext(UserContext)
  const [message, setMessage] = useState('')
  const [uploading, setUploading] = useState(false)
  const [attachments, setAttachments] = useState([])
  const fileInputRef = useRef(null)

  const submitOnEnter = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSubmit(event)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (!channel_id) {
        console.error('No channel_id provided')
        return
      }

      if (message.trim() || attachments.length > 0) {
        console.log('Submitting message:', {
          message: message.trim(),
          channel_id,
          user_id: user.id,
          attachments
        })

        await addMessage(message.trim(), parseInt(channel_id), user.id, attachments)
        setMessage('')
        setAttachments([])
      }
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    setUploading(true)
    try {
      const uploadedFiles = await Promise.all(
        files.map(async (file) => {
          const fileData = await uploadFile(file, user.id)
          return fileData
        })
      )
      setAttachments(prev => [...prev, ...uploadedFiles])
    } catch (error) {
      console.error('Error uploading files:', error)
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
    <div className="p-4 bg-gray-800">
      {/* File attachments preview */}
      {attachments.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {attachments.map((file, index) => (
            <div 
              key={index}
              className="flex items-center gap-1 bg-gray-700 rounded px-2 py-1"
            >
              <span className="text-sm text-gray-300">{file.name}</span>
              <button
                onClick={() => removeAttachment(index)}
                className="text-gray-400 hover:text-white ml-1"
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
          className="p-2 text-gray-400 hover:text-white disabled:opacity-50"
          title="Attach files"
        >
          <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none">
            <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
          </svg>
        </button>

        <input
          className="flex-1 bg-gray-700 rounded px-4 py-2 text-white placeholder-gray-400 focus:outline-none"
          type="text"
          placeholder="Send a message (press Enter to submit)"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={submitOnEnter}
          disabled={uploading}
        />

        <button
          type="submit"
          disabled={uploading || (!message.trim() && attachments.length === 0)}
          className="p-2 text-gray-400 hover:text-white disabled:opacity-50"
        >
          {uploading ? (
            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          )}
        </button>
      </form>
    </div>
  )
}

export default MessageInput
