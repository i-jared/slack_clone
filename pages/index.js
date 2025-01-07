import { useState, useEffect, useContext } from 'react'
import { supabase } from '~/lib/Store'
import Head from 'next/head'
import { useRouter } from 'next/router'
import UserContext from '~/lib/UserContext'

export default function Home() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { user } = useContext(UserContext)

  // If user is already logged in, redirect to channels
  useEffect(() => {
    console.log('Index page useEffect - User state:', user)
    if (user) {
      console.log('User found, redirecting to channels...')
      router.push('/channels/1')
    }
  }, [user, router])

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
      } else {
        const { data, error } = await supabase.auth.signUp({ 
          email: username, 
          password,
          options: {
            data: {
              username: username.split('@')[0]
            }
          }
        })
        console.log('Signup response:', { data, error })
        if (error) throw error
        
        // Only show verification message if email confirmation is pending
        if (!data.session && data.user?.identities?.length === 0) {
          alert('Please check your email for verification')
        }
      }
    } catch (error) {
      console.error('Error:', error.message)
      alert(error.message)
    } finally {
      setIsLoading(false)
    }
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
        <div className="text-center mb-12 transform hover:scale-105 transition-transform duration-300">
          <h1 className="text-6xl font-orbitron text-yellow-400 mb-4 animate-pulse-glow">
            Talk2D2
          </h1>
          <p className="text-blue-400 text-lg animate-float">
            Your Galactic Chat Hub
          </p>
        </div>

        <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-lg p-8 shadow-2xl border border-gray-700">
          <div className="space-y-6">
            <div>
              <label className="text-yellow-400 block mb-2 font-orbitron">Email</label>
              <input
                type="email"
                className="w-full px-4 py-2 rounded bg-gray-900 border border-gray-700 text-white focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400 transition-all duration-300"
                placeholder="Your email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="text-yellow-400 block mb-2 font-orbitron">Password</label>
              <input
                type="password"
                className="w-full px-4 py-2 rounded bg-gray-900 border border-gray-700 text-white focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400 transition-all duration-300"
                placeholder="Your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-4">
              <button
                onClick={() => handleLogin('SIGNUP', username, password)}
                disabled={isLoading}
                className="w-full py-3 rounded font-orbitron bg-yellow-500 hover:bg-yellow-400 text-black transition-colors duration-300 flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <span className="animate-spin">⚡</span>
                    <span>Connecting to the Force...</span>
                  </>
                ) : (
                  'Join the Alliance'
                )}
              </button>

              <button
                onClick={() => handleLogin('LOGIN', username, password)}
                disabled={isLoading}
                className="w-full py-3 rounded font-orbitron bg-blue-600 hover:bg-blue-500 text-white transition-colors duration-300 flex items-center justify-center disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <span className="animate-spin">⚡</span>
                    <span>Authenticating...</span>
                  </>
                ) : (
                  'Access Granted'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
