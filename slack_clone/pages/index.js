import { useState, useEffect, useContext } from 'react'
import { useRouter } from 'next/router'
import { UserContext } from '../lib/UserContext'
import { supabase } from '../lib/Store'
import LoadingScreen from '../components/LoadingScreen'

export default function Home() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isSignup, setIsSignup] = useState(false)
  const [redirecting, setRedirecting] = useState(false)
  const router = useRouter()
  const { user } = useContext(UserContext)

  useEffect(() => {
    // If we're already logged in, attempt to find a channel and redirect
    const handleRedirect = async () => {
      if (user) {
        try {
          setRedirecting(true)
          // fetch channels from supabase
          const { data: channelData, error: channelError } = await supabase
            .from('channels')
            .select('id')
            .limit(1)

          if (channelError) {
            console.error('Error fetching channels in Home:', channelError)
          }

          if (channelData && channelData.length > 0) {
            // redirect to the first channel
            router.push(`/channels/${channelData[0].id}`)
          } else {
            // fallback if no channel
            router.push('/channels')
          }
        } finally {
          setRedirecting(false)
        }
      }
    }

    handleRedirect()
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

      if (!email || !password) {
        setError('Please provide both email and password')
        setIsLoading(false)
        return
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters')
        setIsLoading(false)
        return
      }

      // Attempt signup
      const { data: signUpResult, error: signupError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: typeof window !== 'undefined' ? window.location.origin : undefined
        }
      })

      if (signupError) {
        if (signupError.message.includes('already registered')) {
          setError('That email is already registered. Please sign in instead.')
        } else {
          console.error('Signup error:', signupError)
          setError(signupError.message || 'Error during signup. Please try again.')
        }
        setIsLoading(false)
        return
      }

      const signedUpUser = signUpResult?.user
      if (!signedUpUser) {
        setError('No user data returned from signup')
        setIsLoading(false)
        return
      }

      // Wait briefly for the DB trigger to create the user row
      await new Promise(resolve => setTimeout(resolve, 2500))

      // Verify profile was created
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('id, email, username')
        .eq('id', signedUpUser.id)
        .single()

      if (profileError) {
        console.error('Error verifying user profile:', profileError)
        setError('Error creating user profile. Please try again.')
        setIsLoading(false)
        return
      }

      if (!profile) {
        console.error('No profile found after signup')
        setError('Error creating user profile. Please try again.')
        setIsLoading(false)
        return
      }

      // Successfully created account and profile
      router.push('/channels')
    } catch (err) {
      console.error('Signup error:', err)
      setError(err.message || 'An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogin = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const { data: loginRes, error: loginErr } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      if (loginErr) {
        setError(loginErr.message)
        setIsLoading(false)
        return
      }
      if (!loginRes?.user) {
        setError('No user returned from signIn')
        setIsLoading(false)
        return
      }

      // Successfully logged in, push them to channels
      router.push('/channels')
    } catch (err) {
      console.error('Login error:', err)
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  if (redirecting) {
    return <LoadingScreen message="Preparing your galactic dashboard..." />
  }

  // If we are already logged in and waiting for redirect, show loading screen
  if (user && !redirecting) {
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