// lib/useChannelMessages.js
import { useState, useEffect, useContext, useCallback } from 'react'
import { supabase } from './Store'
import { UserContext } from './UserContext'

export function useChannelMessages({ channelId }) {
  const { user } = useContext(UserContext)
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [pendingMessages, setPendingMessages] = useState(new Set())
  const [users, setUsers] = useState([])

  // Merge user data in-memory
  const fetchUsersForMessages = async (messages) => {
    if (!messages?.length) return

    const userIds = [...new Set(messages.map(msg => msg.user_id))]
    
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
    setMessages((prev) => {
      const newMessage = {
        ...message,
        status: message.id.startsWith('temp-') ? 'pending' : 'confirmed',
        attachments: message.attachments || {},
        mentions: message.mentions || {},
        metadata: message.metadata || {},
        placeholder_1: message.placeholder_1 || null,
        placeholder_2: message.placeholder_2 || {},
        created_at: message.created_at || new Date().toISOString(),
        updated_at: message.updated_at || new Date().toISOString()
      }
      if (newMessage.status === 'pending') {
        setPendingMessages((p) => new Set(p).add(message.id))
      }
      return [...prev, newMessage].sort(
        (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
      )
    })
  }, [])

  const confirmMessage = useCallback((tempId, confirmedMessage) => {
    setMessages((prev) => {
      const filtered = prev.filter((msg) => msg.id !== confirmedMessage.id && msg.id !== tempId)
      return [...filtered, { 
        ...confirmedMessage, 
        status: 'confirmed',
        delivery_status: confirmedMessage.delivery_status || 'sent',
        read_by: confirmedMessage.read_by || {},
        reactions: confirmedMessage.reactions || {},
        reply_count: confirmedMessage.reply_count || 0,
        is_pinned: confirmedMessage.is_pinned || false,
        is_announcement: confirmedMessage.is_announcement || false,
        is_ai_generated: confirmedMessage.is_ai_generated || false
      }].sort(
        (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
      )
    })
    setPendingMessages((prev) => {
      const newSet = new Set(prev)
      newSet.delete(tempId)
      return newSet
    })
  }, [])

  const removeMessage = useCallback((messageId) => {
    setMessages((prev) => prev.filter((msg) => msg.id !== messageId))
    setPendingMessages((prev) => {
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

    let isMounted = true

    const handleNewMessage = (event) => {
      const msg = event.detail
      if (msg.channel_id === channelId) {
        addMessage(msg)
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

    window.addEventListener('newChannelMessage', handleNewMessage)
    window.addEventListener('channelMessageConfirmed', handleMessageConfirmed)
    window.addEventListener('channelMessageFailed', handleMessageFailed)

    const fetchMessages = async () => {
      try {
        setIsLoading(true)
        const { data, error } = await supabase
          .from('messages')
          .select(`
            id,
            message_text,
            channel_id,
            user_id,
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
          .eq('channel_id', channelId)
          .order('created_at', { ascending: true })

        if (error) {
          console.error('Error fetching messages:', error)
          return
        }

        if (isMounted) {
          setMessages(data || [])
          await fetchUsersForMessages(data || [])
        }
      } catch (error) {
        console.error('Error in fetchMessages:', error)
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    const subscription = supabase
      .channel(`channel-messages-${channelId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'messages',
        filter: `channel_id=eq.${channelId}`
      }, async (payload) => {
        if (!isMounted) return

        if (payload.eventType === 'INSERT') {
          const message = payload.new
          logger.debug('🔔 Received new message:', message)
          
          // Fetch user data if needed
          if (!users.find(u => u.id === message.user_id)) {
            const { data: newUsers } = await supabase
              .from('users')
              .select('*')
              .in('id', [...users.map(u => u.id), message.user_id])
            
            if (isMounted) {
              setUsers(newUsers || [])
            }
          }
          
          if (isMounted) {
            setMessages(prev => [...prev, message])
          }
        } else if (payload.eventType === 'UPDATE') {
          logger.debug('🔄 Message updated:', payload.new)
          if (isMounted) {
            setMessages(prev => 
              prev.map(msg => msg.id === payload.new.id ? payload.new : msg)
            )
          }
        } else if (payload.eventType === 'DELETE') {
          logger.debug('❌ Message deleted:', payload.old)
          if (isMounted) {
            setMessages(prev => 
              prev.filter(msg => msg.id !== payload.old.id)
            )
          }
        }
      })
      .subscribe()

    fetchMessages()

    return () => {
      isMounted = false
      subscription.unsubscribe()
      window.removeEventListener('newChannelMessage', handleNewMessage)
      window.removeEventListener('channelMessageConfirmed', handleMessageConfirmed)
      window.removeEventListener('channelMessageFailed', handleMessageFailed)
    }
  }, [
    user?.id,
    channelId,
    addMessage,
    confirmMessage,
    removeMessage,
    pendingMessages,
    users
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