import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import { logger } from './logger'

export function useWorkspaceMembers(workspaceId) {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const workspaceMembersLogger = logger.withPrefix('useWorkspaceMembers')

  useEffect(() => {
    if (!workspaceId) {
      setLoading(false)
      return
    }
    let subscription
    async function loadMembers() {
      try {
        setLoading(true)
        setError(null)
        const { data, error: fetchError } = await supabase
          .from('workspace_members')
          .select(`
            id,
            role,
            user:users(
              id,
              username,
              display_name,
              avatar_url,
              status
            )
          `)
          .eq('workspace_id', workspaceId)
          .order('created_at', { ascending: true })
        if (fetchError) throw fetchError
        setMembers(data || [])
      } catch (err) {
        workspaceMembersLogger.error('Failed to load workspace members:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadMembers()

    subscription = supabase
      .channel(`workspace-${workspaceId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'workspace_members',
        filter: `workspace_id=eq.${workspaceId}`
      }, (payload) => {
        // Just reload for simplicity
        loadMembers()
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [workspaceId])

  return {
    members,
    loading,
    error
  }
}