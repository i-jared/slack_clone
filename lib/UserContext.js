import { createContext, useEffect, useState } from 'react'
import { supabase } from './Store'

export const UserContext = createContext({})

export const UserContextProvider = (props) => {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const value = {
    session,
    user,
    loading
  }

  return (
    <UserContext.Provider value={value}>
      {!loading && props.children}
    </UserContext.Provider>
  )
}

// random content