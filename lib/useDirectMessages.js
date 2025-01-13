import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import { logger } from './logger'
import { v4 as uuidv4 } from 'uuid'

const dmHookLogger = logger.withPrefix('useDirectMessages')

/**
 * usage: 
 *   const { messages, loading } = useDirectMessages(dmRoomId, workspaceId)
 */
export function useDirectMessages(dmRoomId, workspaceId) {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!dmRoomId || !workspaceId) return
    async function loadDMs() {
      setLoading(true)
      try {
        dmHookLogger.debug('Fetching direct_messages for dmRoomId:', dmRoomId, ' workspaceId:', workspaceId)
        const { data, error } = await supabase
          .from('direct_messages')
          .select(`
            id,
            message_text,
            sender_id,
            dm_room_id,
            workspace_id,
            created_at,
            updated_at,
            parent_id,
            thread_id,
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
            sender:users(id, username, avatar_url)
          `)
          .eq('dm_room_id', dmRoomId)
          .eq('workspace_id', workspaceId)
          .order('created_at', { ascending: true })
        if (error) throw error
        setMessages(data || [])
      } catch (err) {
        dmHookLogger.error('Error fetching DMs:', err)
      } finally {
        setLoading(false)
      }
    }
    loadDMs()
  }, [dmRoomId, workspaceId])

  useEffect(() => {
    if (!dmRoomId || !workspaceId) return
    const subscription = supabase
      .channel(`dm_room-${dmRoomId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'direct_messages',
        filter: `dm_room_id=eq.${dmRoomId}`
      }, (payload) => {
        dmHookLogger.debug('Realtime DM payload:', payload)
        if (payload.eventType === 'INSERT') {
          setMessages(prev => [...prev, payload.new])
        } else if (payload.eventType === 'UPDATE') {
          setMessages(prev => prev.map(msg => msg.id === payload.new.id ? payload.new : msg))
        } else if (payload.eventType === 'DELETE') {
          setMessages(prev => prev.filter(msg => msg.id !== payload.old.id))
        }
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [dmRoomId, workspaceId])

  return { messages, loading }
}