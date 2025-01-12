import React, { useContext, useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/router'
import { UserContext } from '../lib/UserContext'
import { supabase, supabaseAdmin } from '~/lib/supabaseClient'
import { useStore } from '~/lib/Store'
import { logger } from '~/lib/logger'
import Link from 'next/link'
import LoadingScreen from '~/components/LoadingScreen'
import UserStatusDot from '~/components/UserStatusDot'
import CreateChannelButton from './CreateChannelButton'
import Head from 'next/head'
import LogViewer from './LogViewer'
import { formatDistanceToNow } from 'date-fns'
import { SearchIcon, MenuIcon, XIcon } from '@heroicons/react/outline'
import { v4 as uuidv4 } from 'uuid'

const layoutLogger = logger.withPrefix('Layout')

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
  const { channels } = useStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isThreadOpen, setIsThreadOpen] = useState(false)
  const [showLogs, setShowLogs] = useState(false)

  // Memoize fetchUsers to prevent unnecessary re-renders
  const fetchUsers = useCallback(async () => {
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
      setUsers([])
    }
  }, []) // Empty dependency array since supabase is stable

  // Initialize users
  useEffect(() => {
    logger.log('🚀 Initializing Layout component with user:', user)
    const initialize = async () => {
      setIsLoading(true)
      try {
        logger.log('📥 Starting user fetch')
        await fetchUsers()
        logger.log('✅ User fetch complete')
      } catch (error) {
        logger.error('❌ Error in initialization:', error)
      } finally {
        setIsLoading(false)
        logger.log('🏁 Initialization complete')
      }
    }
    initialize()
  }, [fetchUsers])

  // Subscribe to user status changes
  useEffect(() => {
    if (!user) {
      console.log('⏳ Waiting for user data...')
      return
    }

    console.log('🔌 Setting up realtime subscription for user:', user.id)
    const subscription = supabase
      .channel('user_status_changes')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'users',
        filter: 'status IS NOT NULL'
      }, (payload) => {
        console.log('📡 Received status update:', payload)
        setUsers(prevUsers => {
          console.log('🔄 Updating users with new status:', {
            userId: payload.new.id,
            newStatus: payload.new.status
          })
          return prevUsers.map(u => {
            if (u.id === payload.new.id) {
              return { ...u, status: payload.new.status }
            }
            return u
          })
        })

        if (payload.new.id === user.id) {
          console.log('🎯 Updating current user status:', payload.new.status)
          setStatus(payload.new.status)
        }
      })
      .subscribe()

    console.log('✅ Realtime subscription setup complete')

    return () => {
      console.log('🔌 Cleaning up realtime subscription')
      subscription.unsubscribe()
    }
  }, [user?.id])

  // Navigation event handlers
  useEffect(() => {
    let navigationTimeout

    const handleStart = () => {
      setIsNavigating(true)
      if (navigationTimeout) {
        clearTimeout(navigationTimeout)
      }
    }

    const handleComplete = () => {
      navigationTimeout = setTimeout(() => {
        setIsNavigating(false)
      }, 300)
    }

    const handleError = () => {
      if (navigationTimeout) {
        clearTimeout(navigationTimeout)
      }
      setIsNavigating(false)
    }

    const handleVisibilityChange = () => {
      if (!document.hidden && isNavigating) {
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
  }, [isNavigating]) // Only depend on isNavigating, router is stable

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

  // Memoize goToResult function
  const goToResult = useCallback(async (result) => {
    layoutLogger.debug('🎯 goToResult called with:', { 
      result,
      resultType: result?.type,
      resultData: result?.data,
      currentUserId: user?.id,
      currentUserDetails: {
        email: user?.email,
        username: user?.username,
        displayName: user?.display_name
      }
    })

    if (!user?.id) {
      layoutLogger.error('❌ No authenticated user found', { user })
      return
    }

    if (result.type === 'channel') {
      layoutLogger.debug('📢 Navigating to channel:', { channelId: result.id })
      router.push(`/channels/${result.id}`)
      return
    }

    // Start DM room flow
    const targetUser = result.data
    layoutLogger.debug('💬 Starting DM room flow:', { 
      targetUser,
      targetUserDetails: {
        id: targetUser?.id,
        username: targetUser?.username,
        displayName: targetUser?.display_name
      },
      currentUser: {
        id: user?.id,
        username: user?.username,
        displayName: user?.display_name
      }
    })

    if (targetUser.id === user.id) {
      layoutLogger.warn('⚠️ Cannot start DM with yourself', { userId: user.id })
      return
    }

    // Find existing DM room
    layoutLogger.debug('🔍 Finding existing DM rooms for current user...')
    const { data: dmRoomMembers, error: membersError } = await supabase
      .from('dm_room_members')
      .select('dm_room_id')
      .eq('user_id', user.id)

    layoutLogger.debug('📋 DM room members query result:', { 
      dmRoomMembers, 
      error: membersError,
      foundRooms: dmRoomMembers?.length || 0
    })

    if (membersError) {
      layoutLogger.error('❌ Error finding DM room members:', membersError)
      return
    }

    const dmRoomIds = dmRoomMembers?.map(m => m.dm_room_id) || []
    layoutLogger.debug('🏷️ Found DM Room IDs:', { dmRoomIds, count: dmRoomIds.length })

    if (dmRoomIds.length > 0) {
      layoutLogger.debug('🔍 Checking if target user is in any existing rooms...')
      // Find if target user is in any of these rooms
      const { data: otherMember, error: otherMemberError } = await supabase
        .from('dm_room_members')
        .select('dm_room_id')
        .eq('user_id', targetUser.id)
        .in('dm_room_id', dmRoomIds)
        .single()

      layoutLogger.debug('👥 Other member query result:', { 
        otherMember, 
        error: otherMemberError,
        targetUserId: targetUser.id,
        roomIds: dmRoomIds
      })

      if (otherMember) {
        layoutLogger.debug('✨ Found existing DM room, navigating...', { roomId: otherMember.dm_room_id })
        router.push(`/dms/${otherMember.dm_room_id}`)
        return
      }
    }

    // Create new DM room
    layoutLogger.debug('🆕 Creating new DM room:', { 
      user1: {
        id: user.id,
        username: user.username,
        displayName: user.display_name
      }, 
      user2: {
        id: targetUser.id,
        username: targetUser.username,
        displayName: targetUser.display_name
      }
    })

    const roomName = `${targetUser.display_name || targetUser.username} and ${user.display_name || user.username}`
    layoutLogger.debug('📝 Room name generated:', { roomName })

    const roomId = uuidv4()
    layoutLogger.debug('🎲 Generated room ID:', { roomId })

    const { data: newRoom, error: createError } = await supabase
      .from('dm_rooms')
      .insert({
        id: roomId,
        room_name: roomName,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    layoutLogger.debug('🏗️ DM room creation result:', { 
      newRoom, 
      error: createError,
      requestDetails: {
        roomId,
        roomName,
        timestamp: new Date().toISOString()
      }
    })

    if (createError) {
      layoutLogger.error('❌ Error creating DM room:', createError)
      return
    }

    layoutLogger.debug('👥 Adding members to room...', {
      roomId,
      members: [
        { id: user.id, username: user.username },
        { id: targetUser.id, username: targetUser.username }
      ]
    })

    // Add both users as members using supabaseAdmin to bypass RLS
    const { error: membersAddError } = await supabaseAdmin
      .from('dm_room_members')
      .insert([
        {
          id: uuidv4(),
          dm_room_id: roomId,
          user_id: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: uuidv4(),
          dm_room_id: roomId,
          user_id: targetUser.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ])

    if (membersAddError) {
      layoutLogger.error('❌ Error adding DM room members:', membersAddError)
      return
    }

    layoutLogger.debug('✅ Successfully created DM room and added members', {
      roomId,
      roomName,
      members: [user.id, targetUser.id]
    })

    // Navigate to the new DM room
    layoutLogger.debug('🚀 Navigating to new DM room...', { roomId })
    router.push(`/dms/${roomId}`)
  }, [user, router]) // Add user to dependencies

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

  // Memoize the users list rendering
  const renderUsersList = useCallback(() => {
    return users
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
  }, [users, user?.id, goToResult])

  // Instead of early returns, use conditional rendering
  const renderContent = () => {
    if (isNavigating) {
      return (
        <LoadingScreen 
          message="Navigating through hyperspace..." 
          onHide={() => setIsNavigating(false)}
        />
      )
    }

    if (isLoading) {
      return (
        <LoadingScreen 
          message="Establishing connection to the Galactic Network..." 
          onHide={() => setIsLoading(false)}
        />
      )
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
                {renderUsersList()}
              </div>
            </div>

            {/* User Profile */}
            <Link
              href="/profile"
              className="flex items-center p-4 border-t border-gray-700 hover:bg-gray-700/50 transition-colors group"
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
              <div className="ml-3 flex-1">
                <div className="font-medium text-gray-100">{user?.dbUser?.display_name || user?.dbUser?.username}</div>
                <div className="text-xs text-gray-400 flex items-center justify-between">
                  <span>{status === 'ONLINE' ? 'Online' : 'Offline'}</span>
                  <span className="text-gray-500">•</span>
                  <span>{user?.dbUser?.email}</span>
                </div>
                <div className="text-xs text-gray-500 mt-0.5 hidden group-hover:block">
                  Click to edit profile
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

  // Single return statement
  return renderContent()
}

export default Layout