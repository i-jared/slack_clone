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
      subscription = supabase
        .channel(`messages:${channelId}:${user.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'messages',
            filter: `channel_id=eq.${channelId},parent_id=is.null`
          },
          (payload) => {
            if (!isMounted) return

            // For inserts, only handle if it's not our optimistic update
            if (payload.eventType === 'INSERT' && pendingMessages.has(payload.new.id)) {
              return
            }

            // For updates and deletes, update the messages state directly
            if (payload.eventType === 'DELETE') {
              setMessages(prev => prev.filter(m => m.id !== payload.old.id))
            } else if (payload.eventType === 'UPDATE') {
              setMessages(prev => prev.map(m => 
                m.id === payload.new.id ? { ...m, ...payload.new } : m
              ))
            } else {
              // For new messages (not our optimistic ones)
              const newMessage = {
                ...payload.new,
                status: 'confirmed',
                user: payload.new.user_id === user.id ? {
                  id: user.id,
                  username: user.email?.split('@')[0],
                  avatar_url: user.user_metadata?.avatar_url
                } : undefined
              }
              
              setMessages(prev => {
                const exists = prev.some(m => m.id === newMessage.id)
                if (exists) return prev
                return [...prev, newMessage].sort((a, b) => 
                  new Date(a.inserted_at) - new Date(b.inserted_at)
                )
              })
            }
          }
        )
        .subscribe()
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