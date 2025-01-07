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
  const { user, signOut } = useContext(UserContext)
  const router = useRouter()
  const { channels } = useStore()
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isNavigating, setIsNavigating] = useState(false)

  // Debug logs with more detail
  useEffect(() => {
    console.log('📊 Layout state:', {
      currentPath: router.asPath,
      query: router.query,
      isReady: router.isReady,
      user: user?.email,
      channelsCount: channels?.length,
      isNavigating
    })
  }, [router.asPath, router.query, router.isReady, user, channels, isNavigating])

  // Handle channel switching
  const handleChannelSwitch = async (channelId) => {
    try {
      if (isNavigating) {
        console.log('⚠️ Already navigating, ignoring click')
        return
      }
      
      setIsNavigating(true)
      console.log('🔄 Starting channel switch to:', channelId)
      console.log('📍 Current path:', router.asPath)
      
      const targetPath = `/channels/${channelId}`
      console.log('🎯 Target path:', targetPath)
      
      await router.replace(targetPath, undefined, { 
        shallow: false,
        scroll: false
      })
      
      console.log('✅ Navigation complete')
    } catch (error) {
      console.error('❌ Error switching channel:', error)
    } finally {
      console.log('🔄 Resetting navigation state')
      setIsNavigating(false)
    }
  }

  // Ensure we're in the browser
  if (typeof window === 'undefined') return null

  return (
    <ErrorBoundary>
      <main className="flex h-screen text-gray-100 bg-gray-900 relative overflow-hidden">
        {/* Background Effects */}
        <Starfield />
        <FlyingShips />
        <BackgroundMusic />
        <RandomCharacters />

        {/* Sidebar */}
        <nav className="w-64 bg-gray-800/90 border-r border-gray-700 flex flex-col relative z-10">
          {/* User Profile */}
          <div className="p-4 border-b border-gray-700">
            <div 
              className="flex items-center space-x-2 cursor-pointer hover:opacity-80"
              onClick={() => setIsProfileOpen(true)}
            >
              <div className="sw-profile-icon w-10 h-10 rounded-full flex items-center justify-center">
                {user?.email?.[0]?.toUpperCase()}
              </div>
              <div>
                <p className="font-orbitron text-yellow-400">{user?.email?.split('@')[0]}</p>
                <button 
                  onClick={(e) => {
                    e.stopPropagation()
                    signOut()
                  }}
                  className="text-sm text-gray-400 hover:text-yellow-400 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>

          {/* Channel List */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4">
              <h2 className="font-orbitron text-yellow-400 mb-2">Channels</h2>
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
          </div>
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
