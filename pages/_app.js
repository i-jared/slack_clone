import '~/styles/globals.css'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import UserContext from 'lib/UserContext'
import { supabase } from 'lib/Store'
import LoadingScreen from '~/components/LoadingScreen'
import Layout from '~/components/Layout'

const ensureUserRecord = async (user) => {
  try {
    const { data: existingUser, error: selectError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (selectError) {
      throw selectError
    }

    if (existingUser) {
      return existingUser
    }

    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert([{ 
        id: user.id,
        username: user.email.split('@')[0],
        status: 'ONLINE',
        avatar_url: null
      }])
      .select()
      .single()
    
    if (insertError) {
      throw insertError
    }

    return newUser
  } catch (error) {
    console.error('❌ Error in ensureUserRecord:', error)
    throw error
  }
}

export default function App({ Component, pageProps }) {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isStatusUpdating, setIsStatusUpdating] = useState(false)
  const [isRouteChanging, setIsRouteChanging] = useState(false)
  const [authError, setAuthError] = useState(null)

  // Add debounce function at the top
  const debounce = (func, wait) => {
    let timeout
    return (...args) => {
      clearTimeout(timeout)
      timeout = setTimeout(() => func.apply(this, args), wait)
    }
  }

  const updateStatus = debounce(async (userId, newStatus) => {
    if (!userId) return
    try {
      setIsStatusUpdating(true)
      const timestamp = new Date().toISOString()
      
      // Get fresh session token
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        console.error('No session available for status update')
        return
      }

      // First update local state
      setUser(prev => prev ? {
        ...prev,
        dbUser: { ...prev.dbUser, status: newStatus }
      } : null)

      const { error } = await supabase
        .from('users')
        .update({ 
          status: newStatus,
          last_seen: timestamp
        })
        .eq('id', userId)

      if (error) {
        console.error('Status update error:', error)
        // Revert local state on error
        setUser(prev => prev ? {
          ...prev,
          dbUser: { ...prev.dbUser, status: prev.dbUser.status }
        } : null)
      }
    } catch (err) {
      console.error('Failed to update user status:', err.message)
    } finally {
      setIsStatusUpdating(false)
    }
  }, 1000) // Debounce for 1 second

  // Handle route change loading
  useEffect(() => {
    let routeChangeTimeout;
    let forceLoadTimeout;

    const handleStart = () => {
      setIsRouteChanging(true)
      // Clear any existing timeouts
      if (routeChangeTimeout) clearTimeout(routeChangeTimeout)
      if (forceLoadTimeout) clearTimeout(forceLoadTimeout)

      // Force clear loading after 20 seconds
      forceLoadTimeout = setTimeout(() => {
        setIsRouteChanging(false)
        setIsLoading(false)
      }, 20000)
    }

    const handleComplete = () => {
      // Add a small delay to ensure data is loaded
      routeChangeTimeout = setTimeout(() => {
        setIsRouteChanging(false)
        // Only clear loading if we're not in the middle of an auth change
        if (!isStatusUpdating) {
          setIsLoading(false)
        }
      }, 500)
    }

    const handleError = () => {
      if (routeChangeTimeout) clearTimeout(routeChangeTimeout)
      if (forceLoadTimeout) clearTimeout(forceLoadTimeout)
      setIsRouteChanging(false)
      setIsLoading(false)
    }

    router.events.on('routeChangeStart', handleStart)
    router.events.on('routeChangeComplete', handleComplete)
    router.events.on('routeChangeError', handleError)

    return () => {
      if (routeChangeTimeout) clearTimeout(routeChangeTimeout)
      if (forceLoadTimeout) clearTimeout(forceLoadTimeout)
      router.events.off('routeChangeStart', handleStart)
      router.events.off('routeChangeComplete', handleComplete)
      router.events.off('routeChangeError', handleError)
    }
  }, [router, isStatusUpdating])

  // Handle browser events for online/offline status
  useEffect(() => {
    if (!user?.id) return

    const handleOnline = () => {
      updateStatus(user.id, 'ONLINE')
    }

    const handleOffline = () => {
      updateStatus(user.id, 'OFFLINE')
    }

    // Use BroadcastChannel to sync status across tabs
    const statusChannel = new BroadcastChannel('user_status')
    
    // Track visibility state across tabs
    let visibleTabsCount = 1
    
    statusChannel.onmessage = (event) => {
      if (event.data.type === 'visibility_change') {
        if (event.data.state === 'visible') {
          visibleTabsCount++
          if (visibleTabsCount === 1) {
            updateStatus(user.id, 'ONLINE')
          }
        } else {
          visibleTabsCount--
          if (visibleTabsCount <= 0) {
            updateStatus(user.id, 'OFFLINE')
          }
        }
      }
    }

    const handleVisibilityChange = () => {
      const isVisible = document.visibilityState === 'visible'
      
      // Broadcast visibility change to other tabs
      statusChannel.postMessage({
        type: 'visibility_change',
        state: isVisible ? 'visible' : 'hidden',
        userId: user.id
      })

      // Update status based on visibility
      if (isVisible) {
        updateStatus(user.id, 'ONLINE')
      } else if (visibleTabsCount <= 0) {
        updateStatus(user.id, 'OFFLINE')
      }
    }

    const handleBeforeUnload = () => {
      // Only set offline if this is the last tab
      if (visibleTabsCount <= 1) {
        const timestamp = new Date().toISOString()
        navigator.sendBeacon(
          `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/users?id=eq.${user.id}`,
          JSON.stringify({ 
            status: 'OFFLINE',
            last_seen: timestamp
          }),
          {
            'Content-Type': 'application/json',
            'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${supabase.auth.getSession()?.data?.session?.access_token}`
          }
        )
      }
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('beforeunload', handleBeforeUnload)

    // Set initial status
    if (document.visibilityState === 'visible') {
      updateStatus(user.id, 'ONLINE')
    }

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('beforeunload', handleBeforeUnload)
      statusChannel.close()
    }
  }, [user?.id])

  useEffect(() => {
    if (!router.isReady) return

    let authSubscription = null

    const handleAuthChange = async (event, session) => {
      console.log('Auth change event:', event, 'Session:', session?.user?.email)
      
      // Only skip if it's truly the same session and not a signup/signin
      const { data: { session: currentSession } } = await supabase.auth.getSession()
      if (
        event !== 'INITIAL' &&
        event !== 'SIGNED_IN' &&
        event !== 'SIGNED_UP' &&
        currentSession?.access_token === session?.access_token
      ) {
        console.log('Skipping auth change - same session')
        return
      }

      setIsLoading(true)
      try {
        if (session?.user) {
          console.log('Setting up user after auth change')
          // Ensure user record and set user status to ONLINE
          const dbUser = await ensureUserRecord(session.user)
          await updateStatus(dbUser.id, 'ONLINE')
          setUser({ ...session.user, dbUser })
          setAuthError(null)
          
          // Only redirect if we're on the login page
          if (router.pathname === '/') {
            console.log('Redirecting to channels after auth')
            await router.push('/channels/1')
          }
        } else {
          console.log('No session, cleaning up')
          // No session user => set OFFLINE if we previously had a user
          if (user?.id) {
            await updateStatus(user.id, 'OFFLINE')
          }
          setUser(null)
          if (router.pathname !== '/') {
            await router.push('/')
          }
        }
      } catch (error) {
        console.error('❌ Error in auth change:', error)
        setAuthError(error.message)
        setUser(null)
        await router.push('/')
      } finally {
        // Only clear loading if we're not in the middle of a route change
        if (!isRouteChanging) {
          setIsLoading(false)
        }
      }
    }

    const setupAuth = async () => {
      try {
        console.log('Setting up auth...')
        const { data, error } = await supabase.auth.getSession()
        if (error) {
          console.error('Error getting session:', error)
          setAuthError(error.message)
          setIsLoading(false)
          return
        }
        await handleAuthChange('INITIAL', data?.session)

        const {
          data: { subscription }
        } = supabase.auth.onAuthStateChange(handleAuthChange)
        authSubscription = subscription
      } catch (error) {
        console.error('Error in setupAuth:', error)
        setAuthError(error.message)
        setIsLoading(false)
      }
    }

    setupAuth()

    return () => {
      if (authSubscription) authSubscription.unsubscribe()
    }
  }, [router.isReady, router.pathname])

  const signOut = async () => {
    try {
      setIsLoading(true)
      // First sign out from Supabase
      const { error } = await supabase.auth.signOut()
      if (error) throw error

      // Then update user status and clean up
      if (user?.id) {
        try {
          await updateStatus(user.id, 'OFFLINE')
        } catch (err) {
          console.error('Failed to update status during sign out:', err)
          // Continue with sign out even if status update fails
        }
      }

      // Clear local state
      setUser(null)
      setAuthError(null)
      
      // Redirect to home
      await router.push('/')
    } catch (error) {
      console.error('Error signing out:', error)
      setAuthError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  // Add route protection
  useEffect(() => {
    if (!router.isReady) return

    // Check if the current route needs authentication
    const isProtectedRoute = router.pathname !== '/'
    const isAuthenticated = !!user

    if (isProtectedRoute && !isAuthenticated && !isLoading) {
      console.log('Route protection check - Path:', router.pathname, 'Auth:', isAuthenticated, 'Loading:', isLoading)
      router.push('/')
    }
  }, [router.isReady, router.pathname, user, isLoading])

  // Show loading screen if any major state change is happening
  if (isLoading || isRouteChanging) {
    console.log('Full loading screen shown - Loading:', isLoading, 'Route changing:', isRouteChanging)
    return <LoadingScreen onHide={() => {
      setIsLoading(false)
      setIsRouteChanging(false)
    }} />
  }

  // Show minimal loading indicator for status updates
  const showMinimalLoading = isStatusUpdating && !isLoading && !isRouteChanging

  return (
    <UserContext.Provider value={{ user, signOut }}>
      <Component {...pageProps} />
      {showMinimalLoading && (
        <div className="fixed bottom-4 right-4 bg-yellow-500 text-black px-4 py-2 rounded-lg opacity-75">
          {isStatusUpdating ? 'Updating status...' : 'Loading...'}
        </div>
      )}
    </UserContext.Provider>
  )
}
