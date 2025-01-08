import { useState, useEffect, useContext } from 'react'
import { supabase } from './Store'
import UserContext from './UserContext'

export function useDirectMessages({ recipientId }) {
  const { user } = useContext(UserContext)
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!user?.id || !recipientId) {
      setIsLoading(false)
      setMessages([])
      return
    }

    let subscription
    let isMounted = true

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
      // Subscribe to real-time changes
      const channelName = `direct_messages-${[user.id, recipientId].sort().join('-')}`
      subscription = supabase
        .channel(channelName)
        .on('postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'direct_messages',
            filter: `or(and(sender_id.eq.${user.id},recipient_id.eq.${recipientId}),and(sender_id.eq.${recipientId},recipient_id.eq.${user.id}))`
          },
          async (payload) => {
            if (!isMounted) return

            if (payload.eventType === 'INSERT') {
              // Fetch user data for the new message
              const { data: users } = await supabase
                .from('users')
                .select('id, username, avatar_url')
                .in('id', [payload.new.sender_id, payload.new.recipient_id])

              const userMap = users.reduce((acc, user) => {
                acc[user.id] = user
                return acc
              }, {})

              const enrichedMessage = {
                ...payload.new,
                sender: userMap[payload.new.sender_id],
                recipient: userMap[payload.new.recipient_id]
              }

              setMessages((prev) => [...prev, enrichedMessage].sort((a, b) =>
                new Date(a.inserted_at) - new Date(b.inserted_at)
              ))
            } else if (payload.eventType === 'UPDATE') {
              setMessages((prev) => prev.map(
                (m) => m.id === payload.new.id ? payload.new : m
              ))
            } else if (payload.eventType === 'DELETE') {
              setMessages((prev) => prev.filter((m) => m.id !== payload.old.id))
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
    }
  }, [user?.id, recipientId])

  return { messages, isLoading }
}
  