import '~/styles/style.css'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import UserContext from 'lib/UserContext'
import { supabase } from 'lib/Store'
import LoadingScreen from '~/components/LoadingScreen'

const ensureUserRecord = async (user) => {
  try {
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (existingUser) {
      return existingUser
    }

    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert([{ 
        id: user.id,
        username: user.email.split('@')[0],
        status: 'ONLINE'
      }])
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
    if (!router.isReady) return

    // Handle auth state changes
    const handleAuthChange = async (event, session) => {
      console.log('Auth state changed:', event, session)
      console.log('Current pathname:', router.pathname)
      console.log('Router ready:', router.isReady)
      
      // Only process certain auth events
      if (!['SIGNED_IN', 'SIGNED_OUT', 'INITIAL'].includes(event)) {
        console.log('Skipping auth event:', event)
        return
      }

      if (session?.user) {
        console.log('Session user found:', session.user.email)
        try {
          console.log('Ensuring user record...')
          const dbUser = await ensureUserRecord(session.user)
          console.log('DB User:', dbUser)
          
          // Set user state
          setUser({ ...session.user, dbUser })
          
          // Handle redirect
          if (router.pathname === '/') {
            console.log('On home page, redirecting to channels...')
            await router.push('/channels/1')
            console.log('Redirect complete')
          } else {
            console.log('Not on home page, current path:', router.pathname)
          }
        } catch (error) {
          console.error('Error handling auth change:', error)
          setUser(null)
        }
      } else {
        console.log('No session user, clearing state')
        setUser(null)
        if (router.pathname !== '/') {
          await router.push('/')
        }
      }
      setIsLoading(false)
    }

    // Set up auth subscription
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthChange)

    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleAuthChange('INITIAL', session)
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [router.isReady, router.pathname])

  const signOut = async () => {
    try {
      setIsLoading(true)
      await supabase.auth.signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <UserContext.Provider value={{ user, signOut }}>
      {isLoading && <LoadingScreen />}
      <Component {...pageProps} />
    </UserContext.Provider>
  )
}
