import { useState, useEffect } from 'react'
import { supabase } from '~/lib/supabaseClient'
import { formatDistanceToNow } from 'date-fns'
import { logger } from '~/lib/logger'
import MessageInput from './MessageInput'
import classNames from 'classnames'
import { DocumentIcon, ChatIcon, PinIcon, BoltIcon } from '@heroicons/react/24/outline'

const dmLogger = logger.withPrefix('DirectMessage')

export default function DirectMessage({ roomId, recipient }) {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    dmLogger.debug('DirectMessage component mounted', { roomId })
    if (roomId) {
      loadMessages()
      subscribeToMessages()
    }
  }, [roomId])

  async function loadMessages() {
    try {
      // First get current user's workspace
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError) throw userError

      const { data: workspaces, error: workspaceError } = await supabase
        .from('workspaces')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: true })
        .limit(1)

      if (workspaceError) throw workspaceError
      if (!workspaces || workspaces.length === 0) throw new Error('No workspace found')

      const workspace = workspaces[0]

      // Then fetch messages with workspace validation
      const { data: messages, error: messagesError } = await supabase
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
        .eq('dm_room_id', roomId)
        .eq('workspace_id', workspace.id)
        .order('created_at', { ascending: true })

      if (messagesError) {
        dmLogger.error('Error fetching messages:', messagesError)
        setError(messagesError.message)
        return
      }

      // Then fetch user details for all senders and editors
      if (messages?.length) {
        const userIds = [...new Set([
          ...messages.map(m => m.sender_id),
          ...messages.map(m => m.edited_by).filter(Boolean)
        ])]
        
        const { data: users, error: usersError } = await supabase
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
          .in('id', userIds)

        if (usersError) {
          dmLogger.error('Error fetching users:', usersError)
          setError(usersError.message)
          return
        }

        // Map users to messages
        const transformedData = messages.map(msg => ({
          ...msg,
          sender: users.find(u => u.id === msg.sender_id),
          editor: msg.edited_by ? users.find(u => u.id === msg.edited_by) : null
        }))

        dmLogger.debug('Messages loaded successfully', { count: transformedData?.length })
        setMessages(transformedData || [])
      } else {
        setMessages([])
      }
    } catch (err) {
      dmLogger.error('Unexpected error loading messages:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function subscribeToMessages() {
    const subscription = supabase
      .channel(`room:${roomId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'direct_messages',
        filter: `dm_room_id=eq.${roomId}`
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
            dmLogger.warn('Unknown event type:', payload.eventType)
          }
        }
      })
      .subscribe()

    return () => {
      dmLogger.debug('Unsubscribing from messages')
      subscription.unsubscribe()
    }
  }

  const DirectMessage = ({ message }) => {
    const messageClasses = classNames(
      'flex items-start p-2 hover:bg-gray-50',
      {
        'bg-yellow-50': message.is_announcement,
        'bg-blue-50': message.is_ai_generated
      }
    )

    const renderUserStatus = (user) => {
      if (!user) return null
      return (
        <div className="flex items-center text-xs text-gray-500 mt-1">
          {user.status && (
            <span className="mr-2">
              {user.status}
            </span>
          )}
          {user.is_bot && (
            <span className="bg-purple-100 text-purple-800 px-1 rounded mr-2">
              Bot
            </span>
          )}
          {user.faction && (
            <span className="text-gray-400">
              {user.faction}
            </span>
          )}
        </div>
      )
    }

    const renderUserInfo = (user) => {
      if (!user) return 'Unknown User'
      return (
        <div>
          <span className="font-bold">
            {user.display_name || user.username}
          </span>
          {user.description && (
            <span className="text-xs text-gray-500 ml-2">
              {user.description}
            </span>
          )}
          {renderUserStatus(user)}
        </div>
      )
    }

    return (
      <div className={messageClasses}>
        <div className="flex-shrink-0 relative">
          <img 
            src={message.sender?.avatar_url || '/default-avatar.png'} 
            alt={message.sender?.display_name || message.sender?.username || 'User'} 
            className="w-10 h-10 rounded-full mr-3"
          />
          {message.sender?.is_bot && (
            <div className="absolute -bottom-1 -right-1 bg-purple-500 rounded-full w-4 h-4 flex items-center justify-center">
              <BoltIcon className="w-3 h-3 text-white" />
            </div>
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center">
            {renderUserInfo(message.sender)}
            <span className="text-gray-500 text-sm ml-2">
              {new Date(message.created_at).toLocaleString()}
            </span>
            {message.edited_at && (
              <div className="flex items-center text-gray-400 text-xs ml-2">
                <span>(edited by {message.editor?.display_name || message.editor?.username || 'Unknown'})</span>
                {renderUserStatus(message.editor)}
              </div>
            )}
            {message.is_announcement && (
              <span className="bg-yellow-200 text-yellow-800 text-xs px-2 py-1 rounded ml-2">
                Announcement
              </span>
            )}
            {message.is_ai_generated && (
              <span className="bg-blue-200 text-blue-800 text-xs px-2 py-1 rounded ml-2">
                AI Generated
              </span>
            )}
          </div>
          
          <div className="mt-1">
            {message.message_text}
          </div>

          {message.attachments && Object.keys(message.attachments).length > 0 && (
            <div className="mt-2 space-y-2">
              {Object.entries(message.attachments).map(([id, attachment]) => (
                <div key={id} className="flex items-center space-x-2">
                  <DocumentIcon className="w-5 h-5 text-gray-500" />
                  <a 
                    href={attachment.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {attachment.name}
                  </a>
                </div>
              ))}
            </div>
          )}

          {message.reactions && Object.keys(message.reactions).length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {Object.entries(message.reactions).map(([emoji, users]) => (
                <button
                  key={emoji}
                  className="inline-flex items-center space-x-1 bg-gray-100 hover:bg-gray-200 rounded px-2 py-1"
                >
                  <span>{emoji}</span>
                  <span className="text-xs text-gray-600">{Object.keys(users).length}</span>
                </button>
              ))}
            </div>
          )}

          <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
            {message.reply_count > 0 && (
              <span className="flex items-center space-x-1">
                <ChatIcon className="w-4 h-4" />
                <span>{message.reply_count} replies</span>
              </span>
            )}
            
            {message.is_pinned && (
              <span className="flex items-center space-x-1">
                <PinIcon className="w-4 h-4" />
                <span>Pinned</span>
              </span>
            )}

            {message.delivery_status !== 'sent' && (
              <span className="text-orange-500">
                {message.delivery_status}
              </span>
            )}

            {message.scheduled_for && (
              <span className="text-gray-400">
                Scheduled for {new Date(message.scheduled_for).toLocaleString()}
              </span>
            )}

            {message.expires_at && (
              <span className="text-red-400">
                Expires {new Date(message.expires_at).toLocaleString()}
              </span>
            )}
          </div>

          {message.is_ai_generated && message.ai_model && (
            <div className="mt-2 text-xs text-gray-500">
              Generated by {message.ai_model}
              {message.ai_prompt && (
                <span className="ml-2">
                  Prompt: "{message.ai_prompt}"
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : error ? (
          <div className="text-red-500 text-center">{error}</div>
        ) : messages.length === 0 ? (
          <div className="text-gray-500 text-center">No messages yet</div>
        ) : (
          messages.map((message) => (
            <DirectMessage key={message.id} message={message} />
          ))
        )}
      </div>
      
      <div className="border-t border-gray-200 p-4">
        <MessageInput 
          dm_room_id={roomId}
          recipient_id={recipient?.id}
          isDirect={true}
        />
      </div>
    </div>
  )
}