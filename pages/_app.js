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
  const [authError, setAuthError] = useState(null)

  const updateStatus = async (userId, newStatus) => {
    if (!userId) return
    try {
      await supabase
        .from('users')
        .update({ status: newStatus })
        .eq('id', userId)
    } catch (err) {
      console.error('Failed to update user status:', err.message)
    }
  }

  useEffect(() => {
    if (!router.isReady) return

    let authSubscription = null

    const handleAuthChange = async (event, session) => {
      if (event !== 'TOKEN_REFRESHED') setIsLoading(true)
      try {
        if (session?.user) {
          // Ensure user record and set user status to ONLINE
          const dbUser = await ensureUserRecord(session.user)
          await updateStatus(dbUser.id, 'ONLINE')
          setUser({ ...session.user, dbUser })
          setAuthError(null)
          if (router.pathname === '/') {
            await router.push('/channels/1')
          }
        } else {
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
        // Always clear loading state unless it's a token refresh
        if (event !== 'TOKEN_REFRESHED') setIsLoading(false)
      }
    }

    const setupAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        if (error) {
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
        setAuthError(error.message)
        setIsLoading(false)
      }
    }

    setupAuth()

    return () => {
      if (authSubscription) {
        authSubscription.unsubscribe()
      }
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
      console.log('Unauthorized access, redirecting to login...')
      router.push('/')
    }
  }, [router.isReady, router.pathname, user, isLoading])

  // Add navigation loading state
  useEffect(() => {
    let loadingTimeout;

    const handleStart = () => {
      // Clear any existing timeout
      if (loadingTimeout) {
        clearTimeout(loadingTimeout)
      }
      setIsLoading(true)
    }

    const handleComplete = () => {
      // Add a small delay before hiding the loading screen
      loadingTimeout = setTimeout(() => {
        setIsLoading(false)
      }, 300)
    }

    const handleError = () => {
      if (loadingTimeout) {
        clearTimeout(loadingTimeout)
      }
      setIsLoading(false)
    }

    // Handle visibility change
    const handleVisibilityChange = () => {
      if (!document.hidden && isLoading) {
        // If we return to the tab and loading is still shown, clear it
        handleComplete()
      }
    }

    router.events.on('routeChangeStart', handleStart)
    router.events.on('routeChangeComplete', handleComplete)
    router.events.on('routeChangeError', handleError)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      router.events.off('routeChangeStart', handleStart)
      router.events.off('routeChangeComplete', handleComplete)
      router.events.off('routeChangeError', handleError)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      if (loadingTimeout) {
        clearTimeout(loadingTimeout)
      }
    }
  }, [router, isLoading])

  if (isLoading) {
    return <LoadingScreen message="Establishing connection to the Galactic Network..." />
  }

  if (authError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="p-4 bg-red-900/50 text-red-200 rounded-lg">
          {authError}
        </div>
      </div>
    )
  }

  const value = {
    user,
    signOut
  }

  return (
    <UserContext.Provider value={value}>
      {router.pathname === '/' ? (
        <Component {...pageProps} />
      ) : (
        <Component {...pageProps} />
      )}
    </UserContext.Provider>
  )
}
