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
 * Attempt to send a channel-based message
 */
export async function sendMessage({ messageText, channel_id, user_id, workspace_id, parent_id=null, thread_id=null }) {
  storeLogger.debug('sendMessage invoked', { channel_id, user_id, workspace_id, messageText })
  const row = {
    id: uuidv4(),
    message_text: messageText,
    user_id,
    channel_id,
    workspace_id: workspace_id || '00000000-0000-0000-0000-000000000000',
    parent_id: parent_id || null,
    thread_id: thread_id || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }

  // Because we don't actually store workspace_id in 'messages' by default,
  // ensure your table has a workspace_id column if you want. Or remove it if not needed.

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
 * Attempt to send a direct message
 */
export async function sendDirectMessage({ text, dm_room_id, sender_id, workspace_id, parent_id=null, thread_id=null }) {
  storeLogger.debug('sendDirectMessage invoked', { dm_room_id, sender_id, workspace_id, text })
  const row = {
    id: uuidv4(),
    dm_room_id,
    sender_id,
    // If your direct_messages table has a workspace_id, put it here
    // workspace_id: workspace_id || '00000000-0000-0000-0000-000000000000',
    message_text: text,
    parent_id,
    thread_id,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
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
 * Attempt to upload a file
 */
export async function uploadFile(file, bucket='message_attachments') {
  storeLogger.debug('uploadFile invoked', { fileName: file.name, bucket })

  const fileExt = file.name.split('.').pop()
  const filePath = `${uuidv4()}.${fileExt}`
  const { data, error } = await supabase
    .storage
    .from(bucket)
    .upload(filePath, file)

  if (error) {
    storeLogger.error('Error uploading file:', error)
    throw error
  }
  storeLogger.debug('File upload success:', data)

  const { data: publicData } = supabase
    .storage
    .from(bucket)
    .getPublicUrl(filePath)

  if (publicData?.publicUrl) {
    storeLogger.debug('File public url:', publicData.publicUrl)
    return { url: publicData.publicUrl, path: filePath }
  }
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
  const [error, setError] = useState(null)
  const [fetchAttempts, setFetchAttempts] = useState(0)
  const mountTime = useRef(new Date())
  const lastFetchTime = useRef(null)

  useEffect(() => {
    storeLogger.info('\n=== STORE MOUNT METRICS ===')
    storeLogger.info('Mount details:', {
      mountTimestamp: mountTime.current.toISOString(),
      componentState: {
        channelsCount: channels.length,
        workspacesCount: workspaces.length,
        loading,
        error: error?.message,
        fetchAttempts
      },
      timestamp: new Date().toISOString()
    })

    const fetchData = async () => {
      try {
        setFetchAttempts(prev => prev + 1)
        lastFetchTime.current = new Date()

        storeLogger.info('\n=== FETCH ATTEMPT DETAILS ===')
        storeLogger.info('Starting fetch:', {
          attempt: fetchAttempts + 1,
          timeSinceMount: new Date() - mountTime.current,
          timestamp: new Date().toISOString()
        })

        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError) {
          storeLogger.error('Authentication error:', authError)
          throw authError
        }
        storeLogger.info('Authentication state:', {
          isAuthenticated: !!user,
          userId: user?.id,
          email: user?.email,
          timestamp: new Date().toISOString()
        })

        if (!user) {
          setChannels([])
          setWorkspaces([])
          setLoading(false)
          return
        }

        // Fetch all workspace_members rows for this user, then join the 'workspaces' data
        // The correct syntax:
        //   ?select=id,workspace_id,role,workspaces!inner(id,name,owner_id,...)...
        const { data: wmData, error: wError } = await supabase
          .from('workspace_members')
          .select(`
            id,
            workspace_id,
            role,
            workspaces!workspace_id (
              id,
              name,
              owner_id,
              created_at,
              updated_at
            )
          `)
          .eq('user_id', user.id)

        if (wError) {
          storeLogger.error('Workspace fetch error details:', wError)
          throw wError
        }

        // Flatten out the joined data
        let processedWorkspaces = []
        if (wmData?.length) {
          processedWorkspaces = wmData.map(wm => ({
            ...wm.workspaces,
            role: wm.role
          }))
        }

        // Next, fetch channel_members for this user
        const { data: cmData, error: cError } = await supabase
          .from('channel_members')
          .select(`
            id,
            channel_id,
            role,
            channels!channel_id (
              id,
              name,
              workspace_id,
              description,
              created_by,
              created_at,
              updated_at
            )
          `)
          .eq('user_id', user.id)

        storeLogger.debug('Raw channel_members data:', cmData)
        if (cmData?.length === 0) {
          storeLogger.warn('No channel_members found for user:', user.id)
        }

        if (cError) {
          storeLogger.error('Channel fetch error details:', cError)
          throw cError
        }

        let processedChannels = []
        if (cmData?.length) {
          processedChannels = cmData.map(cm => {
            storeLogger.debug('Processing channel:', cm.channels)
            return {
              ...cm.channels,
              role: cm.role
            }
          })
        }

        storeLogger.info('Processed workspaces:', {
          count: processedWorkspaces.length
        })
        storeLogger.info('Processed channels:', {
          count: processedChannels.length
        })

        setWorkspaces(processedWorkspaces)
        setChannels(processedChannels)
      } catch (err) {
        storeLogger.error('\n=== FETCH ERROR DETAILS ===')
        storeLogger.error('Error in store:', {
          message: err.message,
          stack: err.stack
        })
        setError(err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()

    return () => {
      storeLogger.info('\n=== STORE CLEANUP ===')
      storeLogger.info('Store unmounting:', {
        mountDuration: new Date() - mountTime.current,
        finalState: {
          channelsCount: channels.length,
          workspacesCount: workspaces.length,
          loading,
          error: error?.message,
          fetchAttempts
        },
        timestamp: new Date().toISOString()
      })
    }
  }, [])

  useEffect(() => {
    storeLogger.debug('\n=== STORE STATE UPDATE ===')
    storeLogger.debug('State changed:', {
      channels: channels.map(c => ({
        id: c.id,
        name: c.name,
        workspace: c.workspace_id
      })),
      workspaces: workspaces.map(w => ({
        id: w.id,
        name: w.name,
        role: w.role
      })),
      loading,
      error: error?.message,
      timestamp: new Date().toISOString()
    })
  }, [channels, workspaces, loading, error])

  return {
    channels,
    workspaces,
    loading,
    error
  }
}