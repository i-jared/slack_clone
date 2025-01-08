import { useEffect, useState, useRef, useMemo } from 'react'
import { useRouter } from 'next/router'
import { useStore } from '~/lib/Store'
import Message from '~/components/Message'
import MessageInput from '~/components/MessageInput'
import LoadingScreen from '~/components/LoadingScreen'
import { useContext } from 'react'
import UserContext from '~/lib/UserContext'

const ChannelPage = () => {
  const router = useRouter()
  const { id } = router.query
  const { messages, channels } = useStore({ channelId: id ? parseInt(id) : null })
  const { user } = useContext(UserContext)
  const messagesEndRef = useRef(null)

  // Find the current channel
  const channel = useMemo(() => {
    console.log('🔍 Finding channel:', id, 'from', channels.length, 'channels')
    const found = channels.find(x => x.id === parseInt(id))
    if (found) console.log('✅ Channel found:', found.slug)
    return found
  }, [id, channels])

  // Auto scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages]) // Scroll when messages change

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Channel Header */}
      <header className="flex items-center h-16 px-6 bg-gray-900/75 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-10">
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-yellow-400 flex items-center">
            <span className="text-gray-500 mr-2">#</span>
            {channel?.displayName || channel?.name || channel?.slug || 'Loading...'}
          </h2>
          <p className="text-sm text-gray-400">
            {channel?.description || `Welcome to #${channel?.displayName || channel?.name || channel?.slug || 'channel'}`}
          </p>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages?.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="text-yellow-400 text-4xl mb-4">👋</div>
              <h3 className="text-2xl font-semibold text-yellow-400 mb-2">
                Welcome to #{channel?.name || channel?.slug}!
              </h3>
              <p className="text-gray-400">
                This is the start of the channel. Send a message to get the conversation going!
              </p>
            </div>
          ) : (
            <>
              {messages?.map((message) => (
                <Message key={message.id} message={message} />
              ))}
              <div ref={messagesEndRef} /> {/* Scroll anchor */}
            </>
          )}
        </div>
      </div>

      {/* Message Input */}
      <div className="p-4 bg-gray-900/75 backdrop-blur-sm border-t border-gray-800">
        <div className="max-w-4xl mx-auto">
          <MessageInput channel_id={parseInt(id)} />
        </div>
      </div>
    </div>
  )
}

export default ChannelPage
