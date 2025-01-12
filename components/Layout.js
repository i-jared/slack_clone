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

  const goToResult = async (result) => {
    setSearchTerm('')
    setSearchResults([])

    switch (result.type) {
      case 'channel':
        router.push(`/channels/${result.data.id}`)
        break
      case 'user':
        // Handle DM navigation
        const { data: dmRoom, error } = await supabase
          .from('dm_rooms')
          .select('id')
          .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
          .or(`user1_id.eq.${result.data.id},user2_id.eq.${result.data.id}`)
          .maybeSingle()

        if (error) {
          console.error('Error finding DM room:', error)
          return
        }

        if (dmRoom) {
          router.push(`/dm/${dmRoom.id}`)
        } else {
          // Create new DM room
          const { data: newRoom, error: createError } = await supabase
            .from('dm_rooms')
            .insert([
              { user1_id: user.id, user2_id: result.data.id }
            ])
            .select()
            .single()

          if (createError) {
            console.error('Error creating DM room:', createError)
            return
          }

          router.push(`/dm/${newRoom.id}`)
        }
        break
      case 'message':
        // Navigate to the message's channel
        router.push(`/channels/${result.data.channel_id}?message=${result.data.id}`)
        break
    }
  }

  const handleLogoClick = () => {
    router.push('/channels')
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
    <div className="flex h-screen bg-gray-900 text-gray-100">
      {!hideSidebar && (
        <div className="w-64 flex flex-col bg-gray-800 border-r border-gray-700">
          {/* Logo */}
          <div 
            className="flex items-center p-4 border-b border-gray-700 cursor-pointer hover:bg-gray-700/50 transition-colors"
            onClick={handleLogoClick}
          >
            <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center transform rotate-45">
              <span className="text-black text-lg font-bold transform -rotate-45">T2</span>
            </div>
            <h1 className="ml-3 text-xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-200 bg-clip-text text-transparent">
              Talk2D2
            </h1>
          </div>

          {/* Search */}
          <div className="p-4">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  handleSearch(e.target.value)
                }}
                placeholder="Search..."
                className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-xl text-gray-100
                  focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500/50
                  placeholder-gray-500"
              />
              <SearchIcon className="absolute right-3 top-2.5 h-5 w-5 text-gray-500" />
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="absolute z-10 mt-2 w-56 bg-gray-800 rounded-xl shadow-lg border border-gray-700 overflow-hidden">
                {searchResults.map((result, index) => (
                  <div
                    key={`${result.type}-${result.data.id}`}
                    onClick={() => goToResult(result)}
                    className="px-4 py-2 hover:bg-gray-700 cursor-pointer"
                  >
                    {result.type === 'channel' && (
                      <div className="flex items-center">
                        <span className="text-gray-400">#</span>
                        <span className="ml-1">{result.data.name}</span>
                      </div>
                    )}
                    {result.type === 'user' && (
                      <div className="flex items-center">
                        <UserStatusDot status={result.data.status} />
                        <span className="ml-2">{result.data.display_name || result.data.username}</span>
                      </div>
                    )}
                    {result.type === 'message' && (
                      <div className="text-sm">
                        <div className="text-gray-400">in #{channels.find(c => c.id === result.data.channel_id)?.name}</div>
                        <div className="truncate">{result.data.message_text}</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Channels */}
          <div className="flex-1 overflow-y-auto">
            <div className="px-4 mb-2">
              <div className="flex items-center justify-between text-gray-400 text-sm">
                <span>Channels</span>
                <CreateChannelButton />
              </div>
            </div>
            <div className="space-y-1 px-2">
              {channels?.map((channel) => (
                <Link
                  key={channel.id}
                  href={`/channels/${channel.id}`}
                  className={`
                    flex items-center px-2 py-1 rounded-lg text-sm
                    ${router.query.id === channel.id.toString()
                      ? 'bg-yellow-500/10 text-yellow-500'
                      : 'text-gray-400 hover:bg-gray-700/50 hover:text-gray-200'
                    }
                  `}
                >
                  <span className="text-lg mr-1">#</span>
                  {channel.name}
                </Link>
              ))}
            </div>

            {/* Direct Messages */}
            <div className="px-4 mt-6 mb-2">
              <div className="flex items-center justify-between text-gray-400 text-sm">
                <span>Direct Messages</span>
              </div>
            </div>
            <div className="space-y-1 px-2">
              {users
                .filter(u => u.id !== user?.id)
                .map((u) => (
                  <div
                    key={u.id}
                    onClick={() => goToResult({ type: 'user', data: u })}
                    className="flex items-center px-2 py-1 rounded-lg text-sm text-gray-400 hover:bg-gray-700/50 hover:text-gray-200 cursor-pointer"
                  >
                    <UserStatusDot status={u.status} />
                    <span className="ml-2">{u.display_name || u.username}</span>
                  </div>
                ))
              }
            </div>
          </div>

          {/* User Profile */}
          <Link
            href="/profile"
            className="flex items-center p-4 border-t border-gray-700 hover:bg-gray-700/50 transition-colors"
          >
            <div className="relative">
              <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-700 flex items-center justify-center">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-xl text-gray-400">?</span>
                )}
              </div>
              <UserStatusDot status={status} className="absolute -bottom-0.5 -right-0.5 border-2 border-gray-800" />
            </div>
            <div className="ml-3">
              <div className="font-medium">{user?.dbUser?.display_name || user?.dbUser?.username}</div>
              <div className="text-xs text-gray-400">
                {status === 'ONLINE' ? 'Online' : 'Offline'}
              </div>
            </div>
          </Link>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {children}
      </div>

      {/* Thread Panel */}
      {isThreadOpen && (
        <div className="w-96 border-l border-gray-700 bg-gray-800">
          {/* Thread content will be rendered by the ThreadPanel component */}
        </div>
      )}

      {/* Log Viewer */}
      {showLogs && (
        <LogViewer onClose={() => setShowLogs(false)} />
      )}
    </div>
  )
}

export default Layout