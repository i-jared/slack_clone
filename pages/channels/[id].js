import { useEffect, useRef, useContext, useState } from 'react'
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
  const [isThreadOpen, setIsThreadOpen] = useState(false)
  const [forceHideLoading, setForceHideLoading] = useState(false)

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
      // First scroll using scrollIntoView
      endElement.scrollIntoView({ behavior, block: 'end' })
      // Then force scroll to bottom directly
      messagesContainer.scrollTop = messagesContainer.scrollHeight
      // Double-check scroll position after a tiny delay
      setTimeout(() => {
        messagesContainer.scrollTop = messagesContainer.scrollHeight
      }, 100)
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
      // Use 'auto' for immediate scroll without animation on initial load
      scrollToBottom('auto')
    }
  }, [messages?.length, isLoading, scrollToMessageId])

  // Scroll when new messages arrive
  useEffect(() => {
    const lastMessage = messages?.[messages.length - 1]
    if (lastMessage && !scrollToMessageId && !isLoading) {
      // Always scroll if the message is from the current user or we're near bottom
      if (lastMessage.user_id === user?.id || shouldAutoScroll.current) {
        scrollToBottom('smooth')
      }
    }
  }, [messages?.length, scrollToMessageId, isLoading, user?.id])

  // Add effect to listen for thread panel state changes
  useEffect(() => {
    const handleThreadState = (e) => {
      if (e.detail?.isOpen !== undefined) {
        setIsThreadOpen(e.detail.isOpen)
      }
    }
    window.addEventListener('threadPanelState', handleThreadState)
    return () => window.removeEventListener('threadPanelState', handleThreadState)
  }, [])

  // Add loading timeout
  useEffect(() => {
    const timer = setTimeout(() => {
      setForceHideLoading(true)
    }, 5000) // Force hide after 5 seconds

    return () => clearTimeout(timer)
  }, [])

  // Remove all other scroll effects and keep just this one reliable scroll effect
  useEffect(() => {
    if (messages?.length > 0 && !scrollToMessageId) {
      // Small delay to ensure rendering
      setTimeout(() => {
        const container = document.querySelector('.messages-container')
        if (container) {
          container.scrollTop = container.scrollHeight
        }
      }, 100)
    }
  }, [messages, id, scrollToMessageId]) // Run on messages or channel change

  // get the channel from the store
  const channel = channels.find((c) => c.id === parseInt(id))

  if (!user) {
    return <Layout />
  }

  return (
    <Layout>
      <div className="relative h-screen flex flex-col">
        {/* Channel Header */}
        <div className="px-4 py-2 border-b border-gray-700 bg-gray-800/90">
          <h2 className="text-2xl font-orbitron text-yellow-400 flex items-center">
            <span className="text-gray-500 mr-2">#</span>
            {channel?.slug || 'Loading...'}
          </h2>
          <p className="text-sm text-gray-400 font-orbitron">
            {channel ? `Welcome to #${channel.slug}` : 'Channel not found'}
          </p>
        </div>

        {/* Messages Area */}
        <div className={`messages-container flex-1 overflow-y-auto scrollbar-hide ${isThreadOpen ? 'mr-80' : ''}`}>
          {isLoading && !forceHideLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-yellow-400 text-xl">Loading messages...</div>
            </div>
          ) : messages?.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-400">
              This is the start of the channel. Send a message to get the conversation going!
            </div>
          ) : (
            <div className="py-4 space-y-2 px-4 w-full max-w-6xl mx-auto pb-16">
              {messages.map((message, i) => (
                <Message
                  key={message.id}
                  message={message}
                  isLatest={i === messages.length - 1}
                  retryMessage={retryMessage}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Message Input */}
        <div className="absolute bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-700 p-4">
          <MessageInput channel_id={parseInt(id)} />
        </div>
      </div>
    </Layout>
  )
}

export default ChannelPage
