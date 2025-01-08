import '~/styles/globals.css'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import UserContext from 'lib/UserContext'
import { supabase } from 'lib/Store'
import LoadingScreen from '~/components/LoadingScreen'
import Layout from '~/components/Layout'

const ensureUserRecord = async (user) => {
  try {
    console.log('🔍 Checking for existing user record:', user.id)
    const { data: existingUser, error: selectError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (selectError) {
      console.error('❌ Error checking for existing user:', selectError)
      throw selectError
    }

    if (existingUser) {
      console.log('✅ Found existing user record:', existingUser.username)
      return existingUser
    }

    console.log('📝 Creating new user record for:', user.email)
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert([{ 
        id: user.id,
        username: user.email.split('@')[0],
        email: user.email,
        status: 'ONLINE',
        avatar_url: null
      }])
      .select()
      .single()
    
    if (insertError) {
      console.error('❌ Error creating user record:', insertError)
      throw insertError
    }

    console.log('✅ Created new user record:', newUser.username)
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

  useEffect(() => {
    if (!router.isReady) return

    let authSubscription = null

    // Handle auth state changes
    const handleAuthChange = async (event, session) => {
      try {
        console.log('🔐 Auth state changed:', event, session?.user?.email)
        
        if (event !== 'TOKEN_REFRESHED') {
          setIsLoading(true)
        }
        
        if (session?.user) {
          console.log('👤 Ensuring user record...')
          try {
            const dbUser = await ensureUserRecord(session.user)
            console.log('✅ User record confirmed:', dbUser.username)
            setUser({ ...session.user, dbUser })
            setAuthError(null)
            
            if (router.pathname === '/') {
              console.log('🔄 Redirecting to channels...')
              await router.push('/channels/1')
            }
          } catch (error) {
            console.error('❌ Failed to ensure user record:', error)
            setAuthError(error.message)
            await supabase.auth.signOut()
            setUser(null)
            await router.push('/')
          }
        } else {
          console.log('⚠️ No session user, clearing state')
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
        if (event !== 'TOKEN_REFRESHED') {
          setIsLoading(false)
        }
      }
    }

    const setupAuth = async () => {
      try {
        // Initialize Supabase auth
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('❌ Error getting session:', error)
          setAuthError(error.message)
          setIsLoading(false)
          return
        }

        console.log('🔍 Initial session check:', data?.session ? 'Found session' : 'No session')
        await handleAuthChange('INITIAL', data?.session)

        // Set up auth state change subscription
        const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthChange)
        authSubscription = subscription

      } catch (error) {
        console.error('❌ Error in setupAuth:', error)
        setAuthError(error.message)
        setIsLoading(false)
      }
    }

    setupAuth()

    return () => {
      console.log('🧹 Cleaning up auth subscription')
      if (authSubscription) {
        authSubscription.unsubscribe()
      }
    }
  }, [router.isReady, router.pathname])

  const value = {
    user,
    signOut: async () => {
      try {
        setIsLoading(true)
        const { error } = await supabase.auth.signOut()
        if (error) throw error
        setUser(null)
        await router.push('/')
      } catch (error) {
        console.error('Error signing out:', error)
        setAuthError(error.message)
      } finally {
        setIsLoading(false)
      }
    }
  }

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

  return (
    <UserContext.Provider value={value}>
      {router.pathname === '/' ? (
        <Component {...pageProps} />
      ) : (
        <Layout>
          <Component {...pageProps} />
        </Layout>
      )}
    </UserContext.Provider>
  )
}
