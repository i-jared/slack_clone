import { useState, useContext, useEffect } from 'react'
import { supabase } from '~/lib/Store'
import UserContext from '~/lib/UserContext'

export default function UserProfile() {
  const { user, signOut } = useContext(UserContext)
  const [username, setUsername] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (user) {
      fetchProfile()
    }
  }, [user])

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('username, avatar_url')
        .eq('id', user.id)
        .single()

      if (error) throw error
      if (data) {
        setUsername(data.username || '')
        setAvatarUrl(data.avatar_url || '')
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  }

  const uploadAvatar = async (event) => {
    try {
      setUploading(true)
      const file = event.target.files[0]
      const fileExt = file.name.split('.').pop()
      const filePath = `${user.id}-${Math.random()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      await updateProfile({ avatar_url: publicUrl })
      setAvatarUrl(publicUrl)
    } catch (error) {
      console.error('Error uploading avatar:', error)
    } finally {
      setUploading(false)
    }
  }

  const updateProfile = async (updates) => {
    try {
      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id)

      if (error) throw error
      
      if (updates.username) setUsername(updates.username)
      if (updates.avatar_url) setAvatarUrl(updates.avatar_url)
      setIsEditing(false)
    } catch (error) {
      console.error('Error updating profile:', error)
    }
  }

  if (!user) return null

  return (
    <>
      {isEditing ? (
        <div className="p-4 bg-gray-800 shadow-lg">
          <h3 className="text-lg font-bold mb-4 text-white">Profile Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm mb-2 text-white">Avatar</label>
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={username} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl text-white">{username?.charAt(0)?.toUpperCase()}</span>
                  )}
                </div>
                <label className="cursor-pointer bg-yellow-500 text-black px-4 py-2 rounded hover:bg-yellow-400">
                  {uploading ? 'Uploading...' : 'Upload'}
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={uploadAvatar}
                    disabled={uploading}
                  />
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm mb-2 text-white">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-yellow-500"
                placeholder="Enter username"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={() => updateProfile({ username })}
                className="px-4 py-2 bg-yellow-500 text-black rounded hover:bg-yellow-400"
              >
                Save
              </button>
            </div>
            <div className="pt-4 border-t border-gray-700">
              <button
                onClick={signOut}
                className="w-full px-4 py-2 bg-red-500/10 text-red-400 rounded hover:bg-red-500/20 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div 
          className="p-3 cursor-pointer hover:bg-gray-800"
          onClick={() => setIsEditing(true)}
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden">
              {avatarUrl ? (
                <img src={avatarUrl} alt={username} className="w-full h-full object-cover" />
              ) : (
                <span className="text-lg text-white">{username?.charAt(0)?.toUpperCase()}</span>
              )}
            </div>
            <div>
              <div className="font-medium text-white">{username || 'Set Username'}</div>
              <div className="text-xs text-gray-400">Click to edit profile</div>
            </div>
          </div>
        </div>
      )}
    </>
  )
} 