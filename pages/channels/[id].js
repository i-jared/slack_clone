import { useEffect, useRef, useContext } from 'react'
import { useRouter } from 'next/router'
import { useStore } from '~/lib/Store'
import Message from '~/components/Message'
import MessageInput from '~/components/MessageInput'
import UserContext from '~/lib/UserContext'
import Layout from '~/components/Layout'

const ChannelPage = () => {
  const router = useRouter()
  const { id } = router.query
  const { user } = useContext(UserContext)
  const scrollToMessageId = router.query.scrollToMessage
  const { messages, channels } = useStore({ channelId: id ? parseInt(id) : null })

  const messagesEndRef = useRef(null)

  useEffect(() => {
    if (!user) {
      router.push('/')
      return
    }
  }, [user, router])

  useEffect(() => {
    if (scrollToMessageId) {
      // Delay to ensure messages are loaded
      const timer = setTimeout(() => {
        const elem = document.getElementById(`message-${scrollToMessageId}`)
        if (elem) {
          elem.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [scrollToMessageId, messages])

  const channel = channels.find((c) => c.id === parseInt(id))

  useEffect(() => {
    // Auto-scroll to bottom if there's no specific message to scroll to
    if (!scrollToMessageId && messages?.length) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, scrollToMessageId])

  if (!user) {
    return <Layout />
  }

  return (
    <Layout>
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Channel Header */}
        <header className="flex items-center h-16 px-6 bg-gray-900/75 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-10">
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-yellow-400 flex items-center">
              <span className="text-gray-500 mr-2">#</span>
              {channel?.name || channel?.slug || 'Loading...'}
            </h2>
            <p className="text-sm text-gray-400">
              {channel?.description || `Welcome to #${channel?.name || channel?.slug || 'channel'}`}
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
                <div ref={messagesEndRef} />
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
    </Layout>
  )
}

export default ChannelPage
