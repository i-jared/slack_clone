import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/router'
import { useDirectMessages, supabase } from '~/lib/Store'
import Layout from '~/components/Layout'
import Message from '~/components/Message'
import MessageInput from '~/components/MessageInput'
import LoadingScreen from '~/components/LoadingScreen'
import { useContext } from 'react'
import UserContext from '~/lib/UserContext'

const DirectMessagePage = () => {
  const router = useRouter()
  const { id } = router.query
  const { user } = useContext(UserContext)
  const [recipient, setRecipient] = useState(null)
  const [isLoadingRecipient, setIsLoadingRecipient] = useState(true)
  const { messages: directMessages, isLoading: isLoadingMessages } = useDirectMessages({ recipientId: id })
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Scroll to bottom when messages change
  useEffect(() => {
    if (!isLoadingMessages && directMessages?.length > 0) {
      scrollToBottom()
    }
  }, [directMessages, isLoadingMessages])

  // Fetch recipient user data
  useEffect(() => {
    let isMounted = true

    const fetchRecipient = async () => {
      if (!id || !router.isReady || !user) return

      try {
        console.log('🔍 Fetching recipient data:', id)
        
        const { data: userData, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', id)
          .single()

        if (error) {
          console.error('❌ Error fetching recipient:', error)
          throw error
        }

        if (isMounted) {
          console.log('✅ Recipient data:', userData)
          setRecipient(userData)
        }
      } catch (error) {
        console.error('Error fetching recipient:', error)
      } finally {
        if (isMounted) {
          setIsLoadingRecipient(false)
        }
      }
    }

    setIsLoadingRecipient(true)
    fetchRecipient()

    return () => {
      isMounted = false
    }
  }, [id, router.isReady, user])

  // Show loading screen while auth is initializing
  if (!user) {
    return (
      <Layout>
        <LoadingScreen message="Initializing..." />
      </Layout>
    )
  }

  // Show loading screen while fetching recipient data
  if (isLoadingRecipient) {
    return (
      <Layout>
        <LoadingScreen message="Loading user data..." />
      </Layout>
    )
  }

  // Show error if recipient not found
  if (!recipient) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-red-400 bg-red-400/10 px-4 py-2 rounded-lg">
            User not found
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="relative h-screen flex flex-col">
        <div className="px-4 py-2 border-b border-gray-700 bg-gray-800/90">
          <h2 className="text-2xl font-orbitron text-yellow-400">
            {recipient.username || recipient.email?.split('@')[0] || 'Unknown User'}
          </h2>
          <p className="text-sm text-gray-400 font-orbitron">
            Private conversation
          </p>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
          {isLoadingMessages ? (
            <div className="flex items-center justify-center h-full">
              <LoadingScreen message="Loading messages..." />
            </div>
          ) : directMessages?.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-400">
              No messages yet. Start the conversation!
            </div>
          ) : (
            <div className="py-4 space-y-2">
              {directMessages?.map((message) => (
                <Message 
                  key={`${message.id}-${message.inserted_at}`} 
                  message={{
                    ...message,
                    user: message.sender,
                    isDirect: true
                  }} 
                />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
        <MessageInput 
          recipient_id={id}
          isDirect={true}
        />
      </div>
    </Layout>
  )
}

export default DirectMessagePage 