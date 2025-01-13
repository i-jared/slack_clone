import { useState, useEffect, useContext } from 'react'
import { supabase } from './supabaseClient'
import { UserContext } from './UserContext'
import { logger } from './logger'

export function useChannelMessages({ channelId, workspaceId }) {
  const { user } = useContext(UserContext)
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const channelLogger = logger.withPrefix('useChannelMessages')

  useEffect(() => {
    if (!channelId || !workspaceId) return
    const loadMessages = async () => {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .eq('channel_id', channelId)
          .eq('workspace_id', workspaceId)
          .order('created_at', { ascending: true })
        if (error) throw error
        setMessages(data || [])
      } catch (err) {
        channelLogger.error('Error loading channel messages:', err)
      } finally {
        setLoading(false)
      }
    }
    loadMessages()
  }, [channelId, workspaceId, channelLogger])

  useEffect(() => {
    if (!channelId) return
    const subscription = supabase
      .channel(`channel-${channelId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages', filter: `channel_id=eq.${channelId}` }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setMessages(prev => [...prev, payload.new])
        } else if (payload.eventType === 'UPDATE') {
          setMessages(prev => prev.map(m => m.id === payload.new.id ? payload.new : m))
        } else if (payload.eventType === 'DELETE') {
          setMessages(prev => prev.filter(m => m.id !== payload.old.id))
        }
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [channelId])

  return { messages, loading }
}