import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

/**
 * @param {number} channelId the currently selected Channel
 */
export const useStore = (props) => {
  const [channels, setChannels] = useState([])
  const [messages, setMessages] = useState([])
  const [users] = useState(new Map())
  const [newMessage, handleNewMessage] = useState(null)
  const [newChannel, handleNewChannel] = useState(null)
  const [newOrUpdatedUser, handleNewOrUpdatedUser] = useState(null)
  const [deletedChannel, handleDeletedChannel] = useState(null)
  const [deletedMessage, handleDeletedMessage] = useState(null)

  // Load initial data and set up listeners
  useEffect(() => {
    // Get Channels
    fetchChannels(setChannels)
    // Listen for new and deleted messages
    const messageListener = supabase
      .channel('public:messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        console.log('New message received:', payload.new)
        handleNewMessage(payload.new)
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'messages' }, (payload) => {
        console.log('Message deleted:', payload.old)
        handleDeletedMessage(payload.old)
      })
      .subscribe()

    // Listen for changes to reactions
    const reactionListener = supabase
      .channel('public:reactions')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'message_reactions' }, (payload) => {
        console.log('Reaction change received:', payload)
        // Refetch messages to get updated reactions
        if (props?.channelId > 0) {
          console.log('Refetching messages due to reaction change')
          fetchMessages(props.channelId, setMessages)
        }
      })
      .subscribe()

    // Listen for changes to our users
    const userListener = supabase
      .channel('public:users')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, (payload) => {
        console.log('User change received:', payload.new)
        handleNewOrUpdatedUser(payload.new)
      })
      .subscribe()

    // Listen for new and deleted channels
    const channelListener = supabase
      .channel('public:channels')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'channels' }, (payload) => {
        console.log('New channel received:', payload.new)
        handleNewChannel(payload.new)
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'channels' }, (payload) => {
        console.log('Channel deleted:', payload.old)
        handleDeletedChannel(payload.old)
      })
      .subscribe()

    // Cleanup on unmount
    return () => {
      messageListener.unsubscribe()
      reactionListener.unsubscribe()
      userListener.unsubscribe()
      channelListener.unsubscribe()
    }
  }, [])

  // Update when the route changes
  useEffect(() => {
    if (props?.channelId > 0) {
      fetchMessages(props.channelId, setMessages)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.channelId])

  // New message received from Postgres
  useEffect(() => {
    if (newMessage && newMessage.channel_id === Number(props.channelId)) {
      const handleNewMessageWithUser = async () => {
        // Get the message with user data
        const { data: messageWithUser } = await supabase
          .from('messages')
          .select(`
            *,
            user:user_id (
              id,
              username,
              avatar_url
            )
          `)
          .eq('id', newMessage.id)
          .single()

        if (!messageWithUser) {
          console.error('Could not fetch message with user data')
          return
        }

        // Get reactions for the message
        const { data: reactions } = await supabase
          .from('message_reactions')
          .select('emoji, user_id')
          .eq('message_id', messageWithUser.id)

        // Get usernames for reactions in a separate query
        const userIds = [...new Set((reactions || []).map(r => r.user_id))]
        const { data: reactionUsers } = await supabase
          .from('users')
          .select('id, username')
          .in('id', userIds)

        // Combine reaction data with user data
        const reactionsWithUsers = (reactions || []).map(reaction => ({
          ...reaction,
          user: reactionUsers?.find(u => u.id === reaction.user_id) || { username: 'Unknown User' }
        }))

        const transformedMessage = {
          ...messageWithUser,
          author: {
            id: messageWithUser.user_id,
            username: messageWithUser.user?.username || 'Unknown User',
            dbUser: {
              id: messageWithUser.user_id,
              username: messageWithUser.user?.username || 'Unknown User',
              avatar_url: messageWithUser.user?.avatar_url
            }
          },
          reactions: reactionsWithUsers
        }

        console.log('New message with user data and reactions:', transformedMessage)
        setMessages(messages.concat(transformedMessage))
      }

      handleNewMessageWithUser()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newMessage])

  // Deleted message received from postgres
  useEffect(() => {
    if (deletedMessage) setMessages(messages.filter((message) => message.id !== deletedMessage.id))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deletedMessage])

  // New channel received from Postgres
  useEffect(() => {
    if (newChannel) setChannels(channels.concat(newChannel))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newChannel])

  // Deleted channel received from postgres
  useEffect(() => {
    if (deletedChannel) setChannels(channels.filter((channel) => channel.id !== deletedChannel.id))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deletedChannel])

  // New or updated user received from Postgres
  useEffect(() => {
    if (newOrUpdatedUser) users.set(newOrUpdatedUser.id, newOrUpdatedUser)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newOrUpdatedUser])

  return {
    messages: messages.map((x) => ({
      ...x,
      author: {
        id: x.user_id,
        username: x.user?.username || 'Unknown User',
        dbUser: {
          id: x.user_id,
          username: x.user?.username || 'Unknown User',
          avatar_url: x.user?.avatar_url
        }
      },
      reactions: x.reactions || []
    })),
    channels: channels !== null ? channels.sort((a, b) => a.slug.localeCompare(b.slug)) : [],
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
export const fetchMessages = async (channelId, setState) => {
  try {
    console.log('Fetching messages for channel:', channelId)
    
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
      console.error('Error fetching messages:', messagesError)
      return []
    }

    // Fetch reactions separately for each message
    const messagesWithReactions = await Promise.all(
      messages.map(async (msg) => {
        const { data: reactions } = await supabase
          .from('message_reactions')
          .select('emoji, user_id')
          .eq('message_id', msg.id)

        // Get usernames for reactions in a separate query
        const userIds = [...new Set((reactions || []).map(r => r.user_id))]
        const { data: reactionUsers } = await supabase
          .from('users')
          .select('id, username')
          .in('id', userIds)

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

    console.log('Messages with reactions:', messagesWithReactions)
    
    if (setState) {
      setState(messagesWithReactions)
    }
    return messagesWithReactions
  } catch (error) {
    console.error('Error in fetchMessages:', error)
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
