// lib/Store.js
"use client";

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { v4 as uuidv4 } from 'uuid'
import { createLogger } from '~/lib/logger'

const logger = createLogger('Store')

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
  logger.debug('🚀 [sendMessage] Starting message send process', {
    messageLength: message?.length,
    channel_id,
    user_id
  })

  try {
    // First get the channel
    logger.debug('🔍 [sendMessage] Fetching channel details')
    const { data: channel, error: channelError } = await supabase
      .from('channels')
      .select('*, workspace_id')
      .eq('id', channel_id)
      .single()

    if (channelError) {
      logger.error('❌ [sendMessage] Error fetching channel:', channelError)
      throw channelError
    }

    if (!channel) {
      logger.error('❌ [sendMessage] Channel not found:', { channel_id })
      throw new Error('Channel not found')
    }

    logger.debug('✅ [sendMessage] Channel found:', { 
      channel_id: channel.id,
      workspace_id: channel.workspace_id
    })

    // If no workspace_id, try to get user's default workspace
    if (!channel.workspace_id) {
      logger.debug('🔍 [sendMessage] No workspace_id found, fetching default workspace')
      const { data: workspace, error: workspaceError } = await supabase
        .from('workspaces')
        .select('*')
        .eq('owner_id', user_id)
        .order('created_at', { ascending: true })
        .limit(1)
        .single()

      if (workspaceError) {
        logger.error('❌ [sendMessage] Error fetching workspace:', workspaceError)
        throw workspaceError
      }

      if (!workspace) {
        logger.error('❌ [sendMessage] No workspace found for user:', user_id)
        throw new Error('No workspace found')
      }

      channel.workspace_id = workspace.id
      logger.debug('✅ [sendMessage] Using workspace:', { workspace_id: workspace.id })
    }

    const messageId = uuidv4()
    logger.debug('📝 [sendMessage] Generated message ID:', messageId)

    const messageData = {
      id: messageId,
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

    logger.debug('📤 [sendMessage] Inserting message into database')
    const { data, error } = await supabase
      .from('messages')
      .insert([messageData])
      .select()
      .single()

    if (error) {
      logger.error('❌ [sendMessage] Error inserting message:', error)
      throw error
    }

    logger.info('✨ [sendMessage] Message sent successfully:', {
      message_id: data.id,
      channel_id: data.channel_id,
      workspace_id: data.workspace_id
    })
    return data
  } catch (error) {
    logger.error('❌ [sendMessage] Error in sendMessage:', error)
    throw error
  }
}

/**
 * sendDirectMessage
 * Insert a new row into "direct_messages" with a valid UUID for the 'id'.
 */
export async function sendDirectMessage({ message, room_id, sender_id, recipient_id }) {
  logger.debug('Attempting to send direct message:', { 
    message, 
    room_id, 
    sender_id, 
    recipient_id 
  })

  try {
    // First get the DM room to get its workspace_id
    const { data: room, error: roomError } = await supabase
      .from('dm_rooms')
      .select('*, workspaces(*)')
      .eq('id', room_id)
      .single()

    if (roomError) {
      logger.error('Error fetching DM room:', roomError)
      throw roomError
    }

    if (!room) {
      logger.error('DM room not found:', { room_id })
      throw new Error('DM room not found')
    }

    logger.debug('DM room found:', room)

    // If no workspace_id, try to get sender's default workspace
    if (!room.workspace_id) {
      const { data: workspace, error: workspaceError } = await supabase
        .from('workspaces')
        .select('*')
        .eq('owner_id', sender_id)
        .maybeSingle()

      if (workspaceError) {
        logger.error('Error fetching workspace:', workspaceError)
        throw workspaceError
      }

      if (!workspace) {
        logger.error('No workspace found for user:', sender_id)
        throw new Error('No workspace found')
      }

      room.workspace_id = workspace.id
    }

    const messageData = {
      id: uuidv4(),
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

    logger.debug('Inserting direct message:', messageData)

    const { data, error } = await supabase
      .from('direct_messages')
      .insert([messageData])
      .select()
      .single()

    if (error) {
      logger.error('Error inserting direct message:', error)
      throw error
    }

    logger.info('Direct message sent successfully:', data)
    return data
  } catch (error) {
    logger.error('Error in sendDirectMessage:', error)
    throw error
  }
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
  logger.debug('🔄 [ensureDefaultChannels] Starting with detailed logging', { user_id })
  
  try {
    // First verify user exists
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user_id)
      .single()

    if (userError) {
      logger.error('❌ [ensureDefaultChannels] User verification failed:', userError)
      throw userError
    }

    logger.debug('✅ [ensureDefaultChannels] User verified:', user)

    // Check for existing workspace with detailed logging
    const { data: existingWorkspace, error: workspaceError } = await supabase
      .from('workspaces')
      .select('*')
      .eq('owner_id', user_id)
      .order('created_at', { ascending: true })
      .limit(1)
      .single()

    if (workspaceError && workspaceError.code !== 'PGRST116') {
      logger.error('❌ [ensureDefaultChannels] Workspace check failed:', workspaceError)
      throw workspaceError
    }

    let workspace
    if (!existingWorkspace) {
      logger.debug('📝 [ensureDefaultChannels] Creating new workspace')
      const { data: newWorkspace, error: createError } = await supabase
        .from('workspaces')
        .insert([{
          id: uuidv4(),
          name: 'My Workspace',
          owner_id: user_id,
          workspace_type: 'standard'
        }])
        .select()
        .single()

      if (createError) {
        logger.error('❌ [ensureDefaultChannels] Workspace creation failed:', createError)
        throw createError
      }
      workspace = newWorkspace
      logger.info('✨ [ensureDefaultChannels] Created new workspace:', workspace)
    } else {
      workspace = existingWorkspace
      logger.info('📋 [ensureDefaultChannels] Using existing workspace:', workspace)
    }

    // Check for existing channels
    const { data: existingChannels, error: channelsError } = await supabase
      .from('channels')
      .select('*')
      .eq('workspace_id', workspace.id)

    if (channelsError) {
      logger.error('❌ [ensureDefaultChannels] Channel check failed:', channelsError)
      throw channelsError
    }

    logger.debug('📊 [ensureDefaultChannels] Existing channels:', existingChannels)

    // Only create default channels if none exist
    if (!existingChannels || existingChannels.length === 0) {
      const defaultChannels = [
        { name: 'General', slug: 'general', description: 'General discussion' },
        { name: 'Random', slug: 'random', description: 'Random topics' },
        { name: 'Announcements', slug: 'announcements', description: 'Important announcements' }
      ]

      // Check which channels we need to create
      const existingSlugs = new Set(existingChannels?.map(ch => ch.slug) || [])
      const channelsToCreate = defaultChannels
        .filter(ch => !existingSlugs.has(ch.slug))
        .map(channel => ({
          id: uuidv4(),
          workspace_id: workspace.id,
          ...channel,
          created_by: user_id
        }))

      if (channelsToCreate.length > 0) {
        const { error: createChannelsError } = await supabase
          .from('channels')
          .insert(channelsToCreate)

        if (createChannelsError) {
          logger.error('❌ [ensureDefaultChannels] Channel creation failed:', createChannelsError)
          throw createChannelsError
        }

        logger.info('✨ [ensureDefaultChannels] Created missing default channels for workspace:', workspace.id)
      } else {
        logger.info('📋 [ensureDefaultChannels] All default channels already exist for workspace:', workspace.id)
      }
    } else {
      logger.info('📋 [ensureDefaultChannels] Using existing channels for workspace:', workspace.id)
    }

    return workspace
  } catch (error) {
    logger.error('❌ [ensureDefaultChannels] Unexpected error:', error)
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
  const [currentWorkspace, setCurrentWorkspace] = useState(null)

  // Get current workspace
  useEffect(() => {
    const getCurrentWorkspace = async () => {
      const { data: sessionRes } = await supabase.auth.getUser()
      if (!sessionRes?.user) return null

      const { data: workspace } = await supabase
        .from('workspaces')
        .select('*')
        .eq('owner_id', sessionRes.user.id)
        .order('created_at', { ascending: true })
        .limit(1)
        .single()

      setCurrentWorkspace(workspace)
    }

    getCurrentWorkspace()
  }, [])

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

        const workspace = await ensureDefaultChannels(currentUser.id)
        setCurrentWorkspace(workspace)

        await Promise.all([
          fetchChannels(workspace?.id),
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

    // Only subscribe if we have a workspace
    let channelsSub
    if (currentWorkspace?.id) {
      channelsSub = supabase
        .channel('public:channels')
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'channels',
            filter: `workspace_id=eq.${currentWorkspace.id}`
          }, 
          () => {
            fetchChannels(currentWorkspace.id)
          }
        )
        .subscribe()
    }

    return () => {
      if (channelsSub) {
        supabase.removeChannel(channelsSub)
      }
    }
  }, [isInitialized, currentWorkspace?.id])

  const fetchChannels = async (workspaceId) => {
    if (!workspaceId) {
      console.log('⚠️ No workspace ID provided for fetching channels')
      return
    }

    try {
      console.log('🔍 Fetching channels for workspace:', workspaceId)
      const { data, error } = await supabase
        .from('channels')
        .select('id, slug, name, description, workspace_id, created_by')
        .eq('workspace_id', workspaceId)
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