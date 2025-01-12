import { createContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '~/lib/supabaseClient'
import { logger } from '~/lib/logger'

const userLogger = logger.withPrefix('UserContext')

export const UserContext = createContext({})

export const UserContextProvider = (props) => {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchUserData = useCallback(async (userId) => {
    try {
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
        .eq('id', userId)
        .single()

      if (error) {
        userLogger.error('Error fetching user data:', error)
        return null
      }

      return userData
    } catch (err) {
      userLogger.error('Unexpected error fetching user data:', err)
      return null
    }
  }, [])

  const handleAuthChange = useCallback(async (event, session) => {
    userLogger.debug('Auth state changed:', { event, userId: session?.user?.id })
    
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
  }, [fetchUserData])

  useEffect(() => {
    let mounted = true
    
    // Get initial session
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (mounted) {
          await handleAuthChange('INITIAL', session)
        }
      } catch (err) {
        userLogger.error('Error getting initial session:', err)
        if (mounted) {
          setLoading(false)
        }
      }
    }

    initializeAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthChange)

    return () => {
      mounted = false
      subscription?.unsubscribe()
    }
  }, [handleAuthChange])

  const value = {
    session,
    user,
    loading,
    supabase // Expose the supabase instance through context
  }

  return (
    <UserContext.Provider value={value}>
      {!loading && props.children}
    </UserContext.Provider>
  )
}

// random content