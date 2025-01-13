import React, { useEffect, useState, useContext } from 'react'
import { useRouter } from 'next/router'
import Layout from '~/components/Layout'
import DirectMessage from '~/components/DirectMessage'
import { UserContext } from '~/lib/UserContext'
import { supabase } from '~/lib/supabaseClient'
import { logger } from '~/lib/logger'

const dmLogger = logger.withPrefix('DMPage')

/*
  We assume the route param [id] is the dm_room_id (like a room).
  Then we just show <DirectMessage roomId={dmRoomId} workspaceId={} />
  If user is not logged in, redirect to /auth
*/

export default function DMPage() {
  const router = useRouter()
  const { id: dmRoomId } = router.query
  const { user, loading: userLoading } = useContext(UserContext)
  const [workspaceId, setWorkspaceId] = useState(null)
  const [localLoading, setLocalLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    dmLogger.info('=== DM PAGE LIFECYCLE ===')
    dmLogger.info('Component mounted:', {
      mountTime: new Date().toISOString(),
      initialState: { dmRoomId },
      routerState: {
        query: router.query,
        pathname: router.pathname
      },
      userContext: user ? { id: user.id, email: user.email } : 'No user',
      timestamp: new Date().toISOString()
    })

    return () => {
      dmLogger.info('=== DM PAGE CLEANUP ===')
      dmLogger.info('Component unmounting:', {
        finalState: { dmRoomId },
        timestamp: new Date().toISOString()
      })
    }
  }, [])

  useEffect(() => {
    if (userLoading) return
    if (!user) {
      // not logged in, redirect
      dmLogger.warn('No authenticated user, redirecting to /auth')
      router.replace('/auth')
      return
    }
    if (!dmRoomId) {
      setLocalLoading(false)
      return
    }

    // Possibly we want a workspace for the user
    async function fetchWorkspaceId() {
      try {
        setLocalLoading(true)
        // We can find a default workspace or just set a fallback
        // Or we can fetch the first workspace the user is in
        const { data, error } = await supabase
          .from('workspace_members')
          .select('workspace_id')
          .eq('user_id', user.id)
          .limit(1)
          .single()

        if (error) {
          dmLogger.warn('No workspace found or error. Using fallback workspace', error)
          setWorkspaceId('00000000-0000-0000-0000-000000000000')
        } else {
          setWorkspaceId(data?.workspace_id || '00000000-0000-0000-0000-000000000000')
        }
      } catch (err) {
        dmLogger.error('Error loading workspace for DM:', err)
        setError(err.message)
      } finally {
        setLocalLoading(false)
      }
    }
    fetchWorkspaceId()
  }, [dmRoomId, user, userLoading, router])

  if (userLoading || localLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full text-gray-200">
          Loading DM...
        </div>
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout>
        <div className="text-red-500 p-4">{error}</div>
      </Layout>
    )
  }

  if (!dmRoomId) {
    return (
      <Layout>
        <div className="p-4">No DM selected</div>
      </Layout>
    )
  }

  return (
    <Layout>
      <DirectMessage roomId={dmRoomId} workspaceId={workspaceId} />
    </Layout>
  )
}