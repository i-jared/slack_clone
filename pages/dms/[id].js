import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/router'
import { useDirectMessages, supabase } from '~/lib/Store'
import Layout from '~/components/Layout'
import Message from '~/components/Message'
import MessageInput from '~/components/MessageInput'
import LoadingScreen from '~/components/LoadingScreen'
import { useContext } from 'react'
import UserContext from '~/lib/UserContext'

const DirectMessageContent = () => {
  const router = useRouter()
  const { id } = router.query
  const { user } = useContext(UserContext)
  const [recipient, setRecipient] = useState(null)
  const { messages: directMessages, isLoading: isLoadingMessages } = useDirectMessages({ recipientId: id })
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Scroll to bottom when messages change
  useEffect(() => {
    if (!isLoadingMessages) {
      scrollToBottom()
    }
  }, [directMessages, isLoadingMessages])

  // Fetch recipient user data
  useEffect(() => {
    const fetchRecipient = async () => {
      if (id && router.isReady) {
        try {
          const { data: userData, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', id)
            .single()

          if (error) throw error

          setRecipient(userData)
        } catch (error) {
          console.error('Error fetching recipient:', error)
        }
      }
    }

    fetchRecipient()
  }, [id, router.isReady])

  // Render null if user is not authenticated
  if (!user) {
    console.log('⚠️ No user, rendering null')
    return null
  }

  if (!recipient) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-red-400 bg-red-400/10 px-4 py-2 rounded-lg">
          User not found
        </div>
      </div>
    )
  }

  return (
    <div className="relative h-screen flex flex-col">
      <div className="px-4 py-2 border-b border-gray-700 bg-gray-800/90">
        <h2 className="text-2xl font-orbitron text-yellow-400">
          {recipient.username || 'Unknown User'}
        </h2>
        <p className="text-sm text-gray-400 font-orbitron">
          Private conversation
        </p>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
        {directMessages?.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            No messages yet. Start the conversation!
          </div>
        ) : (
          <div className="py-4 space-y-2">
            {directMessages?.map((message) => (
              <Message key={message.id} message={message} />
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
  )
}

const DirectMessagePage = () => {
  const router = useRouter()
  const { id } = router.query

  // Use key prop to force remount of entire component tree
  return (
    <Layout key={id}>
      <DirectMessageContent />
    </Layout>
  )
}

export default DirectMessagePage 