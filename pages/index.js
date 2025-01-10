import { useState, useEffect, useContext } from 'react'
import { supabase } from '~/lib/Store'
import Head from 'next/head'
import { useRouter } from 'next/router'
import UserContext from '~/lib/UserContext'
import LoadingScreen from '~/components/LoadingScreen'
import { generateStars, generateStaticStars, generateNebula } from '../lib/starUtils'

export default function Home() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [type, setType] = useState(null)
  const [isRedirecting, setIsRedirecting] = useState(false)
  const router = useRouter()
  const { user } = useContext(UserContext)

  // If user is already logged in, redirect to channels
  useEffect(() => {
    if (user && !isRedirecting) {
      console.log('User found, redirecting to channels...')
      setIsRedirecting(true)
      router.push('/channels/1').catch(console.error)
    }
  }, [user, router, isRedirecting])

  // Show loading screen only during actual redirect
  if (isRedirecting) {
    return <LoadingScreen message="Preparing your galactic dashboard..." />
  }

  // If user exists but we haven't started redirecting, don't render anything
  if (user) {
    return null
  }

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

  return (
    <div className="flex min-h-screen bg-[#0A0C10] items-center justify-center relative overflow-hidden">
      <Head>
        <title>Talk2D2 - Your Galactic Chat Hub</title>
        <style jsx global>{`
          :root {
            --stars-small: ${generateStars(40000, 1)};
            --stars-medium: ${generateStars(30000, 2)};
            --stars-large: ${generateStars(20000, 3)};
            --stars-static: ${generateStaticStars(20000)};
            --stars-twinkle: ${generateStaticStars(10000)};
            --nebula: ${generateNebula(40)};
          }
        `}</style>
      </Head>

      {/* Enhanced Star field background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#0A0C10] via-[#0A0C10] to-black overflow-hidden">
        {/* Deep space gradient for depth */}
        <div className="absolute inset-0 bg-gradient-radial from-transparent via-blue-900/5 to-purple-900/10"></div>
        
        {/* Nebula layers - behind everything */}
        <div className="nebula-layer"></div>
        <div className="nebula-layer-2"></div>
        
        {/* Static star layers - create depth */}
        <div className="stars-static"></div>
        <div className="stars-static" style={{ opacity: 0.8, transform: 'scale(1.2)' }}></div>
        <div className="stars-static" style={{ opacity: 0.6, transform: 'scale(1.4)' }}></div>
        <div className="stars-static" style={{ opacity: 0.4, transform: 'scale(1.6)' }}></div>
        <div className="stars-twinkle"></div>
        <div className="stars-twinkle" style={{ opacity: 0.7, transform: 'scale(1.3)' }}></div>
        <div className="stars-twinkle" style={{ opacity: 0.5, transform: 'scale(1.6)' }}></div>
        <div className="stars-twinkle" style={{ opacity: 0.3, transform: 'scale(1.9)' }}></div>
        
        {/* Moving star layers - multiple instances for fuller coverage */}
        <div className="stars-small"></div>
        <div className="stars-small"></div>
        <div className="stars-small"></div>
        <div className="stars-small"></div>
        <div className="stars-small" style={{ opacity: 0.7, transform: 'scale(1.2)' }}></div>
        <div className="stars-small" style={{ opacity: 0.5, transform: 'scale(1.4)' }}></div>
        
        <div className="stars-medium"></div>
        <div className="stars-medium"></div>
        <div className="stars-medium"></div>
        <div className="stars-medium" style={{ opacity: 0.8, transform: 'scale(1.1)' }}></div>
        <div className="stars-medium" style={{ opacity: 0.6, transform: 'scale(1.3)' }}></div>
        
        <div className="stars-large"></div>
        <div className="stars-large"></div>
        <div className="stars-large" style={{ opacity: 0.8, transform: 'scale(1.2)' }}></div>
        
        {/* Shooting stars - on top */}
        <div className="shooting-stars" style={{ left: '20%', top: '20%', width: '250px' }}></div>
        <div className="shooting-stars" style={{ left: '60%', top: '35%', animationDelay: '1.5s', width: '200px' }}></div>
        <div className="shooting-stars" style={{ left: '80%', top: '50%', animationDelay: '2.2s', width: '180px' }}></div>
        <div className="shooting-stars" style={{ left: '30%', top: '70%', animationDelay: '3.5s', width: '220px' }}></div>
        <div className="shooting-stars" style={{ left: '10%', top: '40%', animationDelay: '4.2s', width: '190px' }}></div>
        <div className="shooting-stars" style={{ left: '70%', top: '25%', animationDelay: '5s', width: '230px' }}></div>
        <div className="shooting-stars" style={{ left: '40%', top: '60%', animationDelay: '5.8s', width: '210px' }}></div>
        <div className="shooting-stars" style={{ left: '90%', top: '15%', animationDelay: '6.5s', width: '170px' }}></div>
        <div className="shooting-stars" style={{ left: '15%', top: '85%', animationDelay: '7.2s', width: '240px' }}></div>
        <div className="shooting-stars" style={{ left: '85%', top: '45%', animationDelay: '8s', width: '200px' }}></div>
        
        {/* Ambient glow effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-yellow-500/5 via-transparent to-blue-500/5 mix-blend-screen"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/5 via-transparent to-purple-500/5 mix-blend-screen"></div>
        <div className="absolute inset-0 bg-gradient-to-tl from-purple-500/5 via-transparent to-yellow-500/5 mix-blend-screen"></div>
        <div className="absolute bottom-0 left-0 right-0 h-[40vh] bg-gradient-to-t from-yellow-500/10 via-yellow-500/5 to-transparent blur-3xl"></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 w-full max-w-[420px] p-6">
        <div className="bg-[#12141A]/90 backdrop-blur-2xl rounded-2xl shadow-2xl border border-yellow-500/10 overflow-hidden
          shadow-yellow-500/5">
          {/* Logo Section with yellow gradient line */}
          <div className="relative pt-12 pb-8 px-8">
            <div className="text-center">
              <h1 className="talk2d2-logo text-5xl mb-3 bg-gradient-to-r from-yellow-300 to-yellow-500 bg-clip-text text-transparent">
                Talk2D2
              </h1>
              <p className="text-yellow-100/70 font-orbitron text-sm tracking-wide">
                Your Galactic Chat Hub
              </p>
            </div>
            {/* Enhanced decorative line */}
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-yellow-500/20 to-transparent">
              <div className="absolute inset-0 blur-sm bg-gradient-to-r from-transparent via-yellow-500/20 to-transparent"></div>
            </div>
          </div>

          {isLoading ? (
            <div className="px-8 pb-8">
              <LoadingScreen message={
                type === 'SIGNUP' 
                  ? "Registering with the Rebel Alliance..." 
                  : "Verifying Imperial credentials..."
              } />
            </div>
          ) : (
            <div className="px-8 pb-8 space-y-6">
              <div>
                <label className="block text-sm font-medium text-yellow-200/80 mb-1.5 font-orbitron tracking-wide">
                  Galactic ID (Email)
                </label>
                <input
                  type="email"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="sw-input w-full px-4 py-2.5 rounded-xl bg-[#0A0C10]/80 text-yellow-100 font-orbitron text-sm
                    border border-yellow-500/20 
                    focus:outline-none focus:ring-1 focus:ring-yellow-500/30 focus:border-yellow-500/30
                    placeholder:text-yellow-200/20 placeholder:font-orbitron
                    [&:-webkit-autofill]:font-orbitron [&:-webkit-autofill]:text-yellow-100
                    [&:-webkit-autofill]:[background-color:rgb(10,12,16)]
                    [&:-webkit-autofill]:[-webkit-text-fill-color:rgb(254,243,199)]
                    [&:-webkit-autofill]:[box-shadow:0_0_0px_1000px_rgb(10,12,16)_inset]
                    transition-all duration-200 ease-in-out"
                  placeholder="luke@rebellion.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-yellow-200/80 mb-1.5 font-orbitron tracking-wide">
                  Secret Code (Password)
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="sw-input w-full px-4 py-2.5 rounded-xl bg-[#0A0C10]/80 text-yellow-100 font-orbitron text-sm
                    border border-yellow-500/20
                    focus:outline-none focus:ring-1 focus:ring-yellow-500/30 focus:border-yellow-500/30
                    placeholder:text-yellow-200/20 placeholder:font-orbitron
                    [&:-webkit-autofill]:font-orbitron [&:-webkit-autofill]:text-yellow-100
                    [&:-webkit-autofill]:[background-color:rgb(10,12,16)]
                    [&:-webkit-autofill]:[-webkit-text-fill-color:rgb(254,243,199)]
                    [&:-webkit-autofill]:[box-shadow:0_0_0px_1000px_rgb(10,12,16)_inset]
                    transition-all duration-200 ease-in-out"
                  placeholder="••••••••"
                />
              </div>

              <div className="space-y-3 pt-2">
                <button
                  onClick={() => {
                    setType('SIGNUP')
                    handleLogin('SIGNUP', username, password)
                  }}
                  disabled={isLoading}
                  className="sw-button w-full py-2.5 rounded-xl font-orbitron bg-gradient-to-r from-yellow-500 to-yellow-400 text-gray-900 
                    hover:from-yellow-400 hover:to-yellow-300 hover:shadow-lg hover:shadow-yellow-500/10
                    active:scale-[0.98] transition-all duration-200 text-sm font-medium tracking-wide
                    relative overflow-hidden group"
                >
                  <span className="relative z-10">Join the Alliance</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/0 via-white/20 to-yellow-400/0 
                    translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                </button>

                <button
                  onClick={() => {
                    setType('LOGIN')
                    handleLogin('LOGIN', username, password)
                  }}
                  disabled={isLoading}
                  className="sw-button w-full py-2.5 rounded-xl font-orbitron bg-[#0A0C10] text-yellow-400
                    border border-yellow-500/20 hover:border-yellow-400/30 hover:text-yellow-300
                    hover:shadow-lg hover:shadow-yellow-500/5 group
                    active:scale-[0.98] transition-all duration-200 text-sm tracking-wide
                    relative overflow-hidden"
                >
                  <span className="relative z-10">Enter the Command Center</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/0 via-yellow-400/5 to-yellow-400/0 
                    translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
