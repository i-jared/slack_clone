import React, { useEffect, useState, useContext, useRef } from 'react'
import { useRouter } from 'next/router'
import { UserContext } from '~/lib/UserContext'
import Layout from '~/components/Layout'
import MessageList from '~/components/MessageList'
import MessageInput from '~/components/MessageInput'
import LoadingScreen from '~/components/LoadingScreen'
import { supabase } from '~/lib/supabaseClient'
import { logger } from '~/lib/logger'

const dmLogger = logger.withPrefix('DMPage')

export default function DMPage() {
  const router = useRouter()
  const { user } = useContext(UserContext)
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [dmRoom, setDmRoom] = useState(null)
  const [otherUser, setOtherUser] = useState(null)
  const { id: otherUserId } = router.query
  const [loadError, setLoadError] = useState(null)
  const [messageStats, setMessageStats] = useState({
    total: 0,
    bySender: {},
    avgLength: 0,
    timeRange: null
  })
  const mountTime = useRef(new Date())
  const lastFetchTime = useRef(null)

  useEffect(() => {
    dmLogger.info('\n=== DM PAGE LIFECYCLE ===')
    dmLogger.info('Component mounted:', {
      mountTime: mountTime.current.toISOString(),
      initialState: {
        messages: messages.length,
        loading,
        dmRoom: dmRoom?.id,
        otherUser: otherUser?.id,
        loadError: loadError?.message
      },
      routerState: {
        query: router.query,
        pathname: router.pathname,
        asPath: router.asPath
      },
      userContext: user ? {
        id: user.id,
        email: user.email,
        metadata: user.user_metadata,
        lastSignIn: user.last_sign_in_at
      } : 'No user',
      timestamp: new Date().toISOString()
    })

    if (!user || !otherUserId) {
      dmLogger.warn('\n=== MISSING REQUIRED DATA ===')
      dmLogger.warn('Authentication or user ID missing:', {
        authenticated: !!user,
        userId: user?.id,
        otherUserId,
        path: router.asPath,
        timestamp: new Date().toISOString()
      })
      setLoading(false)
      return
    }

    async function loadDMRoom() {
      lastFetchTime.current = new Date()
      dmLogger.info('\n=== DM ROOM FETCH START ===')
      dmLogger.info('Fetch parameters:', {
        currentUser: user.id,
        otherUser: otherUserId,
        timeSinceMount: new Date() - mountTime.current,
        timestamp: new Date().toISOString()
      })

      try {
        // Log query details
        dmLogger.debug('Querying DM room:', {
          table: 'dm_rooms',
          conditions: {
            users: [user.id, otherUserId]
          },
          timestamp: new Date().toISOString()
        })

        // Get or create DM room
        dmLogger.debug('Querying for existing DM room...', {
          table: 'dm_rooms',
          conditions: {
            users: [user.id, otherUserId]
          }
        })

        const { data: existingRooms, error: roomError } = await supabase
          .from('dm_room_members')
          .select(`
            dm_room:dm_rooms (
              id,
              created_at,
              updated_at
            )
          `)
          .eq('user_id', user.id)
          .eq('other_user_id', otherUserId)

        if (roomError) {
          dmLogger.error('DM room query error:', {
            code: roomError.code,
            message: roomError.message,
            details: roomError.details,
            hint: roomError.hint,
            timestamp: new Date().toISOString()
          })
          setLoadError(roomError.message)
          return
        }

        dmLogger.info('\n=== DM ROOM QUERY RESULTS ===')
        dmLogger.info('Room status:', {
          found: existingRooms?.length || 0,
          rooms: existingRooms?.map(r => ({
            id: r.dm_room.id,
            created: r.dm_room.created_at
          })),
          queryDuration: new Date() - lastFetchTime.current,
          timestamp: new Date().toISOString()
        })

        let room = existingRooms?.[0]?.dm_room
        if (!room) {
          dmLogger.info('No existing DM room found, creating new one...')
          
          // First create the DM room
          const { data: newRoom, error: createRoomError } = await supabase
            .from('dm_rooms')
            .insert({})
            .select()
            .single()

          if (createRoomError) {
            dmLogger.error('Error creating DM room:', createRoomError)
            setLoadError(createRoomError.message)
            return
          }

          // Then create the member associations
          const { error: createMembersError } = await supabase
            .from('dm_room_members')
            .insert([
              { dm_room_id: newRoom.id, user_id: user.id, other_user_id: otherUserId },
              { dm_room_id: newRoom.id, user_id: otherUserId, other_user_id: user.id }
            ])

          if (createMembersError) {
            dmLogger.error('Error creating DM room members:', createMembersError)
            setLoadError(createMembersError.message)
            return
          }

          room = newRoom
          dmLogger.info('Successfully created new DM room:', {
            roomId: room.id,
            users: [user.id, otherUserId],
            created: room.created_at,
            timestamp: new Date().toISOString()
          })
        }

        setDmRoom(room)
        dmLogger.info('DM room state updated:', {
          room,
          timestamp: new Date().toISOString()
        })

        // Get other user's details
        dmLogger.debug('Fetching other user details...', {
          userId: otherUserId,
          timestamp: new Date().toISOString()
        })

        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id, username, display_name, avatar_url, status, last_seen')
          .eq('id', otherUserId)
          .single()

        if (userError) {
          dmLogger.error('Error fetching other user:', {
            code: userError.code,
            message: userError.message,
            details: userError.details,
            hint: userError.hint,
            timestamp: new Date().toISOString()
          })
          setLoadError(userError.message)
          return
        }

        setOtherUser(userData)
        dmLogger.info('\n=== USER DETAILS LOADED ===')
        dmLogger.info('Other user info:', {
          id: userData.id,
          username: userData.username,
          displayName: userData.display_name,
          status: userData.status,
          lastSeen: userData.last_seen,
          timestamp: new Date().toISOString()
        })

        // Message loading with enhanced stats
        dmLogger.debug('\n=== MESSAGE FETCH START ===')
        dmLogger.debug('Fetching messages:', {
          roomId: room.id,
          timestamp: new Date().toISOString()
        })

        const { data: messagesData, error: messagesError } = await supabase
          .from('direct_messages')
          .select(`
            id,
            message_text,
            created_at,
            updated_at,
            sender:users!inner (
              id,
              username,
              display_name,
              avatar_url,
              status
            )
          `)
          .eq('dm_room_id', room.id)
          .order('created_at', { ascending: true })

        if (messagesError) {
          dmLogger.error('Error fetching messages:', {
            code: messagesError.code,
            message: messagesError.message,
            details: messagesError.details,
            hint: messagesError.hint,
            timestamp: new Date().toISOString()
          })
          setLoadError(messagesError.message)
          return
        }

        // Enhanced message statistics
        const stats = {
          total: messagesData?.length || 0,
          bySender: {},
          avgLength: 0,
          timeRange: null
        }

        if (messagesData?.length) {
          stats.timeRange = {
            first: messagesData[0].created_at,
            last: messagesData[messagesData.length - 1].created_at
          }
          
          let totalLength = 0
          messagesData.forEach(msg => {
            stats.bySender[msg.sender.id] = (stats.bySender[msg.sender.id] || 0) + 1
            totalLength += msg.message_text.length
          })
          stats.avgLength = totalLength / messagesData.length
        }

        setMessageStats(stats)
        
        dmLogger.info('\n=== MESSAGE LOAD COMPLETE ===')
        dmLogger.info('Message statistics:', {
          total: stats.total,
          timeRange: stats.timeRange,
          bySender: stats.bySender,
          avgMessageLength: stats.avgLength,
          fetchDuration: new Date() - lastFetchTime.current,
          timestamp: new Date().toISOString()
        })

        // Subscribe to new messages
        dmLogger.debug('\n=== REALTIME SUBSCRIPTION SETUP ===')
        dmLogger.debug('Subscribing to messages:', {
          channel: `dm_room:${room.id}`,
          timestamp: new Date().toISOString()
        })

        const subscription = supabase
          .channel(`dm_room:${room.id}`)
          .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'direct_messages',
            filter: `dm_room_id=eq.${room.id}`
          }, async (payload) => {
            dmLogger.info('Realtime message event received:', {
              type: payload.eventType,
              messageId: payload.new?.id,
              senderId: payload.new?.sender_id,
              timestamp: new Date().toISOString()
            })

            // Fetch the complete message with sender info
            const { data: newMessage, error: fetchError } = await supabase
              .from('direct_messages')
              .select(`
                id,
                message_text,
                created_at,
                updated_at,
                sender:users!inner (
                  id,
                  username,
                  display_name,
                  avatar_url,
                  status
                )
              `)
              .eq('id', payload.new.id)
              .single()

            if (fetchError) {
              dmLogger.error('Error fetching new message details:', {
                code: fetchError.code,
                message: fetchError.message,
                details: fetchError.details,
                hint: fetchError.hint,
                messageId: payload.new.id,
                timestamp: new Date().toISOString()
              })
              return
            }

            dmLogger.debug('New message details fetched:', {
              id: newMessage.id,
              sender: newMessage.sender.username,
              timestamp: newMessage.created_at,
              messageLength: newMessage.message_text.length
            })

            setMessages(prev => [...prev, newMessage])
          })
          .subscribe((status) => {
            dmLogger.debug('Message subscription status:', {
              status,
              channel: `dm_room:${room.id}`,
              timestamp: new Date().toISOString()
            })
          })

        return () => {
          dmLogger.info('Cleaning up DM room resources...', {
            roomId: room.id,
            subscriptionChannel: `dm_room:${room.id}`,
            timestamp: new Date().toISOString()
          })
          subscription.unsubscribe()
        }
      } catch (err) {
        dmLogger.error('\n=== DM ROOM LOAD ERROR ===')
        dmLogger.error('Error details:', {
          name: err.name,
          message: err.message,
          stack: err.stack,
          timeSinceMount: new Date() - mountTime.current,
          componentState: {
            messages: messages.length,
            dmRoom: dmRoom?.id,
            otherUser: otherUser?.id
          },
          timestamp: new Date().toISOString()
        })
        setLoadError(err)
      } finally {
        setLoading(false)
        dmLogger.info('DM room load completed', {
          success: !loadError,
          timestamp: new Date().toISOString()
        })
      }
    }

    loadDMRoom()

    return () => {
      dmLogger.info('\n=== DM PAGE CLEANUP ===')
      dmLogger.info('Component unmounting:', {
        mountDuration: new Date() - mountTime.current,
        finalState: {
          messages: messages.length,
          dmRoom: dmRoom?.id,
          otherUser: otherUser?.id,
          error: loadError?.message
        },
        timestamp: new Date().toISOString()
      })
    }
  }, [user, otherUserId])

  // Track state changes
  useEffect(() => {
    dmLogger.debug('\n=== DM PAGE STATE UPDATE ===')
    dmLogger.debug('State changed:', {
      messages: messages.length,
      dmRoom: dmRoom?.id,
      otherUser: otherUser?.id,
      loading,
      error: loadError?.message,
      messageStats,
      timestamp: new Date().toISOString()
    })
  }, [messages, dmRoom, otherUser, loading, loadError, messageStats])

  if (!user) {
    dmLogger.warn('No authenticated user, showing sign-in prompt')
    return (
      <Layout>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Please sign in</h2>
            <p className="text-gray-400">You need to be signed in to view messages</p>
          </div>
        </div>
      </Layout>
    )
  }

  if (loading) {
    dmLogger.debug('Showing loading screen')
    return <LoadingScreen message="Loading messages..." />
  }

  if (loadError) {
    dmLogger.error('Rendering error state:', loadError)
    return (
      <Layout>
        <div className="p-4 text-red-500">Error: {loadError}</div>
      </Layout>
    )
  }

  dmLogger.debug('Rendering DM page:', {
    otherUser: otherUser?.username,
    messageCount: messages.length,
    dmRoomId: dmRoom?.id,
    timestamp: new Date().toISOString()
  })

  return (
    <Layout>
      <div className="flex-1 flex flex-col bg-gray-800">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-700">
          <h1 className="text-lg font-semibold">
            {otherUser?.display_name || otherUser?.username || 'Loading...'}
          </h1>
          {otherUser?.status && (
            <p className="text-sm text-gray-400">{otherUser.status}</p>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <MessageList messages={messages} />
        </div>

        {/* Input */}
        {dmRoom && (
          <div className="px-6 py-4 border-t border-gray-700">
            <MessageInput
              onSendMessage={async (text) => {
                try {
                  dmLogger.debug('Sending message:', {
                    roomId: dmRoom.id,
                    senderId: user.id,
                    textLength: text.length,
                    timestamp: new Date().toISOString()
                  })

                  const { error } = await supabase.from('direct_messages').insert([{
                    dm_room_id: dmRoom.id,
                    sender_id: user.id,
                    message_text: text
                  }])

                  if (error) {
                    dmLogger.error('Error sending message:', {
                      code: error.code,
                      message: error.message,
                      details: error.details,
                      hint: error.hint,
                      timestamp: new Date().toISOString()
                    })
                    throw error
                  }

                  dmLogger.info('Message sent successfully', {
                    roomId: dmRoom.id,
                    timestamp: new Date().toISOString()
                  })
                } catch (err) {
                  dmLogger.error('Failed to send message:', err)
                  alert('Failed to send message')
                }
              }}
              placeholder={`Message ${otherUser?.display_name || otherUser?.username}`}
            />
          </div>
        )}
      </div>
    </Layout>
  )
} 