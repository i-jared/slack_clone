import { useState, useContext } from 'react'
import UserContext from '~/lib/UserContext'
import { supabase } from '~/lib/Store'

const UserProfile = ({ isOpen, onClose }) => {
  const { user } = useContext(UserContext)
  const [isEditing, setIsEditing] = useState(false)
  const [username, setUsername] = useState(user?.dbUser?.username || '')
  const [status, setStatus] = useState(user?.dbUser?.status || 'ONLINE')
  const [isLoading, setIsLoading] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState(user?.dbUser?.avatar_url || null)

  const handleUpdateProfile = async () => {
    if (!user?.dbUser?.id) return
    setIsLoading(true)
    
    try {
      const { error } = await supabase
        .from('users')
        .update({
          username,
          status,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.dbUser.id)

      if (error) throw error
      setIsEditing(false)
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Failed to update profile. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const ensureAvatarBucket = async () => {
    try {
      // Check if bucket exists
      const { data: buckets } = await supabase
        .storage
        .listBuckets()

      const avatarBucket = buckets?.find(b => b.name === 'avatars')
      
      if (!avatarBucket) {
        // Create bucket if it doesn't exist
        const { error: createError } = await supabase
          .storage
          .createBucket('avatars', {
            public: true,
            allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif'],
            fileSizeLimit: 1024 * 1024 * 2 // 2MB
          })

        if (createError) throw createError
      }
    } catch (error) {
      console.error('Error ensuring avatar bucket exists:', error)
      throw error
    }
  }

  const handleAvatarUpload = async (event) => {
    try {
      setIsLoading(true)
      const file = event.target.files?.[0]
      if (!file) return

      // Delete old avatar if exists
      if (avatarUrl) {
        const oldFilePath = avatarUrl.split('/').pop()
        if (oldFilePath) {
          await supabase.storage
            .from('avatars')
            .remove([oldFilePath])
        }
      }

      // Upload new avatar in user's folder
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.dbUser.id}/${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)

      // Update user profile with new avatar URL
      const { error: updateError } = await supabase
        .from('users')
        .update({ 
          avatar_url: publicUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.dbUser.id)

      if (updateError) throw updateError
      
      setAvatarUrl(publicUrl)

    } catch (error) {
      console.error('Error uploading avatar:', error)
      alert('Failed to upload avatar. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="w-80 border-l border-gray-700 bg-gray-900 h-full overflow-y-auto">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Profile</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6">
          {/* Avatar Section */}
          <div className="text-center">
            <div className="relative inline-block">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-indigo-600 flex items-center justify-center text-white text-2xl font-medium">
                  {username.slice(0, 2).toUpperCase()}
                </div>
              )}
              {isEditing && (
                <label className="absolute bottom-0 right-0 bg-gray-800 rounded-full p-2 cursor-pointer hover:bg-gray-700">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                    disabled={isLoading}
                  />
                  📷
                </label>
              )}
            </div>
          </div>

          {/* User Details */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Username
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-gray-800 text-white px-3 py-2 rounded border border-gray-700 focus:outline-none focus:border-indigo-500"
                  disabled={isLoading}
                />
              ) : (
                <p className="text-white">{username}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Status
              </label>
              {isEditing ? (
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full bg-gray-800 text-white px-3 py-2 rounded border border-gray-700 focus:outline-none focus:border-indigo-500"
                  disabled={isLoading}
                >
                  <option value="ONLINE">Online</option>
                  <option value="AWAY">Away</option>
                  <option value="BUSY">Busy</option>
                  <option value="OFFLINE">Offline</option>
                </select>
              ) : (
                <p className="text-white capitalize">{status.toLowerCase()}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Email
              </label>
              <p className="text-white">{user?.email}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            {isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-sm text-gray-400 hover:text-white"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateProfile}
                  className="px-4 py-2 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700"
                  disabled={isLoading}
                >
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 text-sm bg-gray-800 text-white rounded hover:bg-gray-700"
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserProfile 