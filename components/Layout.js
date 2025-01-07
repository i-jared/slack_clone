import Link from 'next/link'
import { useContext, useState } from 'react'
import UserContext from '~/lib/UserContext'
import { addChannel, deleteChannel } from '~/lib/Store'
import TrashIcon from '~/components/TrashIcon'
import UserProfile from './UserProfile'
import { useStore, useMessageCount } from '~/lib/Store'

export default function Layout(props) {
  const { signOut, user } = useContext(UserContext)
  const [isProfileOpen, setIsProfileOpen] = useState(false)

  const slugify = (text) => {
    return text
      .toString()
      .toLowerCase()
      .replace(/\s+/g, '-') // Replace spaces with -
      .replace(/[^\w-]+/g, '') // Remove all non-word chars
      .replace(/--+/g, '-') // Replace multiple - with single -
      .replace(/^-+/, '') // Trim - from start of text
      .replace(/-+$/, '') // Trim - from end of text
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
    <main className="main flex h-screen w-screen overflow-hidden bg-gray-800">
      {/* Sidebar */}
      <nav
        className="w-64 bg-gray-900 text-gray-100 overflow-y-auto"
        style={{ maxWidth: '20%', minWidth: 200 }}
      >
        {/* Workspace Header */}
        <div className="px-4 py-2 border-b border-gray-800">
          <h1 className="text-xl font-bold">GauntletAI Chat</h1>
          <p className="text-sm text-gray-400">Team Workspace</p>
        </div>

        {/* User Profile Section */}
        <div className="p-4 border-b border-gray-800">
          <button 
            onClick={() => setIsProfileOpen(true)}
            className="w-full flex items-center space-x-2 hover:bg-gray-800 p-2 rounded transition-colors"
          >
            <div className="w-8 h-8 rounded bg-indigo-600 flex items-center justify-center text-white font-medium">
              {userInitials}
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-medium truncate">{user?.email}</p>
              <p className="text-xs text-gray-400">Online</p>
            </div>
            <div
              onClick={(e) => {
                e.stopPropagation()
                signOut()
              }}
              className="text-gray-400 hover:text-white cursor-pointer"
            >
              Sign out
            </div>
          </button>
        </div>

        {/* Channels Section */}
        <div className="px-4 py-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">Channels</h2>
            <button
              onClick={() => newChannel()}
              className="text-gray-400 hover:text-white text-xl"
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
      <div className="flex-1 flex flex-col bg-gray-800">
        {props.children}
      </div>

      {/* User Profile Sidebar */}
      <UserProfile isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
    </main>
  )
}

const SidebarItem = ({ channel, isActiveChannel, user }) => {
  const messageCount = useMessageCount(channel.id)
  
  return (
    <li>
      <div className={`flex items-center justify-between group px-2 py-1 rounded ${
        isActiveChannel ? 'bg-indigo-600' : 'hover:bg-gray-800'
      }`}>
        <Link
          href={`/channels/${channel.id}`}
          className={`flex-1 truncate ${isActiveChannel ? 'font-bold' : ''}`}
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
              isActiveChannel ? 'text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            <TrashIcon />
          </button>
        )}
      </div>
    </li>
  )
}
