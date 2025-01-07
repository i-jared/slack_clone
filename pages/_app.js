import '~/styles/style.scss'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import UserContext from 'lib/UserContext'
import { supabase } from 'lib/Store'
import { jwtDecode } from 'jwt-decode'

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
        try {
          const jwt = jwtDecode(session.access_token)
          currentUser.appRole = jwt.user_role
          
          // Just fetch the user record, don't create
          const { data: dbUser } = await supabase
            .from('users')
            .select('*')
            .eq('id', currentUser.id)
            .single()
            
          if (dbUser) {
            currentUser.dbUser = dbUser
            setUser(currentUser)
            setUserLoaded(true)
            router.push('/channels/1')
          } else {
            console.error('User record not found')
            setUser(null)
            setUserLoaded(false)
          }
        } catch (error) {
          console.error('Error in saveSession:', error)
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
