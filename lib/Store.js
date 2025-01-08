import { useState, useEffect, useRef, useContext } from 'react'
import { createClient } from '@supabase/supabase-js'
import UserContext from '~/contexts/UserContext'
import { CHANNELS } from '~/lib/constants'

// Initialize the Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
})

// Message sending functions
export const sendMessage = async (content, channel_id) => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('messages')
      .insert([
        {
          message: content,
          channel_id,
          user_id: user.id,
          inserted_at: new Date().toISOString(),
          attachments: []
        }
      ])
      .select(`
        id,
        message,
        inserted_at,
        channel_id,
        attachments,
        user:user_id (
          id,
          username,
          avatar_url
        )
      `)
      .single()

    if (error) {
      console.error('Database error:', error)
      throw new Error(error.message)
    }
    return data
  } catch (error) {
    console.error('Error sending message:', error)
    throw error
  }
}

export const sendDirectMessage = async (content, recipient_id) => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('direct_messages')
      .insert([
        {
          message: content,
          sender_id: user.id,
          recipient_id,
          inserted_at: new Date().toISOString(),
          attachments: []
        }
      ])
      .select(`
        id,
        message,
        inserted_at,
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
      .single()

    if (error) {
      console.error('Database error:', error)
      throw new Error(error.message)
    }
    return data
  } catch (error) {
    console.error('Error sending direct message:', error)
    throw error
  }
}

// File upload function
export const uploadFile = async (file, bucket) => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    // Validate bucket name
    if (!['avatars', 'message-attachments'].includes(bucket)) {
      throw new Error('Invalid bucket name. Must be either "avatars" or "message-attachments"')
    }

    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random()}-${file.name}`
    const filePath = `${user.id}/${fileName}`

    // Upload the file
    const { error: uploadError, data } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      throw new Error('Failed to upload file')
    }

    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath)

    return publicUrl
  } catch (error) {
    console.error('Error uploading file:', error)
    throw error
  }
}

// Ensure default channels exist
const ensureDefaultChannels = async () => {
  try {
    const { data: existingChannels, error: fetchError } = await supabase
      .from('channels')
      .select('id, slug')

    if (fetchError) {
      console.error('Error fetching channels:', fetchError)
      return
    }

    const defaultChannels = Object.values(CHANNELS)
    const channelsToCreate = defaultChannels.filter(channel => 
      !existingChannels?.some(existing => existing.id === channel.id)
    )

    if (channelsToCreate.length > 0) {
      const { error: insertError } = await supabase
        .from('channels')
        .insert(channelsToCreate.map(channel => ({
          id: channel.id,
          slug: channel.slug,
          name: channel.displayName,
          description: channel.description,
          created_by: 'system'
        })))

      if (insertError) {
        console.error('Error creating channels:', insertError)
        return
      }
      console.log('✅ Created default channels:', channelsToCreate.length)
    }
  } catch (error) {
    console.error('Error ensuring default channels:', error)
  }
}

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
    ensureDefaultChannels().then(() => {
      fetchChannels()
      fetchUsers()
    })
    
    // Subscribe to channel changes
    const channelsSubscription = supabase
      .channel('public:channels')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'channels' }, (payload) => {
        console.log('Change received!', payload)
        fetchChannels()
      })
      .subscribe()

    // Subscribe to user changes
    const usersSubscription = supabase
      .channel('public:users')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'users' }, handleNewOrUpdatedUser)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'users' }, handleNewOrUpdatedUser)
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'users' }, handleDeletedUser)
      .subscribe()

    // Subscribe to message changes
    const messagesSubscription = supabase
      .channel('public:messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, handleNewMessage)
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'messages' }, handleDeletedMessage)
      .subscribe()

    return () => {
      channelsSubscription.unsubscribe()
      usersSubscription.unsubscribe()
      messagesSubscription.unsubscribe()
    }
  }, [])

  // Fetch messages when channel ID changes
  useEffect(() => {
    if (props?.channelId) {
      fetchMessages(props.channelId)
    }
  }, [props?.channelId])

  // Update users when they change
  useEffect(() => {
    if (newOrUpdatedUser) {
      setUsers(users => {
        const exists = users.find(x => x.id === newOrUpdatedUser.id)
        if (exists) {
          return users.map(u => u.id === newOrUpdatedUser.id ? newOrUpdatedUser : u)
        } else {
          return [...users, newOrUpdatedUser]
        }
      })
    }
  }, [newOrUpdatedUser])

  // Delete users
  useEffect(() => {
    if (deletedUser) {
      setUsers(users => users.filter(u => u.id !== deletedUser.id))
    }
  }, [deletedUser])

  // Update messages
  useEffect(() => {
    if (newMessage && newMessage.channel_id === props?.channelId) {
      setMessages(messages => [...messages, newMessage].sort((a, b) => 
        new Date(a.inserted_at) - new Date(b.inserted_at)
      ))
    }
  }, [newMessage, props?.channelId])

  // Delete messages
  useEffect(() => {
    if (deletedMessage) {
      setMessages(messages => messages.filter(m => m.id !== deletedMessage.id))
    }
  }, [deletedMessage])

  const fetchChannels = async () => {
    try {
      const { data, error } = await supabase
        .from('channels')
        .select('*')
        .order('id', { ascending: true })
      
      if (error) throw error
      setChannels(data)
    } catch (error) {
      console.error('Error fetching channels:', error)
    }
  }

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('username', { ascending: true })
      
      if (error) throw error
      setUsers(data)
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  const fetchMessages = async (channelId) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          id,
          message,
          inserted_at,
          channel_id,
          attachments,
          user:user_id (
            id,
            username,
            avatar_url
          )
        `)
        .eq('channel_id', channelId)
        .order('inserted_at', { ascending: true })

      if (error) {
        console.error('Error fetching messages:', error)
        throw error
      }
      setMessages(data || [])
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }

  // Subscribe to message changes
  useEffect(() => {
    if (!props?.channelId) return

    const messagesSubscription = supabase
      .channel('public:messages')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages',
          filter: `channel_id=eq.${props.channelId}`
        }, 
        payload => {
          console.log('New message received:', payload)
          const newMsg = payload.new
          if (newMsg.channel_id === props.channelId) {
            handleNewMessage(newMsg)
          }
        }
      )
      .subscribe()

    return () => {
      messagesSubscription.unsubscribe()
    }
  }, [props?.channelId])

  return {
    channels,
    messages,
    users,
  }
} 