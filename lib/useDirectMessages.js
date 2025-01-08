import { useState, useEffect, useContext } from 'react'
import { supabase } from './Store'
import UserContext from './UserContext'

export function useDirectMessages({ recipientId }) {
  const { user } = useContext(UserContext)
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!user || !recipientId) {
      setIsLoading(false)
      setMessages([])
      return
    }

    let subscription
    ;(async () => {
      setIsLoading(true)
      // Fetch initial messages
      const { data, error } = await supabase
        .from('direct_messages')
        .select(`
          id,
          message,
          inserted_at,
          updated_at,
          attachments,
          sender:sender_id (
            id,
            username,
            avatar_url
          ),
          recipient:recipient_id (
            id,
            username,
            avatar_url
          )
        `)
        .or(
          `and(sender_id.eq.${user.id},recipient_id.eq.${recipientId}),and(sender_id.eq.${recipientId},recipient_id.eq.${user.id})`
        )
        .order('inserted_at', { ascending: true })

      if (!error && data) {
        setMessages(data)
      }

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
          (payload) => {
            if (payload.eventType === 'INSERT') {
              setMessages((prev) => [...prev, payload.new].sort((a, b) =>
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

      setIsLoading(false)
    })()

    return () => {
      if (subscription) supabase.removeChannel(subscription)
    }
  }, [user, recipientId])

  return { messages, isLoading }
}
  