import React, { useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import UserContext from '~/lib/UserContext'
import { supabase, useStore } from '~/lib/Store'
import Link from 'next/link'
import LoadingScreen from '~/components/LoadingScreen'
import UserStatusDot from '~/components/UserStatusDot'

const Layout = ({ children, hideSidebar = false }) => {
  const { user, signOut } = useContext(UserContext)
  const router = useRouter()
  const [isNavigating, setIsNavigating] = useState(false)
  const [users, setUsers] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [showProfilePopup, setShowProfilePopup] = useState(false)
  const [username, setUsername] = useState(user?.dbUser?.username || '')
  const [avatarUrl, setAvatarUrl] = useState(user?.dbUser?.avatar_url || '')
  const [uploading, setUploading] = useState(false)
  const [status, setStatus] = useState(user?.dbUser?.status || 'OFFLINE')
  const { channels } = useStore()  // Get channels from the store

  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isThreadOpen, setIsThreadOpen] = useState(false)

  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true)
      try {
        await fetchUsers()
      } finally {
        setIsLoading(false)
      }
    }
    initialize()
  }, [])

  // Subscribe to user status changes
  useEffect(() => {
    if (!user) return

    // Subscribe to status changes for all users
    const subscription = supabase
      .channel('user_status_changes')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'users',
        filter: 'status IS NOT NULL'
      }, (payload) => {
        // Update the users list with the new status
        setUsers(prevUsers => prevUsers.map(u => {
          if (u.id === payload.new.id) {
            return { ...u, status: payload.new.status }
          }
          return u
        }))

        // If this is the current user, update their status in the profile popup
        if (payload.new.id === user.id) {
          setStatus(payload.new.status)
        }
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [user])

  // Add router change event handlers
  useEffect(() => {
    let navigationTimeout;

    const handleStart = () => {
      setIsNavigating(true)
      // Clear any existing timeout
      if (navigationTimeout) {
        clearTimeout(navigationTimeout)
      }
    }

    const handleComplete = () => {
      // Add a small delay before hiding the loading screen to prevent flashing
      navigationTimeout = setTimeout(() => {
        setIsNavigating(false)
      }, 300)
    }

    const handleError = () => {
      // In case of error, ensure we hide the loading screen
      if (navigationTimeout) {
        clearTimeout(navigationTimeout)
      }
      setIsNavigating(false)
    }

    // Handle visibility change
    const handleVisibilityChange = () => {
      if (!document.hidden && isNavigating) {
        // If we return to the tab and loading is still shown, clear it
        handleComplete()
      }
    }

    router.events.on('routeChangeStart', handleStart)
    router.events.on('routeChangeComplete', handleComplete)
    router.events.on('routeChangeError', handleError)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      router.events.off('routeChangeStart', handleStart)
      router.events.off('routeChangeComplete', handleComplete)
      router.events.off('routeChangeError', handleError)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      if (navigationTimeout) {
        clearTimeout(navigationTimeout)
      }
    }
  }, [router, isNavigating])

  // Add effect to listen for thread panel state changes
  useEffect(() => {
    const handleThreadState = (e) => {
      if (e.detail?.isOpen !== undefined) {
        setIsThreadOpen(e.detail.isOpen)
      }
    }
    window.addEventListener('threadPanelState', handleThreadState)
    return () => window.removeEventListener('threadPanelState', handleThreadState)
  }, [])

  // Show loading screen during navigation
  if (isNavigating) {
    return <LoadingScreen 
      message="Navigating through hyperspace..." 
      onHide={() => setIsNavigating(false)}
    />
  }

  // Show loading screen during initial load
  if (isLoading) {
    return <LoadingScreen 
      message="Establishing connection to the Galactic Network..." 
      onHide={() => setIsLoading(false)}
    />
  }

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('username', { ascending: true })

      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  const handleSearch = async (term) => {
    if (!term.trim()) {
      setSearchResults([])
      return
    }
    try {
      // Search channels
      const { data: channelMatches } = await supabase
        .from('channels')
        .select('id, slug, name')
        .ilike('name', `%${term}%`)

      // Search users
      const { data: userMatches } = await supabase
        .from('users')
        .select('id, username, avatar_url')
        .ilike('username', `%${term}%`)

      // Search messages
      // We also fetch channel_id so we can jump to that message
      const { data: messageMatches } = await supabase
        .from('messages')
        .select(`
          id,
          channel_id,
          message
        `)
        .ilike('message', `%${term}%`)
        .order('id', { ascending: false })  // most recent first

      // Combine results
      setSearchResults([
        ...((channelMatches || []).map((c) => ({ type: 'channel', data: c }))),
        ...((userMatches || []).map((u) => ({ type: 'user', data: u }))),
        ...((messageMatches || []).map((m) => ({ type: 'message', data: m })))
      ])
    } catch (err) {
      console.error('Error searching:', err)
      setSearchResults([])
    }
  }

  const goToResult = (item) => {
    if (item.type === 'channel') {
      router.push(`/channels/${item.data.id}`)
    } else if (item.type === 'user') {
      router.push(`/dms/${item.data.id}`)
    } else if (item.type === 'message') {
      // We navigate to that message's channel, then we can add a query param with the message ID
      router.push(`/channels/${item.data.channel_id}?scrollToMessage=${item.data.id}`)
    }
    setSearchTerm('')
    setSearchResults([])
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

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file)

      if (uploadError) throw uploadError

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
          status: status,
        })
        .eq('id', user.id)

      if (error) throw error
      setShowProfilePopup(false)
    } catch (error) {
      console.error('Error updating profile:', error)
    }
  }

  // Update search bar container styles
  const searchBarContainerStyles = {
    position: 'fixed',
    top: '0',
    left: '260px',
    right: isThreadOpen ? '400px' : '0',
    height: '64px',
    backgroundColor: '#1E1F22',
    borderBottom: '1px solid rgba(45, 45, 46, 0.5)',
    zIndex: 30,
    transition: 'all 0.3s ease-in-out',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    padding: '0 24px'
  }

  // Update sidebar styles
  const sidebarStyles = {
    width: '260px',
    height: '100vh',
    backgroundColor: '#1E1F22',
    borderRight: '1px solid rgba(45, 45, 46, 0.8)',
    display: 'flex',
    flexDirection: 'column',
    position: 'fixed',
    left: '0',
    top: '0',
    bottom: '0',
    zIndex: 20
  }

  // Update content wrapper styles
  const contentWrapperStyles = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    backgroundColor: '#1E1F22'
  }

  // Update main content styles for smooth sliding
  const mainContentStyles = {
    transition: 'all 0.3s ease-in-out',
    marginLeft: '260px',
    width: isThreadOpen ? 'calc(100% - 660px)' : 'calc(100% - 260px)',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    backgroundColor: '#1E1F22',
    overflow: 'hidden'
  }

  // Add styles for the main scroll area
  const mainScrollAreaStyles = {
    flex: 1,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    paddingTop: '64px' // Height of search bar
  }

  return (
    <div className="flex h-screen bg-[#1E1F22] overflow-hidden">
      {!hideSidebar && (
        <div style={sidebarStyles}>
          {/* App Header */}
          <div className="p-4 border-b border-gray-800/50">
            <h1 className="text-2xl font-orbitron text-yellow-400 tracking-wider">Talk2D2</h1>
          </div>

          {/* Channels & DMs */}
          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
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
                        : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200'}`}
                  >
                    <span className="text-gray-500 mr-1.5">#</span>
                    {channel.name || channel.slug}
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
                    className="flex items-center px-2 py-1.5 text-sm text-gray-400 rounded-md hover:bg-gray-800/50 hover:text-gray-200 cursor-pointer"
                    onClick={() => router.push(`/dms/${otherUser.id}`)}
                  >
                    <span
                      className={`w-2 h-2 rounded-full mr-2 ${
                        otherUser.status === 'ONLINE' ? 'bg-green-500' : 'bg-gray-500'
                      }`}
                    />
                    {otherUser.username}
                  </div>
                ))}
              </nav>
            </div>
          </div>

          {/* User Profile Section */}
          <div className="relative p-4 border-t border-gray-800/50 bg-[#1E1F22]">
            <div 
              className="flex items-center space-x-3 cursor-pointer hover:bg-gray-800/30 p-2 rounded-lg transition-colors duration-150"
              onClick={() => setShowProfilePopup(!showProfilePopup)}
            >
              <div className="w-10 h-10 rounded-full bg-gray-700/50 overflow-hidden flex-shrink-0">
                {avatarUrl && (
                  <img 
                    src={avatarUrl} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-200 truncate">{username || user?.email}</span>
                  <UserStatusDot status={status} />
                </div>
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
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Status
                    </label>
                    <div className="flex items-center space-x-3 bg-gray-700 p-3 rounded-md">
                      <div className="flex items-center space-x-2">
                        <UserStatusDot status={status} />
                        <span className="text-white">{status}</span>
                      </div>
                      <button
                        onClick={() => setStatus(status === 'ONLINE' ? 'OFFLINE' : 'ONLINE')}
                        className="ml-auto px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-500 transition-colors"
                      >
                        Toggle Status
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2 pt-4 border-t border-gray-700">
                    <button
                      onClick={() => setShowProfilePopup(false)}
                      className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={updateProfile}
                      className="px-4 py-2 bg-yellow-500 text-black rounded hover:bg-yellow-400"
                    >
                      Save Changes
                    </button>
                  </div>
                  <div className="pt-4 border-t border-gray-700 mt-4">
                    <button
                      onClick={signOut}
                      className="w-full px-4 py-2 bg-red-500/10 text-red-400 rounded hover:bg-red-500/20 transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      <div style={mainContentStyles}>
        {/* Search Bar */}
        <div style={searchBarContainerStyles}>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              handleSearch(e.target.value)
            }}
            placeholder="Search messages, channels, or users..."
            className="w-full px-4 py-2 bg-gray-800/50 text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500/50 placeholder-gray-500"
          />
          
          {/* Search Results Dropdown */}
          {searchResults.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-2 mx-4 bg-gray-800 border border-gray-700 rounded-lg shadow-lg max-h-96 overflow-y-auto z-50">
              {searchResults.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => goToResult(item)}
                  className="px-4 py-2 hover:bg-gray-700 cursor-pointer text-gray-200"
                >
                  {item.type === 'channel' && (
                    <div>
                      <span className="text-yellow-400">#</span> {item.data.name || item.data.slug}
                    </div>
                  )}
                  {item.type === 'user' && (
                    <div className="flex items-center gap-2">
                      <span className="text-yellow-400">@</span>
                      <span>{item.data.username || item.data.email}</span>
                    </div>
                  )}
                  {item.type === 'message' && (
                    <div className="text-gray-300">
                      <div className="text-xs text-gray-400 mb-1">
                        in #{item.data.channel_name || 'channel'}
                      </div>
                      {item.data.message}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Main Content */}
        <div style={contentWrapperStyles} className="flex-1 overflow-hidden">
          <div 
            style={mainScrollAreaStyles}
            className="scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent"
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Layout
