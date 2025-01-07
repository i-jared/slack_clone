import Link from 'next/link'
import { useContext, useState, useEffect, Suspense, lazy } from 'react'
import UserContext from '~/lib/UserContext'
import { addChannel, deleteChannel } from '~/lib/Store'
import TrashIcon from '~/components/TrashIcon'
import UserProfile from './UserProfile'
import { useStore, useMessageCount } from '~/lib/Store'
import Starfield from './Starfield'

// Lazy load non-critical components
const FlyingShips = lazy(() => import('./FlyingShips'))
const BackgroundMusic = lazy(() => import('./BackgroundMusic'))
const RandomCharacters = lazy(() => import('./RandomCharacters'))

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error in component:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="text-yellow-400 p-4">
          <h2>Something went wrong.</h2>
          <button 
            onClick={() => this.setState({ hasError: false })}
            className="sw-button mt-2"
          >
            Try again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

export default function Layout(props) {
  const { signOut, user } = useContext(UserContext)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [showLightspeed, setShowLightspeed] = useState(false)

  useEffect(() => {
    const handleRouteChange = () => {
      setShowLightspeed(true)
      setTimeout(() => setShowLightspeed(false), 500)
    }

    window.addEventListener('routeChangeStart', handleRouteChange)
    return () => window.removeEventListener('routeChangeStart', handleRouteChange)
  }, [])

  const slugify = (text) => {
    return text
      .toString()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '')
      .replace(/--+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '')
  }

  const newChannel = async () => {
    const slug = prompt('Please enter channel name')
    if (slug) {
      addChannel(slugify(slug), user.id)
    }
  }

  // Generate user initials for avatar
  const userInitials = user?.email?.slice(0, 2)?.toUpperCase() || '??'

  return (
    <ErrorBoundary>
      <main className="main flex h-screen w-screen overflow-hidden bg-gray-800">
        <Starfield />
        <Suspense fallback={null}>
          <FlyingShips />
          <BackgroundMusic />
          <RandomCharacters />
        </Suspense>
        {showLightspeed && <div className="lightspeed-transition active" />}
        
        {/* Sidebar */}
        <nav
          className="w-64 bg-opacity-90 bg-gray-900 text-gray-100 overflow-y-auto"
          style={{ maxWidth: '20%', minWidth: 200 }}
        >
          {/* Workspace Header */}
          <div className="px-4 py-2 border-b border-gray-800">
            <h1 className="text-xl font-bold talk2d2-logo">Talk2D2</h1>
            <p className="text-sm text-gray-400">Your Galactic Chat Hub</p>
          </div>

          {/* User Profile Section */}
          <div className="p-4 border-b border-gray-800">
            <button 
              onClick={() => setIsProfileOpen(true)}
              className="w-full flex items-center space-x-2 hover:bg-gray-800 p-2 rounded transition-colors"
            >
              {user?.dbUser?.avatar_url ? (
                <img 
                  src={user.dbUser.avatar_url}
                  alt={user.email}
                  className="w-8 h-8 rounded object-cover flex-shrink-0 sw-profile-icon"
                />
              ) : (
                <div className="w-8 h-8 rounded flex items-center justify-center flex-shrink-0 sw-profile-icon">
                  {userInitials}
                </div>
              )}
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-medium truncate">{user?.email}</p>
                <p className="text-xs text-yellow-400">Online</p>
              </div>
              <div
                onClick={(e) => {
                  e.stopPropagation()
                  signOut()
                }}
                className="text-gray-400 hover:text-yellow-400 cursor-pointer"
              >
                Sign out
              </div>
            </button>
          </div>

          {/* Channels Section */}
          <div className="px-4 py-2">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-yellow-400">Channels</h2>
              <button
                onClick={() => newChannel()}
                className="text-gray-400 hover:text-yellow-400 text-xl"
                title="Add Channel"
              >
                +
              </button>
            </div>
            <ul className="space-y-1">
              {props.channels.map((x) => (
                <SidebarItem
                  channel={x}
                  key={x.id}
                  isActiveChannel={x.id === Number(props.activeChannelId)}
                  user={user}
                />
              ))}
            </ul>
          </div>
        </nav>

        {/* Main Content */}
        <div className="flex-1 flex flex-col bg-opacity-90 bg-gray-800">
          {props.children}
        </div>

        {/* User Profile Sidebar */}
        <UserProfile isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
      </main>
    </ErrorBoundary>
  )
}

const SidebarItem = ({ channel, isActiveChannel, user }) => {
  const messageCount = useMessageCount(channel.id)
  
  return (
    <li>
      <div className={`flex items-center justify-between group px-2 py-1 rounded sw-channel ${
        isActiveChannel ? 'active' : ''
      }`}>
        <Link
          href={`/channels/${channel.id}`}
          className={`flex-1 truncate ${isActiveChannel ? 'font-bold text-yellow-400' : ''}`}
        >
          <div className="flex items-center justify-between">
            <span># {channel.slug}</span>
            <span className="text-xs text-gray-400">{messageCount}</span>
          </div>
        </Link>
        {channel.id !== 1 && (channel.created_by === user?.id || user?.appRole === 'admin') && (
          <button 
            onClick={() => deleteChannel(channel.id)}
            className={`opacity-0 group-hover:opacity-100 transition-opacity ${
              isActiveChannel ? 'text-yellow-400' : 'text-gray-400 hover:text-yellow-400'
            }`}
          >
            <TrashIcon />
          </button>
        )}
      </div>
    </li>
  )
}
