import { useState, useEffect, useContext, useRef } from 'react'
import { useRouter } from 'next/router'
import { UserContext } from '../../lib/UserContext'
import { useStore } from '../../lib/Store'
import { supabase } from '../../lib/supabaseClient'
import Message from '../../components/Message'
import MessageInput from '../../components/MessageInput'
import Layout from '../../components/Layout'
import { logger } from '~/lib/logger'
import { v4 as uuidv4 } from 'uuid'

const channelLogger = logger.withPrefix('ChannelPage')

export default function ChannelPage() {
  const router = useRouter()
  const { id } = router.query
  const { user } = useContext(UserContext)
  const { channels } = useStore()

  const [workspace, setWorkspace] = useState(null)
  const [membership, setMembership] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const [messages, setMessages] = useState([])
  const [isThreadOpen, setIsThreadOpen] = useState(false)
  const [forceHideLoading, setForceHideLoading] = useState(false)

  const messagesEndRef = useRef(null)
  const shouldAutoScroll = useRef(true)

  useEffect(() => {
    if (!user) {
      channelLogger.warn('No user found, redirecting to /auth')
      router.push('/auth')
    }
  }, [user, router])

  useEffect(() => {
    if (user?.id && id) {
      loadWorkspaceAndValidate()
    }
  }, [user?.id, id])

  async function loadWorkspaceAndValidate() {
    channelLogger.debug('loadWorkspaceAndValidate called', { channelId: id, userId: user?.id })
    setLoading(true)
    try {
      // First get the channel to check if it's public/private
      const { data: channel, error: channelError } = await supabase
        .from('channels')
        .select('*')
        .eq('id', id)
        .single()

      if (channelError) throw channelError
      if (!channel) {
        setError('Channel not found')
        setLoading(false)
        return
      }

      // Get user's workspace
      const { data: workspaces, error: workspaceError } = await supabase
        .from('workspaces')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: true })
        .limit(1)

      if (workspaceError) throw workspaceError
      if (!workspaces?.length) {
        setError('No workspace found')
        setLoading(false)
        return
      }

      const workspace = workspaces[0]
      setWorkspace(workspace)

      // Check membership
      const { data: membership, error: membershipError } = await supabase
        .from('channel_members')
        .select('*')
        .eq('channel_id', id)
        .eq('user_id', user.id)
        .maybeSingle()

      if (membershipError) throw membershipError

      // If not a member and channel is public, auto-join
      if (!membership && !channel.is_private) {
        channelLogger.debug('Auto-joining public channel', { channelId: id })
        const { data: newMembership, error: joinError } = await supabase
          .from('channel_members')
          .insert([
            {
              id: uuidv4(),
              channel_id: id,
              user_id: user.id,
              role: 'member',
              metadata: { auto_joined: true }
            }
          ])
          .select()
          .single()

        if (joinError) throw joinError
        setMembership(newMembership)
        channelLogger.info('Successfully auto-joined channel', { channelId: id })
      } else if (!membership) {
        setError('You are not a member of this channel')
        setLoading(false)
        return
      } else {
        setMembership(membership)
      }

      // Load messages
      await loadChannelMessages(workspace.id, id)
    } catch (err) {
      channelLogger.error('Error in loadWorkspaceAndValidate:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function loadChannelMessages(workspaceId, channelId) {
    channelLogger.debug('loadChannelMessages triggered', { workspaceId, channelId })
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:user_id(*)
        `)
        .eq('channel_id', channelId)
        .order('created_at', { ascending: true })

      if (error) {
        channelLogger.error('Error fetching channel messages:', error)
        setError(error.message)
        setLoading(false)
        return
      }

      setMessages(data || [])
      channelLogger.debug('Channel messages loaded', { count: data?.length })
    } catch (err) {
      channelLogger.error('Error in loadChannelMessages:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Realtime subscription for new messages in this channel
  useEffect(() => {
    if (!membership || !id) {
      return
    }
    channelLogger.debug('Setting up realtime subscription for channel messages', { channelId: id })

    const subscription = supabase
      .channel(`channel-messages:${id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'messages',
        filter: `channel_id=eq.${id}`
      }, async (payload) => {
        channelLogger.debug('Realtime event for messages', payload)
        
        // For new messages, fetch the sender info
        if (payload.eventType === 'INSERT') {
          const { data: messageWithSender } = await supabase
            .from('messages')
            .select(`
              *,
              sender:user_id(*)
            `)
            .eq('id', payload.new.id)
            .single()

          if (messageWithSender) {
            setMessages(prev => [...prev, messageWithSender])
          }
        } else if (payload.eventType === 'UPDATE') {
          const { data: messageWithSender } = await supabase
            .from('messages')
            .select(`
              *,
              sender:user_id(*)
            `)
            .eq('id', payload.new.id)
            .single()

          if (messageWithSender) {
            setMessages(prev => prev.map(m => m.id === messageWithSender.id ? messageWithSender : m))
          }
        } else if (payload.eventType === 'DELETE') {
          setMessages(prev => prev.filter(m => m.id !== payload.old.id))
        }
      })
      .subscribe()

    return () => {
      channelLogger.debug('Cleaning up channel subscription', { channelId: id })
      subscription.unsubscribe()
    }
  }, [membership, id])

  // Scrolling to bottom after messages
  useEffect(() => {
    if (!loading) {
      setTimeout(() => {
        scrollToBottom('smooth')
      }, 300)
    }
  }, [messages, loading])

  function scrollToBottom(behavior = 'smooth') {
    const container = document.querySelector('.messages-container')
    if (!container) return
    messagesEndRef.current?.scrollIntoView({ behavior, block: 'end' })
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setForceHideLoading(true)
    }, 5000)
    return () => clearTimeout(timer)
  }, [])

  const handleScroll = (e) => {
    const container = e.target
    const nearBottom = (container.scrollHeight - (container.scrollTop + container.clientHeight)) < 100
    shouldAutoScroll.current = nearBottom
  }

  if (loading && !forceHideLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <p className="text-gray-400">Loading channel...</p>
        </div>
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen text-red-400">
          {error}
        </div>
      </Layout>
    )
  }

  const channelObj = channels.find((c) => c.id === id)
  const channelName = channelObj?.name || channelObj?.slug || 'Channel'

  return (
    <Layout>
      <div className="relative h-screen flex flex-col">
        <div className="px-4 py-2 border-b border-gray-700 bg-gray-800/90">
          <h2 className="text-2xl font-orbitron text-yellow-400 flex items-center">
            <span className="text-gray-500 mr-2">#</span>
            {channelName}
          </h2>
          <p className="text-sm text-gray-400 font-orbitron">
            Welcome to #{channelName}
          </p>
        </div>

        <div
          className={`messages-container flex-1 overflow-y-auto ${isThreadOpen ? 'mr-80' : ''}`}
          onScroll={handleScroll}
        >
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-400">
              No messages. Start the conversation!
            </div>
          ) : (
            <div className="py-4 space-y-2 px-4 w-full max-w-6xl mx-auto mb-20">
              {messages.map((msg, idx) => (
                <Message key={msg.id} message={msg} isLatest={idx === messages.length - 1} />
              ))}
              <div ref={messagesEndRef} className="h-4" />
            </div>
          )}
        </div>

        <div className="absolute bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-700">
          <MessageInput channel_id={id} />
        </div>
      </div>
    </Layout>
  )
}