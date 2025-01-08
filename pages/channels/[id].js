import { useEffect, useState, useRef, useMemo } from 'react'
import { useRouter } from 'next/router'
import { useStore } from '~/lib/Store'
import Message from '~/components/Message'
import MessageInput from '~/components/MessageInput'
import LoadingScreen from '~/components/LoadingScreen'
import { useContext } from 'react'
import UserContext from '~/lib/UserContext'
import { CHANNELS, LOADING_MESSAGES } from '~/lib/constants'

const ChannelPage = () => {
  const router = useRouter()
  const { id } = router.query
  const { messages, channels } = useStore({ channelId: id ? parseInt(id) : null })
  const { user } = useContext(UserContext)

  // Find the current channel
  const channel = useMemo(() => {
    console.log('🔍 Finding channel:', id, 'from', channels.length, 'channels')
    const found = channels.find(x => x.id === parseInt(id))
    if (found) console.log('✅ Channel found:', found.slug)
    return found
  }, [id, channels])

  return (
    <div className="relative flex flex-col flex-1 overflow-hidden bg-gray-800">
      {/* Channel Header */}
      <header className="flex items-center h-16 px-6 bg-gray-900 border-b border-gray-800">
        <h2 className="text-lg font-semibold text-yellow-400">
          # {channel?.slug}
        </h2>
        <div className="ml-4 text-sm text-gray-400">
          {channel?.description}
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages?.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-400 text-center">
              <p className="text-2xl mb-2">Welcome to #{channel?.slug}!</p>
              <p>This is the start of the channel.</p>
            </div>
          </div>
        ) : (
          messages?.map((message) => (
            <Message key={message.id} message={message} />
          ))
        )}
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-800">
        <MessageInput channel_id={parseInt(id)} />
      </div>
    </div>
  )
}

export default ChannelPage
