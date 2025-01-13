import React, { useEffect, useState, useContext, useRef } from 'react'
import { useRouter } from 'next/router'
import { UserContext } from '~/lib/UserContext'
import Layout from '~/components/Layout'
import Message from '~/components/Message'
import MessageInput from '~/components/MessageInput'
import ThreadPanel from '~/components/ThreadPanel'
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
  const [showThread, setShowThread] = useState(false)
  const [threadParentMessage, setThreadParentMessage] = useState(null)

  useEffect(() => {
    channelLogger.info('=== ChannelPage Mount ===')
    channelLogger.info('Component state:', {
      router: {
        query: router.query,
        pathname: router.pathname,
        asPath: router.asPath
      },
      channelId,
      userContext: user ? {
        id: user.id,
        email: user.email,
        lastSignIn: user.last_sign_in_at
      } : 'No user',
      timestamp: new Date().toISOString()
    })

    return () => {
      channelLogger.info('ChannelPage unmounting:', {
        channelId,
        timestamp: new Date().toISOString()
      })
    }
  }, [channelId, user])

  useEffect(() => {
    if (!channelId || !user) {
      channelLogger.warn('Missing required data:', {
        hasChannelId: !!channelId,
        hasUser: !!user,
        currentPath: router.asPath
      })
      setLoading(false)
      return
    }

    let isMounted = true
    const loadChannelData = async () => {
      setLoading(true)
      try {
        channelLogger.info('=== Starting Channel Data Load ===')
        channelLogger.info('Load parameters:', {
          channelId,
          userId: user.id,
          timestamp: new Date().toISOString()
        })

        // First verify channel membership
        channelLogger.debug('Verifying channel membership...')
        const { data: membershipData, error: membershipError } = await supabase
          .from('channel_members')
          .select('role')
          .eq('channel_id', channelId)
          .eq('user_id', user.id)
          .single()

        if (membershipError) {
          channelLogger.error('Channel membership verification failed:', {
            code: membershipError.code,
            message: membershipError.message,
            details: membershipError.details,
            hint: membershipError.hint
          })
          setError('You do not have access to this channel')
          setLoading(false)
          return
        }

        channelLogger.info('Channel membership verified:', {
          role: membershipData.role
        })

        // fetch messages from "messages" table
        channelLogger.debug('Fetching channel messages...', {
          channelId
        })

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
            user:users(id,username,display_name,avatar_url)
          `)
          .eq('channel_id', channelId)
          .order('created_at', { ascending: true })

        if (msgErr) {
          channelLogger.error('Error fetching messages:', {
            code: msgErr.code,
            message: msgErr.message,
            details: msgErr.details,
            hint: msgErr.hint
          })
          setError(msgErr.message)
          setMessages([])
          setLoading(false)
          return
        }

        channelLogger.info('Messages loaded:', {
          count: msgData?.length || 0,
          channelId,
          timeRange: msgData?.length ? {
            first: msgData[0].created_at,
            last: msgData[msgData.length - 1].created_at
          } : null
        })

        if (msgData) {
          channelLogger.debug('Message statistics:', {
            totalMessages: msgData.length,
            withThreads: msgData.filter(m => m.thread_id).length,
            withAttachments: msgData.filter(m => m.attachments?.length).length,
            withMentions: msgData.filter(m => m.mentions?.length).length,
            pinned: msgData.filter(m => m.is_pinned).length,
            announcements: msgData.filter(m => m.is_announcement).length
          })
        }

        setMessages(msgData || [])
      } catch (error) {
        channelLogger.error('Critical error in loadChannelData:', {
          name: error.name,
          message: error.message,
          stack: error.stack,
          timestamp: new Date().toISOString()
        })
        setError(error.message)
      } finally {
        if (isMounted) {
          setLoading(false)
          channelLogger.info('Channel data load completed', {
            success: !error,
            timestamp: new Date().toISOString()
          })
        }
      }
    }
    loadChannelData()

    // Set up realtime subscription
    channelLogger.debug('Setting up realtime message subscription...', {
      channel: `channel-${channelId}`
    })

    const subscription = supabase
      .channel(`channel-${channelId}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'messages', 
        filter: `channel_id=eq.${channelId}` 
      }, (payload) => {
        channelLogger.debug('Realtime message event:', {
          type: payload.eventType,
          messageId: payload.new?.id || payload.old?.id,
          timestamp: new Date().toISOString()
        })

        if (payload.eventType === 'INSERT') {
          channelLogger.info('New message received:', {
            id: payload.new.id,
            sender: payload.new.user_id,
            timestamp: payload.new.created_at
          })
          setMessages(prev => [...prev, payload.new])
        } else if (payload.eventType === 'UPDATE') {
          channelLogger.info('Message updated:', {
            id: payload.new.id,
            editor: payload.new.edited_by,
            editTime: payload.new.edited_at
          })
          setMessages(prev => prev.map(m => (m.id === payload.new.id ? payload.new : m)))
        } else if (payload.eventType === 'DELETE') {
          channelLogger.info('Message deleted:', {
            id: payload.old.id,
            timestamp: new Date().toISOString()
          })
          setMessages(prev => prev.filter(m => m.id !== payload.old.id))
        }
      })
      .subscribe((status) => {
        channelLogger.debug('Message subscription status:', {
          status,
          channel: `channel-${channelId}`,
          timestamp: new Date().toISOString()
        })
      })

    return () => {
      isMounted = false
      channelLogger.info('Cleaning up channel resources...', {
        channelId,
        subscriptionChannel: `channel-${channelId}`,
        timestamp: new Date().toISOString()
      })
      subscription.unsubscribe()
    }
  }, [channelId, user])

  const handleThreadClick = (message) => {
    channelLogger.debug('Thread clicked:', {
      messageId: message.id,
      threadId: message.thread_id,
      timestamp: new Date().toISOString()
    })
    setThreadParentMessage(message)
    setShowThread(true)
  }

  const closeThreadPanel = () => {
    channelLogger.debug('Closing thread panel', {
      previousMessage: threadParentMessage?.id,
      timestamp: new Date().toISOString()
    })
    setShowThread(false)
    setThreadParentMessage(null)
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <span className="text-gray-500">Loading channel messages...</span>
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
        <div className="flex-1 flex overflow-hidden">
          <div className={`flex-1 overflow-y-auto p-4 space-y-2 ${showThread ? 'border-r border-gray-700' : ''}`}>
            {messages.length === 0 ? (
              <div className="text-gray-500">No messages yet</div>
            ) : (
              messages.map((msg) => (
                <Message
                  key={msg.id}
                  message={msg}
                  onThreadClick={handleThreadClick}
                />
              ))
            )}
          </div>

          {/* Thread Panel */}
          {showThread && (
            <ThreadPanel
              parentMessage={threadParentMessage}
              onClose={closeThreadPanel}
            />
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