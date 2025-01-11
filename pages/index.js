import { useState, useEffect, useContext } from 'react'
import { useRouter } from 'next/router'
import { UserContext } from '../lib/UserContext'
import { supabase } from '../lib/Store'
import LoadingScreen from '../components/LoadingScreen'
import Head from 'next/head'

export default function Home() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isSignup, setIsSignup] = useState(false)
  const router = useRouter()
  const { user } = useContext(UserContext)

  useEffect(() => {
    if (user) {
      router.push('/channels/1')
    }
  }, [user, router])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (isSignup) {
      await handleSignup()
    } else {
      await handleLogin()
    }
  }

  const handleSignup = async () => {
    try {
      setIsLoading(true)
      setError(null)
      console.log('Attempting signup')
      
      // Generate username from email
      const baseUsername = email.split('@')[0]
      console.log('Setting username:', baseUsername)
      
      // First sign up with Supabase Auth
      const { data: { user }, error: signupError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: baseUsername,
            full_name: baseUsername
          }
        }
      })

      if (signupError) {
        console.error('Signup error:', signupError)
        setError(signupError.message)
        return
      }

      if (!user) {
        setError('No user data returned')
        return
      }

      console.log('Signup successful:', user)
      
      // Create user profile in users table
      const { error: profileError } = await supabase
        .from('users')
        .insert([{
          id: user.id,
          email: user.email,
          username: baseUsername,
          display_name: baseUsername,
          status: 'ONLINE',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])

      if (profileError) {
        console.error('Error creating user profile:', profileError)
        setError('Error creating user profile: ' + profileError.message)
        return
      }

      // Redirect to channels page
      router.push('/channels/1')
    } catch (error) {
      console.error('Signup error:', error)
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogin = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const { data: { user }, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        setError(error.message)
        return
      }

      router.push('/channels/1')
    } catch (error) {
      console.error('Login error:', error)
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  // If we're already logged in and waiting for redirect, show loading screen
  if (user) {
    return <LoadingScreen message="Preparing your galactic dashboard..." />
  }

  return (
    <div className="flex min-h-screen bg-gray-900">
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-md">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-yellow-400 font-orbitron">
              {isSignup ? 'Create your account' : 'Sign in to your account'}
            </h2>
          </div>

          <div className="mt-8">
            <div className="bg-gray-800 py-8 px-4 shadow-lg sm:rounded-lg sm:px-10">
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                    Email address
                  </label>
                  <div className="mt-1">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full appearance-none rounded-md border border-gray-700 bg-gray-700 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-yellow-500 focus:outline-none focus:ring-yellow-500 sm:text-sm text-white"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                    Password
                  </label>
                  <div className="mt-1">
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete={isSignup ? 'new-password' : 'current-password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full appearance-none rounded-md border border-gray-700 bg-gray-700 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-yellow-500 focus:outline-none focus:ring-yellow-500 sm:text-sm text-white"
                    />
                  </div>
                </div>

                {error && (
                  <div className="rounded-md bg-red-500/10 p-4">
                    <div className="text-sm text-red-400">{error}</div>
                  </div>
                )}

                <div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`flex w-full justify-center rounded-md border border-transparent bg-yellow-500 py-2 px-4 text-sm font-medium text-black shadow-sm hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 ${
                      isLoading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {isLoading ? 'Please wait...' : isSignup ? 'Sign up' : 'Sign in'}
                  </button>
                </div>
              </form>

              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-700" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="bg-gray-800 px-2 text-gray-400">
                      {isSignup ? 'Already have an account?' : 'Need an account?'}
                    </span>
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    type="button"
                    onClick={() => setIsSignup(!isSignup)}
                    className="w-full text-center text-sm text-yellow-400 hover:text-yellow-500"
                  >
                    {isSignup ? 'Sign in instead' : 'Sign up instead'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
