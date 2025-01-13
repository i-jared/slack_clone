// FULL UPDATED CODE
import { useState, useEffect, useContext } from 'react'
import { useRouter } from 'next/router'
import { UserContext } from '../lib/UserContext'
import { supabase } from '../lib/supabaseClient'
import LoadingScreen from '../components/LoadingScreen'
import { logger } from '../lib/logger'

// Test terminal logging
logger.log('=== INDEX PAGE LOADED ===')
logger.info('Testing terminal logging from index page')
logger.debug('Debug info will appear in terminal')
logger.warn('Warnings will show in terminal')
logger.error('Errors will display in terminal')

console.log('Direct console.log test - should appear in terminal')
console.info('Direct console.info test - should appear in terminal')
console.warn('Direct console.warn test - should appear in terminal')
console.error('Direct console.error test - should appear in terminal')

export default function Home() {
  const [redirecting, setRedirecting] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      setRedirecting(true)
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        // Attempt to fetch channels
        const { data: channels } = await supabase
          .from('channels')
          .select('id')
          .limit(1)

        if (channels && channels.length > 0) {
          router.push(`/channels/${channels[0].id}`)
        } else {
          router.push('/channels')
        }
      } else {
        router.push('/auth')
      }
      setRedirecting(false)
    }
    checkUser()
  }, [router])

  if (redirecting) {
    return <LoadingScreen message="Redirecting..." />
  }
  return null
}