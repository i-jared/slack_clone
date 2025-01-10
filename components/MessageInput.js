import { useState, useContext } from 'react'
import { supabase, sendMessage, sendDirectMessage, uploadFile } from '~/lib/Store'
import UserContext from '~/lib/UserContext'

export default function MessageInput({ channel_id, recipient_id, isDirect = false, isThread = false, parentMessageId = null }) {
  const [content, setContent] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const { user } = useContext(UserContext)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!content.trim() || isSending) return

    setIsSending(true)
    setError(null)

    try {
      // Create a temporary ID for optimistic update
      const tempId = 'temp-' + Date.now()
      
      // Prepare the message data
      const messageData = {
        id: tempId,
        message: content.trim(),
        user_id: user.id,
        status: 'pending',
        inserted_at: new Date().toISOString()
      }

      if (isDirect) {
        messageData.recipient_id = recipient_id
        messageData.is_direct = true
      } else {
        messageData.channel_id = channel_id
      }

      if (isThread && parentMessageId) {
        messageData.parent_id = parentMessageId
      }

      // Dispatch optimistic update event
      const eventName = isThread ? 'newThreadMessage' : isDirect ? 'newDirectMessage' : 'newMessage'
      window.dispatchEvent(new CustomEvent(eventName, { detail: messageData }))

      // Send the actual message
      const { data: message, error } = await supabase
        .from('messages')
        .insert([{
          message: content.trim(),
          user_id: user.id,
          ...(isDirect ? { recipient_id } : { channel_id }),
          ...(isThread && parentMessageId ? { parent_id: parentMessageId } : {})
        }])
        .select('*, user:user_id(*)')
        .single()

      if (error) throw error

      // Dispatch confirmation event
      const confirmEventName = isThread ? 'threadMessageConfirmed' : isDirect ? 'directMessageConfirmed' : 'messageConfirmed'
      window.dispatchEvent(new CustomEvent(confirmEventName, {
        detail: { tempId, confirmedMessage: message }
      }))

      // Clear the input
      setContent('')

      // Trigger scroll to bottom after a short delay to ensure message is rendered
      setTimeout(() => {
        const messagesEndRef = document.querySelector('[data-messages-end]')
        messagesEndRef?.scrollIntoView({ behavior: 'smooth' })
      }, 100)

    } catch (error) {
      console.error('Error sending message:', error)
      setError(error.message)
      
      // Dispatch failure event
      const failEventName = isThread ? 'threadMessageFailed' : isDirect ? 'directMessageFailed' : 'messageFailed'
      window.dispatchEvent(new CustomEvent(failEventName, {
        detail: { messageId: tempId }
      }))
    } finally {
      setIsSending(false)
    }
  }

  const handleFileUpload = async (e) => {
    console.log('🔍 Debug: Starting handleFileUpload')
    const file = e.target.files?.[0]
    
    if (!file) {
      console.log('⚠️ No file selected')
      return
    }

    // Set the selected file
    setSelectedFile(file)

    console.log('📁 File details:', {
      name: file.name,
      type: file.type,
      size: file.size,
      lastModified: file.lastModified
    })

    // Reset error state
    setError(null)

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB in bytes
    if (file.size > maxSize) {
      console.error('❌ File too large:', {
        fileSize: file.size,
        maxSize,
        difference: file.size - maxSize
      })
      setError('File size must be less than 5MB')
      setSelectedFile(null)
      return
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf']
    if (!allowedTypes.includes(file.type)) {
      console.error('❌ Invalid file type:', {
        fileType: file.type,
        allowedTypes
      })
      setError('Only images (JPEG, PNG, GIF) and PDF files are allowed')
      setSelectedFile(null)
      return
    }

    try {
      console.log('📤 Starting file upload...')
      setIsUploading(true)
      setError(null)

      const result = await uploadFile(file, 'message_attachments')
      console.log('✅ File uploaded successfully:', result)
      
      const fileMessage = `[File: ${file.name}](${result.url})`
      console.log('📝 Creating file message:', fileMessage)
      
      if (isDirect && recipient_id) {
        console.log('📨 Sending direct message with file to:', recipient_id)
        await sendDirectMessage(fileMessage, recipient_id)
      } else if (!isDirect && channel_id) {
        console.log('📢 Sending channel message with file to:', channel_id)
        await sendMessage(fileMessage, channel_id)
      } else {
        console.error('❌ Invalid message target:', { isDirect, channel_id, recipient_id })
        throw new Error(isDirect ? 'Recipient not specified' : 'Channel not specified')
      }

      console.log('✅ File message sent successfully!')
      setSelectedFile(null)
    } catch (error) {
      console.error('❌ Error handling file:', error)
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      })
      setError(error.message || 'Failed to upload file')
      setSelectedFile(null)
      // Reset file input
      e.target.value = ''
    } finally {
      setIsUploading(false)
      console.log('🏁 handleFileUpload completed')
    }
  }

  const messageInputStyles = {
    position: 'sticky',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#1a1d21',
    borderTop: '1px solid #2D2D2E',
    padding: '20px',
    zIndex: 5,
    width: '100%',
    transition: 'all 0.2s ease-in-out',
    boxShadow: '0 -4px 6px -1px rgba(0, 0, 0, 0.1)'
  }

  return (
    <div style={messageInputStyles}>
      <div className="max-w-screen-xl mx-auto">
        <div className="relative">
          {/* File attachment button */}
          <button
            onClick={() => document.getElementById('file-input').click()}
            className="absolute left-4 bottom-3 text-gray-400 hover:text-yellow-500 transition-colors duration-200"
            title="Attach file"
            disabled={isUploading}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clipRule="evenodd" />
            </svg>
          </button>

          <input
            id="file-input"
            type="file"
            className="hidden"
            onChange={handleFileUpload}
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
            disabled={isUploading}
          />

          {/* Message input */}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={`Message ${isDirect ? 'user' : '#channel'}`}
            className="w-full bg-gray-700 text-white rounded-lg pl-12 pr-20 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all duration-200 border border-transparent hover:border-gray-600"
            style={{ 
              minHeight: '48px', 
              maxHeight: '200px', 
              resize: 'none',
              fontSize: '0.95rem',
              lineHeight: '1.5'
            }}
            disabled={isUploading}
          />

          {/* Send button */}
          <button
            onClick={handleSubmit}
            disabled={(!content.trim() && !selectedFile) || isUploading || isSending}
            className={`absolute right-2 bottom-2 px-4 py-1.5 rounded-md transition-all duration-200 font-medium ${
              (content.trim() || selectedFile) && !isUploading && !isSending
                ? 'bg-yellow-500 hover:bg-yellow-600 text-gray-900 shadow-sm hover:shadow'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed opacity-75'
            }`}
          >
            {isUploading ? 'Uploading...' : isSending ? 'Sending...' : 'Send'}
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="mt-2 text-red-400 text-sm font-medium px-2">
            {error}
          </div>
        )}

        {/* File preview */}
        {selectedFile && (
          <div className="mt-2 p-3 bg-gray-700 rounded-md flex items-center justify-between border border-gray-600">
            <span className="text-sm text-gray-300">{selectedFile.name}</span>
            <button
              onClick={() => setSelectedFile(null)}
              className="text-gray-400 hover:text-gray-200"
              disabled={isUploading}
            >
              ×
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
