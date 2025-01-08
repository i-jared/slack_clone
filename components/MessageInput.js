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
    console.log('🔍 Debug: Starting handleSubmit')
    console.log('📝 Message content:', content)
    console.log('🎯 Target:', isDirect ? 'Direct Message' : 'Channel Message')
    console.log('Parameters:', {
      isDirect,
      channel_id,
      recipient_id,
      content: content.trim(),
      user: user?.id
    })

    if (!content.trim() || isSending) {
      console.log('⚠️ Validation failed:', {
        emptyContent: !content.trim(),
        isSending
      })
      return
    }

    try {
      console.log('🚀 Attempting to send message...')
      setIsSending(true)
      setError(null)
      
      if (isDirect && recipient_id) {
        console.log('📨 Sending direct message to:', recipient_id)
        await sendDirectMessage(content.trim(), recipient_id)
      } else if (!isDirect && channel_id) {
        console.log('📢 Sending channel message to:', channel_id)
        await sendMessage(content.trim(), channel_id)
      } else {
        console.error('❌ Invalid message target:', { isDirect, channel_id, recipient_id })
        throw new Error(isDirect ? 'Recipient not specified' : 'Channel not specified')
      }

      console.log('✅ Message sent successfully!')
      setContent('')
    } catch (error) {
      console.error('❌ Error sending message:', error)
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      })
      setError(error.message || 'Failed to send message')
    } finally {
      setIsSending(false)
      console.log('🏁 handleSubmit completed')
    }
  }

  const handleFileUpload = async (e) => {
    console.log('🔍 Debug: Starting handleFileUpload')
    const file = e.target.files?.[0]
    
    if (!file) {
      console.log('⚠️ No file selected')
      return
    }

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
    } catch (error) {
      console.error('❌ Error handling file:', error)
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      })
      setError(error.message || 'Failed to upload file')
      // Reset file input
      e.target.value = ''
    } finally {
      setIsUploading(false)
      console.log('🏁 handleFileUpload completed')
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
