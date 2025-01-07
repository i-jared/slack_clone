import { useState, useContext } from 'react'
import UserContext from '~/lib/UserContext'
import { supabase } from '~/lib/Store'

const UserProfile = ({ isOpen, onClose }) => {
  const { user } = useContext(UserContext)
  const [username, setUsername] = useState(user?.username || '')
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || '')
  const [status, setStatus] = useState('ONLINE')
  const [isUploading, setIsUploading] = useState(false)
  const [message, setMessage] = useState('')

  const updateProfile = async (e) => {
    e.preventDefault()
    
    try {
      setMessage('')
      
      const { error } = await supabase
        .from('users')
        .update({ 
          username,
          avatar_url: avatarUrl,
          status
        })
        .eq('id', user.id)

      if (error) throw error
      setMessage('Profile updated successfully!')
    } catch (error) {
      console.error('Error updating profile:', error)
      setMessage('Error updating profile. Please try again.')
    }
  }

  const handleFileUpload = async (e) => {
    try {
      setIsUploading(true)
      setMessage('')
      
      const file = e.target.files[0]
      const fileExt = file.name.split('.').pop()
      const filePath = `${user.id}-${Math.random()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      setAvatarUrl(publicUrl)
      setMessage('Avatar uploaded successfully!')
    } catch (error) {
      console.error('Error uploading avatar:', error)
      setMessage('Error uploading avatar. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
        
        <div className="relative w-full max-w-md rounded-lg bg-gray-800/95 border-2 border-yellow-400/50 shadow-xl">
          <div className="p-6">
            <h2 className="text-2xl font-orbitron text-yellow-400 mb-6">Profile Settings</h2>
            
            <form onSubmit={updateProfile} className="space-y-4">
              {/* Avatar */}
              <div className="space-y-2">
                <label className="block font-orbitron text-sm text-gray-300">Avatar</label>
                <div className="flex items-center space-x-4">
                  <div className="sw-profile-icon w-16 h-16 rounded-full overflow-hidden">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gray-700 flex items-center justify-center text-xl text-yellow-400">
                        {username?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase()}
                      </div>
                    )}
                  </div>
                  <label className="sw-button cursor-pointer">
                    <span>{isUploading ? 'Uploading...' : 'Upload'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      disabled={isUploading}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Username */}
              <div className="space-y-2">
                <label className="block font-orbitron text-sm text-gray-300">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="sw-input w-full"
                  placeholder="Enter username"
                />
              </div>

              {/* Status */}
              <div className="space-y-2">
                <label className="block font-orbitron text-sm text-gray-300">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="sw-input w-full"
                >
                  <option value="ONLINE">Online</option>
                  <option value="OFFLINE">Offline</option>
                </select>
              </div>

              {/* Message */}
              {message && (
                <p className={`text-sm ${message.includes('Error') ? 'text-red-400' : 'text-green-400'}`}>
                  {message}
                </p>
              )}

              {/* Buttons */}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="sw-button-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="sw-button"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserProfile 