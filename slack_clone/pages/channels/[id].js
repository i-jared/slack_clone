import React, { useEffect, useState, useContext, useRef } from 'react'
import { useRouter } from 'next/router'
import { UserContext } from '~/lib/UserContext'
import Layout from '~/components/Layout'
import Message from '~/components/Message'
import MessageInput from '~/components/MessageInput'
import { supabase } from '~/lib/supabaseClient'
import { logger } from '~/lib/logger'
import { v4 as uuidv4 } from 'uuid'

const channelLogger = logger.withPrefix('ChannelPage')

export default function ChannelPage() {
  const router = useRouter()
  const { id: channelId } = router.query
  const { user } = useContext(UserContext)

  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const fetchAttemptRef = useRef(0)

  useEffect(() => {
    channelLogger.info('=== ChannelPage Mount ===')
    channelLogger.info('Router query:', router.query)
    channelLogger.info('Channel ID:', channelId)
    channelLogger.info('User context:', user ? { id: user.id, email: user.email } : 'No user')

    return () => {
      channelLogger.info('=== ChannelPage Unmount ===')
    }
  }, [])

  useEffect(() => {
    if (!channelId) {
      channelLogger.warn('No channelId available yet')
      return
    }
    if (!user) {
      channelLogger.warn('No user available yet')
      return
    }

    async function loadChannelMessages() {
      fetchAttemptRef.current += 1
      channelLogger.info(`=== Loading Channel Messages (Attempt #${fetchAttemptRef.current}) ===`)
      channelLogger.info('Channel ID:', channelId)
      channelLogger.info('User ID:', user.id)
      setLoading(true)

      try {
        // 1) Fetch channel data
        channelLogger.debug('Fetching channel data...')
        const { data: channelData, error: channelErr } = await supabase
          .from('channels')
          .select('*')
          .eq('id', channelId)
          .single()

        if (channelErr || !channelData) {
          channelLogger.error('Error fetching channel:', channelErr)
          channelLogger.error('Channel query params:', { channelId })
          setError('Channel not found')
          setMessages([])
          setLoading(false)
          return
        }

        // 2) Possibly fetch workspace name
        let workspaceName = null
        if (channelData.workspace_id) {
          const { data: workspaceRow, error: workspaceErr } = await supabase
            .from('workspaces')
            .select('name')
            .eq('id', channelData.workspace_id)
            .maybeSingle()
          if (!workspaceErr && workspaceRow) {
            workspaceName = workspaceRow.name
          }
        }
        channelLogger.info('Found channel:', {
          id: channelData.id,
          workspace_id: channelData.workspace_id,
          workspace_name: workspaceName || '(none)'
        })

        // 3) Check membership
        channelLogger.debug('Checking workspace membership...')
        const { data: membershipData, error: memberErr } = await supabase
          .from('workspace_members')
          .select('*')
          .eq('workspace_id', channelData.workspace_id)
          .eq('user_id', user.id)
          .maybeSingle()

        if (memberErr) {
          channelLogger.error('Error checking workspace membership:', memberErr)
          setError('Error verifying channel access')
          setMessages([])
          setLoading(false)
          return
        }

        if (!membershipData) {
          channelLogger.warn('User is not a member of this workspace, adding user...')
          const newMemberId = uuidv4()
          const { data: newMember, error: addMemberError } = await supabase
            .from('workspace_members')
            .insert({
              id: newMemberId,
              workspace_id: channelData.workspace_id,
              user_id: user.id,
              role: 'member'
            })
            .select()
            .single()
          if (addMemberError || !newMember) {
            channelLogger.error('Error adding user to workspace:', addMemberError)
            setError('Unable to add user to workspace')
            setMessages([])
            setLoading(false)
            return
          }
          channelLogger.info('Successfully added user to workspace:', newMember)
        } else {
          channelLogger.info('Confirmed workspace membership:', {
            role: membershipData.role,
            workspace_id: membershipData.workspace_id,
            user_id: membershipData.user_id,
            member_since: membershipData.created_at
          })
        }

        // 4) Fetch channel messages
        channelLogger.debug('Fetching channel messages...')
        const { data: msgData, error: msgErr } = await supabase
          .from('messages')
          .select(`
            id,
            message_text,
            user_id,
            workspace_id,
            channel_id,
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
            edited_at,
            edited_by,
            user:users(id, username, avatar_url)
          `)
          .eq('channel_id', channelId)
          .eq('workspace_id', channelData.workspace_id)
          .order('created_at', { ascending: true })

        if (msgErr) {
          channelLogger.error('Error loading messages:', msgErr)
          setError(msgErr.message)
          setMessages([])
        } else {
          channelLogger.info(`Loaded ${msgData?.length || 0} messages`)
          setMessages(msgData || [])
        }
      } catch (e) {
        channelLogger.error('Critical error in loadChannelMessages:', e)
        setError(e.message)
        setMessages([])
      } finally {
        setLoading(false)
      }
    }

    loadChannelMessages()
  }, [channelId, user])

  useEffect(() => {
    // Setup realtime subscription
    if (!channelId || !user) return
    channelLogger.debug('Setting up Realtime subscription for channel:', channelId)

    const subscription = supabase
      .channel(`channel-${channelId}`)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'messages', filter: `channel_id=eq.${channelId}`
      }, (payload) => {
        channelLogger.debug('Realtime message payload:', payload)
        if (payload.eventType === 'INSERT') {
          setMessages(prev => [...prev, payload.new])
        } else if (payload.eventType === 'UPDATE') {
          setMessages(prev => prev.map(m => (m.id === payload.new.id ? payload.new : m)))
        } else if (payload.eventType === 'DELETE') {
          setMessages(prev => prev.filter(m => m.id !== payload.old.id))
        }
      })
      .subscribe((status) => {
        channelLogger.debug('Subscription status:', status)
      })

    return () => {
      subscription.unsubscribe()
    }
  }, [channelId, user])

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <div className="text-gray-500">Loading channel messages...</div>
        </div>
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout>
        <div className="p-4 text-red-500">Error: {error}</div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {messages.length === 0 ? (
            <div className="text-gray-500">No messages yet</div>
          ) : (
            messages.map(msg => (
              <Message key={msg.id} message={msg} />
            ))
          )}
        </div>
        <div className="border-t border-gray-700 p-4">
          <MessageInput
            channel_id={channelId}
            workspace_id={messages[0]?.workspace_id || '00000000-0000-0000-0000-000000000000'}
            isDirect={false}
          />
        </div>
      </div>
    </Layout>
  )
}