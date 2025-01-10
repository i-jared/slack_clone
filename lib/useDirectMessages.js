import { useState, useEffect, useContext, useCallback } from 'react'
import { supabase } from './Store'
import UserContext from './UserContext'

export function useDirectMessages({ recipientId }) {
  const { user } = useContext(UserContext)
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [pendingMessages, setPendingMessages] = useState(new Set())

  // Handle optimistic updates
  const addMessage = useCallback((message) => {
    setMessages(prev => {
      // Create new message with status
      const newMessage = {
        ...message,
        status: message.id.startsWith('temp-') ? 'pending' : 'confirmed',
        timestamp: message.inserted_at || new Date().toISOString()
      }
      
      // Add to pending if temporary
      if (newMessage.status === 'pending') {
        setPendingMessages(prev => new Set(prev).add(message.id))
      }

      // Check if message already exists to prevent duplicates
      const exists = prev.some(m => 
        (m.id === newMessage.id) || 
        (m.id === newMessage.messageId) ||
        (newMessage.id.startsWith('temp-') && m.message === newMessage.message && 
         m.sender_id === newMessage.sender_id && m.recipient_id === newMessage.recipient_id)
      )

      if (exists) return prev

      return [...prev, newMessage].sort((a, b) => 
        new Date(a.timestamp || a.inserted_at) - new Date(b.timestamp || b.inserted_at)
      )
    })
  }, [])

  // Handle message confirmation
  const confirmMessage = useCallback((tempId, confirmedMessage) => {
    setMessages(prev => {
      const messageExists = prev.some(m => m.id === confirmedMessage.id || m.id === confirmedMessage.messageId)
      if (messageExists) {
        // If the confirmed message already exists, just remove the temporary one
        return prev.filter(msg => msg.id !== tempId)
      }

      return prev.map(msg => 
        msg.id === tempId ? { 
          ...confirmedMessage,
          id: confirmedMessage.id || confirmedMessage.messageId,
          message: confirmedMessage.message || msg.message,
          inserted_at: confirmedMessage.timestamp || confirmedMessage.inserted_at || msg.inserted_at,
          status: 'confirmed'
        } : msg
      )
    })
    setPendingMessages(prev => {
      const newSet = new Set(prev)
      newSet.delete(tempId)
      return newSet
    })
  }, [])

  // Handle message removal (for failed sends)
  const removeMessage = useCallback((messageId) => {
    setMessages(prev => prev.filter(msg => msg.id !== messageId))
    setPendingMessages(prev => {
      const newSet = new Set(prev)
      newSet.delete(messageId)
      return newSet
    })
  }, [])

  useEffect(() => {
    if (!user?.id || !recipientId) {
      setIsLoading(false)
      setMessages([])
      return
    }

    let subscription
    let isMounted = true

    // Handle optimistic updates
    const handleNewMessage = (event) => {
      const message = event.detail
      // Only add if it's relevant to this conversation
      if ((message.sender_id === user.id && message.recipient_id === recipientId) ||
          (message.sender_id === recipientId && message.recipient_id === user.id)) {
        addMessage(message)
      }
    }

    const handleMessageConfirmed = (event) => {
      const { tempId, confirmedMessage } = event.detail
      if (pendingMessages.has(tempId)) {
        confirmMessage(tempId, confirmedMessage)
      }
    }

    const handleMessageFailed = (event) => {
      const { messageId } = event.detail
      if (pendingMessages.has(messageId)) {
        removeMessage(messageId)
      }
    }

    // Listen for optimistic updates
    window.addEventListener('newDirectMessage', handleNewMessage)
    window.addEventListener('messageConfirmed', handleMessageConfirmed)
    window.addEventListener('messageFailed', handleMessageFailed)

    const fetchMessages = async () => {
      try {
        setIsLoading(true)
        // Fetch initial messages
        const { data: messages, error: messagesError } = await supabase
          .from('direct_messages')
          .select('*')
          .or(
            `and(sender_id.eq.${user.id},recipient_id.eq.${recipientId}),and(sender_id.eq.${recipientId},recipient_id.eq.${user.id})`
          )
          .order('inserted_at', { ascending: true })

        if (messagesError) {
          console.error('Error fetching messages:', messagesError)
          return
        }

        // Fetch all unique user IDs from messages
        const userIds = [...new Set([
          ...messages.map(m => m.sender_id),
          ...messages.map(m => m.recipient_id)
        ])]

        // Fetch user data for all users in one query
        const { data: users, error: usersError } = await supabase
          .from('users')
          .select('id, username, avatar_url')
          .in('id', userIds)

        if (usersError) {
          console.error('Error fetching users:', usersError)
          return
        }

        // Create a map of user data
        const userMap = users.reduce((acc, user) => {
          acc[user.id] = user
          return acc
        }, {})

        // Combine message data with user data
        const enrichedMessages = messages.map(message => ({
          ...message,
          sender: userMap[message.sender_id],
          recipient: userMap[message.recipient_id]
        }))

        if (isMounted) {
          setMessages(enrichedMessages)
        }
      } catch (error) {
        console.error('Error in fetchMessages:', error)
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    const setupSubscription = () => {
      // Subscribe to real-time changes for sent messages
      const channel = supabase.channel('direct_messages_' + user.id + '_' + recipientId)
      
      channel
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'direct_messages',
            filter: `or(and(sender_id.eq.${user.id},recipient_id.eq.${recipientId}),and(sender_id.eq.${recipientId},recipient_id.eq.${user.id}))`
          },
          async (payload) => {
            if (!isMounted) return

            // Get the new message data
            const newMessage = payload.new
            
            // Fetch the sender and recipient data
            const { data: users } = await supabase
              .from('users')
              .select('id, username, avatar_url')
              .in('id', [newMessage.sender_id, newMessage.recipient_id])

            if (users) {
              const userMap = users.reduce((acc, user) => {
                acc[user.id] = user
                return acc
              }, {})

              const enrichedMessage = {
                ...newMessage,
                sender: userMap[newMessage.sender_id],
                recipient: userMap[newMessage.recipient_id]
              }

              addMessage(enrichedMessage)
            }
          }
        )
        .subscribe()

      return channel
    }

    // Initial fetch and setup
    fetchMessages()
    subscription = setupSubscription()

    return () => {
      isMounted = false
      window.removeEventListener('newDirectMessage', handleNewMessage)
      window.removeEventListener('messageConfirmed', handleMessageConfirmed)
      window.removeEventListener('messageFailed', handleMessageFailed)
      if (subscription) {
        subscription.unsubscribe()
      }
    }
  }, [user?.id, recipientId, addMessage, confirmMessage, removeMessage, pendingMessages])

  return { 
    messages, 
    isLoading,
    pendingMessages: Array.from(pendingMessages),
    addMessage,
    confirmMessage,
    removeMessage
  }
}
  