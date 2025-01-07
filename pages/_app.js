import '~/styles/globals.css'
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
      try {
        console.log('🔐 Auth state changed:', event, session?.user?.email)
        
        if (session?.user) {
          console.log('👤 Ensuring user record...')
          const dbUser = await ensureUserRecord(session.user)
          
          if (!dbUser) {
            console.error('❌ Failed to ensure user record')
            setUser(null)
            setIsLoading(false)
            return
          }

          console.log('✅ User record confirmed:', dbUser.username)
          setUser({ ...session.user, dbUser })
          
          if (router.pathname === '/') {
            console.log('🔄 Redirecting to channels...')
            await router.push('/channels/1')
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
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    // Set up auth subscription
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthChange)

    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('🔍 Checking initial session...')
      handleAuthChange('INITIAL', session)
    })

    return () => {
      console.log('🧹 Cleaning up auth subscription')
      subscription?.unsubscribe()
    }
  }, [router.isReady, router.pathname])

  // Provide auth context
  const value = {
    user,
    signOut: async () => {
      try {
        await supabase.auth.signOut()
        setUser(null)
        router.push('/')
      } catch (error) {
        console.error('Error signing out:', error)
      }
    }
  }

  if (isLoading) {
    return <LoadingScreen message="Establishing connection to the Galactic Network..." />
  }

  return (
    <UserContext.Provider value={value}>
      <Component {...pageProps} />
    </UserContext.Provider>
  )
}
