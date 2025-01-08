import React, { useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import UserContext from '~/lib/UserContext'
import { supabase } from '~/lib/Store'
import { CHANNELS } from '~/lib/constants'
import Link from 'next/link'

const Layout = ({ children }) => {
  const { user, signOut } = useContext(UserContext)
  const router = useRouter()
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
      const { data, error } = await supabase
        .from('channels')
        .select('id, slug, name, description')
        .order('id', { ascending: true })

      if (error) throw error

      // Map channels to ensure we have all required fields
      const mappedChannels = data.map(channel => ({
        ...channel,
        slug: channel.slug || `channel-${channel.id}`,
        name: channel.name || channel.slug || `Channel ${channel.id}`,
        description: channel.description || `Welcome to #${channel.name || channel.slug}`
      }))

      setChannels(mappedChannels)
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
    <div className="flex h-screen bg-gray-900 text-gray-100">
      {/* Sidebar */}
      <div className="w-64 flex flex-col bg-gradient-to-b from-gray-900 to-gray-800 border-r border-gray-800">
        {/* App Header */}
        <div className="p-4 border-b border-gray-800">
          <h1 className="text-2xl font-orbitron text-yellow-400 tracking-wider">Talk2D2</h1>
        </div>

        {/* Channels & DMs */}
        <div className="flex-1 overflow-y-auto">
          {/* Channels Section */}
          <div className="p-4">
            <h2 className="text-sm font-bold text-yellow-400 tracking-wide mb-2">CHANNELS</h2>
            <nav className="space-y-1">
              {channels.map((channel) => (
                <Link
                  key={channel.id}
                  href={`/channels/${channel.id}`}
                  className={`flex items-center px-2 py-1.5 text-sm rounded-md transition-colors duration-150
                    ${channel.id === parseInt(router.query.id) 
                      ? 'bg-yellow-500/10 text-yellow-400' 
                      : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'}`}
                >
                  <span className="text-gray-500 mr-1.5">#</span>
                  {channel.displayName || channel.name || channel.slug}
                </Link>
              ))}
            </nav>
          </div>

          {/* Direct Messages Section */}
          <div className="p-4">
            <h2 className="text-sm font-bold text-yellow-400 tracking-wide mb-2">DIRECT MESSAGES</h2>
            <nav className="space-y-1">
              {users.map((otherUser) => (
                <div
                  key={otherUser.id}
                  className="flex items-center px-2 py-1.5 text-sm text-gray-400 rounded-md hover:bg-gray-800 hover:text-gray-200 cursor-pointer"
                >
                  <span className={`w-2 h-2 rounded-full mr-2 ${
                    otherUser.status === 'ONLINE' ? 'bg-green-500' : 'bg-gray-500'
                  }`} />
                  {otherUser.username}
                </div>
              ))}
            </nav>
          </div>
        </div>

        {/* User Profile Section */}
        <div className="relative p-4 border-t border-gray-800 bg-gray-900/50 backdrop-blur-sm">
          <div 
            className="flex items-center space-x-3 cursor-pointer hover:bg-gray-800/50 p-2 rounded-lg transition-colors duration-150"
            onClick={() => setShowProfilePopup(!showProfilePopup)}
          >
            <div className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden flex-shrink-0">
              {avatarUrl && (
                <img 
                  src={avatarUrl} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">{username || user?.email}</div>
              <div className="text-xs text-gray-400">Click to edit profile</div>
            </div>
          </div>

          {/* Profile Popup */}
          {showProfilePopup && (
            <div className="absolute bottom-full left-0 mb-2 w-80 bg-gray-800 rounded-lg shadow-xl border border-gray-700 p-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 rounded-md border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Avatar
                  </label>
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 rounded-full bg-gray-700 overflow-hidden">
                      {avatarUrl && (
                        <img 
                          src={avatarUrl} 
                          alt="Avatar Preview" 
                          className="w-full h-full object-cover"
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
                      <div className={`px-4 py-2 bg-gray-700 rounded-md border border-gray-600 text-white text-center cursor-pointer hover:bg-gray-600 transition-colors duration-150 ${
                        uploading ? 'opacity-50 cursor-not-allowed' : ''
                      }`}>
                        {uploading ? 'Uploading...' : 'Upload Image'}
                      </div>
                    </label>
                  </div>
                </div>
                <div className="flex justify-between pt-2">
                  <button
                    onClick={updateProfile}
                    className="px-4 py-2 bg-yellow-500 text-gray-900 rounded-md font-medium hover:bg-yellow-400 transition-colors duration-150"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={signOut}
                    className="px-4 py-2 bg-red-500/10 text-red-500 rounded-md font-medium hover:bg-red-500/20 transition-colors duration-150"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col bg-gray-800">
        {children}
      </main>
    </div>
  )
}

export default Layout
