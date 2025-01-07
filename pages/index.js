import { useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '~/lib/Store'
import Starfield from '~/components/Starfield'

const LoadingSpinner = () => (
  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
    try {
      setIsLoading(true)
      const { data: { user }, error } = type === 'LOGIN' 
        ? await supabase.auth.signInWithPassword({ email: username, password })
        : await supabase.auth.signUp({ email: username, password })
      
      if (error) throw error

      if (user) {
        if (type === 'SIGNUP') {
          await createUserRecord(user)
        }
        router.push('/channels/1')
      }
    } catch (error) {
      console.log('Error during authentication:', error)
      alert(error.error_description || error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full h-full flex justify-center items-center p-4 bg-gray-800">
      <Starfield />
      <div className="w-full sm:w-1/2 xl:w-1/3">
        <div className="text-center mb-8">
          <h1 className="talk2d2-logo text-4xl mb-4">Talk2D2</h1>
          <p className="text-yellow-400">Your Galactic Chat Hub</p>
        </div>
        <div className="sw-modal p-8 rounded-lg shadow-lg">
          <div className="mb-4">
            <label className="font-bold text-yellow-400 block mb-2">Email</label>
            <input
              type="email"
              className="block appearance-none w-full bg-gray-900 border border-gray-700 hover:border-yellow-400 px-2 py-2 rounded shadow sw-input text-white"
              placeholder="your.email@example.com"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="mb-4">
            <label className="font-bold text-yellow-400 block mb-2">Password</label>
            <input
              type="password"
              className="block appearance-none w-full bg-gray-900 border border-gray-700 hover:border-yellow-400 px-2 py-2 rounded shadow sw-input text-white"
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
              className={`sw-button ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              } py-2 px-4 rounded text-center transition duration-150 flex items-center justify-center`}
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
              className={`sw-button ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              } py-2 px-4 rounded w-full text-center transition duration-150 flex items-center justify-center`}
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
