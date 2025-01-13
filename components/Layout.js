import React, { useState, useEffect, useContext, useRef } from 'react'
import { supabase } from '~/lib/supabaseClient'
import { UserContext } from '~/lib/UserContext'
import LoadingScreen from './LoadingScreen'
import { logger } from '~/lib/logger'
import { useStore } from '~/lib/Store'
import Link from 'next/link'
import { useRouter } from 'next/router'
import CreateChannelButton from './CreateChannelButton'

const layoutLogger = logger.withPrefix('Layout')

export default function Layout({ children, hideSidebar=false }) {
  const { user } = useContext(UserContext)
  const { channels, workspaces, loading: storeLoading, error: storeError } = useStore()
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState([])
  const router = useRouter()
  const mountTime = useRef(new Date())
  const lastFetchTime = useRef(null)
  const [userStats, setUserStats] = useState({
    total: 0,
    online: 0,
    recentlyActive: 0,
    withAvatars: 0
  })

  useEffect(() => {
    layoutLogger.info('\n=== LAYOUT LIFECYCLE ===')
    layoutLogger.info('Component mounted:', {
      mountTime: mountTime.current.toISOString(),
      initialState: {
        userCount: users.length,
        channelCount: channels.length,
        workspaceCount: workspaces.length,
        loading: loading || storeLoading,
        storeError: storeError?.message
      },
      userContext: user ? {
        id: user.id,
        email: user.email,
        metadata: user.user_metadata,
        lastSignIn: user.last_sign_in_at
      } : 'No user',
      routerState: {
        pathname: router.pathname,
        query: router.query,
        asPath: router.asPath
      },
      timestamp: new Date().toISOString()
    })

    async function loadAllUsers() {
      if (!user) {
        layoutLogger.warn('\n=== AUTH CHECK FAILED ===')
        layoutLogger.warn('No authenticated user:', {
          path: router.asPath,
          timestamp: new Date().toISOString()
        })
        setLoading(false)
        return
      }

      lastFetchTime.current = new Date()
      layoutLogger.debug('\n=== USER FETCH START ===')
      layoutLogger.debug('Fetching users:', {
        authenticatedUser: user.id,
        timeSinceMount: new Date() - mountTime.current,
        timestamp: new Date().toISOString()
      })

      const { data, error } = await supabase
        .from('users')
        .select('id, username, display_name, avatar_url, status, last_seen')
        .order('display_name', { ascending: true })

      if (error) {
        layoutLogger.error('\n=== USER FETCH ERROR ===')
        layoutLogger.error('Error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
          timeSinceMount: new Date() - mountTime.current,
          timestamp: new Date().toISOString()
        })
        setLoading(false)
        return
      }

      // Enhanced user statistics
      const stats = {
        total: data?.length || 0,
        online: data?.filter(u => u.status === 'online').length || 0,
        recentlyActive: data?.filter(u => {
          const lastSeen = new Date(u.last_seen)
          const hourAgo = new Date(Date.now() - 60 * 60 * 1000)
          return lastSeen > hourAgo
        }).length || 0,
        withAvatars: data?.filter(u => u.avatar_url).length || 0
      }

      setUserStats(stats)

      layoutLogger.info('\n=== USER FETCH COMPLETE ===')
      layoutLogger.info('User statistics:', {
        total: stats.total,
        online: stats.online,
        recentlyActive: stats.recentlyActive,
        withAvatars: stats.withAvatars,
        statusBreakdown: data?.reduce((acc, u) => {
          acc[u.status || 'unknown'] = (acc[u.status || 'unknown'] || 0) + 1
          return acc
        }, {}),
        fetchDuration: new Date() - lastFetchTime.current,
        timestamp: new Date().toISOString()
      })

      setUsers(data || [])
      setLoading(false)
    }

    loadAllUsers()

    return () => {
      layoutLogger.info('\n=== LAYOUT CLEANUP ===')
      layoutLogger.info('Component unmounting:', {
        mountDuration: new Date() - mountTime.current,
        finalState: {
          users: users.length,
          channels: channels.length,
          workspaces: workspaces.length,
          loading: loading || storeLoading,
          error: storeError?.message
        },
        timestamp: new Date().toISOString()
      })
    }
  }, [user])

  // Track state changes
  useEffect(() => {
    layoutLogger.debug('\n=== LAYOUT STATE UPDATE ===')
    layoutLogger.debug('State changed:', {
      users: users.map(u => ({
        id: u.id,
        name: u.display_name || u.username,
        status: u.status,
        lastSeen: u.last_seen
      })),
      channels: channels.map(c => ({
        id: c.id,
        name: c.name,
        workspace: workspaces.find(w => w.id === c.workspace_id)?.name
      })),
      workspaces: workspaces.map(w => ({
        id: w.id,
        name: w.name,
        channelCount: channels.filter(c => c.workspace_id === w.id).length
      })),
      userStats,
      loading: loading || storeLoading,
      error: storeError?.message,
      currentPath: router.asPath,
      timestamp: new Date().toISOString()
    })
  }, [users, channels, workspaces, loading, storeLoading, storeError, router.asPath, userStats])

  // Navigation logging
  const handleChannelClick = (channelId) => {
    layoutLogger.debug('\n=== CHANNEL NAVIGATION ===')
    layoutLogger.debug('Channel selected:', {
      channelId,
      channel: channels.find(c => c.id === channelId)?.name,
      workspace: workspaces.find(w => 
        w.id === channels.find(c => c.id === channelId)?.workspace_id
      )?.name,
      previousPath: router.asPath,
      timestamp: new Date().toISOString()
    })
    router.push(`/channels/${channelId}`)
  }

  const handleDMClick = (dmUserId) => {
    layoutLogger.debug('\n=== DM NAVIGATION ===')
    layoutLogger.debug('DM user selected:', {
      userId: dmUserId,
      user: users.find(u => u.id === dmUserId)?.display_name,
      status: users.find(u => u.id === dmUserId)?.status,
      previousPath: router.asPath,
      timestamp: new Date().toISOString()
    })
    router.push(`/dm/${dmUserId}`)
  }

  if (storeLoading || loading) {
    layoutLogger.debug('Layout in loading state:', {
      storeLoading,
      componentLoading: loading,
      timestamp: new Date().toISOString()
    })
    return <LoadingScreen message="Loading layout (channels, user info)..." />
  }

  if (storeError) {
    layoutLogger.error('Store error in layout:', storeError)
    return (
      <div className="p-4 text-red-500">
        Error loading channels/workspaces: {storeError.message}
      </div>
    )
  }

  // Log workspace and channel state before render
  layoutLogger.debug('\n=== Rendering Layout ===', {
    workspaces: workspaces?.map(w => ({
      id: w.id,
      name: w.name,
      channelCount: channels.filter(c => c.workspace_id === w.id).length,
      role: w.role
    })),
    channels: channels.map(c => ({
      id: c.id,
      name: c.name,
      workspace: workspaces.find(w => w.id === c.workspace_id)?.name,
      role: c.channel_role
    })),
    users: users.map(u => ({
      id: u.id,
      name: u.display_name || u.username,
      status: u.status,
      lastSeen: u.last_seen
    })),
    currentUser: user?.id,
    currentPath: router.asPath,
    timestamp: new Date().toISOString()
  })

  return (
    <div className="flex h-screen bg-gray-900 text-gray-200">
      {!hideSidebar && (
        <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
          {/* App Header */}
          <div className="p-4 text-yellow-400 font-bold border-b border-gray-700">
            Talk2D2
          </div>

          {/* Workspaces and Channels */}
          <div className="flex-1 overflow-y-auto">
            {workspaces?.map(ws => {
              const workspaceChannels = channels.filter(ch => ch.workspace_id === ws.id)
              layoutLogger.debug(`Rendering workspace ${ws.name}:`, {
                channelCount: workspaceChannels.length,
                channels: workspaceChannels.map(ch => ({
                  id: ch.id,
                  name: ch.name,
                  role: ch.channel_role
                })),
                workspaceRole: ws.role,
                canCreateChannel: ['admin', 'owner'].includes(ws.role),
                timestamp: new Date().toISOString()
              })
              return (
                <div key={ws.id} className="p-4 border-b border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-sm font-semibold text-gray-400">
                      {ws.name}
                    </h2>
                    {['admin', 'owner'].includes(ws.role) && <CreateChannelButton workspaceId={ws.id} />}
                  </div>
                  <div className="space-y-1">
                    {workspaceChannels.map(ch => (
                      <button
                        key={ch.id}
                        onClick={() => handleChannelClick(ch.id)}
                        className={`block w-full text-left px-2 py-1 rounded ${
                          router.query.id === ch.id
                            ? 'bg-gray-700 text-yellow-400'
                            : 'text-gray-400 hover:bg-gray-700 hover:text-gray-200'
                        }`}
                      >
                        # {ch.name}
                      </button>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Direct Messages */}
          <div className="p-4 border-t border-gray-700">
            <h2 className="text-sm font-semibold text-gray-400 mb-2">
              Direct Messages
            </h2>
            <div className="space-y-1">
              {users
                .filter(u => u.id !== user?.id)
                .map(u => {
                  layoutLogger.debug(`Rendering DM user ${u.username}:`, {
                    id: u.id,
                    status: u.status,
                    lastSeen: u.last_seen,
                    isActive: router.query.id === u.id,
                    timestamp: new Date().toISOString()
                  })
                  return (
                    <button
                      key={u.id}
                      onClick={() => handleDMClick(u.id)}
                      className={`flex w-full text-left items-center px-2 py-1 rounded ${
                        router.query.id === u.id
                          ? 'bg-gray-700 text-yellow-400'
                          : 'text-gray-400 hover:bg-gray-700 hover:text-gray-200'
                      }`}
                    >
                      {u.avatar_url && (
                        <img
                          src={u.avatar_url}
                          alt=""
                          className="w-6 h-6 rounded-full mr-2"
                        />
                      )}
                      <span>{u.display_name || u.username}</span>
                      {u.status && (
                        <span className="ml-2 text-xs text-gray-500">
                          ({u.status})
                        </span>
                      )}
                    </button>
                  )
                })}
            </div>
          </div>

          {/* User Profile */}
          {user && (
            <div className="p-4 border-t border-gray-700 flex items-center space-x-2">
              {user.avatar_url && (
                <img
                  src={user.avatar_url}
                  alt={user.email}
                  className="w-8 h-8 rounded-full"
                />
              )}
              <div className="flex-1">
                <div className="text-sm font-medium truncate">
                  {user.display_name || user.email}
                </div>
                <div className="text-xs text-gray-400 truncate">
                  {user.username}
                </div>
              </div>
              <Link
                href="/profile"
                className="text-xs text-gray-300 hover:text-yellow-400"
              >
                Profile
              </Link>
            </div>
          )}
        </div>
      )}
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {children}
      </div>
    </div>
  )
}