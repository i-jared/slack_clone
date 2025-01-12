import { createContext, useEffect, useState } from 'react'
import { supabase } from './Store'

export const UserContext = createContext({})

export const UserContextProvider = (props) => {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const { data: userData, error } = await supabase
          .from('users')
          .select(`
            id,
            email,
            username,
            display_name,
            phone_number,
            avatar_url,
            description,
            status,
            faction,
            last_seen,
            is_bot,
            preferences,
            ai_persona,
            gamification,
            metadata,
            placeholder_col_1,
            placeholder_col_2
          `)
          .eq('id', session.user.id)
          .single()

        if (!error && userData) {
          setUser({ ...session.user, ...userData })
        } else {
          setUser(session.user)
        }
      } else {
        setUser(null)
      }
      setSession(session)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const { data: userData, error } = await supabase
          .from('users')
          .select(`
            id,
            email,
            username,
            display_name,
            phone_number,
            avatar_url,
            description,
            status,
            faction,
            last_seen,
            is_bot,
            preferences,
            ai_persona,
            gamification,
            metadata,
            placeholder_col_1,
            placeholder_col_2
          `)
          .eq('id', session.user.id)
          .single()

        if (!error && userData) {
          setUser({ ...session.user, ...userData })
        } else {
          setUser(session.user)
        }
      } else {
        setUser(null)
      }
      setSession(session)
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