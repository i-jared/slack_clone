import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

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
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    },
    timeout: 30000,
    heartbeat: {
      interval: 15000,
      maxRetries: 3
    }
  }
})

// When auth state changes, attempt to ensure storage buckets
supabase.auth.onAuthStateChange((event) => {
  if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
    ensureStorageBuckets()
  }
})

// Attempt to send a message in a channel
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

// Fix direct message foreign key references
export async function sendDirectMessage(content, recipient_id) {
  console.log('🔍 Debug: Starting sendDirectMessage')
  console.log('� Input parameters:', { content, recipient_id })

  try {
    // Debug Supabase client configuration
    console.log('🔧 Supabase Configuration:', {
      url: supabaseUrl,
      hasAnonKey: !!supabaseAnonKey,
      authConfig: supabase.auth.config,
    })

    console.log('🔑 Checking authentication...')
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError) {
      console.error('❌ Auth Error:', authError)
      console.error('Auth Error Details:', {
        code: authError.code,
        message: authError.message,
        status: authError.status,
        name: authError.name,
        stack: authError.stack
      })
      throw new Error('Authentication error')
    }
    
    if (!user) {
      console.error('❌ No authenticated user found')
      throw new Error('You must be logged in to send messages')
    }

    console.log('✅ Authentication successful')
    console.log('👤 Authenticated user:', {
      id: user.id,
      email: user.email,
      aud: user.aud,
      role: user.role
    })

    // Debug: Check if tables exist and their schemas
    console.log('🔍 Verifying database schema...')
    
    // Check direct_messages table
    const { data: dmTableInfo, error: dmTableError } = await supabase
      .from('direct_messages')
      .select('*')
      .limit(0)

    if (dmTableError) {
      console.error('❌ direct_messages table verification failed:', dmTableError)
    } else {
      console.log('✅ direct_messages table verified')
    }

    // Check users table
    const { data: usersTableInfo, error: usersTableError } = await supabase
      .from('users')
      .select('*')
      .limit(0)

    if (usersTableError) {
      console.error('❌ users table verification failed:', usersTableError)
    } else {
      console.log('✅ users table verified')
    }

    // First, verify the recipient exists
    console.log('🔍 Verifying recipient...')
    const { data: recipientExists, error: recipientError } = await supabase
      .from('users')
      .select('id, username, status')
      .eq('id', recipient_id)
      .single()

    if (recipientError) {
      console.error('❌ Recipient lookup failed:', recipientError)
      console.error('Recipient Error Details:', {
        code: recipientError.code,
        message: recipientError.message,
        hint: recipientError.hint,
        details: recipientError.details
      })
      throw new Error('Failed to verify recipient')
    }

    if (!recipientExists) {
      console.error('❌ Recipient not found:', recipient_id)
      throw new Error('Invalid recipient')
    }

    console.log('✅ Recipient verified:', recipientExists)

    // Debug: Check foreign key relationships
    console.log('🔍 Checking foreign key relationships...')
    const messageData = {
      message: content,
      sender_id: user.id,
      recipient_id,
      inserted_at: new Date().toISOString()
    }
    console.log('📝 Message data to insert:', messageData)

    console.log('🚀 Attempting database insert...')
    // First insert the message
    const { data: insertedMessage, error: insertError } = await supabase
      .from('direct_messages')
      .insert(messageData)
      .select('*')
      .single()

    if (insertError) {
      console.error('❌ Database error:', insertError)
      console.error('Error details:', {
        code: insertError.code,
        message: insertError.message,
        details: insertError.details,
        hint: insertError.hint,
        query: insertError.query
      })
      throw insertError
    }

    // Then fetch the sender and recipient data separately
    const { data: senderData } = await supabase
      .from('users')
      .select('id, username, avatar_url')
      .eq('id', user.id)
      .single()

    const { data: recipientData } = await supabase
      .from('users')
      .select('id, username, avatar_url')
      .eq('id', recipient_id)
      .single()

    const fullMessageData = {
      ...insertedMessage,
      sender: senderData,
      recipient: recipientData
    }

    console.log('✅ Direct message sent successfully:', {
      messageId: fullMessageData.id,
      content: fullMessageData.content,
      sender: fullMessageData.sender,
      recipient: fullMessageData.recipient,
      timestamp: fullMessageData.inserted_at
    })

    return fullMessageData
  } catch (error) {
    console.error('❌ Error in sendDirectMessage:', error)
    console.error('Full error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      code: error.code,
      details: error.details,
      hint: error.hint
    })
    throw error
  } finally {
    console.log('🏁 sendDirectMessage completed')
  }
}

// Upload a file to storage
export const uploadFile = async (file, bucket) => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    if (!['avatars', 'message_attachments'].includes(bucket)) {
      throw new Error('Invalid bucket name. Must be either "avatars" or "message_attachments"')
    }

    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      throw new Error('File size must be less than 5MB')
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf']
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Only images (JPEG, PNG, GIF) and PDF files are allowed')
    }

    await ensureStorageBuckets()

    const { data: buckets } = await supabase.storage.listBuckets()
    const bucketExists = buckets?.some(b => b.name === bucket)
    if (!bucketExists) {
      throw new Error(`Bucket "${bucket}" not found. Please try again.`)
    }

    const fileExt = file.name.split('.').pop().toLowerCase()
    const timestamp = new Date().getTime()
    const randomString = Math.random().toString(36).substring(2, 15)
    const fileName = `${timestamp}-${randomString}.${fileExt}`
    const filePath = `${user.id}/${fileName}`

    console.log('Attempting to upload file:', {
      bucket: bucket,
      filePath,
      contentType: file.type,
      size: file.size
    })

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      throw new Error(uploadError.message || 'Failed to upload file')
    }

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath)

    console.log('File uploaded successfully:', {
      url: publicUrl,
      path: filePath,
      bucket: bucket
    })

    return {
      url: publicUrl,
      path: filePath,
      bucket: bucket,
      contentType: file.type,
      size: file.size
    }
  } catch (error) {
    console.error('Error uploading file:', error)
    throw error
  }
}

// Ensure we have the needed buckets
const ensureStorageBuckets = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) {
      console.log('User not authenticated, skipping bucket creation')
      return
    }

    // List existing buckets
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()
    if (listError) {
      if (listError.message.includes('JWT')) {
        console.log('Auth token not ready, retry bucket creation later')
        return
      }
      console.error('Error listing buckets:', listError)
      return
    }
    console.log('Available buckets:', buckets?.map(b => b.name))
  } catch (error) {
    console.error('Error ensuring storage buckets:', error)
    if (error.message.includes('JWT') || error.message.includes('auth')) {
      console.log('Will retry bucket creation in 2 seconds...')
      setTimeout(ensureStorageBuckets, 2000)
    }
  }
}

// Default channels info (no 'name' or 'description' columns exist, so we only have slug/created_by)
const DEFAULT_CHANNELS = [
  { id: 1, slug: 'general', created_by: 'system' },
  { id: 2, slug: 'random', created_by: 'system' },
  { id: 3, slug: 'star-wars', created_by: 'system' }
]

// Ensure default channels exist
const ensureDefaultChannels = async () => {
  try {
    const { data: existingChannels, error: fetchError } = await supabase
      .from('channels')
      .select('id, slug, created_by')

    if (fetchError) {
      console.error('Error fetching channels:', fetchError)
      return
    }

    const channelsToCreate = DEFAULT_CHANNELS.filter(def =>
      !existingChannels?.some(ec => ec.id === def.id)
    )

    if (channelsToCreate.length > 0) {
      const { error: insertError } = await supabase
        .from('channels')
        .insert(channelsToCreate)
      if (insertError) {
        console.error('Error creating channels:', insertError)
      } else {
        console.log('✅ Created default channels:', channelsToCreate.length)
      }
    }
  } catch (error) {
    console.error('Error ensuring default channels:', error)
  }
}

// Basic store usage
export function useStore(props) {
  const [channels, setChannels] = useState([])
  const [messages, setMessages] = useState([])
  const [users, setUsers] = useState([])
  const [newOrUpdatedUser, handleNewOrUpdatedUser] = useState(null)
  const [deletedUser, handleDeletedUser] = useState(null)
  const [newMessage, handleNewMessage] = useState(null)
  const [deletedMessage, handleDeletedMessage] = useState(null)

  useEffect(() => {
    // create default channels if needed
    ensureDefaultChannels().then(() => {
      fetchChannels()
      fetchUsers()
    })

    // subscribe to channel changes
    const channelsSub = supabase
      .channel('public:channels')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'channels' }, () => {
        fetchChannels()
      })
      .subscribe()

    // subscribe to user changes
    const usersSub = supabase
      .channel('public:users')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'users' }, payload => {
        handleNewOrUpdatedUser(payload.new)
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'users' }, payload => {
        handleNewOrUpdatedUser(payload.new)
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'users' }, payload => {
        handleDeletedUser(payload.old)
      })
      .subscribe()

    // subscribe to message changes
    const messagesSub = supabase
      .channel('public:messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, payload => {
        handleNewMessage(payload.new)
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'messages' }, payload => {
        handleDeletedMessage(payload.old)
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channelsSub)
      supabase.removeChannel(usersSub)
      supabase.removeChannel(messagesSub)
    }
  }, [])

  // if channel changes, fetch messages
  useEffect(() => {
    if (props?.channelId) {
      fetchMessages(props.channelId)
    }
  }, [props?.channelId])

  // new/updated user
  useEffect(() => {
    if (newOrUpdatedUser) {
      setUsers((prev) => {
        const found = prev.find((u) => u.id === newOrUpdatedUser.id)
        if (found) {
          return prev.map((u) => (u.id === newOrUpdatedUser.id ? newOrUpdatedUser : u))
        } else {
          return [...prev, newOrUpdatedUser]
        }
      })
    }
  }, [newOrUpdatedUser])

  // deleted user
  useEffect(() => {
    if (deletedUser) {
      setUsers((prev) => prev.filter((u) => u.id !== deletedUser.id))
    }
  }, [deletedUser])

  // new message
  useEffect(() => {
    if (newMessage && newMessage.channel_id === props?.channelId) {
      // fetch user data for new message
      fetchMessageWithUser(newMessage.id)
    }
  }, [newMessage, props?.channelId])

  // deleted message
  useEffect(() => {
    if (deletedMessage) {
      setMessages((prev) => prev.filter((m) => m.id !== deletedMessage.id))
    }
  }, [deletedMessage])

  const fetchMessageWithUser = async (messageId) => {
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
        .eq('id', messageId)
        .single()

      if (error) {
        console.error('Error fetching message with user:', error)
        return
      }
      setMessages((prev) => [...prev, data].sort((a, b) =>
        new Date(a.inserted_at) - new Date(b.inserted_at)
      ))
    } catch (err) {
      console.error('Error in fetchMessageWithUser:', err)
    }
  }

  // fetch channels with no name/description columns
  const fetchChannels = async () => {
    try {
      const { data, error } = await supabase
        .from('channels')
        .select('id, slug')
        .order('id', { ascending: true })

      if (error) {
        console.error('Error fetching channels:', error)
        return
      }
      // map them into a friendlier shape
      const mapped = (data || []).map((ch) => ({
        ...ch,
        name: ch.slug,
        displayName: ch.slug,
        description: `Welcome to #${ch.slug}`
      }))
      setChannels(mapped)
    } catch (err) {
      console.error('Error fetching channels:', err)
    }
  }

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('username', { ascending: true })

      if (error) {
        console.error('Error fetching users:', error)
        return
      }
      setUsers(data || [])
    } catch (err) {
      console.error('Error fetching users:', err)
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
        return
      }
      setMessages(data || [])
    } catch (err) {
      console.error('Error fetching messages:', err)
    }
  }

  return {
    channels,
    messages,
    users
  }
}

// Also export our direct message hook from a separate file
export { useDirectMessages } from './useDirectMessages'
