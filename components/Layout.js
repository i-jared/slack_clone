import React, { useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import UserContext from '~/lib/UserContext'
import { supabase } from '~/lib/Store'
import { CHANNELS } from '~/lib/constants'

const Layout = ({ children }) => {
  const { user, signOut } = useContext(UserContext)
  const [isNavigating, setIsNavigating] = useState(false)
  const [channels, setChannels] = useState([])
  const [users, setUsers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [showProfilePopup, setShowProfilePopup] = useState(false)
  const [username, setUsername] = useState(user?.dbUser?.username || '')
  const [avatarUrl, setAvatarUrl] = useState(user?.dbUser?.avatar_url || '')
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetchChannels()
    fetchUsers()
  }, [])

  const fetchChannels = async () => {
    try {
      const { data, error } = await supabase.from('channels').select('*')
      if (error) throw error
      setChannels(data)
    } catch (error) {
      console.error('Error fetching channels:', error)
    }
  }

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase.from('users').select('*')
      if (error) throw error
      setUsers(data)
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  const uploadAvatar = async (event) => {
    try {
      setUploading(true)
      
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.')
      }

      const file = event.target.files[0]
      const fileExt = file.name.split('.').pop()
      const filePath = `${user.id}-${Math.random()}.${fileExt}`

      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      setAvatarUrl(publicUrl)
    } catch (error) {
      console.error('Error uploading avatar:', error)
    } finally {
      setUploading(false)
    }
  }

  const updateProfile = async () => {
    try {
      const { error } = await supabase
        .from('users')
        .update({
          username: username,
          avatar_url: avatarUrl,
        })
        .eq('id', user.id)

      if (error) throw error
      setShowProfilePopup(false)
    } catch (error) {
      console.error('Error updating profile:', error)
    }
  }

  return (
    <div className="flex h-screen">
      <div className="bg-gray-900 text-gray-100 w-64 flex flex-col">
        <div className="p-4 border-b border-gray-800">
          <h1 className="text-2xl font-bold text-yellow-400">Star Wars Chat</h1>
        </div>
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-2 text-yellow-400">CHANNELS</h2>
            <ul>
              {channels.map((channel) => {
                const channelConfig = Object.values(CHANNELS).find(c => c.id === channel.id) || {
                  displayName: channel.slug || `Channel ${channel.id}`,
                  description: 'Channel description'
                }
                return (
                  <li key={channel.id} className="mb-1">
                    <a href={`/channels/${channel.id}`} className="text-gray-300 hover:text-white">
                      # {channelConfig.displayName}
                    </a>
                  </li>
                )
              })}
            </ul>
          </div>
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-2 text-yellow-400">DIRECT MESSAGES</h2>
            <ul>
              {users.map((otherUser) => (
                <li key={otherUser.id} className="mb-1">
                  <span className="flex items-center">
                    <span className={`w-2 h-2 rounded-full mr-2 ${otherUser.status === 'ONLINE' ? 'bg-green-500' : 'bg-gray-500'}`}></span>
                    <span className="text-gray-300">{otherUser.username}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="p-4 border-t border-gray-800 relative">
          <div 
            className="flex items-center cursor-pointer" 
            onClick={() => setShowProfilePopup(!showProfilePopup)}
          >
            <div className="w-8 h-8 bg-gray-700 rounded-full mr-2">
              {avatarUrl && (
                <img 
                  src={avatarUrl} 
                  alt="Profile" 
                  className="w-full h-full rounded-full object-cover"
                />
              )}
            </div>
            <div className="text-sm">
              <div className="font-medium">{username || user?.email}</div>
              <div className="text-gray-400">Click to edit profile</div>
            </div>
          </div>

          {/* Profile Popup */}
          {showProfilePopup && (
            <div className="absolute bottom-full left-0 mb-2 w-64 bg-gray-800 rounded-lg shadow-lg p-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 rounded border border-gray-600 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Avatar
                  </label>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-700 rounded-full">
                      {avatarUrl && (
                        <img 
                          src={avatarUrl} 
                          alt="Avatar Preview" 
                          className="w-full h-full rounded-full object-cover"
                        />
                      )}
                    </div>
                    <label className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={uploadAvatar}
                        className="hidden"
                      />
                      <div className={`px-3 py-2 bg-gray-700 rounded border border-gray-600 text-white text-center cursor-pointer hover:bg-gray-600 ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        {uploading ? 'Uploading...' : 'Upload Image'}
                      </div>
                    </label>
                  </div>
                </div>
                <div className="flex justify-between">
                  <button
                    onClick={updateProfile}
                    className="px-4 py-2 bg-yellow-500 text-gray-900 rounded hover:bg-yellow-400"
                  >
                    Save
                  </button>
                  <button
                    onClick={signOut}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-400"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <main className="flex-1 bg-gray-800 flex flex-col">
        {children}
      </main>
    </div>
  )
}

export default Layout
