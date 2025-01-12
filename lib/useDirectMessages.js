// lib/useDirectMessages.js
import { useState, useEffect, useContext, useCallback } from 'react'
import { supabase } from './Store'
import UserContext from './UserContext'

export function useDirectMessages({ dmRoomId, recipientId }) {
  const { user } = useContext(UserContext)
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [pendingMessages, setPendingMessages] = useState(new Set())
  const [users, setUsers] = useState([])

  const fetchUsersForMessages = async (messages) => {
    if (!messages?.length) return

    const userIds = [...new Set(messages.map(msg => [msg.sender_id, msg.recipient_id]).flat())]
    
    try {
      const { data: users, error } = await supabase
        .from('users')
        .select(`
          id,
          email,
          username,
          display_name,
          phone_number,
          avatar_url,
          description,
          status,
          faction,
          last_seen,
          is_bot,
          preferences,
          ai_persona,
          gamification,
          metadata,
          placeholder_col_1,
          placeholder_col_2
        `)
        .in('id', userIds)

      if (error) {
        console.error('Error fetching users:', error)
        return
      }

      setUsers(users || [])
    } catch (error) {
      console.error('Error in fetchUsersForMessages:', error)
    }
  }

  // Handle optimistic updates
  const addMessage = useCallback((message) => {
    setMessages(prev => {
      const newMessage = {
        ...message,
        status: message.id && message.id.startsWith('temp-') ? 'pending' : 'confirmed',
        attachments: message.attachments || {},
        mentions: message.mentions || {},
        metadata: message.metadata || {},
        placeholder_1: message.placeholder_1 || null,
        created_at: message.created_at || new Date().toISOString(),
        updated_at: message.updated_at || new Date().toISOString()
      }
      if (newMessage.status === 'pending') {
        setPendingMessages(p => new Set(p).add(message.id))
      }
      const exists = prev.some(m => m.id === newMessage.id)
      if (exists) return prev
      return [...prev, newMessage].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
    })
  }, [])

  const confirmMessage = useCallback((tempId, confirmedMessage) => {
    setMessages(prev => {
      return prev.map(msg => {
        if (msg.id === tempId) {
          return {
            ...confirmedMessage,
            status: 'confirmed',
            timestamp: confirmedMessage.created_at || confirmedMessage.timestamp,
            delivery_status: confirmedMessage.delivery_status || 'sent',
            read_by: confirmedMessage.read_by || {},
            reactions: confirmedMessage.reactions || {},
            reply_count: confirmedMessage.reply_count || 0,
            is_pinned: confirmedMessage.is_pinned || false,
            is_announcement: confirmedMessage.is_announcement || false,
            is_ai_generated: confirmedMessage.is_ai_generated || false
          }
        }
        return msg
      })
    })
    setPendingMessages(prev => {
      const newSet = new Set(prev)
      newSet.delete(tempId)
      return newSet
    })
  }, [])

  const removeMessage = useCallback((messageId) => {
    setMessages(prev => prev.filter(msg => msg.id !== messageId))
    setPendingMessages(prev => {
      const newSet = new Set(prev)
      newSet.delete(messageId)
      return newSet
    })
  }, [])

  useEffect(() => {
    if (!user?.id) {
      setIsLoading(false)
      setMessages([])
      return
    }

    if (!dmRoomId && !recipientId) {
      setIsLoading(false)
      setMessages([])
      return
    }

    let subscription
    let isMounted = true

    const handleNewMessage = (event) => {
      const message = event.detail
      if (message.dm_room_id === dmRoomId) {
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

    window.addEventListener('newDirectMessage', handleNewMessage)
    window.addEventListener('messageConfirmed', handleMessageConfirmed)
    window.addEventListener('messageFailed', handleMessageFailed)

    const getOrCreateDmRoom = async () => {
      if (dmRoomId) return { id: dmRoomId }

      let { data: allRooms, error: roomErr } = await supabase
        .from('dm_rooms')
        .select('*')

      if (roomErr) {
        console.error('Error fetching dm_rooms:', roomErr)
        return null
      }

      let foundRoom = null
      if (allRooms?.length) {
        foundRoom = allRooms.find(r => {
          if (!r.metadata || !r.metadata.participants) return false
          const part = r.metadata.participants
          const sortedPart = [...part].sort()
          const sortedBoth = [user.id, recipientId].sort()
          return JSON.stringify(sortedPart) === JSON.stringify(sortedBoth) && !r.is_group
        })
      }

      if (!foundRoom) {
        const meta = { participants: [user.id, recipientId].sort() }
        const { data: newRoom, error: createRoomErr } = await supabase
          .from('dm_rooms')
          .insert([{
            id: crypto.randomUUID(),
            room_name: null,
            is_group: false,
            metadata: meta,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])
          .select()
          .single()

        if (createRoomErr) {
          console.error('Error creating DM room:', createRoomErr)
          return null
        }
        foundRoom = newRoom

        for (const uId of meta.participants) {
          await supabase.from('dm_room_members').insert([{
            id: crypto.randomUUID(),
            dm_room_id: newRoom.id,
            user_id: uId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])
        }
      }

      return foundRoom
    }

    const fetchMessages = async () => {
      try {
        const { data, error } = await supabase
          .from('direct_messages')
          .select(`
            id,
            message_text,
            dm_room_id,
            sender_id,
            recipient_id,
            workspace_id,
            thread_id,
            edited_at,
            edited_by,
            is_pinned,
            reactions,
            reply_count,
            is_announcement,
            is_ai_generated,
            ai_model,
            ai_prompt,
            ai_response_metadata,
            read_by,
            delivery_status,
            scheduled_for,
            expires_at,
            attachments,
            mentions,
            metadata,
            placeholder_1,
            placeholder_2,
            created_at,
            updated_at
          `)
          .eq('dm_room_id', dmRoomId)
          .order('created_at', { ascending: true })

        if (error) {
          console.error('Error fetching direct messages:', error)
          return
        }

        setMessages(data || [])
        await fetchUsersForMessages(data || [])
      } catch (error) {
        console.error('Error in fetchMessages:', error)
      }
    }

    let activeRoom = null
    ;(async () => {
      const room = await getOrCreateDmRoom()
      if (!room) {
        setIsLoading(false)
        return
      }
      activeRoom = room
      fetchMessages(room)

      subscription = supabase
        .channel(`dm-room-${room.id}`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'direct_messages',
          filter: `dm_room_id=eq.${room.id}`
        }, async (payload) => {
          console.log('Realtime DM payload:', payload)
          if (payload.eventType === 'INSERT') {
            // Just do a quick re-fetch
            fetchMessages(room)
          }
        })
        .subscribe()
    })()

    return () => {
      isMounted = false
      window.removeEventListener('newDirectMessage', handleNewMessage)
      window.removeEventListener('messageConfirmed', handleMessageConfirmed)
      window.removeEventListener('messageFailed', handleMessageFailed)
      if (subscription) subscription.unsubscribe()
    }
  }, [
    user?.id,
    dmRoomId,
    recipientId,
    addMessage,
    confirmMessage,
    removeMessage,
    pendingMessages,
    fetchUsersForMessages
  ])

  return {
    messages,
    isLoading,
    pendingMessages: Array.from(pendingMessages),
    addMessage,
    confirmMessage,
    removeMessage
  }
}