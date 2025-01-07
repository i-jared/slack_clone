import { useState, useRef, useContext } from 'react'
import { supabase } from '~/lib/Store'
import UserContext from '~/lib/UserContext'

const MessageInput = ({ channel_id }) => {
  const { user } = useContext(UserContext)
  const [message, setMessage] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef(null)

  const sendMessage = async (e) => {
    e.preventDefault()
    
    if (!message.trim() && !fileInputRef.current?.files?.length) return

    try {
      let attachments = []

      // Handle file uploads if any
      if (fileInputRef.current?.files?.length) {
        setIsUploading(true)
        setUploadProgress(0)

        for (const file of fileInputRef.current.files) {
          const fileExt = file.name.split('.').pop()
          const filePath = `${channel_id}/${Date.now()}-${Math.random()}.${fileExt}`

          const { error: uploadError } = await supabase.storage
            .from('attachments')
            .upload(filePath, file, {
              onUploadProgress: (progress) => {
                setUploadProgress(Math.round((progress.loaded / progress.total) * 100))
              }
            })

          if (uploadError) throw uploadError

          const { data: { publicUrl } } = supabase.storage
            .from('attachments')
            .getPublicUrl(filePath)

          attachments.push({
            url: publicUrl,
            type: file.type,
            name: file.name
          })
        }
      }

      // Send message
      const { error } = await supabase
        .from('messages')
        .insert([
          { 
            message: message.trim(),
            channel_id,
            user_id: user.id,
            attachments: attachments.length ? attachments : null
          }
        ])

      if (error) throw error

      // Clear input
      setMessage('')
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  return (
    <form onSubmit={sendMessage} className="sw-message-input">
      <div className="relative">
        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50 rounded">
            <div className="text-center">
              <div className="text-yellow-400 font-orbitron">Uploading... {uploadProgress}%</div>
              <div className="w-48 h-1 bg-gray-700 rounded-full mt-2">
                <div 
                  className="h-full bg-yellow-400 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          </div>
        )}
        <div className="flex items-center gap-2">
          <textarea
            className="sw-input flex-1"
            value={message}
            placeholder="Type a message..."
            rows={1}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                sendMessage(e)
              }
            }}
          />
          <div className="flex items-center gap-2">
            <label className="sw-button-secondary cursor-pointer">
              <span>Attach</span>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={() => {}} // Required to make the input controlled
              />
            </label>
            <button type="submit" className="sw-button">
              Send
            </button>
          </div>
        </div>
      </div>
    </form>
  )
}

export default MessageInput
