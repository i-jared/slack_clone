import { useState, useEffect, useContext } from 'react'
import { supabase } from '~/lib/Store'
import Head from 'next/head'
import { useRouter } from 'next/router'
import UserContext from '~/lib/UserContext'
import LoadingScreen from '~/components/LoadingScreen'

export default function Home() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [type, setType] = useState(null)
  const router = useRouter()
  const { user } = useContext(UserContext)

  // If user is already logged in, redirect to channels
  useEffect(() => {
    console.log('Index page useEffect - User state:', user)
    if (user) {
      console.log('User found, redirecting to channels...')
      router.push('/channels/1')
    }
  }, [user])

  const handleLogin = async (type, username, password) => {
    try {
      setIsLoading(true)
      console.log('Attempting', type)
      
      if (type === 'LOGIN') {
        const { data, error } = await supabase.auth.signInWithPassword({ 
          email: username, 
          password 
        })
        console.log('Login response:', { data, error })
        if (error) throw error
        
        // Redirect after successful login
        if (data?.session) {
          router.push('/channels/1')
        }
      } else {
        // For signup, set the username to the part before @ in email
        const usernameToSet = username.split('@')[0]
        console.log('Setting username:', usernameToSet)
        
        const { data, error } = await supabase.auth.signUp({ 
          email: username, 
          password,
          options: {
            data: {
              username: usernameToSet
            }
          }
        })
        console.log('Signup response:', { data, error })
        if (error) throw error
        
        // After signup, update the username in the users table
        if (data?.user) {
          const { error: updateError } = await supabase
            .from('users')
            .update({ username: usernameToSet })
            .eq('id', data.user.id)
          
          if (updateError) {
            console.error('Error updating username:', updateError)
          }
        }
        
        // Redirect after successful signup
        if (data?.session) {
          router.push('/channels/1')
        }
      }
    } catch (error) {
      console.error('Error:', error.message)
      alert(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  // If we're already logged in and waiting for redirect, show loading screen
  if (user) {
    return <LoadingScreen message="Preparing your galactic dashboard..." />
  }

  return (
    <div className="flex min-h-screen bg-gray-900 items-center justify-center relative overflow-hidden">
      <Head>
        <title>Talk2D2 - Your Galactic Chat Hub</title>
      </Head>

      {/* Animated stars background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-900 via-gray-900 to-black">
        <div className="stars"></div>
        <div className="twinkling"></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 w-full max-w-md p-8">
        <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-lg shadow-2xl p-8 border border-gray-700">
          <div className="text-center mb-8">
            <h1 className="talk2d2-logo text-6xl mb-4">Talk2D2</h1>
            <p className="text-gray-400 font-orbitron">Your Galactic Chat Hub</p>
          </div>

          {isLoading ? (
            <LoadingScreen message={
              type === 'SIGNUP' 
                ? "Registering with the Rebel Alliance..." 
                : "Verifying Imperial credentials..."
            } />
          ) : (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Galactic ID (Email)
                </label>
                <input
                  type="email"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="sw-input w-full px-4 py-3 rounded bg-gray-700 text-white focus:outline-none"
                  placeholder="luke@rebellion.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Secret Code (Password)
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="sw-input w-full px-4 py-3 rounded bg-gray-700 text-white focus:outline-none"
                  placeholder="••••••••"
                />
              </div>

              <div className="space-y-4">
                <button
                  onClick={() => {
                    setType('SIGNUP')
                    handleLogin('SIGNUP', username, password)
                  }}
                  disabled={isLoading}
                  className="sw-button w-full py-3 rounded font-orbitron"
                >
                  Join the Alliance
                </button>

                <button
                  onClick={() => {
                    setType('LOGIN')
                    handleLogin('LOGIN', username, password)
                  }}
                  disabled={isLoading}
                  className="sw-button w-full py-3 rounded font-orbitron"
                >
                  Access Granted
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
