import { useState, useEffect, useContext, useCallback } from 'react'
import { supabase } from './Store'
import UserContext from './UserContext'

export function useChannelMessages({ channelId }) {
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
    setMessages(prev => {
      // Remove any duplicate confirmed messages
      const filtered = prev.filter(msg => 
        msg.id !== confirmedMessage.id && msg.id !== tempId
      )
      return [...filtered, { ...confirmedMessage, status: 'confirmed' }].sort((a, b) => 
        new Date(a.timestamp || a.inserted_at) - new Date(b.timestamp || b.inserted_at)
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
    if (!user?.id || !channelId) {
      setIsLoading(false)
      setMessages([])
      return
    }

    let subscription
    let isMounted = true

    // Handle optimistic updates
    const handleNewMessage = (event) => {
      const message = event.detail
      // Only add if it's for this channel
      if (message.channel_id === channelId) {
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
    window.addEventListener('newChannelMessage', handleNewMessage)
    window.addEventListener('channelMessageConfirmed', handleMessageConfirmed)
    window.addEventListener('channelMessageFailed', handleMessageFailed)

    const fetchMessages = async () => {
      try {
        setIsLoading(true)
        const { data: messages, error: messagesError } = await supabase
          .from('messages')
          .select(`
            id,
            message,
            inserted_at,
            channel_id,
            attachments,
            user:user_id (
              id,
              username,
              avatar_url
            )
          `)
          .eq('channel_id', channelId)
          .is('parent_id', null)
          .order('inserted_at', { ascending: true })

        if (messagesError) {
          console.error('Error fetching messages:', messagesError)
          return
        }

        if (isMounted) {
          setMessages(messages || [])
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
      // Subscribe to message changes
      const messageSubscription = supabase
        .channel(`channel:${channelId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'messages',
            filter: `channel_id=eq.${channelId}`
          },
          async (payload) => {
            if (!isMounted) return

            // Fetch the complete message with user data and reactions
            const { data: message, error } = await supabase
              .from('messages')
              .select(`
                id,
                message,
                inserted_at,
                channel_id,
                parent_id,
                attachments,
                reactions:message_reactions(*),
                user:user_id (
                  id,
                  username,
                  avatar_url
                )
              `)
              .eq('id', payload.new?.id || payload.old?.id)
              .single()

            if (error) {
              console.error('Error fetching updated message:', error)
              return
            }

            if (payload.eventType === 'DELETE') {
              setMessages(prev => prev.filter(m => m.id !== payload.old.id))
            } else if (message) {
              setMessages(prev => {
                const exists = prev.some(m => m.id === message.id)
                if (exists) {
                  return prev.map(m => m.id === message.id ? message : m)
                } else {
                  return [...prev, message].sort((a, b) => 
                    new Date(a.inserted_at) - new Date(b.inserted_at)
                  )
                }
              })
            }
          }
        )
        .subscribe()

      // Subscribe to reaction changes
      const reactionSubscription = supabase
        .channel(`channel-reactions:${channelId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'message_reactions'
          },
          async (payload) => {
            if (!isMounted) return

            // Get the message ID from the reaction
            const messageId = payload.new?.message_id || payload.old?.message_id
            if (!messageId) return

            // Fetch the updated message with reactions
            const { data: message, error } = await supabase
              .from('messages')
              .select(`
                id,
                message,
                inserted_at,
                channel_id,
                parent_id,
                attachments,
                reactions:message_reactions(*),
                user:user_id (
                  id,
                  username,
                  avatar_url
                )
              `)
              .eq('id', messageId)
              .single()

            if (error) {
              console.error('Error fetching message after reaction change:', error)
              return
            }

            // Update the message in state
            if (message) {
              setMessages(prev => 
                prev.map(m => m.id === messageId ? message : m)
              )
            }
          }
        )
        .subscribe()

      return () => {
        messageSubscription.unsubscribe()
        reactionSubscription.unsubscribe()
      }
    }

    fetchMessages()
    setupSubscription()

    return () => {
      isMounted = false
      if (subscription) {
        supabase.removeChannel(subscription)
      }
      // Clean up event listeners
      window.removeEventListener('newChannelMessage', handleNewMessage)
      window.removeEventListener('channelMessageConfirmed', handleMessageConfirmed)
      window.removeEventListener('channelMessageFailed', handleMessageFailed)
    }
  }, [user?.id, channelId, addMessage, confirmMessage, removeMessage])

  return { 
    messages, 
    isLoading,
    pendingMessages: Array.from(pendingMessages),
    addMessage,
    confirmMessage,
    removeMessage
  }
} 