import '~/styles/style.scss'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import UserContext from 'lib/UserContext'
import { supabase } from 'lib/Store'
import { jwtDecode } from 'jwt-decode'

const ensureUserRecord = async (user) => {
  if (!user) return null
  
  try {
    // Check if user record exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (!existingUser) {
      // Create user record if it doesn't exist
      const { error: insertError } = await supabase
        .from('users')
        .insert([
          { 
            id: user.id,
            username: user.email.split('@')[0],
            status: 'ONLINE'
          }
        ])
      
      if (insertError) {
        console.error('Error creating user record:', insertError)
        return null
      }
      
      // Fetch the created user
      const { data: newUser } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()
        
      return newUser
    }
    
    return existingUser
  } catch (error) {
    console.error('Error ensuring user record:', error)
    return null
  }
}

export default function SupabaseSlackClone({ Component, pageProps }) {
  const [userLoaded, setUserLoaded] = useState(false)
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const router = useRouter()

  useEffect(() => {
    async function saveSession(session) {
      setSession(session)
      const currentUser = session?.user
      
      if (session) {
        const jwt = jwtDecode(session.access_token)
        currentUser.appRole = jwt.user_role
        
        // Ensure user record exists in the database
        const dbUser = await ensureUserRecord(currentUser)
        if (dbUser) {
          currentUser.dbUser = dbUser
          setUser(currentUser)
          setUserLoaded(true)
          router.push('/channels/[id]', '/channels/1')
        } else {
          console.error('Failed to ensure user record exists')
          setUser(null)
          setUserLoaded(false)
        }
      } else {
        setUser(null)
        setUserLoaded(false)
      }
    }

    supabase.auth.getSession().then(({ data: { session } }) => saveSession(session))

    const authListener = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session)
      await saveSession(session)
    })

    return () => {
      authListener.data.subscription.unsubscribe()
    }
  }, [])

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (!error) {
      router.push('/')
    }
  }

  return (
    <UserContext.Provider
      value={{
        userLoaded,
        user,
        signOut,
      }}
    >
      <Component {...pageProps} />
    </UserContext.Provider>
  )
}
