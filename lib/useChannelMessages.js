import { useState, useEffect, useContext, useCallback, useRef } from 'react'
import { supabase } from '~/lib/supabaseClient'
import { UserContext } from './UserContext'
import { logger } from './logger'

export function useChannelMessages({ channelId }) {
  const { user } = useContext(UserContext)
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [pendingMessages, setPendingMessages] = useState(new Set())
  const [workspace, setWorkspace] = useState(null)
  const [membership, setMembership] = useState(null)
  const [error, setError] = useState(null)
  
  const channelLogger = logger.withPrefix('useChannelMessages')

  // We'll keep track if we have fetched messages so we don't re-fetch infinitely
  const hasFetchedMessages = useRef(false)
  // We'll keep track if we have loaded the membership so we don't keep reloading
  const hasLoadedMembership = useRef(false)

  // Load membership / workspace once
  useEffect(() => {
    async function loadMembershipAndWorkspace() {
      if (!user?.id || !channelId) {
        setMembership(null)
        setWorkspace(null)
        setIsLoading(false)
        return
      }
      if (hasLoadedMembership.current) {
        return
      }
      hasLoadedMembership.current = true
      setIsLoading(true)
      try {
        // Attempt to load user’s default workspace
        // We'll just do a single fetch for membership
        const { data: workspaces, error: workspaceErr } = await supabase
          .from('workspaces')
          .select('*')
          .eq('owner_id', user.id)
          .order('created_at', { ascending: true })
          .limit(1)

        if (workspaceErr) throw workspaceErr
        if (!workspaces || workspaces.length === 0) {
          channelLogger.warn('No workspace found for user', user.id)
          setWorkspace(null)
          setMembership(null)
          setIsLoading(false)
          return
        }
        const foundWorkspace = workspaces[0]
        setWorkspace(foundWorkspace)

        // Now check channel membership
        const { data: mem, error: memError } = await supabase
          .from('channel_members')
          .select('id, role, metadata, created_at, updated_at')
          .eq('channel_id', channelId)
          .eq('user_id', user.id)
          .maybeSingle()

        if (memError) throw memError
        setMembership(mem || null)
      } catch (err) {
        setError(err.message)
        channelLogger.error('Error loading membership/workspace:', err)
      } finally {
        setIsLoading(false)
      }
    }
    loadMembershipAndWorkspace()
  }, [user?.id, channelId, channelLogger])

  const fetchMessages = useCallback(async () => {
    if (!user?.id || !channelId || !workspace?.id || !membership) {
      return
    }
    if (hasFetchedMessages.current) {
      return
    }
    hasFetchedMessages.current = true
    setIsLoading(true)
    try {
      const { data, error: fetchErr } = await supabase
        .from('messages')
        .select(`
          *,
          sender:user_id(*),
          editor:edited_by(*)
        `)
        .eq('channel_id', channelId)
        .eq('workspace_id', workspace.id)
        .order('created_at', { ascending: true })

      if (fetchErr) throw fetchErr
      setMessages(data || [])
    } catch (err) {
      setError(err.message)
      channelLogger.error('Error in fetchMessages:', err)
    } finally {
      setIsLoading(false)
    }
  }, [channelId, workspace?.id, membership, user?.id, channelLogger])

  useEffect(() => {
    // if we have membership & workspace, fetch messages once
    if (membership && workspace) {
      fetchMessages()
    }
  }, [membership, workspace, fetchMessages])

  useEffect(() => {
    // We'll do a single subscription if membership exists
    if (!membership || !workspace?.id || !channelId || !user?.id) {
      return
    }
    channelLogger.debug('Setting up realtime subscription for channel messages', {
      channelId,
      workspaceId: workspace.id
    })

    const subscription = supabase
      .channel(`channel-messages:${channelId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'messages',
        filter: `channel_id=eq.${channelId}`
      }, async (payload) => {
        channelLogger.debug('Realtime message event:', payload)
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
      channelLogger.debug('Cleaning up realtime subscription for channel messages')
      subscription.unsubscribe()
    }
  }, [membership, workspace, channelId, user?.id, channelLogger])

  return {
    messages,
    isLoading,
    pendingMessages: Array.from(pendingMessages),
    workspace,
    membership,
    error
  }
}