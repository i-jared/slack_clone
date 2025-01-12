// lib/useDirectMessages.js
import { useState, useEffect, useContext, useCallback } from 'react'
import { supabase } from './supabaseClient'
import { UserContext } from './UserContext'
import { v4 as uuidv4 } from 'uuid'
import { logger } from './logger'

// Add constants for roles
const DM_ROOM_ROLES = {
  ADMIN: 'admin',
  MEMBER: 'member'
}

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
        reactions: message.reactions || {},
        read_by: message.read_by || {},
        reply_count: message.reply_count || 0,
        is_pinned: message.is_pinned || false,
        is_announcement: message.is_announcement || false,
        is_ai_generated: message.is_ai_generated || false,
        delivery_status: message.delivery_status || 'sent',
        created_at: message.created_at || new Date().toISOString(),
        updated_at: message.updated_at || new Date().toISOString()
      }
      if (newMessage.status === 'pending') {
        setPendingMessages(p => new Set(p).add(message.id))
      }
      const exists = prev.some(m => m.id === newMessage.id)
      if (exists) return prev
      return [...prev, newMessage].sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
    })
  }, [])

  const confirmMessage = useCallback((tempId, confirmedMessage) => {
    setMessages(prev => {
      return prev.map(msg => {
        if (msg.id === tempId) {
          return {
            ...confirmedMessage,
            status: 'confirmed',
            attachments: confirmedMessage.attachments || {},
            mentions: confirmedMessage.mentions || {},
            metadata: confirmedMessage.metadata || {},
            reactions: confirmedMessage.reactions || {},
            read_by: confirmedMessage.read_by || {},
            reply_count: confirmedMessage.reply_count || 0,
            is_pinned: confirmedMessage.is_pinned || false,
            is_announcement: confirmedMessage.is_announcement || false,
            is_ai_generated: confirmedMessage.is_ai_generated || false,
            delivery_status: confirmedMessage.delivery_status || 'sent',
            created_at: confirmedMessage.created_at || msg.created_at,
            updated_at: confirmedMessage.updated_at || new Date().toISOString()
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

  const getOrCreateDmRoom = async () => {
    if (!user?.id || !recipientId) {
      logger.debug('Missing user or recipient ID')
      return null
    }

    try {
      // First get user's default workspace
      const { data: workspace, error: workspaceError } = await supabase
        .from('workspaces')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: true })
        .limit(1)
        .single()

      if (workspaceError) {
        logger.error('Error fetching workspace:', workspaceError)
        throw workspaceError
      }

      if (!workspace) {
        logger.error('No workspace found for user:', user.id)
        throw new Error('No default workspace found for user')
      }

      // Get recipient details to create room name
      const { data: recipient, error: recipientError } = await supabase
        .from('users')
        .select('username, display_name')
        .eq('id', recipientId)
        .single()

      if (recipientError) {
        logger.error('Error fetching recipient:', recipientError)
        throw recipientError
      }

      if (!recipient) {
        logger.error('Recipient not found:', recipientId)
        throw new Error('Recipient not found')
      }

      // Get current user details
      const { data: sender, error: senderError } = await supabase
        .from('users')
        .select('username, display_name')
        .eq('id', user.id)
        .single()

      if (senderError) {
        logger.error('Error fetching sender:', senderError)
        throw senderError
      }

      // Generate room name from participants
      const senderName = sender.display_name || sender.username
      const recipientName = recipient.display_name || recipient.username
      const roomName = [senderName, recipientName].sort().join(' & ')

      // Then try to find existing room in this workspace
      const { data: rooms, error: findError } = await supabase
        .from('dm_rooms')
        .select('*')
        .eq('workspace_id', workspace.id)
        .contains('metadata', { participants: [user.id, recipientId].sort() })
        .eq('is_group', false)
        .limit(1)

      if (findError) {
        logger.error('Error finding DM room:', findError)
        throw findError
      }

      if (rooms && rooms.length > 0) {
        logger.debug('Found existing DM room:', rooms[0])
        return rooms[0]
      }

      // Create new room if none exists
      const { data: newRoom, error: createError } = await supabase
        .from('dm_rooms')
        .insert([{
          id: uuidv4(),
          room_name: roomName,
          is_group: false,
          workspace_id: workspace.id,
          metadata: { 
            participants: [user.id, recipientId].sort(),
            created_by: user.id,
            last_activity: new Date().toISOString()
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (createError) {
        logger.error('Error creating DM room:', createError)
        throw createError
      }

      logger.debug('Created new DM room:', newRoom)

      // Add room members with roles
      const memberInserts = [
        // Add creator as admin
        {
          id: uuidv4(),
          dm_room_id: newRoom.id,
          user_id: user.id,
          role: DM_ROOM_ROLES.ADMIN,
          metadata: {
            joined_at: new Date().toISOString(),
            invited_by: user.id,
            workspace_id: workspace.id,
            permissions: ['manage_members', 'delete_messages']
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        // Add recipient as member
        {
          id: uuidv4(),
          dm_room_id: newRoom.id,
          user_id: recipientId,
          role: DM_ROOM_ROLES.MEMBER,
          metadata: {
            joined_at: new Date().toISOString(),
            invited_by: user.id,
            workspace_id: workspace.id,
            permissions: ['send_messages', 'read_messages']
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]

      const { error: membersError } = await supabase
        .from('dm_room_members')
        .insert(memberInserts)

      if (membersError) {
        logger.error('Error adding room members:', membersError)
        // Clean up the room if member insertion fails
        await supabase
          .from('dm_rooms')
          .delete()
          .eq('id', newRoom.id)
          .eq('workspace_id', workspace.id)
        throw membersError
      }

      return newRoom
    } catch (error) {
      logger.error('Error in getOrCreateDmRoom:', error)
      throw error
    }
  }

  const fetchMessages = useCallback(async () => {
    if (!dmRoomId) return

    setIsLoading(true)
    try {
      const { data: messages, error } = await supabase
        .from('direct_messages')
        .select(`
          *,
          sender:sender_id(
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
            created_at,
            updated_at
          ),
          editor:edited_by(
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
            created_at,
            updated_at
          )
        `)
        .eq('dm_room_id', dmRoomId)
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Error fetching messages:', error)
        return
      }

      // Process messages
      const processedMessages = messages.map(msg => ({
        ...msg,
        status: 'confirmed',
        attachments: msg.attachments || {},
        mentions: msg.mentions || {},
        metadata: msg.metadata || {},
        reactions: msg.reactions || {},
        read_by: msg.read_by || {},
        reply_count: msg.reply_count || 0,
        is_pinned: msg.is_pinned || false,
        is_announcement: msg.is_announcement || false,
        is_ai_generated: msg.is_ai_generated || false,
        delivery_status: msg.delivery_status || 'sent'
      }))

      setMessages(processedMessages)
    } catch (err) {
      console.error('Error in fetchMessages:', err)
    } finally {
      setIsLoading(false)
    }
  }, [dmRoomId])

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

    const fetchMessages = async (room) => {
      if (!room?.id) return

      setIsLoading(true)
      try {
        const { data, error } = await supabase
          .from('direct_messages')
          .select(`
            id,
            message_text,
            dm_room_id,
            sender_id,
            workspace_id,
            parent_id,
            thread_id,
            edited_at,
            edited_by,
            attachments,
            mentions,
            metadata,
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
            created_at,
            updated_at
          `)
          .eq('dm_room_id', room.id)
          .order('created_at', { ascending: true })

        if (error) {
          logger.error('Error fetching direct messages:', error)
          return
        }

        if (isMounted) {
          setMessages(data || [])
          await fetchUsersForMessages(data || [])
        }
      } catch (error) {
        logger.error('Error in fetchMessages:', error)
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
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
      await fetchMessages(room)

      // Set up real-time subscription
      subscription = supabase
        .channel(`room:${room.id}`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'direct_messages',
          filter: `dm_room_id=eq.${room.id}`
        }, async (payload) => {
          switch (payload.eventType) {
            case 'INSERT': {
              const { data: sender } = await supabase
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
                  created_at,
                  updated_at
                `)
                .eq('id', payload.new.sender_id)
                .single()

              if (sender) {
                addMessage({
                  ...payload.new,
                  sender
                })
              }
              break
            }
            case 'UPDATE': {
              const { data: editor } = await supabase
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
                  created_at,
                  updated_at
                `)
                .eq('id', payload.new.edited_by)
                .single()

              setMessages(prev => prev.map(msg => {
                if (msg.id === payload.new.id) {
                  return {
                    ...msg,
                    ...payload.new,
                    editor: editor || null
                  }
                }
                return msg
              }))
              break
            }
            case 'DELETE': {
              setMessages(prev => prev.filter(msg => msg.id !== payload.old.id))
              break
            }
            default: {
              console.warn('Unknown event type:', payload.eventType)
            }
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
    fetchUsersForMessages,
    messages
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