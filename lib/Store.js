import { useState, useEffect, useRef, useContext } from 'react'
import { createClient } from '@supabase/supabase-js'
import UserContext from '~/contexts/UserContext'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

/**
 * @param {object} props
 * @param {number} [props.channelId] the currently selected Channel (optional)
 */
export const useStore = (props) => {
  const [channels, setChannels] = useState([])
  const [messages, setMessages] = useState([])
  const [users, setUsers] = useState([])
  const [newOrUpdatedUser, handleNewOrUpdatedUser] = useState(null)
  const [deletedUser, handleDeletedUser] = useState(null)
  const [newMessage, handleNewMessage] = useState(null)
  const [deletedMessage, handleDeletedMessage] = useState(null)

  // Load initial data and set up listeners
  useEffect(() => {
    fetchChannels()
    fetchUsers()
    
    const channelsSubscription = supabase
      .channel('public:channels')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'channels' }, (payload) => {
        console.log('Change received!', payload)
        fetchChannels()
      })
      .subscribe()

    const usersSubscription = supabase
      .channel('public:users')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'users' }, handleNewOrUpdatedUser)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'users' }, handleNewOrUpdatedUser)
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'users' }, handleDeletedUser)
      .subscribe()

    // Cleanup
    return () => {
      channelsSubscription.unsubscribe()
      usersSubscription.unsubscribe()
    }
  }, [])

  // Fetch messages when channel ID changes
  useEffect(() => {
    if (props?.channelId) {
      console.log('🔄 Fetching messages for channel:', props.channelId)
      
      // Clear messages before fetching new ones
      setMessages([])
      
      const fetchChannelMessages = async () => {
        try {
          const { data, error } = await supabase
            .from('messages')
            .select(`
              *,
              user:user_id (
                id,
                username,
                avatar_url
              )
            `)
            .eq('channel_id', props.channelId)
            .order('inserted_at', { ascending: true })

          if (error) {
            console.error('❌ Error fetching messages:', error)
            return
          }

          console.log('✅ Messages fetched:', data?.length)
          setMessages(data || [])
        } catch (error) {
          console.error('Error fetching messages:', error)
        }
      }

      fetchChannelMessages()
      
      const messagesSubscription = supabase
        .channel(`messages-${props.channelId}`)
        .on('postgres_changes', 
          { event: 'INSERT', schema: 'public', table: 'messages', filter: `channel_id=eq.${props.channelId}` },
          async (payload) => {
            console.log('📨 New message received from subscription:', payload)
            // Fetch the complete message with user data
            const { data: messageData, error } = await supabase
              .from('messages')
              .select(`
                *,
                user:user_id (
                  id,
                  username,
                  avatar_url
                )
              `)
              .eq('id', payload.new.id)
              .single()

            if (error) {
              console.error('❌ Error fetching new message:', error)
              return
            }

            handleNewMessage(messageData)
          }
        )
        .on('postgres_changes',
          { event: 'DELETE', schema: 'public', table: 'messages', filter: `channel_id=eq.${props.channelId}` },
          handleDeletedMessage
        )
        .subscribe()

      return () => {
        console.log('🔄 Cleaning up messages subscription for channel:', props.channelId)
        messagesSubscription.unsubscribe()
      }
    }
  }, [props?.channelId])

  // Update users when they change
  useEffect(() => {
    if (newOrUpdatedUser) setUsers(users.map(user => user.id === newOrUpdatedUser.id ? newOrUpdatedUser : user))
  }, [newOrUpdatedUser])

  // Delete users
  useEffect(() => {
    if (deletedUser) setUsers(users.filter(user => user.id !== deletedUser.id))
  }, [deletedUser])

  // Update messages
  useEffect(() => {
    if (newMessage) {
      console.log('📨 New message received:', newMessage)
      setMessages(messages => {
        // Check if message already exists
        const isExisting = messages.some(msg => msg.id === newMessage.id)
        if (!isExisting) {
          // Add user data to new message if not present
          const messageWithUser = {
            ...newMessage,
            user: newMessage.user || {
              id: newMessage.user_id,
              username: 'Unknown User',
              avatar_url: null
            }
          }
          console.log('📝 Adding new message to state:', messageWithUser)
          return [...messages, messageWithUser]
        }
        return messages
      })
    }
  }, [newMessage])

  // Delete messages
  useEffect(() => {
    if (deletedMessage) setMessages(messages.filter(message => message.id !== deletedMessage.id))
  }, [deletedMessage])

  const fetchChannels = async () => {
    try {
      console.log('📡 Fetching channels...')
      const { data } = await supabase.from('channels').select('*')
      setChannels(data)
      console.log('✅ Channels fetched:', data?.length)
    } catch (error) {
      console.error('Error fetching channels:', error)
    }
  }

  const fetchUsers = async () => {
    try {
      console.log('👥 Fetching users...')
      const { data } = await supabase.from('users').select('*')
      setUsers(data)
      console.log('✅ Users fetched:', data?.length)
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  const fetchMessages = async (channelId) => {
    try {
      if (!channelId) return
      console.log('📨 Fetching messages for channel:', channelId)
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          user:users(*)
        `)
        .eq('channel_id', channelId)
        .order('inserted_at', { ascending: true })

      if (error) throw error

      console.log('✅ Messages fetched:', data?.length)
      setMessages(data || [])
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }

  return {
    channels,
    messages,
    users,
  }
}

/**
 * Fetch all channels
 * @param {function} setState Optionally pass in a hook or callback to set the state
 */
export const fetchChannels = async (setState) => {
  try {
    let { data } = await supabase.from('channels').select('*')
    if (setState) setState(data)
    return data
  } catch (error) {
    console.log('error', error)
  }
}

/**
 * Fetch a single user
 * @param {number} userId
 * @param {function} setState Optionally pass in a hook or callback to set the state
 */
export const fetchUser = async (userId, setState) => {
  try {
    let { data } = await supabase.from('users').select(`*`).eq('id', userId)
    let user = data[0]
    if (setState) setState(user)
    return user
  } catch (error) {
    console.log('error', error)
  }
}

/**
 * Fetch all messages and their authors
 * @param {number} channelId
 * @param {function} setState Optionally pass in a hook or callback to set the state
 */
export const fetchMessages = async (channelId) => {
  try {
    console.log('🔍 Fetching messages for channel:', channelId)
    
    // Get messages with user data
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select(`
        *,
        user:user_id (
          id,
          username,
          avatar_url
        )
      `)
      .eq('channel_id', channelId)
      .order('inserted_at', { ascending: true })

    if (messagesError) {
      console.error('❌ Error fetching messages:', messagesError)
      return []
    }

    console.log('📨 Raw messages received:', messages?.length)

    // Fetch reactions separately for each message
    const messagesWithReactions = await Promise.all(
      messages.map(async (msg) => {
        console.log('🔄 Processing message:', msg.id)
        const { data: reactions, error: reactionsError } = await supabase
          .from('message_reactions')
          .select('emoji, user_id')
          .eq('message_id', msg.id)

        if (reactionsError) {
          console.error('❌ Error fetching reactions for message:', msg.id, reactionsError)
          return msg
        }

        // Get usernames for reactions in a separate query
        const userIds = [...new Set((reactions || []).map(r => r.user_id))]
        const { data: reactionUsers, error: usersError } = await supabase
          .from('users')
          .select('id, username')
          .in('id', userIds)

        if (usersError) {
          console.error('❌ Error fetching users for reactions:', usersError)
        }

        // Combine reaction data with user data
        const reactionsWithUsers = (reactions || []).map(reaction => ({
          ...reaction,
          user: reactionUsers?.find(u => u.id === reaction.user_id) || { username: 'Unknown User' }
        }))

        return {
          ...msg,
          author: {
            id: msg.user_id,
            username: msg.user?.username || 'Unknown User',
            dbUser: {
              id: msg.user_id,
              username: msg.user?.username || 'Unknown User',
              avatar_url: msg.user?.avatar_url
            }
          },
          reactions: reactionsWithUsers
        }
      })
    )

    console.log('✅ Processed messages with reactions:', messagesWithReactions?.length)
    return messagesWithReactions
  } catch (error) {
    console.error('❌ Error in fetchMessages:', error)
    return []
  }
}

/**
 * Insert a new channel into the DB
 * @param {string} slug The channel name
 * @param {number} user_id The channel creator
 */
export const addChannel = async (slug, user_id) => {
  try {
    let { data } = await supabase
      .from('channels')
      .insert([{ slug, created_by: user_id }])
      .select()
    return data
  } catch (error) {
    console.log('error', error)
  }
}

/**
 * Insert a new message into the DB
 * @param {string} message The message text
 * @param {number} channel_id
 * @param {number} user_id The author
 */
export const addMessage = async (message, channel_id, user_id, attachments = []) => {
  try {
    console.log('Adding message:', { message, channel_id, user_id, attachments })

    if (!channel_id) {
      throw new Error('channel_id is required')
    }

    // Ensure channel_id is a number
    const channelId = parseInt(channel_id)
    if (isNaN(channelId)) {
      throw new Error('channel_id must be a number')
    }

    // Insert the message with attachments
    const { data: messageData, error: messageError } = await supabase
      .from('messages')
      .insert([{ 
        message, 
        channel_id: channelId, 
        user_id,
        attachments: attachments.length > 0 ? attachments : null // Only set if we have attachments
      }])
      .select(`
        *,
        user:user_id (
          id,
          username
        )
      `)
      .single()

    if (messageError) {
      console.error('Error inserting message:', messageError)
      throw messageError
    }

    console.log('Inserted message data:', messageData)

    // Get reactions for the message
    const { data: reactions } = await supabase
      .from('message_reactions')
      .select('emoji, user_id')
      .eq('message_id', messageData.id)

    // Transform to match expected format
    const fullMessage = {
      ...messageData,
      author: {
        id: user_id,
        username: messageData.user?.username || 'Unknown User',
        dbUser: {
          id: user_id,
          username: messageData.user?.username || 'Unknown User'
        }
      },
      reactions: reactions || []
    }

    console.log('Transformed message:', fullMessage)
    return fullMessage
  } catch (error) {
    console.error('Error in addMessage:', error)
    throw error
  }
}

/**
 * Delete a channel from the DB
 * @param {number} channel_id
 */
export const deleteChannel = async (channel_id) => {
  try {
    let { data } = await supabase.from('channels').delete().match({ id: channel_id })
    return data
  } catch (error) {
    console.log('error', error)
  }
}

/**
 * Delete a message from the DB
 * @param {number} message_id
 */
export const deleteMessage = async (message_id) => {
  try {
    let { data } = await supabase.from('messages').delete().match({ id: message_id })
    return data
  } catch (error) {
    console.log('error', error)
  }
}

/**
 * Fetch message count for a channel
 * @param {number} channelId
 * @param {function} setState Optionally pass in a hook or callback to set the state
 */
export const fetchMessageCount = async (channelId, setState) => {
  try {
    const { count, error } = await supabase
      .from('messages')
      .select('id', { count: 'exact' })
      .eq('channel_id', channelId)

    if (error) throw error
    
    if (setState) setState(count)
    return count
  } catch (error) {
    console.error('Error fetching message count:', error)
    return 0
  }
}

// Hook for getting message count
export const useMessageCount = (channelId) => {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (channelId) {
      fetchMessageCount(channelId, setCount)

      // Subscribe to changes
      const countListener = supabase
        .channel(`message-count-${channelId}`)
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'messages',
          filter: `channel_id=eq.${channelId}`
        }, () => {
          // Refetch count on any change
          fetchMessageCount(channelId, setCount)
        })
        .subscribe()

      return () => {
        countListener.unsubscribe()
      }
    }
  }, [channelId])

  return count
}

/**
 * Add a reaction to a message
 * @param {number} message_id The message to react to
 * @param {string} emoji The emoji to react with
 * @param {string} user_id The user adding the reaction
 */
export const addReaction = async (message_id, emoji, user_id) => {
  try {
    // Insert the reaction
    const { data: reaction, error } = await supabase
      .from('message_reactions')
      .insert([{ message_id, emoji, user_id }])
      .select('emoji, user_id')
      .single()

    if (error) {
      console.error('Error adding reaction:', error)
      throw error
    }

    // Get the user data
    const { data: userData } = await supabase
      .from('users')
      .select('id, username')
      .eq('id', user_id)
      .single()

    // Combine reaction with user data
    const reactionWithUser = {
      ...reaction,
      user: userData || { username: 'Unknown User' }
    }

    console.log('Added reaction:', reactionWithUser)
    return reactionWithUser
  } catch (error) {
    console.error('Error in addReaction:', error)
    throw error
  }
}

/**
 * Remove a reaction from a message
 * @param {number} message_id The message to remove reaction from
 * @param {string} emoji The emoji to remove
 * @param {string} user_id The user removing their reaction
 */
export const removeReaction = async (message_id, emoji, user_id) => {
  try {
    const { data, error } = await supabase
      .from('message_reactions')
      .delete()
      .match({ message_id, emoji, user_id })
      .select()

    if (error) {
      console.error('Error removing reaction:', error)
      throw error
    }

    console.log('Removed reaction:', data)
    return data
  } catch (error) {
    console.error('Error in removeReaction:', error)
    throw error
  }
}

/**
 * Fetch reactions for a message
 * @param {number} message_id The message to get reactions for
 */
export const fetchReactions = async (message_id) => {
  try {
    const { data, error } = await supabase
      .from('message_reactions')
      .select(`
        *,
        user:user_id (
          id,
          username
        )
      `)
      .eq('message_id', message_id)

    if (error) {
      console.error('Error fetching reactions:', error)
      throw error
    }

    console.log('Fetched reactions:', data)
    return data
  } catch (error) {
    console.error('Error in fetchReactions:', error)
    throw error
  }
}

/**
 * Upload a file to Supabase Storage
 * @param {File} file The file to upload
 * @param {string} user_id The user uploading the file
 * @returns {Promise<{path: string, name: string, type: string, size: number}>}
 */
export const uploadFile = async (file, user_id) => {
  try {
    // Create a unique file path: userId/timestamp-filename
    const timestamp = new Date().getTime()
    const filePath = `${user_id}/${timestamp}-${file.name}`

    // Upload the file
    const { data, error } = await supabase.storage
      .from('message_attachments')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('Error uploading file:', error)
      throw error
    }

    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from('message_attachments')
      .getPublicUrl(filePath)

    return {
      path: filePath,
      url: publicUrl,
      name: file.name,
      type: file.type,
      size: file.size
    }
  } catch (error) {
    console.error('Error in uploadFile:', error)
    throw error
  }
}

/**
 * Delete a file from Supabase Storage
 * @param {string} filePath The path of the file to delete
 */
export const deleteFile = async (filePath) => {
  try {
    const { error } = await supabase.storage
      .from('message_attachments')
      .remove([filePath])

    if (error) {
      console.error('Error deleting file:', error)
      throw error
    }
  } catch (error) {
    console.error('Error in deleteFile:', error)
    throw error
  }
}

/**
 * Hook for managing direct messages
 * @param {object} props
 * @param {string} [props.recipientId] the ID of the user to message
 */
export const useDirectMessages = (props) => {
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useContext(UserContext)

  useEffect(() => {
    if (!props?.recipientId || !user) return

    setIsLoading(true)
    setMessages([]) // Clear messages when recipient changes

    // Fetch direct messages
    const fetchDirectMessages = async () => {
      try {
        console.log('📨 Fetching DMs with recipient:', props.recipientId)
        const { data, error } = await supabase
          .from('direct_messages')
          .select(`
            *,
            sender:sender_id(*),
            recipient:recipient_id(*)
          `)
          .or(`and(sender_id.eq.${user.id},recipient_id.eq.${props.recipientId}),and(sender_id.eq.${props.recipientId},recipient_id.eq.${user.id})`)
          .order('inserted_at', { ascending: true })

        if (error) throw error

        console.log('✅ Fetched DMs:', data?.length)
        setMessages(data || [])
        setIsLoading(false)
      } catch (error) {
        console.error('❌ Error fetching direct messages:', error)
        setIsLoading(false)
      }
    }

    fetchDirectMessages()

    // Listen for new direct messages
    const subscription = supabase
      .channel('direct_messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'direct_messages',
          filter: `or(and(sender_id.eq.${user.id},recipient_id.eq.${props.recipientId}),and(sender_id.eq.${props.recipientId},recipient_id.eq.${user.id}))`,
        },
        async (payload) => {
          console.log('📨 New DM received:', payload)
          try {
            // Fetch the complete message with user data
            const { data: newMessage, error } = await supabase
              .from('direct_messages')
              .select(`
                *,
                sender:sender_id(*),
                recipient:recipient_id(*)
              `)
              .eq('id', payload.new.id)
              .single()

            if (error) throw error

            setMessages((messages) => [...messages, newMessage])
          } catch (error) {
            console.error('❌ Error fetching new direct message:', error)
          }
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [props.recipientId, user])

  return { messages, isLoading }
}

/**
 * Fetch all direct messages between current user and recipient
 * @param {string} recipientId
 */
export const fetchDirectMessages = async (recipientId) => {
  try {
    console.log('🔍 Fetching direct messages with:', recipientId)
    
    // Get messages with user data
    const { data: messages, error: messagesError } = await supabase
      .from('direct_messages')
      .select(`
        *,
        sender:sender_id (
          id,
          username,
          avatar_url
        ),
        recipient:recipient_id (
          id,
          username,
          avatar_url
        )
      `)
      .or(`and(sender_id.eq.${recipientId},recipient_id.eq.${supabase.auth.user()?.id}),and(sender_id.eq.${supabase.auth.user()?.id},recipient_id.eq.${recipientId})`)
      .order('inserted_at', { ascending: true })

    if (messagesError) {
      console.error('❌ Error fetching direct messages:', messagesError)
      return []
    }

    console.log('📨 Raw direct messages received:', messages?.length)
    return messages
  } catch (error) {
    console.error('❌ Error in fetchDirectMessages:', error)
    return []
  }
}

/**
 * Send a direct message
 * @param {string} message The message text
 * @param {string} recipientId The recipient's user ID
 * @param {Array} attachments Optional array of attachments
 */
export const sendDirectMessage = async (message, recipientId, attachments = []) => {
  try {
    console.log('📤 Sending direct message:', { message, recipientId, attachments })

    if (!recipientId) {
      throw new Error('recipientId is required')
    }

    const currentUser = supabase.auth.getUser()
    if (!currentUser) {
      throw new Error('No authenticated user')
    }

    // Insert the message
    const { data: messageData, error: messageError } = await supabase
      .from('direct_messages')
      .insert([{ 
        message: message,
        sender_id: currentUser.id,
        recipient_id: recipientId,
        attachments: attachments.length > 0 ? attachments : null
      }])
      .select(`
        *,
        sender:sender_id(*),
        recipient:recipient_id(*)
      `)
      .single()

    if (messageError) {
      console.error('❌ Error inserting direct message:', messageError)
      throw messageError
    }

    console.log('✅ Direct message sent:', messageData)
    return messageData
  } catch (error) {
    console.error('❌ Error in sendDirectMessage:', error)
    throw error
  }
}

/**
 * Delete a direct message
 * @param {number} messageId
 */
export const deleteDirectMessage = async (messageId) => {
  try {
    const { error } = await supabase
      .from('direct_messages')
      .delete()
      .match({ id: messageId })

    if (error) throw error
  } catch (error) {
    console.error('Error deleting direct message:', error)
    throw error
  }
}

/**
 * Send a message to a channel
 * @param {string} message The message text
 * @param {number} channelId The channel to send the message to
 * @param {Array} attachments Optional array of attachments
 */
export const sendMessage = async (message, channelId, attachments = []) => {
  try {
    console.log('📤 Sending message:', { message, channelId, attachments })
    
    if (!message?.trim()) {
      throw new Error('Message is required')
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      throw new Error('No authenticated user')
    }

    // Insert the message
    const { data: messageData, error: messageError } = await supabase
      .from('messages')
      .insert([{
        message: message.trim(),
        channel_id: channelId,
        user_id: user.id,
        attachments: attachments.length > 0 ? attachments : null
      }])
      .select(`
        *,
        user:user_id (
          id,
          username,
          avatar_url
        )
      `)
      .single()

    if (messageError) {
      console.error('❌ Error inserting message:', messageError)
      throw messageError
    }

    // Transform the message to match the expected format
    const fullMessage = {
      ...messageData,
      user: messageData.user || {
        id: user.id,
        username: user.email?.split('@')[0] || 'Unknown User',
        avatar_url: null
      }
    }

    console.log('✅ Message sent:', fullMessage)
    return fullMessage
  } catch (error) {
    console.error('❌ Error in sendMessage:', error)
    throw error
  }
}
