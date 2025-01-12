// lib/Store.js
"use client";

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { v4 as uuidv4 } from 'uuid'

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

supabase.auth.onAuthStateChange((event) => {
  if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
    // Possibly re-check storage if needed
  }
})

/**
 * sendMessage
 * Insert a new row into "messages" table with correct fields and a valid UUID for the 'id'.
 */
export async function sendMessage({ message, channel_id, user_id }) {
  const { data: channel } = await supabase
    .from('channels')
    .select('*')
    .eq('id', channel_id)
    .single()

  if (!channel) {
    throw new Error('Channel not found')
  }

  const { data, error } = await supabase
    .from('messages')
    .insert([
      {
        message_text: message,
        channel_id,
        user_id,
        workspace_id: channel.workspace_id,
        attachments: {},
        mentions: {},
        metadata: {},
        placeholder_1: null,
        placeholder_2: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ])
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * sendDirectMessage
 * Insert a new row into "direct_messages" with a valid UUID for the 'id'.
 */
export async function sendDirectMessage({ message, room_id, sender_id, recipient_id }) {
  const { data: room } = await supabase
    .from('dm_rooms')
    .select('*')
    .eq('id', room_id)
    .single()

  if (!room) {
    throw new Error('DM room not found')
  }

  const { data, error } = await supabase
    .from('direct_messages')
    .insert([
      {
        message_text: message,
        dm_room_id: room_id,
        sender_id,
        recipient_id,
        workspace_id: room.workspace_id,
        attachments: {},
        mentions: {},
        metadata: {},
        placeholder_1: null,
        placeholder_2: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ])
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * uploadFile
 * Upload to either 'avatars' or 'message_attachments' with max 5MB. 
 */
export async function uploadFile(file, bucket) {
  try {
    const { data: userData } = await supabase.auth.getUser()
    if (!userData?.user) throw new Error('User not authenticated')

    if (!['avatars', 'message_attachments'].includes(bucket)) {
      throw new Error('Invalid bucket name.')
    }

    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      throw new Error('File size must be less than 5MB')
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf']
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Only images (JPEG, PNG, GIF) and PDF files are allowed')
    }

    const fileExt = file.name.split('.').pop().toLowerCase()
    const timestamp = new Date().getTime()
    const randomString = Math.random().toString(36).substring(2, 15)
    const fileName = `${timestamp}-${randomString}.${fileExt}`
    const filePath = `${userData.user.id}/${fileName}`

    console.log('Attempting to upload file:', {
      bucket,
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
      bucket
    })

    return {
      url: publicUrl,
      path: filePath,
      bucket,
      contentType: file.type,
      size: file.size
    }
  } catch (error) {
    console.error('Error uploading file:', error)
    throw error
  }
}

/**
 * ensureDefaultChannels
 * If user doesn't exist in public.users, skip or log an error. No crash.
 */
export async function ensureDefaultChannels(user_id) {
  console.log('🚀 Starting ensureDefaultChannels for user:', user_id)
  if (!user_id) {
    console.error('No user_id provided to ensureDefaultChannels. Aborting.')
    return false
  }

  try {
    console.log('🔍 Verifying user existence')
    const { data: dbUsers, error: userError } = await supabase
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
        placeholder_col_1,
        placeholder_col_2,
        created_at,
        updated_at
      `)
      .eq('id', user_id)
      .maybeSingle()

    if (userError) {
      console.error('❌ Error fetching user:', userError)
      throw userError
    }

    if (!dbUsers) {
      console.error('❌ User not found:', user_id)
      throw new Error('User not found')
    }

    console.log('✅ User verified:', dbUsers)

    // For demonstration only
    console.log('No default channels logic implemented; skipping creation steps for brevity.')
    return true
  } catch (error) {
    console.error('❌ Error in ensureDefaultChannels:', { error, message: error.message })
    throw error
  }
}

/**
 * useStore
 * A custom hook to fetch channels and users, plus store initialization. 
 */
export function useStore() {
  const [channels, setChannels] = useState([])
  const [messages, setMessages] = useState([])
  const [users, setUsers] = useState([])
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    const initializeStore = async () => {
      try {
        const { data: sessionRes } = await supabase.auth.getUser()
        const currentUser = sessionRes?.user
        if (!currentUser) {
          console.log('❌ No authenticated user in useStore.')
          setIsInitialized(true)
          return
        }
        console.log('✅ User authenticated:', currentUser.id)

        await ensureDefaultChannels(currentUser.id)

        await Promise.all([
          fetchChannels(),
          fetchUsers()
        ])
        setIsInitialized(true)
      } catch (error) {
        console.error('Error initializing store:', error)
        setIsInitialized(true)
      }
    }

    if (!isInitialized) {
      initializeStore()
    }

    const channelsSub = supabase
      .channel('public:channels')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'channels' }, () => {
        fetchChannels()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channelsSub)
    }
  }, [isInitialized])

  const fetchChannels = async () => {
    try {
      console.log('🔍 Fetching channels...')
      const { data: sessionRes } = await supabase.auth.getUser()
      if (!sessionRes?.user) {
        console.log('❌ User not authenticated')
        return
      }
      const { data, error } = await supabase
        .from('channels')
        .select('id, slug, name, description, workspace_id, created_by')
        .order('created_at', { ascending: true })

      if (error) {
        console.error('❌ Error fetching channels:', error)
        return
      }
      console.log('📊 Raw channel data:', data)

      const mapped = (data || []).map(ch => ({
        ...ch,
        displayName: ch.name || ch.slug
      }))
      setChannels(mapped)
    } catch (err) {
      console.error('❌ Error fetching channels:', err)
    }
  }

  const fetchUsers = async () => {
    try {
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
          placeholder_col_1,
          placeholder_col_2
        `)
        .order('username', { ascending: true })

      if (usersError) {
        console.error('Error fetching users:', usersError)
        return
      }
      setUsers(users || [])
    } catch (err) {
      console.error('Error fetching users:', err)
    }
  }

  return {
    channels,
    messages,
    users
  }
}