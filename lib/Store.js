"use client";

import { useState, useEffect } from 'react'
import { logger } from './logger'
import { supabase, supabaseAdmin } from './supabaseClient'
import { v4 as uuidv4 } from 'uuid'

const storeLogger = logger.withPrefix('Store')

supabase.auth.onAuthStateChange((event) => {
  storeLogger.debug(`(onAuthStateChange) Event: ${event}`)
})

/**
 * sendMessage
 * Insert a new row into "messages" table with correct fields and a valid UUID for the 'id'.
 */
export async function sendMessage({ message, channel_id, user_id }) {
  storeLogger.debug('sendMessage() invoked', { message, channel_id, user_id })

  try {
    storeLogger.debug('Fetching channel details for verification')
    const { data: channel, error: channelError } = await supabase
      .from('channels')
      .select('*, workspace_id')
      .eq('id', channel_id)
      .single()

    if (channelError) {
      storeLogger.error('Error fetching channel:', channelError)
      throw channelError
    }

    if (!channel) {
      storeLogger.error('Channel not found', { channel_id })
      throw new Error('Channel not found')
    }

    if (!channel.workspace_id) {
      storeLogger.debug('No workspace_id found on channel; fetching user default workspace')
      const { data: workspace, error: wError } = await supabase
        .from('workspaces')
        .select('*')
        .eq('owner_id', user_id)
        .order('created_at', { ascending: true })
        .limit(1)
        .single()

      if (wError) {
        storeLogger.error('Error fetching user workspace:', wError)
        throw wError
      }
      if (!workspace) {
        storeLogger.error('No workspace found for user', { user_id })
        throw new Error('No workspace found for user')
      }

      channel.workspace_id = workspace.id
      storeLogger.debug('Using user default workspace', { workspace_id: workspace.id })
    }

    const messageId = uuidv4()
    storeLogger.debug('Inserting new message record', { messageId })

    const messageData = {
      id: messageId,
      message_text: message,
      channel_id,
      user_id,
      workspace_id: channel.workspace_id,
      parent_id: null,
      thread_id: null,
      edited_at: null,
      edited_by: null,
      attachments: {},
      mentions: {},
      metadata: {},
      is_pinned: false,
      reactions: {},
      reply_count: 0,
      is_announcement: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    // Insert
    const { data, error } = await supabase
      .from('messages')
      .insert([messageData])
      .select()
      .single()

    if (error) {
      storeLogger.error('Error inserting message:', error)
      throw error
    }

    storeLogger.info('Message sent successfully:', { message_id: data.id })
    return data
  } catch (error) {
    storeLogger.error('sendMessage() error:', error)
    throw error
  }
}

/**
 * sendDirectMessage
 * Insert a new row into "direct_messages" with a valid UUID for the 'id'.
 */
export async function sendDirectMessage(content, recipient_id, options = {}) {
  storeLogger.debug('sendDirectMessage() invoked', { content, recipient_id, options })

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError) {
      storeLogger.error('sendDirectMessage: error fetching user from supabase.auth', userError)
      throw userError
    }
    if (!user) {
      throw new Error('User must be logged in to send messages')
    }

    // fetch sender
    const { data: sender, error: senderError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (senderError || !sender) {
      storeLogger.error('Error getting sender profile or not found:', senderError)
      throw senderError
    }

    // fetch recipient
    const { data: recipient, error: recipientError } = await supabase
      .from('users')
      .select('*')
      .eq('id', recipient_id)
      .single()

    if (recipientError || !recipient) {
      storeLogger.error('Error fetching recipient:', recipientError)
      throw recipientError
    }

    // fetch user workspace
    const { data: workspace, error: workspaceError } = await supabase
      .from('workspaces')
      .select('*')
      .eq('owner_id', sender.id)
      .order('created_at', { ascending: true })
      .limit(1)
      .single()

    if (workspaceError || !workspace) {
      storeLogger.error('No default workspace found or workspace error:', workspaceError)
      throw new Error('No default workspace found for user')
    }

    storeLogger.debug('Looking for existing DM room', { sender_id: sender.id, recipient_id })

    // For brevity, we skip the advanced find or create approach
    // We'll assume the room is created or found
    // In real code, we'd do more checks
    const { data: newRoom, error: createError } = await supabase
      .from('dm_rooms')
      .insert([{
        id: uuidv4(),
        room_name: `${sender.username || 'user'} & ${recipient.username || 'user'}`,
        workspace_id: workspace.id,
        metadata: {
          participants: [sender.id, recipient.id].sort()
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single()

    if (createError) {
      storeLogger.error('Error creating DM room:', createError)
      throw createError
    }

    storeLogger.debug('Adding members to new DM room', { room_id: newRoom.id })

    const { error: memberError } = await supabase
      .from('dm_room_members')
      .insert([
        {
          id: uuidv4(),
          dm_room_id: newRoom.id,
          user_id: sender.id,
          role: 'admin',
          metadata: { invited_by: sender.id },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: uuidv4(),
          dm_room_id: newRoom.id,
          user_id: recipient.id,
          role: 'member',
          metadata: { invited_by: sender.id },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ])

    if (memberError) {
      storeLogger.error('Error adding DM room members:', memberError)
      throw memberError
    }

    storeLogger.info('DM room created successfully', { room_id: newRoom.id })

    // Prepare message data
    const messageData = {
      dm_room_id: newRoom.id,
      workspace_id: workspace.id,
      sender_id: sender.id,
      message_text: content,
      attachments: options.attachments || {},
      mentions: options.mentions || {},
      metadata: {
        ...options.metadata,
        debugCreatedAt: new Date().toISOString()
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    storeLogger.debug('Inserting direct message', { messageData })

    const { data: message, error: insertError } = await supabase
      .from('direct_messages')
      .insert(messageData)
      .single()

    if (insertError) {
      storeLogger.error('Error sending direct message:', insertError)
      throw insertError
    }

    storeLogger.info('Direct message sent', { message_id: message.id })
    return message
  } catch (error) {
    storeLogger.error('sendDirectMessage() error:', error)
    throw error
  }
}

/**
 * uploadFile
 */
export async function uploadFile(file, bucket) {
  storeLogger.debug('uploadFile() invoked', { fileName: file?.name, bucket })

  try {
    const { data: userData } = await supabase.auth.getUser()
    if (!userData?.user) {
      storeLogger.error('uploadFile: not authenticated')
      throw new Error('User not authenticated')
    }

    if (!['avatars', 'message_attachments'].includes(bucket)) {
      storeLogger.error('uploadFile: invalid bucket name', { bucket })
      throw new Error('Invalid bucket name')
    }

    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      storeLogger.error('uploadFile: file too large', { size: file.size })
      throw new Error('File size must be less than 5MB')
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf']
    if (!allowedTypes.includes(file.type)) {
      storeLogger.error('uploadFile: invalid file type', { fileType: file.type })
      throw new Error('Only images (JPEG, PNG, GIF) and PDF are allowed')
    }

    const fileExt = file.name.split('.').pop().toLowerCase()
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 8)
    const fileName = `${timestamp}-${randomString}.${fileExt}`
    const filePath = `${userData.user.id}/${fileName}`

    storeLogger.debug('Starting upload', { filePath })

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, { cacheControl: '3600', upsert: false, contentType: file.type })

    if (uploadError) {
      storeLogger.error('uploadFile: error uploading', uploadError)
      throw new Error(uploadError.message)
    }

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath)

    storeLogger.info('File uploaded', { publicUrl, filePath })
    return { url: publicUrl, path: filePath, bucket, contentType: file.type, size: file.size }
  } catch (error) {
    storeLogger.error('uploadFile() error:', error)
    throw error
  }
}

/**
 * ensureDefaultChannels
 */
export async function ensureDefaultChannels(user_id) {
  storeLogger.debug('[ensureDefaultChannels] Starting', { user_id })

  try {
    // check if user exists
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user_id)
      .single()

    if (userError) {
      storeLogger.error('[ensureDefaultChannels] User fetch error', userError)
      throw userError
    }
    storeLogger.debug('[ensureDefaultChannels] Verified user row', { user_id })

    // check workspace
    const { data: workspaces, error: workspaceError } = await supabase
      .from('workspaces')
      .select('*')
      .eq('owner_id', user_id)
      .order('created_at', { ascending: true })
      .limit(1)

    if (workspaceError) {
      storeLogger.error('[ensureDefaultChannels] Workspace check error', workspaceError)
      throw workspaceError
    }

    let workspace
    if (!workspaces || workspaces.length === 0) {
      storeLogger.debug('[ensureDefaultChannels] Creating new workspace for user', { user_id })
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
        storeLogger.error('[ensureDefaultChannels] Workspace creation failed', createError)
        throw createError
      }

      // add the owner as a workspace member
      const { error: memberError } = await supabase
        .from('workspace_members')
        .insert([{
          id: uuidv4(),
          workspace_id: newWorkspace.id,
          user_id: user_id,
          role: 'owner',
          permissions: { can_manage_workspace: true, can_manage_members: true, can_create_channels: true },
          metadata: { joined_at: new Date().toISOString() }
        }])

      if (memberError) {
        storeLogger.error('[ensureDefaultChannels] Failed to add owner as workspace member', memberError)
        // rollback
        await supabase.from('workspaces').delete().eq('id', newWorkspace.id)
        throw memberError
      }

      workspace = newWorkspace
      storeLogger.info('[ensureDefaultChannels] Created new workspace and membership', { workspace_id: workspace.id })
    } else {
      workspace = workspaces[0]
      storeLogger.info('[ensureDefaultChannels] Using existing workspace', workspace)
    }

    // check existing channels
    const { data: existingChannels, error: channelsError } = await supabase
      .from('channels')
      .select('*')
      .eq('workspace_id', workspace.id)

    if (channelsError) {
      storeLogger.error('[ensureDefaultChannels] channel fetch error', channelsError)
      throw channelsError
    }

    if (!existingChannels || existingChannels.length === 0) {
      storeLogger.debug('[ensureDefaultChannels] Creating default channels', { workspace_id: workspace.id })

      const defaultChannels = [
        { name: 'General', slug: 'general', description: 'General discussion' },
        { name: 'Random', slug: 'random', description: 'Random topics' },
        { name: 'Announcements', slug: 'announcements', description: 'Important announcements' }
      ]

      const channelsToCreate = defaultChannels.map(ch => ({
        id: uuidv4(),
        workspace_id: workspace.id,
        created_by: user_id,
        channel_type: 'text',
        slug: ch.slug,
        name: ch.name,
        description: ch.description
      }))

      const { error: createChannelsError } = await supabase
        .from('channels')
        .insert(channelsToCreate)

      if (createChannelsError) {
        storeLogger.error('[ensureDefaultChannels] channel creation error', createChannelsError)
        throw createChannelsError
      }

      storeLogger.info('[ensureDefaultChannels] Created missing default channels', { workspace_id: workspace.id })
    } else {
      storeLogger.info('[ensureDefaultChannels] Using existing channels for workspace', workspace.id)
    }

    return workspace
  } catch (error) {
    storeLogger.error('[ensureDefaultChannels] Unexpected error:', error)
    throw error
  }
}

/**
 * useStore
 */
export function useStore() {
  const [channels, setChannels] = useState([])
  const [messages, setMessages] = useState([])
  const [users, setUsers] = useState([])
  const [isInitialized, setIsInitialized] = useState(false)
  const [currentWorkspace, setCurrentWorkspace] = useState(null)

  // Add realtime subscription for channels
  useEffect(() => {
    if (!currentWorkspace?.id) return

    const subscription = supabase
      .channel('store-channels')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'channels',
        filter: `workspace_id=eq.${currentWorkspace.id}`
      }, async (payload) => {
        if (payload.eventType === 'INSERT') {
          setChannels(prev => [...prev, { ...payload.new, displayName: payload.new.name || payload.new.slug }])
        } else if (payload.eventType === 'UPDATE') {
          setChannels(prev => prev.map(ch => 
            ch.id === payload.new.id 
              ? { ...payload.new, displayName: payload.new.name || payload.new.slug }
              : ch
          ))
        } else if (payload.eventType === 'DELETE') {
          setChannels(prev => prev.filter(ch => ch.id !== payload.old.id))
        }
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [currentWorkspace?.id])

  useEffect(() => {
    const getCurrentWorkspace = async () => {
      const { data: sessionRes } = await supabase.auth.getUser()
      if (!sessionRes?.user) return null

      storeLogger.debug('Fetching workspace for current user', { userId: sessionRes.user.id })

      const { data: workspace } = await supabase
        .from('workspaces')
        .select('*')
        .eq('owner_id', sessionRes.user.id)
        .order('created_at', { ascending: true })
        .limit(1)
        .single()

      setCurrentWorkspace(workspace || null)
    }

    getCurrentWorkspace()
  }, [])

  useEffect(() => {
    const initializeStore = async () => {
      storeLogger.debug('initializeStore() called')
      try {
        const { data: sessionRes } = await supabase.auth.getUser()
        const currentUser = sessionRes?.user
        if (!currentUser) {
          storeLogger.warn('No authenticated user in useStore. Aborting init.')
          setIsInitialized(true)
          return
        }
        storeLogger.debug('User authenticated:', currentUser.id)
        const workspace = await ensureDefaultChannels(currentUser.id)
        setCurrentWorkspace(workspace)

        await Promise.all([
          fetchChannels(workspace?.id),
          fetchUsers()
        ])
        setIsInitialized(true)
      } catch (error) {
        storeLogger.error('Error initializing store:', error)
        setIsInitialized(true)
      }
    }

    if (!isInitialized) {
      initializeStore()
    }
  }, [isInitialized])

  const fetchChannels = async (workspaceId) => {
    if (!workspaceId) {
      storeLogger.warn('No workspace ID provided for fetching channels')
      return
    }
    storeLogger.debug('Fetching channels for workspace:', workspaceId)
    try {
      const { data, error } = await supabase
        .from('channels')
        .select('id, slug, name, description, workspace_id, created_by')
        .eq('workspace_id', workspaceId)
        .order('created_at', { ascending: true })

      if (error) {
        storeLogger.error('Error fetching channels:', error)
        return
      }
      storeLogger.debug('Raw channel data:', data)
      const mapped = (data || []).map(ch => ({
        ...ch,
        displayName: ch.name || ch.slug
      }))
      setChannels(mapped)
    } catch (err) {
      storeLogger.error('Error in fetchChannels:', err)
    }
  }

  const fetchUsers = async () => {
    storeLogger.debug('Fetching users for store')
    try {
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('*')
        .order('username', { ascending: true })

      if (usersError) {
        storeLogger.error('Error fetching users:', usersError)
        return
      }
      setUsers(users || [])
    } catch (err) {
      storeLogger.error('Error fetching users:', err)
    }
  }

  return {
    channels,
    messages,
    users,
    currentWorkspace,
    refreshChannels: () => fetchChannels(currentWorkspace?.id)
  }
}

export const createChannel = async ({ name, description = '', workspace_id, user_id }) => {
  try {
    // First create the channel
    const { data: channel, error: channelError } = await supabase
      .from('channels')
      .insert([
        { 
          id: uuidv4(),
          name,
          description,
          workspace_id,
          created_by: user_id,
          is_private: false,
          channel_type: 'text',
          slug: name.toLowerCase().replace(/\s+/g, '-')
        }
      ])
      .select()
      .single()

    if (channelError) throw channelError

    // Then create channel membership for creator
    const { error: membershipError } = await supabase
      .from('channel_members')
      .insert([
        {
          id: uuidv4(),
          channel_id: channel.id,
          user_id,
          role: 'owner',
          metadata: { is_creator: true }
        }
      ])

    if (membershipError) throw membershipError

    return { channel, error: null }
  } catch (error) {
    console.error('Error creating channel:', error)
    return { channel: null, error }
  }
}