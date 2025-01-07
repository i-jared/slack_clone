import Layout from '~/components/Layout'
import Message from '~/components/Message'
import MessageInput from '~/components/MessageInput'
import { useRouter } from 'next/router'
import { useStore, addMessage } from '~/lib/Store'
import { useContext, useEffect, useRef } from 'react'
import UserContext from '~/lib/UserContext'

export default function ChannelPage() {
  const { user } = useContext(UserContext)
  const router = useRouter()

  useEffect(() => {
    console.log('Channels page - User state:', user)
    if (!user) {
      console.log('No user found, redirecting to home...')
      router.push('/')
    }
  }, [user, router])

  if (!user) {
    console.log('No user, rendering null')
    return null
  }

  const messagesEndRef = useRef(null)

  // Get current channel
  const { id: channelId } = router.query
  console.log('Channel ID:', channelId)
  const { messages, channels } = useStore({ channelId })
  const currentChannel = channels.find(channel => channel.id === Number(channelId))
  console.log('Current channel:', currentChannel)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      block: 'start',
      behavior: 'smooth',
    })
  }, [messages])

  // redirect to public channel when current channel is deleted
  useEffect(() => {
    if (!channels.some((channel) => channel.id === Number(channelId))) {
      router.push('/channels/1')
    }
  }, [channels, channelId])

  // Render the channels and messages
  return (
    <Layout channels={channels} activeChannelId={channelId}>
      {/* Channel Header */}
      <div className="border-b border-gray-700 px-6 py-2 flex items-center">
        <div className="flex-1">
          <h2 className="text-white text-lg font-semibold">
            # {currentChannel?.slug || 'loading...'}
          </h2>
          <p className="text-sm text-gray-400">
            {messages.length} messages
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="py-4">
          {messages.map((x) => (
            <Message key={x.id} message={x} />
          ))}
          <div ref={messagesEndRef} style={{ height: 0 }} />
        </div>
      </div>

      {/* Message Input */}
      <div className="px-4 pb-4">
        <MessageInput 
          channel_id={channelId}
        />
      </div>
    </Layout>
  )
}
