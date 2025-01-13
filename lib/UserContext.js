import { createContext, useState, useEffect, useCallback } from 'react'
import { supabase } from './supabaseClient'
import { logger } from './logger'

export const UserContext = createContext({})

export const UserContextProvider = (props) => {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchUserData = useCallback(async (userId) => {
    try {
      const { data, error } = await supabase
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
          created_at,
          updated_at
        `)
        .eq('id', userId)
        .single()
      if (error) {
        return null
      }
      return data
    } catch (err) {
      return null
    }
  }, [])

  useEffect(() => {
    let mounted = true
    const initSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        const userData = await fetchUserData(session.user.id)
        if (userData) {
          setUser({ ...session.user, ...userData })
        } else {
          setUser(session.user)
        }
      } else {
        setUser(null)
      }
      setSession(session)
      setLoading(false)
    }
    initSession()

    const { data: listener } = supabase.auth.onAuthStateChange(async (event, sess) => {
      if (sess?.user) {
        const userData = await fetchUserData(sess.user.id)
        if (userData) {
          setUser({ ...sess.user, ...userData })
        } else {
          setUser(sess.user)
        }
        setSession(sess)
      } else {
        setUser(null)
        setSession(null)
      }
      setLoading(false)
    })

    return () => {
      listener.subscription.unsubscribe()
      mounted = false
    }
  }, [fetchUserData])

  return (
    <UserContext.Provider value={{ user, session, loading }}>
      {props.children}
    </UserContext.Provider>
  )
}