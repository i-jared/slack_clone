"use client"

import { logger } from './logger'
import { supabase } from './supabaseClient'
import { v4 as uuidv4 } from 'uuid'
import { useState, useEffect, useRef } from 'react'

console.log('\n==================== STORE.JS LOADED ====================')
console.log('Process ENV:', process.env.NODE_ENV)
console.log('Current Time:', new Date().toISOString())

const storeLogger = logger.withPrefix('Store')
storeLogger.info('Store initialized')

/**
 * Attempt to send a channel-based message (to the new 'messages' table).
 */
export async function sendMessage({ messageText, channel_id, user_id, workspace_id, parent_id=null, thread_id=null }) {
  storeLogger.debug('sendMessage invoked', { channel_id, user_id, workspace_id, messageText })

  const row = {
    id: uuidv4(),
    message_text: messageText,
    user_id,
    channel_id,
    workspace_id,
    parent_id: parent_id || null,
    thread_id: thread_id || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }

  storeLogger.debug('sendMessage: inserting row into messages table', row)

  const { data, error } = await supabase
    .from('messages')
    .insert([row])
    .single()

  if (error) {
    storeLogger.error('sendMessage error:', error)
    throw error
  }
  storeLogger.debug('sendMessage success:', data)
  return data
}

/**
 * Attempt to send a direct message (to the 'direct_messages' table).
 */
export async function sendDirectMessage({ text, dm_room_id, sender_id, workspace_id, parent_id=null, thread_id=null }) {
  storeLogger.debug('sendDirectMessage invoked', { dm_room_id, sender_id, workspace_id, text })
  const row = {
    id: uuidv4(),
    dm_room_id,
    sender_id,
    workspace_id,
    message_text: text,
    parent_id: parent_id || null,
    thread_id: thread_id || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
  storeLogger.debug('sendDirectMessage: inserting row into direct_messages table', row)

  const { data, error } = await supabase
    .from('direct_messages')
    .insert(row)
    .single()

  if (error) {
    storeLogger.error('sendDirectMessage error:', error)
    throw error
  }
  storeLogger.debug('sendDirectMessage success:', data)
  return data
}

/**
 * Attempt to upload a file. (Placeholder)
 */
export async function uploadFile(file, bucket='message_attachments') {
  storeLogger.debug('uploadFile invoked', { fileName: file.name, bucket })
  // Implementation remains the same ...
  return null
}

/**
 * A custom React hook to fetch channels, workspaces, etc.
 */
export function useStore() {
  storeLogger.info('\n=== USESTORE HOOK CALLED ===')
  storeLogger.info('Time:', new Date().toISOString())

  const [channels, setChannels] = useState([])
  const [workspaces, setWorkspaces] = useState([])
  const [loading, setLoading] = useState(true)
  const mountRef = useRef(Date.now())
  const fetchCountRef = useRef(0)

  useEffect(() => {
    storeLogger.info('\n=== USESTORE EFFECT: FETCHING DATA ===')
    storeLogger.info('Time since mount:', Date.now() - mountRef.current, 'ms')

    async function fetchData() {
      try {
        setLoading(true)
        fetchCountRef.current++
        storeLogger.info(`\n=== Fetch Attempt #${fetchCountRef.current} ===`)

        // Check auth state first
        storeLogger.debug('Checking authentication...')
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        
        if (authError) {
          storeLogger.error('Authentication error:', authError)
          return
        }

        if (!user) {
          storeLogger.warn('No authenticated user found')
          return
        }

        storeLogger.info('Authenticated user:', {
          id: user.id,
          email: user.email
        })

        // Fetch workspaces
        storeLogger.debug('Fetching workspaces...')
        const { data: workspacesData, error: wError } = await supabase
          .from('workspaces')
          .select('*')
          .order('created_at', { ascending: true })

        if (wError) {
          storeLogger.error('Error fetching workspaces:', wError)
        } else {
          storeLogger.info(`Found ${workspacesData?.length || 0} workspaces`)
          setWorkspaces(workspacesData || [])
        }

        // Fetch channels
        storeLogger.debug('Fetching channels...')
        const { data: channelsData, error: cError } = await supabase
          .from('channels')
          .select('*')
          .order('created_at', { ascending: true })

        if (cError) {
          storeLogger.error('Error fetching channels:', cError)
        } else {
          storeLogger.info(`Found ${channelsData?.length || 0} channels`)
          setChannels(channelsData || [])
        }
      } catch (err) {
        storeLogger.error('Critical error in useStore fetchData:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()

    storeLogger.debug('Setting up realtime subscriptions...')
    
    const wsSub = supabase
      .channel('public:workspaces')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'workspaces' }, (payload) => {
        storeLogger.info('Realtime: workspace change detected:', {
          event: payload.eventType,
          workspace: payload.new?.name || payload.old?.name
        })
        fetchData()
      })
      .subscribe((status) => {
        storeLogger.debug('Workspace subscription status:', status)
      })

    const chSub = supabase
      .channel('public:channels')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'channels' }, (payload) => {
        storeLogger.info('Realtime: channel change detected:', {
          event: payload.eventType,
          channel: payload.new?.name || payload.old?.name
        })
        fetchData()
      })
      .subscribe((status) => {
        storeLogger.debug('Channel subscription status:', status)
      })

    return () => {
      storeLogger.debug('Cleaning up subscriptions...')
      wsSub.unsubscribe()
      chSub.unsubscribe()
    }
  }, [])

  useEffect(() => {
    storeLogger.debug('Store state updated:', {
      channels: channels.length,
      workspaces: workspaces.length,
      loading,
      timeSinceMount: Date.now() - mountRef.current
    })
  }, [channels, workspaces, loading])

  return {
    channels,
    workspaces,
    loading
  }
}