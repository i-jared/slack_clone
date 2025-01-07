import '~/styles/style.css'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import UserContext from 'lib/UserContext'
import { supabase } from 'lib/Store'
import { jwtDecode } from 'jwt-decode'
import LoadingScreen from '~/components/LoadingScreen'

const ensureUserRecord = async (user) => {
  try {
    // First check if user exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (existingUser) {
      return existingUser
    }

    // Create new user record if doesn't exist
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert([
        { 
          id: user.id,
          username: user.email.split('@')[0],
          status: 'ONLINE'
        }
      ])
      .select()
      .single()
    
    if (insertError) throw insertError
    return newUser
  } catch (error) {
    console.error('Error in ensureUserRecord:', error)
    return null
  }
}

export default function App({ Component, pageProps }) {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    // Handle route change loading states
    const handleStart = () => setIsLoading(true)
    const handleComplete = () => setIsLoading(false)

    router.events.on('routeChangeStart', handleStart)
    router.events.on('routeChangeComplete', handleComplete)
    router.events.on('routeChangeError', handleComplete)

    // Initial auth check
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user && mounted) {
          const dbUser = await ensureUserRecord(session.user)
          setUser({ ...session.user, dbUser })
          
          // Only redirect if we're on the home page
          if (router.pathname === '/') {
            await router.push('/channels/1')
          }
        }
      } catch (error) {
        console.error('Error checking session:', error)
      } finally {
        if (mounted) {
          setIsLoading(false)
        }
      }
    }

    getInitialSession()

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session)
      
      if (mounted) {
        if (session?.user) {
          const dbUser = await ensureUserRecord(session.user)
          setUser({ ...session.user, dbUser })
          
          // Redirect to chat on login/signup
          if (event === 'SIGNED_IN' || event === 'SIGNED_UP') {
            await router.push('/channels/1')
          }
        } else {
          setUser(null)
          // Redirect to home on signout
          if (event === 'SIGNED_OUT') {
            await router.push('/')
          }
        }
      }
    })

    return () => {
      mounted = false
      router.events.off('routeChangeStart', handleStart)
      router.events.off('routeChangeComplete', handleComplete)
      router.events.off('routeChangeError', handleComplete)
      subscription?.unsubscribe()
    }
  }, [router])

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      await router.push('/')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <UserContext.Provider value={{ user, signOut }}>
      {isLoading && <LoadingScreen />}
      <Component {...pageProps} />
    </UserContext.Provider>
  )
}
