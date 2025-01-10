import { useEffect, useRef, useContext } from 'react'
import { useRouter } from 'next/router'
import { useStore } from '~/lib/Store'
import { useChannelMessages } from '~/lib/useChannelMessages'
import Message from '~/components/Message'
import MessageInput from '~/components/MessageInput'
import UserContext from '~/lib/UserContext'
import Layout from '~/components/Layout'

const ChannelPage = () => {
  const router = useRouter()
  const { id } = router.query
  const { user } = useContext(UserContext)
  const scrollToMessageId = router.query.scrollToMessage

  // This custom store hook loads channels
  const { channels } = useStore()
  // This hook handles messages with optimistic updates
  const { messages, isLoading, retryMessage } = useChannelMessages({ 
    channelId: id ? parseInt(id) : null 
  })
  const messagesEndRef = useRef(null)
  const shouldAutoScroll = useRef(true)

  useEffect(() => {
    if (!user) {
      router.push('/')
    }
  }, [user, router])

  // If scrollToMessageId is set, scroll to that message
  useEffect(() => {
    if (scrollToMessageId && messages?.length) {
      const timer = setTimeout(() => {
        const elem = document.getElementById(`message-${scrollToMessageId}`)
        if (elem) {
          elem.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [scrollToMessageId, messages])

  // Improved scroll to bottom function
  const scrollToBottom = (behavior = 'smooth') => {
    const messagesContainer = document.querySelector('.messages-container')
    const endElement = messagesEndRef.current
    
    if (messagesContainer && endElement) {
      // Calculate if we're already near bottom
      const containerHeight = messagesContainer.clientHeight
      const scrollPosition = messagesContainer.scrollTop
      const scrollHeight = messagesContainer.scrollHeight
      const isNearBottom = (scrollHeight - (scrollPosition + containerHeight)) < 100

      // Update auto-scroll preference based on user's scroll position
      shouldAutoScroll.current = isNearBottom

      // Only scroll if we should auto-scroll
      if (shouldAutoScroll.current) {
        setTimeout(() => {
          endElement.scrollIntoView({ behavior, block: 'end' })
        }, 100)
      }
    }
  }

  // Handle scroll events to determine if user has scrolled up
  const handleScroll = (e) => {
    const container = e.target
    const isNearBottom = (container.scrollHeight - (container.scrollTop + container.clientHeight)) < 100
    shouldAutoScroll.current = isNearBottom
  }

  // Scroll to bottom on initial load
  useEffect(() => {
    if (!scrollToMessageId && messages?.length && !isLoading) {
      scrollToBottom('auto')
    }
  }, [isLoading, messages?.length, scrollToMessageId])

  // Scroll when new messages arrive
  useEffect(() => {
    const lastMessage = messages?.[messages.length - 1]
    if (lastMessage && !scrollToMessageId && !isLoading) {
      scrollToBottom()
    }
  }, [messages?.length, scrollToMessageId, isLoading])

  // get the channel from the store
  const channel = channels.find((c) => c.id === parseInt(id))

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
              {channel?.slug || 'Loading...'}
            </h2>
            <p className="text-sm text-gray-400">
              {channel ? `Welcome to #${channel.slug}` : 'Channel not found'}
            </p>
          </div>
        </header>

        {/* Messages */}
        <div 
          className="messages-container flex-1 overflow-y-auto px-6 py-4"
          onScroll={handleScroll}
        >
          <div className="max-w-4xl mx-auto space-y-4">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <div className="text-yellow-400 text-4xl mb-4">⌛</div>
                <h3 className="text-2xl font-semibold text-yellow-400 mb-2">
                  Loading messages...
                </h3>
              </div>
            ) : messages?.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <div className="text-yellow-400 text-4xl mb-4">👋</div>
                <h3 className="text-2xl font-semibold text-yellow-400 mb-2">
                  {channel ? `Welcome to #${channel.slug}!` : 'No channel loaded'}
                </h3>
                <p className="text-gray-400">
                  This is the start of the channel. Send a message to get the conversation going!
                </p>
              </div>
            ) : (
              <>
                {messages.map((message, i) => (
                  <Message
                    key={message.id}
                    message={message}
                    isLatest={i === messages.length - 1}
                    retryMessage={retryMessage}
                  />
                ))}
                <div ref={messagesEndRef} className="h-1" />
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
