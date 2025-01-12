import { useState, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { supabase } from './supabase'
import { useLogger } from './useLogger'

export function useWorkspaceMembers(workspaceId) {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const workspaceMembersLogger = useLogger('useWorkspaceMembers')

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

        // Fetch members with user details
        const { data, error: fetchError } = await supabase
          .from('workspace_members')
          .select(`
            id,
            role,
            permissions,
            metadata,
            created_at,
            updated_at,
            user:users (
              id,
              email,
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

    async function setupSubscription() {
      subscription = supabase
        .channel(`workspace:${workspaceId}`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'workspace_members',
          filter: `workspace_id=eq.${workspaceId}`
        }, async (payload) => {
          workspaceMembersLogger.debug('Received workspace member change:', payload)

          switch (payload.eventType) {
            case 'INSERT': {
              // Fetch the complete member data with user details
              const { data: newMember } = await supabase
                .from('workspace_members')
                .select(`
                  id,
                  role,
                  permissions,
                  metadata,
                  created_at,
                  updated_at,
                  user:users (
                    id,
                    email,
                    username,
                    display_name,
                    avatar_url,
                    status
                  )
                `)
                .eq('id', payload.new.id)
                .single()

              if (newMember) {
                setMembers(prev => [...prev, newMember])
              }
              break
            }
            case 'UPDATE': {
              setMembers(prev => prev.map(member => 
                member.id === payload.new.id 
                  ? { ...member, ...payload.new }
                  : member
              ))
              break
            }
            case 'DELETE': {
              setMembers(prev => prev.filter(member => member.id !== payload.old.id))
              break
            }
          }
        })
        .subscribe()
    }

    loadMembers()
    setupSubscription()

    return () => {
      if (subscription) {
        subscription.unsubscribe()
      }
    }
  }, [workspaceId])

  async function addMember(userId, role = 'member') {
    try {
      if (!workspaceId || !userId) {
        throw new Error('Workspace ID and User ID are required')
      }

      // Check if user exists
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('id', userId)
        .single()

      if (userError || !user) {
        throw new Error('User not found')
      }

      // Check if membership already exists
      const { data: existingMember } = await supabase
        .from('workspace_members')
        .select('id')
        .eq('workspace_id', workspaceId)
        .eq('user_id', userId)
        .single()

      if (existingMember) {
        throw new Error('User is already a member of this workspace')
      }

      // Add member
      const { error: insertError } = await supabase
        .from('workspace_members')
        .insert([{
          id: uuidv4(),
          workspace_id: workspaceId,
          user_id: userId,
          role,
          permissions: role === 'admin' 
            ? { can_manage_members: true, can_create_channels: true }
            : { can_create_channels: true },
          metadata: { joined_at: new Date().toISOString() }
        }])

      if (insertError) throw insertError

      return { success: true }
    } catch (error) {
      workspaceMembersLogger.error('Failed to add workspace member:', error)
      return { success: false, error: error.message }
    }
  }

  async function updateMemberRole(memberId, newRole) {
    try {
      if (!workspaceId || !memberId) {
        throw new Error('Workspace ID and Member ID are required')
      }

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError) throw userError

      // Check if current user is owner or admin
      const { data: currentMember } = await supabase
        .from('workspace_members')
        .select('role')
        .eq('workspace_id', workspaceId)
        .eq('user_id', user.id)
        .single()

      if (!currentMember || !['owner', 'admin'].includes(currentMember.role)) {
        throw new Error('You do not have permission to update member roles')
      }

      // Update role
      const { error: updateError } = await supabase
        .from('workspace_members')
        .update({ 
          role: newRole,
          permissions: newRole === 'admin' 
            ? { can_manage_members: true, can_create_channels: true }
            : { can_create_channels: true },
          updated_at: new Date().toISOString()
        })
        .eq('id', memberId)
        .eq('workspace_id', workspaceId)

      if (updateError) throw updateError

      return { success: true }
    } catch (error) {
      workspaceMembersLogger.error('Failed to update member role:', error)
      return { success: false, error: error.message }
    }
  }

  async function removeMember(memberId) {
    try {
      if (!workspaceId || !memberId) {
        throw new Error('Workspace ID and Member ID are required')
      }

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError) throw userError

      // Check if current user is owner or admin
      const { data: currentMember } = await supabase
        .from('workspace_members')
        .select('role')
        .eq('workspace_id', workspaceId)
        .eq('user_id', user.id)
        .single()

      if (!currentMember || !['owner', 'admin'].includes(currentMember.role)) {
        throw new Error('You do not have permission to remove members')
      }

      // Check if trying to remove workspace owner
      const { data: targetMember } = await supabase
        .from('workspace_members')
        .select('role, user_id')
        .eq('id', memberId)
        .single()

      if (targetMember?.role === 'owner') {
        throw new Error('Cannot remove workspace owner')
      }

      // Remove member
      const { error: deleteError } = await supabase
        .from('workspace_members')
        .delete()
        .eq('id', memberId)
        .eq('workspace_id', workspaceId)

      if (deleteError) throw deleteError

      return { success: true }
    } catch (error) {
      workspaceMembersLogger.error('Failed to remove workspace member:', error)
      return { success: false, error: error.message }
    }
  }

  return {
    members,
    loading,
    error,
    addMember,
    updateMemberRole,
    removeMember
  }
} 