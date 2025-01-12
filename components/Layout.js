import React, { useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { UserContext } from '../lib/UserContext'
import { supabase, useStore } from '~/lib/Store'
import Link from 'next/link'
import LoadingScreen from '~/components/LoadingScreen'
import UserStatusDot from '~/components/UserStatusDot'
import CreateChannelButton from './CreateChannelButton'
import Head from 'next/head'
import LogViewer from './LogViewer'
import { formatDistanceToNow } from 'date-fns'
import { SearchIcon, MenuIcon, XIcon } from '@heroicons/react/outline'

const Layout = ({ children, hideSidebar = false }) => {
  const { user } = useContext(UserContext)
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
  const [showLogs, setShowLogs] = useState(false)

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
    let navigationTimeout

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

  // Toggle logs with Ctrl+L
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === 'l') {
        e.preventDefault()
        setShowLogs(prev => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
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
        .select(`
          id,
          email,
          username,
          display_name,
          avatar_url,
          status,
          last_seen,
          created_at,
          updated_at
        `)
        .order('username', { ascending: true })

      if (error) {
        console.error('Error fetching users:', error)
        throw error
      }
      
      setUsers(data || [])
    } catch (error) {
      console.error('Error in fetchUsers:', error)
      // Don't throw here - we want to gracefully handle errors in the UI
      setUsers([])
    }
  }

  const handleSearch = async (term) => {
    if (!term.trim()) {
      setSearchResults([])
      return
    }
    try {
      // Search channels
      const { data: channelMatches, error: channelError } = await supabase
        .from('channels')
        .select('id, slug, name')
        .ilike('name', `%${term}%`)

      if (channelError) throw channelError

      // Search users
      const { data: userMatches, error: userError } = await supabase
        .from('users')
        .select(`
          id, 
          username,
          display_name,
          avatar_url,
          status
        `)
        .or(`username.ilike.%${term}%,display_name.ilike.%${term}%`)

      if (userError) throw userError

      // Search messages
      const { data: messageMatches, error: messageError } = await supabase
        .from('messages')
        .select(`
          id,
          channel_id,
          message_text,
          created_at,
          user_id
        `)
        .ilike('message_text', `%${term}%`)
        .order('created_at', { ascending: false })
        .limit(20)  // Limit to recent messages

      if (messageError) throw messageError

      // Combine results
      setSearchResults([
        ...((channelMatches || []).map((c) => ({ 
          type: 'channel', 
          data: c,
          timestamp: null 
        }))),
        ...((userMatches || []).map((u) => ({ 
          type: 'user', 
          data: u,
          timestamp: null
        }))),
        ...((messageMatches || []).map((m) => ({ 
          type: 'message', 
          data: m,
          timestamp: m.created_at
        })))
      ].sort((a, b) => {
        // Sort messages by timestamp, keep channels and users at top
        if (!a.timestamp && !b.timestamp) return 0
        if (!a.timestamp) return -1
        if (!b.timestamp) return 1
        return new Date(b.timestamp) - new Date(a.timestamp)
      }))
    } catch (err) {
      console.error('Error in search:', err)
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
      const updates = {
        username: username.trim(),
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString()
      }

      // Validate username
      if (!updates.username) {
        throw new Error('Username cannot be empty')
      }

      // Check if username is taken (excluding current user)
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('id')
        .eq('username', updates.username)
        .neq('id', user.id)
        .single()

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 means no rows returned
        throw checkError
      }

      if (existingUser) {
        throw new Error('Username is already taken')
      }

      const { error: updateError } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id)

      if (updateError) throw updateError

      // Update local state
      setUsername(updates.username)
      setAvatarUrl(updates.avatar_url)
      setShowProfilePopup(false)
    } catch (error) {
      console.error('Error updating profile:', error)
      alert(error.message || 'Error updating profile')
    }
  }

  // Handle sign out
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      router.push('/')
    } catch (error) {
      console.error('Error signing out:', error.message)
    }
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-100">
      <Head>
        <title>Talk2D2 - Your Galactic Chat Hub</title>
      </Head>

      {!hideSidebar && (
        <aside className="w-72 flex flex-col bg-gray-800/50 backdrop-blur-md border-r border-yellow-500/10 shadow-xl">
          {/* App Logo */}
          <div className="p-6 border-b border-yellow-500/10">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center transform rotate-45">
                <span className="text-black font-bold transform -rotate-45">T2</span>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-200 bg-clip-text text-transparent font-space">
                Talk2D2
              </h1>
            </div>
          </div>

          {/* Search Bar */}
          <div className="p-4">
            <div className="relative group">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <SearchIcon className="h-5 w-5 text-gray-400 group-focus-within:text-yellow-400 transition-colors" />
              </div>
              <input
                type="text"
                placeholder="Search anything..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  handleSearch(e.target.value)
                }}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-900/50 text-sm rounded-xl border border-gray-700/50 
                  focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500/50
                  placeholder-gray-500 transition-all duration-200"
              />
              {searchResults.length > 0 && searchTerm && (
                <div className="absolute w-full mt-2 bg-gray-800/95 backdrop-blur-sm rounded-xl shadow-2xl z-50 max-h-96 overflow-y-auto
                  border border-yellow-500/10 divide-y divide-gray-700/50">
                  {searchResults.map((result, index) => (
                    <div
                      key={`${result.type}-${index}`}
                      className="p-3 hover:bg-gray-700/50 cursor-pointer transition-colors duration-150"
                      onClick={() => goToResult(result)}
                    >
                      <div className="flex items-center space-x-2">
                        {result.type === 'channel' && (
                          <span className="text-yellow-400 font-medium">#</span>
                        )}
                        {result.type === 'user' && (
                          <UserStatusDot status={result.data.status} />
                        )}
                        <span className="font-medium text-gray-200">
                          {result.data.name || result.data.username}
                        </span>
                      </div>
                      {result.type === 'message' && (
                        <div className="mt-1 text-sm text-gray-400 line-clamp-2">
                          {result.data.message_text}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Channels Section */}
          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold tracking-wider text-transparent bg-gradient-to-r from-yellow-400 to-yellow-200 bg-clip-text">
                  CHANNELS
                </h2>
                <CreateChannelButton />
              </div>
              <nav className="space-y-0.5">
                {channels?.map((channel) => (
                  <Link
                    key={channel.id}
                    href={`/channels/${channel.id}`}
                    className={`
                      flex items-center px-3 py-2 text-sm rounded-lg transition-all duration-200
                      ${router.query.id === channel.id 
                        ? 'bg-yellow-500/10 text-yellow-400 shadow-sm' 
                        : 'text-gray-400 hover:bg-gray-700/50 hover:text-gray-200'
                      }
                    `}
                  >
                    <span className="mr-2 text-yellow-500/75">#</span>
                    {channel.name}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Direct Messages Section */}
            <div className="p-4 mt-2">
              <h2 className="text-sm font-bold tracking-wider text-transparent bg-gradient-to-r from-yellow-400 to-yellow-200 bg-clip-text mb-3">
                DIRECT MESSAGES
              </h2>
              <nav className="space-y-0.5">
                {users.map((otherUser) => (
                  <div
                    key={otherUser.id}
                    className="flex items-center px-3 py-2 text-sm rounded-lg text-gray-400 hover:bg-gray-700/50 hover:text-gray-200 
                      cursor-pointer transition-all duration-200"
                    onClick={() => router.push(`/dms/${otherUser.id}`)}
                  >
                    <UserStatusDot status={otherUser.status} />
                    <span className="ml-2 truncate flex-1">
                      {otherUser.display_name || otherUser.username || otherUser.email}
                    </span>
                    {otherUser.last_seen && (
                      <span className="ml-2 text-xs text-gray-500">
                        {formatDistanceToNow(new Date(otherUser.last_seen), { addSuffix: true })}
                      </span>
                    )}
                  </div>
                ))}
              </nav>
            </div>
          </div>

          {/* User Profile Section */}
          <div className="shrink-0 p-4 border-t border-yellow-500/10 bg-gray-800/50 backdrop-blur-sm">
            <div 
              className="flex items-center space-x-3 p-2 rounded-xl cursor-pointer
                hover:bg-gray-700/50 transition-all duration-200
                group relative"
              onClick={() => setShowProfilePopup(!showProfilePopup)}
            >
              <div className="w-10 h-10 rounded-lg bg-gray-700 overflow-hidden flex-shrink-0 ring-2 ring-yellow-500/20">
                {avatarUrl ? (
                  <img 
                    src={avatarUrl} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 font-medium">
                    {username?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <span className="font-medium truncate text-gray-200">
                    {username || user?.email?.split('@')[0]}
                  </span>
                  <UserStatusDot status={status} />
                </div>
                <div className="text-xs text-gray-400 group-hover:text-yellow-400 transition-colors">
                  Click to edit profile
                </div>
              </div>
            </div>
          </div>
        </aside>
      )}

      {/* Main Content */}
      <main className={`flex-1 flex flex-col relative ${isThreadOpen ? 'mr-80' : ''}`}>
        {children}
      </main>

      {/* Logs Viewer */}
      {showLogs && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50">
          <LogViewer onClose={() => setShowLogs(false)} />
        </div>
      )}
    </div>
  )
}

export default Layout