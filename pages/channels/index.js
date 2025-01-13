import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/router'
import Layout from '~/components/Layout'
import { useStore } from '~/lib/Store'

const LOG_LEVELS = {
  DEBUG: '🔍',
  INFO: 'ℹ️',
  WARN: '⚠️',
  ERROR: '❌',
  SUCCESS: '✅',
  NETWORK: '📡',
  STATE: '📊',
  TIMING: '⏰',
  MEMORY: '💾',
  LIFECYCLE: '🔄'
}

const logWithLevel = (level, message, data = {}) => {
  const timestamp = new Date().toISOString()
  console.log(`${LOG_LEVELS[level]} [${timestamp}] ${message}`, data)
}

export default function ChannelsIndex() {
  const mountTime = useRef(Date.now())
  const renderCount = useRef(0)
  const effectCount = useRef(0)
  const redirectAttempts = useRef(0)

  const [componentState, setComponentState] = useState({
    isInitialized: false,
    hasError: false,
    error: null
  })

  const router = useRouter()
  const { channels, workspaces, loading } = useStore()

  logWithLevel('LIFECYCLE', 'ChannelsIndex render started', {
    timeSinceMount: Date.now() - mountTime.current
  })

  useEffect(() => {
    renderCount.current++
    logWithLevel('LIFECYCLE', 'ChannelsIndex useEffect - render count incremented', {
      renderCount: renderCount.current,
      timeSinceMount: Date.now() - mountTime.current
    })
  })

  // on mount
  useEffect(() => {
    effectCount.current++
    logWithLevel('LIFECYCLE', 'ChannelsIndex mount effect triggered', {
      effectCount: effectCount.current
    })

    setComponentState(prev => ({
      ...prev,
      isInitialized: true
    }))

    return () => {
      logWithLevel('LIFECYCLE', 'ChannelsIndex unmounted', {
        totalTime: Date.now() - mountTime.current
      })
    }
  }, [])

  // Once we have channels, do redirect
  const handleRedirect = useCallback(
    async (channelId) => {
      if (!channelId) return
      logWithLevel('STATE', 'Attempting to redirect to channel ID', { channelId })
      redirectAttempts.current++
      try {
        await router.push(`/channels/${channelId}`)
        logWithLevel('SUCCESS', 'Redirect success', { attempt: redirectAttempts.current })
      } catch (error) {
        logWithLevel('ERROR', 'Redirect failure', { error: error.message })
        setComponentState(prev => ({ ...prev, hasError: true, error: error.message }))
      }
    },
    [router]
  )

  useEffect(() => {
    if (!loading && channels?.length > 0) {
      logWithLevel('STATE', 'Found channels, redirecting to first channel', {
        channelsCount: channels.length
      })
      handleRedirect(channels[0].id)
    } else if (!loading && channels?.length === 0) {
      logWithLevel('WARN', 'No channels found at all', {})
    }
  }, [channels, loading, handleRedirect])

  if (componentState.hasError) {
    return (
      <Layout>
        <div className="p-4 text-red-400">
          Channel Index Error: {componentState.error}
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="p-4 text-gray-100">
        <h1 className="text-xl mb-2">Channels Index</h1>
        {loading ? (
          <div className="animate-pulse">
            <p>Loading channels and workspaces...</p>
          </div>
        ) : (
          <div>
            {workspaces.length === 0 ? (
              <div className="text-yellow-400">
                <p>No workspaces found. Please make sure you are logged in.</p>
                <p>If this persists, try refreshing the page.</p>
              </div>
            ) : (
              <>
                <p>Current workspace: {workspaces[0]?.name}</p>
                <p>Channels found: {channels.length}</p>
                {channels.length === 0 && (
                  <p className="text-yellow-400 mt-2">
                    No channels found in this workspace yet.
                  </p>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </Layout>
  )
}