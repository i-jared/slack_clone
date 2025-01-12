import { useEffect, useState, useRef, useContext } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '~/lib/Store'
import Layout from '~/components/Layout'
import Message from '~/components/Message'
import MessageInput from '~/components/MessageInput'
import LoadingScreen from '~/components/LoadingScreen'
import UserContext from '~/lib/UserContext'
import { useDirectMessages } from '~/lib/useDirectMessages'
import { v4 as uuidv4 } from 'uuid'

export default function DirectMessagePage() {
  const router = useRouter()
  const { id } = router.query
  const { user } = useContext(UserContext)
  const [recipient, setRecipient] = useState(null)
  const [isLoadingRecipient, setIsLoadingRecipient] = useState(true)
  const messagesEndRef = useRef(null)

  const { messages: directMessages, isLoading: isLoadingMessages } = useDirectMessages({ recipientId: id })

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (!user) {
      // Updated to /auth
      router.push('/auth')
    }
  }, [user, router])

  useEffect(() => {
    scrollToBottom()
  }, [directMessages])

  // Fetch recipient user data
  useEffect(() => {
    let isMounted = true

    const fetchRecipient = async () => {
      if (!id) return
      setIsLoadingRecipient(true)
      try {
        const { data, error } = await supabase
          .from('users')
          .select('id, username, display_name, avatar_url, status')
          .eq('id', id)
          .single()

        if (error) {
          console.error('Error fetching recipient:', error)
        }
        if (data && isMounted) {
          setRecipient(data)
        }
      } catch (err) {
        console.error('Error:', err)
      } finally {
        if (isMounted) setIsLoadingRecipient(false)
      }
    }

    fetchRecipient()
    return () => {
      isMounted = false
    }
  }, [id])

  const handleSend = async (content) => {
    const tempId = `temp-${uuidv4()}`
    const tempMessage = {
      id: tempId,
      dm_room_id: roomId,
      sender_id: user.id,
      recipient_id: recipientId,
      message_text: content,
      attachments: {},
      mentions: {},
      metadata: {},
      placeholder_1: null,
      placeholder_2: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    addMessage(tempMessage)

    try {
      const confirmedMessage = await sendDirectMessage({
        message: content,
        room_id: roomId,
        sender_id: user.id,
        recipient_id: recipientId
      })

      window.dispatchEvent(new CustomEvent('dmMessageConfirmed', {
        detail: { tempId, confirmedMessage }
      }))
    } catch (error) {
      console.error('Error sending direct message:', error)
      window.dispatchEvent(new CustomEvent('dmMessageFailed', {
        detail: { messageId: tempId }
      }))
    }
  }

  if (!user) {
    return (
      <Layout>
        <LoadingScreen message="Checking authentication..." />
      </Layout>
    )
  }

  if (isLoadingRecipient) {
    return (
      <Layout>
        <LoadingScreen message="Loading recipient data..." />
      </Layout>
    )
  }

  if (!recipient) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <p className="text-gray-400">Recipient not found.</p>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="relative h-screen flex flex-col">
        {/* DM Header */}
        <div className="px-4 py-2 border-b border-gray-700 bg-gray-800/90">
          <h2 className="text-2xl font-orbitron text-yellow-400">
            {recipient.display_name || recipient.username}
          </h2>
          <p className="text-sm text-gray-400 font-orbitron">Private conversation</p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
          {isLoadingMessages ? (
            <div className="flex items-center justify-center h-full">
              <LoadingScreen message="Loading messages..." />
            </div>
          ) : directMessages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              No messages yet. Start the conversation!
            </div>
          ) : (
            <div className="py-4 space-y-2">
              {directMessages.map((msg) => (
                <Message
                  key={msg.id}
                  message={{
                    ...msg,
                    user: msg.sender, // unify usage with the <Message> component
                    isDirect: true
                  }}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* MessageInput with a direct param */}
        <MessageInput recipient_id={id} isDirect />
      </div>
    </Layout>
  )
}