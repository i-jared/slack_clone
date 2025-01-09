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

      return [...prev, newMessage].sort((a, b) => 
        new Date(a.timestamp) - new Date(b.timestamp)
      )
    })
  }, [])

  // Handle message confirmation
  const confirmMessage = useCallback((tempId, confirmedMessage) => {
    setMessages(prev => prev.map(msg => 
      msg.id === tempId ? { ...confirmedMessage, status: 'confirmed' } : msg
    ))
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
      const sentChannelName = `direct_messages:${user.id}:${recipientId}:sent`
      const receivedChannelName = `direct_messages:${user.id}:${recipientId}:received`
      
      const subscriptions = []

      // Subscribe to sent messages
      subscriptions.push(
        supabase
          .channel(sentChannelName)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'direct_messages',
              filter: `sender_id.eq.${user.id},recipient_id.eq.${recipientId}`
            },
            handleMessageUpdate
          )
          .subscribe((status) => {
            console.log(`Subscription ${sentChannelName} status:`, status)
          })
      )

      // Subscribe to received messages
      subscriptions.push(
        supabase
          .channel(receivedChannelName)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'direct_messages',
              filter: `sender_id.eq.${recipientId},recipient_id.eq.${user.id}`
            },
            handleMessageUpdate
          )
          .subscribe((status) => {
            console.log(`Subscription ${receivedChannelName} status:`, status)
          })
      )

      subscription = subscriptions

      async function handleMessageUpdate(payload) {
        console.log('🔔 DM subscription event received:', {
          eventType: payload.eventType,
          new: payload.new,
          old: payload.old
        })
        if (!isMounted) return

        // Fetch the latest messages to ensure we have everything in sync
        console.log('📥 Fetching latest messages after update')
        const { data: messages, error: messagesError } = await supabase
          .from('direct_messages')
          .select('*')
          .or(
            `and(sender_id.eq.${user.id},recipient_id.eq.${recipientId}),and(sender_id.eq.${recipientId},recipient_id.eq.${user.id})`
          )
          .order('inserted_at', { ascending: true })

        if (messagesError) {
          console.error('Error fetching messages after update:', messagesError)
          return
        }

        // Fetch user data
        const userIds = [...new Set([
          ...messages.map(m => m.sender_id),
          ...messages.map(m => m.recipient_id)
        ])]

        const { data: users, error: usersError } = await supabase
          .from('users')
          .select('id, username, avatar_url')
          .in('id', userIds)

        if (usersError) {
          console.error('Error fetching users after update:', usersError)
          return
        }

        // Create a map of user data
        const userMap = users.reduce((acc, user) => {
          acc[user.id] = user
          return acc
        }, {})

        // Update messages with user data
        const enrichedMessages = messages.map(message => ({
          ...message,
          sender: userMap[message.sender_id],
          recipient: userMap[message.recipient_id]
        }))

        setMessages(enrichedMessages)
      }
    }

    fetchMessages()
    setupSubscription()

    return () => {
      isMounted = false
      if (subscription) {
        // Clean up all subscriptions
        subscription.forEach(sub => {
          supabase.removeChannel(sub)
        })
      }
      // Clean up event listeners
      window.removeEventListener('newDirectMessage', handleNewMessage)
      window.removeEventListener('messageConfirmed', handleMessageConfirmed)
      window.removeEventListener('messageFailed', handleMessageFailed)
    }
  }, [user?.id, recipientId])

  return { 
    messages, 
    isLoading,
    pendingMessages: Array.from(pendingMessages),
    addMessage,
    confirmMessage,
    removeMessage
  }
}
  