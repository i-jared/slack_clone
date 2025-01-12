import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { supabase } from '~/lib/supabaseClient'
import { logger } from '~/lib/logger'
import Layout from '~/components/Layout'
import DirectMessage from '~/components/DirectMessage'

const dmPageLogger = logger.withPrefix('DMPage')

export default function DMPage() {
  const router = useRouter()
  const { id: roomId } = router.query
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [room, setRoom] = useState(null)
  const [recipient, setRecipient] = useState(null)

  useEffect(() => {
    dmPageLogger.debug('DM page mounted', { roomId })
    if (roomId) {
      loadDMRoom()
    }
  }, [roomId])

  async function loadDMRoom() {
    try {
      dmPageLogger.debug('Loading DM room details', { roomId })

      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError) {
        dmPageLogger.error('Error fetching auth user:', userError)
        setError(userError.message)
        setLoading(false)
        return
      }
      if (!user) {
        dmPageLogger.error('No logged-in user found')
        setError('You must be logged in to view this DM.')
        setLoading(false)
        return
      }

      const { data: workspaces, error: workspaceError } = await supabase
        .from('workspaces')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: true })
        .limit(1)

      if (workspaceError) {
        dmPageLogger.error('Error fetching user workspace:', workspaceError)
        setError(workspaceError.message)
        setLoading(false)
        return
      }
      if (!workspaces || workspaces.length === 0) {
        dmPageLogger.error('No workspace found for user', { user_id: user.id })
        setError('No workspace found for user')
        setLoading(false)
        return
      }
      const workspace = workspaces[0]

      const { data: roomData, error: roomError } = await supabase
        .from('dm_rooms')
        .select('*')
        .eq('id', roomId)
        .eq('workspace_id', workspace.id)
        .single()

      if (roomError) {
        dmPageLogger.error('Error fetching DM room:', roomError)
        setError(roomError.message)
        setLoading(false)
        return
      }
      if (!roomData) {
        dmPageLogger.warn('DM room not found or not accessible', { roomId })
        setError('DM room not found or not accessible')
        setLoading(false)
        return
      }

      dmPageLogger.debug('DM room loaded', roomData)
      setRoom(roomData)

      const { data: members, error: membersError } = await supabase
        .from('dm_room_members')
        .select(`
          *,
          user:users(*)
        `)
        .eq('dm_room_id', roomId)

      if (membersError) {
        dmPageLogger.error('Error fetching DM room members:', membersError)
        setError(membersError.message)
        setLoading(false)
        return
      }
      if (!members || members.length === 0) {
        dmPageLogger.warn('No members found in room', { roomId })
        setError('No members found in this DM room')
        setLoading(false)
        return
      }

      const currentUserMember = members.find(m => m.user_id === user.id)
      if (!currentUserMember) {
        dmPageLogger.warn('User is not a member of this DM room', { userId: user.id, roomId })
        setError('You do not have access to this DM room')
        setLoading(false)
        return
      }

      const otherMember = members.find(m => m.user_id !== user.id)
      if (otherMember) {
        dmPageLogger.debug('Identified recipient', { recipientId: otherMember.user_id })
        setRecipient(otherMember.user)
      }

      setLoading(false)
    } catch (err) {
      dmPageLogger.error('Unexpected error loading DM room:', err)
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div className="flex flex-col h-full">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-300"></div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full text-red-500">
            {error}
          </div>
        ) : (
          <>
            <div className="border-b border-gray-200 px-4 py-3">
              <h2 className="text-lg font-semibold text-yellow-400">
                {recipient?.display_name || recipient?.username || 'Direct Message'}
              </h2>
            </div>
            <div className="flex-1 overflow-y-auto">
              <DirectMessage roomId={roomId} recipient={recipient} />
            </div>
          </>
        )}
      </div>
    </Layout>
  )
}