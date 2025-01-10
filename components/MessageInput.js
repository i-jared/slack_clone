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
    
    const messageContent = content.trim()
    if (!messageContent || isSending) {
      return
    }

    setIsSending(true)
    setError(null)

    // Create temporary message with proper structure
    const tempId = `temp-${Date.now()}`
    const optimisticMessage = {
      id: tempId,
      message: messageContent,
      sender_id: user.id,
      recipient_id: recipient_id,
      channel_id: channel_id,
      inserted_at: new Date().toISOString(),
      sender: {
        id: user.id,
        username: user.email?.split('@')[0],
        avatar_url: user.user_metadata?.avatar_url
      },
      status: 'pending'
    }

    // Show optimistic update
    if (isDirect) {
      window.dispatchEvent(new CustomEvent('newDirectMessage', { 
        detail: optimisticMessage 
      }))
    } else {
      window.dispatchEvent(new CustomEvent('newChannelMessage', { 
        detail: optimisticMessage 
      }))
    }

    // Clear input immediately
    setContent('')
    
    try {
      console.log('🚀 Sending message in background...')
      
      let confirmedMessage
      if (isDirect && recipient_id) {
        console.log('📨 Sending direct message to:', recipient_id)
        confirmedMessage = await sendDirectMessage(messageContent, recipient_id)
        
        // Ensure proper message structure for direct messages
        const formattedMessage = {
          ...confirmedMessage,
          id: confirmedMessage.id || confirmedMessage.messageId,
          message: messageContent,
          inserted_at: confirmedMessage.timestamp || confirmedMessage.inserted_at,
          sender: confirmedMessage.sender || {
            id: user.id,
            username: user.email?.split('@')[0],
            avatar_url: user.user_metadata?.avatar_url
          }
        }

        // Dispatch confirmation event for direct messages
        window.dispatchEvent(new CustomEvent('messageConfirmed', {
          detail: {
            tempId,
            confirmedMessage: formattedMessage
          }
        }))
      } else if (!isDirect && channel_id) {
        console.log('📢 Sending channel message to:', channel_id)
        confirmedMessage = await sendMessage(messageContent, channel_id)
        
        // Dispatch confirmation event for channel messages
        window.dispatchEvent(new CustomEvent('channelMessageConfirmed', {
          detail: {
            tempId,
            confirmedMessage
          }
        }))
      } else {
        throw new Error(isDirect ? 'Recipient not specified' : 'Channel not specified')
      }

      console.log('✅ Message sent and confirmed')
    } catch (error) {
      console.error('❌ Error sending message:', error)
      setError(error.message || 'Failed to send message')
      
      // Dispatch failure event
      const failEvent = new CustomEvent(isDirect ? 'messageFailed' : 'channelMessageFailed', {
        detail: { messageId: tempId }
      })
      window.dispatchEvent(failEvent)
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
    <div className="sticky bottom-0 bg-gray-900 border-t border-gray-700 p-4">
      <form onSubmit={handleSubmit} className="relative">
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={`Message ${isDirect ? 'user' : 'channel'}...`}
          className="w-full px-4 py-2 pr-20 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
          disabled={isSending || isUploading}
        />
        
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-2">
          {/* File upload button */}
          <label className="cursor-pointer">
            <input
              type="file"
              onChange={handleFileUpload}
              className="hidden"
              disabled={isSending || isUploading}
            />
            <div className={`p-2 rounded-full hover:bg-gray-700 transition-colors ${
              isUploading ? 'opacity-50 cursor-not-allowed' : ''
            }`}>
              📎
            </div>
          </label>

          {/* Send button */}
          <button
            type="submit"
            disabled={isSending || isUploading || !content.trim()}
            className={`p-2 rounded-full hover:bg-gray-700 transition-colors ${
              (isSending || isUploading || !content.trim()) ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            ➤
          </button>
        </div>

        {error && (
          <div className="absolute -top-8 left-0 right-0 bg-red-500/10 text-red-400 px-4 py-2 rounded text-sm">
            {error}
          </div>
        )}
      </form>
    </div>
  )
}
