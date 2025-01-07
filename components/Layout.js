import React, { Component, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useStore } from '~/lib/Store'
import { useContext } from 'react'
import UserContext from '~/lib/UserContext'
import Starfield from './Starfield'
import FlyingShips from './FlyingShips'
import BackgroundMusic from './BackgroundMusic'
import RandomCharacters from './RandomCharacters'
import UserProfile from './UserProfile'
import { CHANNELS } from '~/lib/constants'
import Link from 'next/link'
import LoadingScreen from './LoadingScreen'

// Error Boundary Component
class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="text-red-500 p-4">
          Something went wrong. Please try refreshing the page.
        </div>
      )
    }

    return this.props.children
  }
}

const Layout = ({ children }) => {
  const router = useRouter()
  const { user } = useContext(UserContext)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isNavigating, setIsNavigating] = useState(false)
  const { channels, users } = useStore()
  const [isLoading, setIsLoading] = useState(true)

  // Global loading timeout
  useEffect(() => {
    const loadingTimeout = setTimeout(() => {
      setIsLoading(false)
    }, 2000) // Reduced to 2 seconds maximum loading time

    return () => clearTimeout(loadingTimeout)
  }, [router.asPath]) // Reset timer on route change

  // Debug logs with more detail
  useEffect(() => {
    console.log('📊 Layout state:', {
      currentPath: router.asPath,
      query: router.query,
      isReady: router.isReady,
      user: user?.email,
      channelsCount: channels?.length,
      isNavigating,
      isLoading
    })
  }, [router.asPath, router.query, router.isReady, user, channels, isNavigating, isLoading])

  // Handle channel switching
  const handleChannelSwitch = async (channelId) => {
    try {
      setIsNavigating(true)
      setIsLoading(true) // Reset loading state on navigation
      await router.push(`/channels/${channelId}`)
    } catch (error) {
      console.error('Error switching channels:', error)
    } finally {
      setIsNavigating(false)
    }
  }

  // Show loading screen if necessary
  if (!router.isReady || !user || isLoading) {
    return <LoadingScreen message="Establishing connection to the Galactic Network..." />
  }

  // Ensure we're in the browser
  if (typeof window === 'undefined') return null

  return (
    <ErrorBoundary>
      <main className="flex h-screen text-gray-100">
        {/* Background Effects */}
        <div className="fixed inset-0 pointer-events-none">
          <Starfield />
          <FlyingShips />
          <BackgroundMusic />
          <RandomCharacters />
        </div>

        {/* Sidebar Navigation */}
        <nav className="w-64 bg-gray-900/90 border-r border-gray-700 flex-shrink-0 relative z-10 flex flex-col">
          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="p-4">
              <h1 className="text-2xl font-orbitron text-yellow-400 mb-4">
                Star Wars Chat
              </h1>

              {/* Channels Section */}
              <div className="mb-6">
                <h3 className="px-2 mb-2 text-yellow-400 font-orbitron text-sm">CHANNELS</h3>
                <ul className="space-y-1">
                  {channels?.map((channel) => {
                    const channelConfig = Object.values(CHANNELS).find(c => c.slug === channel.slug) || {
                      displayName: channel.slug,
                      description: 'Channel description'
                    }
                    return (
                      <li key={channel.id}>
                        <button
                          onClick={() => handleChannelSwitch(channel.id)}
                          disabled={isNavigating}
                          className={`
                            sw-channel w-full px-2 py-1 rounded text-left transition-colors group
                            ${router.query.id === channel.id.toString() 
                              ? 'bg-yellow-500/20 text-yellow-400' 
                              : 'text-gray-400 hover:bg-gray-700 hover:text-yellow-400'
                            }
                            ${isNavigating ? 'opacity-50 cursor-not-allowed' : ''}
                          `}
                          title={channelConfig.description}
                        >
                          <span className="inline-block w-4 opacity-50 group-hover:opacity-100">#</span>
                          <span>{channelConfig.displayName}</span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </div>

              {/* Direct Messages Section */}
              <div>
                <h3 className="px-2 mb-2 text-yellow-400 font-orbitron text-sm">DIRECT MESSAGES</h3>
                <div className="overflow-y-auto max-h-[calc(100vh-300px)] scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent pr-2">
                  {users?.length === 0 ? (
                    <div className="px-4 py-2 text-gray-400 text-sm">
                      No users available
                    </div>
                  ) : (
                    users?.map((otherUser) => {
                      // Don't show current user in DM list
                      if (otherUser.id === user?.id) return null

                      const isActive = router.pathname === '/dms/[id]' && 
                                    router.query.id === otherUser.id

                      return (
                        <Link
                          key={otherUser.id}
                          href={`/dms/${otherUser.id}`}
                          className={`block px-4 py-1.5 ${
                            isActive
                              ? 'bg-yellow-500/10 text-yellow-400'
                              : 'text-gray-300 hover:bg-gray-700'
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 rounded-full bg-green-400" />
                            <span className="font-orbitron">
                              {otherUser.username || 'Unknown User'}
                            </span>
                          </div>
                        </Link>
                      )
                    })
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* User Profile Section */}
          {user && (
            <div className="p-4 border-t border-gray-700 bg-gray-900/90">
              <button
                onClick={() => setIsProfileOpen(true)}
                className="flex items-center space-x-2 text-gray-300 hover:text-yellow-400 transition-colors w-full"
              >
                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                  {user.user_metadata?.avatar_url ? (
                    <img
                      src={user.user_metadata.avatar_url}
                      alt={user.email}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <span className="text-sm font-medium">
                      {user.email?.[0]?.toUpperCase() || '?'}
                    </span>
                  )}
                </div>
                <span className="flex-1 truncate text-left font-orbitron">
                  {user.email}
                </span>
              </button>
            </div>
          )}
        </nav>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden relative z-10 bg-gray-900/90">
          {children}
        </div>

        {/* User Profile Sidebar */}
        <UserProfile isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
      </main>
    </ErrorBoundary>
  )
}

export default Layout
