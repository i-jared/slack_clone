import { useState } from 'react'
import { supabase } from 'lib/Store'
import { useRouter } from 'next/router'

const LoadingSpinner = () => (
  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
)

const Home = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const createUserRecord = async (user) => {
    try {
      // First check if user exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .single()

      if (!existingUser) {
        // Create new user record
        const { error: insertError } = await supabase
          .from('users')
          .insert([
            { 
              id: user.id,
              username: user.email.split('@')[0],
              status: 'ONLINE'
            }
          ])
        
        if (insertError) throw insertError
        
        // Verify the user was created
        const { data: newUser, error: verifyError } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single()
          
        if (verifyError) throw verifyError
        if (!newUser) throw new Error('Failed to verify user creation')
        
        return false // New user
      }
      return true // Existing user
    } catch (error) {
      console.error('Error in createUserRecord:', error)
      throw error
    }
  }

  const handleLogin = async (type, username, password) => {
    if (!username || !password) {
      alert('Please enter both email and password')
      return
    }

    try {
      setIsLoading(true)
      console.log(`Attempting ${type} with email: ${username}`)
      let authResponse

      if (type === 'LOGIN') {
        // First attempt login
        console.log('Attempting login with Supabase auth...')
        authResponse = await supabase.auth.signInWithPassword({ 
          email: username, 
          password 
        })
        
        console.log('Auth response:', JSON.stringify(authResponse, null, 2))
        
        if (authResponse.error) throw authResponse.error
        if (!authResponse.data?.user) throw new Error('No user returned from login')

        try {
          console.log('Creating/verifying user record...')
          // Then create/verify user record
          const isExistingUser = await createUserRecord(authResponse.data.user)
          console.log('User record status:', isExistingUser ? 'existing' : 'new')
          
          // Finally attempt redirect
          console.log('Attempting redirect to /channels/1...')
          const result = await router.push('/channels/1')
          console.log('Redirect result:', result)
          
          if (!result) {
            throw new Error('Failed to redirect to channels')
          }
        } catch (error) {
          console.error('Post-login error:', error)
          // Sign out if profile setup fails
          await supabase.auth.signOut()
          throw new Error(`Login successful but profile setup failed: ${error.message}`)
        }
      } else {
        // Sign up flow
        console.log('Attempting signup with Supabase auth...')
        authResponse = await supabase.auth.signUp({
          email: username,
          password,
          options: {
            data: {
              username: username.split('@')[0]
            }
          }
        })

        console.log('Signup response:', JSON.stringify(authResponse, null, 2))

        if (authResponse.error) {
          if (authResponse.error.message === 'User already registered') {
            alert('This email is already registered. Please try logging in instead.')
            return
          }
          throw authResponse.error
        }

        if (!authResponse.data?.user) {
          alert('Signup successful! Please check your email for confirmation.')
          return
        }

        try {
          console.log('Creating user record for new signup...')
          await createUserRecord(authResponse.data.user)
          console.log('Attempting redirect after signup...')
          const result = await router.push('/channels/1')
          console.log('Redirect result:', result)
          
          if (!result) {
            throw new Error('Failed to redirect to channels')
          }
        } catch (error) {
          console.error('Error creating user record:', error)
          // Sign out if profile setup fails
          await supabase.auth.signOut()
          throw new Error(`Account created but profile setup failed: ${error.message}`)
        }
      }
    } catch (error) {
      console.error('Auth error:', error)
      alert(error.message || 'An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full h-full flex justify-center items-center p-4 bg-gray-300">
      <div className="w-full sm:w-1/2 xl:w-1/3">
        <div className="border-teal p-8 border-t-12 bg-white mb-6 rounded-lg shadow-lg bg-white">
          <div className="mb-4">
            <label className="font-bold text-grey-darker block mb-2">Email</label>
            <input
              type="email"
              className="block appearance-none w-full bg-white border border-grey-light hover:border-grey px-2 py-2 rounded shadow"
              placeholder="your.email@example.com"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="mb-4">
            <label className="font-bold text-grey-darker block mb-2">Password</label>
            <input
              type="password"
              className="block appearance-none w-full bg-white border border-grey-light hover:border-grey px-2 py-2 rounded shadow"
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="flex flex-col gap-2">
            <button
              onClick={() => handleLogin('SIGNUP', username, password)}
              disabled={isLoading}
              className={`${
                isLoading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-700 hover:bg-indigo-600'
              } text-white py-2 px-4 rounded text-center transition duration-150 flex items-center justify-center`}
            >
              {isLoading ? (
                <>
                  <LoadingSpinner />
                  <span className="ml-2">Please wait...</span>
                </>
              ) : (
                'Sign up'
              )}
            </button>
            <button
              onClick={() => handleLogin('LOGIN', username, password)}
              disabled={isLoading}
              className={`${
                isLoading ? 'border-indigo-400 text-indigo-400 cursor-not-allowed' : 'border-indigo-700 text-indigo-700 hover:bg-indigo-700 hover:text-white'
              } border py-2 px-4 rounded w-full text-center transition duration-150 flex items-center justify-center`}
            >
              {isLoading ? (
                <>
                  <LoadingSpinner />
                  <span className="ml-2">Please wait...</span>
                </>
              ) : (
                'Login'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
