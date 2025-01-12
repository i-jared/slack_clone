// pages/auth.js
// Thorough fix: Use the updated 'users' table fields (id, email, ...).
// Also handle signUp with new schema.

import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '~/lib/supabaseClient'
import Link from 'next/link'
import Head from 'next/head'

// Test cases:
// 1. Basic signup with email/password
// 2. Signup with duplicate email
// 3. Signup with special email (+supaadmin@)
// 4. Verify profile creation
// 5. Verify username generation

export default function AuthPage() {
  const router = useRouter()
  const [isLogin, setIsLogin] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [testResults, setTestResults] = useState([])

  // Add test result
  const addTestResult = (name, passed, error = null) => {
    console.log('🧪 Test Result:', { name, passed, error })
    setTestResults(prev => [...prev, { name, passed, error }])
  }

  const handleSignUp = async (e) => {
    e.preventDefault()
    const startTime = new Date().toISOString()
    
    // Initial Environment Check
    console.log('🌍 [1/50] Environment Check:', {
      nodeEnv: process.env.NODE_ENV,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      browser: {
        userAgent: window.navigator.userAgent,
        language: window.navigator.language,
        platform: window.navigator.platform,
        vendor: window.navigator.vendor,
        cookiesEnabled: window.navigator.cookieEnabled
      },
      screen: {
        width: window.screen.width,
        height: window.screen.height,
        colorDepth: window.screen.colorDepth,
        pixelDepth: window.screen.pixelDepth
      },
      timestamp: new Date().toISOString()
    })

    // Input Validation
    console.log('📝 [2/50] Input Validation:', {
      email: {
        length: email?.length,
        isValid: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
        domain: email?.split('@')[1]
      },
      password: {
        length: password?.length,
        hasUpperCase: /[A-Z]/.test(password),
        hasLowerCase: /[a-z]/.test(password),
        hasNumbers: /\d/.test(password),
        hasSpecialChars: /[!@#$%^&*(),.?":{}|<>]/.test(password)
      },
      displayName: {
        length: displayName?.length,
        value: displayName || email.split('@')[0]
      },
      timestamp: new Date().toISOString()
    })

    setLoading(true)
    setError(null)

    try {
      // Supabase Client Check
      console.log('🔧 [3/50] Supabase Client Configuration:', {
        auth: {
          autoRefreshToken: supabase.auth.autoRefreshToken,
          persistSession: supabase.auth.persistSession,
          detectSessionInUrl: supabase.auth.detectSessionInUrl,
          flowType: supabase.auth.flowType,
          storageKey: supabase.auth.storageKey,
          currentSession: await supabase.auth.getSession(),
          currentUser: await supabase.auth.getUser()
        },
        config: {
          apiKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '***' : 'missing',
          apiUrl: supabase.supabaseUrl,
          realtimeUrl: supabase.realtimeUrl,
          storageUrl: supabase.storageUrl,
          functionsUrl: supabase.functionsUrl
        },
        headers: supabase.rest.headers,
        timestamp: new Date().toISOString()
      })

      // Database Schema Validation
      console.log('📋 [4/50] Database Schema Validation Starting...')
      
      // Test Users Table
      console.log('👥 [5/50] Testing Users Table...')
      const { data: usersSchema, error: usersSchemaError } = await supabase
        .from('users')
        .select('*')
        .limit(1)
      console.log('📊 Users Table Schema Result:', {
        success: !usersSchemaError,
        error: usersSchemaError,
        columns: usersSchema?.[0] ? Object.keys(usersSchema[0]) : [],
        timestamp: new Date().toISOString()
      })

      // Test Messages Table
      console.log('💬 [6/50] Testing Messages Table...')
      const { data: messagesSchema, error: messagesSchemaError } = await supabase
        .from('direct_messages')
        .select(`
          id,
          message_text,
          dm_room_id,
          sender_id,
          created_at,
          updated_at,
          attachments,
          mentions,
          metadata
        `)
        .limit(1)
      console.log('📊 Messages Table Schema Result:', {
        success: !messagesSchemaError,
        error: messagesSchemaError,
        columns: messagesSchema?.[0] ? Object.keys(messagesSchema[0]) : [],
        timestamp: new Date().toISOString()
      })

      // Test Channels Table
      console.log('📢 [7/50] Testing Channels Table...')
      const { data: channelsSchema, error: channelsSchemaError } = await supabase
        .from('channels')
        .select('*')
        .limit(1)
      console.log('📊 Channels Table Schema Result:', {
        success: !channelsSchemaError,
        error: channelsSchemaError,
        columns: channelsSchema?.[0] ? Object.keys(channelsSchema[0]) : [],
        timestamp: new Date().toISOString()
      })

      // RLS Policy Check
      console.log('🔒 [8/50] Testing RLS Policies...')
      const testInserts = await Promise.allSettled([
        // Try inserting as anon
        supabase.from('users').insert([{ 
          email: 'test_' + Date.now() + '@example.com',
          username: 'test_' + Date.now(),
          display_name: 'Test User',
          status: 'OFFLINE'
        }]),
        // Try selecting as anon
        supabase.from('users').select('count'),
        // Try updating as anon
        supabase.from('users').update({ status: 'ONLINE' }).match({ id: 'test' })
      ])
      console.log('🔑 RLS Policy Test Results:', {
        insert: {
          status: testInserts[0].status,
          error: testInserts[0].value?.error
        },
        select: {
          status: testInserts[1].status,
          error: testInserts[1].value?.error
        },
        update: {
          status: testInserts[2].status,
          error: testInserts[2].value?.error
        },
        timestamp: new Date().toISOString()
      })

      // Duplicate Email Check
      console.log('📧 [9/50] Checking for existing email...')
      const { data: existingUser, error: existingError } = await supabase
        .from('users')
        .select('id, email, username')
        .eq('email', email)
        .maybeSingle()
      console.log('🔍 Existing User Check Result:', {
        exists: !!existingUser,
        error: existingError,
        details: existingUser ? {
          id: existingUser.id,
          email: existingUser.email,
          username: existingUser.username
        } : null,
        timestamp: new Date().toISOString()
      })

      if (existingUser) {
        console.log('❌ [10/50] Duplicate email found')
        setError('An account with this email already exists')
        return
      }

      // Prepare Signup Payload
      console.log('📦 [11/50] Preparing signup payload...')
      const signupPayload = {
        email,
        password,
        options: {
          data: {
            username: email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, ''),
            display_name: displayName || email.split('@')[0],
            status: 'OFFLINE',
            updated_at: new Date().toISOString(),
            email: email
          }
        }
      }
      console.log('📤 Signup Payload:', {
        email: signupPayload.email,
        options: {
          ...signupPayload.options,
          data: {
            ...signupPayload.options.data,
            email: signupPayload.options.data.email
          }
        },
        timestamp: new Date().toISOString()
      })

      // Execute Signup
      console.log('🚀 [12/50] Executing signup request...')
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp(signupPayload)

      // Log Raw Response
      console.log('📥 [13/50] Raw signup response:', {
        success: !signUpError,
        data: signUpData ? {
          id: signUpData.user?.id,
          email: signUpData.user?.email,
          created: signUpData.user?.created_at,
          confirmed: signUpData.user?.confirmed_at
        } : null,
        error: signUpError ? {
          name: signUpError.name,
          message: signUpError.message,
          code: signUpError.code,
          status: signUpError.status,
          details: signUpError.details,
          hint: signUpError.hint
        } : null,
        timestamp: new Date().toISOString()
      })

      if (signUpError) {
        // Detailed Error Analysis
        console.error('❌ [14/50] Signup Error Analysis:', {
          error: {
            name: signUpError.name,
            message: signUpError.message,
            code: signUpError.code,
            status: signUpError.status,
            details: signUpError.details,
            hint: signUpError.hint,
            stack: signUpError.stack
          },
          request: {
            url: supabase.supabaseUrl,
            endpoint: '/auth/v1/signup',
            payload: {
              email: signupPayload.email,
              metadata: signupPayload.options.data
            }
          },
          context: {
            timestamp: new Date().toISOString(),
            auth: {
              flowType: supabase.auth.flowType,
              storageKey: supabase.auth.storageKey,
              autoRefreshToken: supabase.auth.autoRefreshToken,
              persistSession: supabase.auth.persistSession
            },
            environment: {
              nodeEnv: process.env.NODE_ENV,
              hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
            }
          }
        })

        // Additional Error Investigation
        if (signUpError.status === 500) {
          console.log('🔍 [15/50] Database Error Investigation:', {
            error: signUpError,
            possibleCauses: [
              'RLS policies blocking insert',
              'Missing required fields',
              'Constraint violations',
              'Trigger errors'
            ],
            timestamp: new Date().toISOString()
          })

          // Test Table Access
          console.log('🔍 [16/50] Testing table access...')
          const { data: testData, error: testError } = await supabase
            .from('users')
            .select('id, email, username, display_name, status')
            .limit(1)
          
          console.log('📊 [17/50] Table access results:', {
            canQuery: !testError,
            error: testError ? {
              message: testError.message,
              code: testError.code,
              details: testError.details,
              hint: testError.hint
            } : null,
            schema: testData ? Object.keys(testData[0] || {}) : [],
            timestamp: new Date().toISOString()
          })

          // Test Direct Insert
          console.log('🔍 [18/50] Testing direct insert...')
          const testUser = {
            email: 'test_' + Date.now() + '@example.com',
            username: 'test_' + Date.now(),
            display_name: 'Test User',
            status: 'OFFLINE'
          }
          
          const { data: insertData, error: insertError } = await supabase
            .from('users')
            .insert([testUser])
            .select()
          
          console.log('📊 [19/50] Direct insert results:', {
            success: !insertError,
            error: insertError ? {
              message: insertError.message,
              code: insertError.code,
              details: insertError.details,
              hint: insertError.hint
            } : null,
            data: insertData,
            timestamp: new Date().toISOString()
          })
        }

        throw signUpError
      }

      // Success Path
      console.log('✅ [20/50] Signup successful!', {
        userId: signUpData.user?.id,
        email: signUpData.user?.email,
        created: signUpData.user?.created_at,
        confirmed: signUpData.user?.confirmed_at,
        totalTime: new Date() - new Date(startTime),
        timestamp: new Date().toISOString()
      })

      // Attempt Immediate Signin
      console.log('🔄 [21/50] Attempting immediate signin...')
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (signInError) {
        console.error('❌ [22/50] Signin failed:', {
          error: signInError,
          context: {
            email: email,
            timestamp: new Date().toISOString()
          }
        })
        throw signInError
      }

      console.log('✅ [23/50] Signin successful:', {
        session: !!signInData.session,
        user: signInData.user?.id,
        timestamp: new Date().toISOString()
      })

      // Redirect to channels
      console.log('🔀 [24/50] Redirecting to channels...')
      router.push('/channels')

      setError(null)
    } catch (err) {
      // Final Error State
      console.error('❌ [25/50] Final Error State:', {
        error: {
          name: err.name,
          message: err.message,
          code: err.code,
          status: err.status,
          details: err.details,
          hint: err.hint
        },
        context: {
          url: supabase.supabaseUrl,
          timestamp: new Date().toISOString(),
          totalTime: new Date() - new Date(startTime),
          requestId: err.requestId
        },
        state: {
          email: email ? `${email.slice(0, 3)}***${email.slice(-10)}` : null,
          passwordLength: password?.length,
          loading: loading,
          hasError: !!error
        },
        debug: {
          stack: err.stack,
          cause: err.cause,
          originalError: err
        },
        environment: {
          nodeEnv: process.env.NODE_ENV,
          supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
          hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        }
      })
      setError(err.message)
    } finally {
      setLoading(false)
      console.log('🏁 [26/50] Process completed:', {
        totalTime: new Date() - new Date(startTime),
        timestamp: new Date().toISOString(),
        status: error ? 'failed' : 'success'
      })
    }
  }

  const handleSignIn = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      if (error) throw error

      router.push('/channels')
    } catch (error) {
      console.error('Error signing in:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  // Helper function to check if a string is valid JSON
  const isValidJSON = (str) => {
    try {
      JSON.parse(str)
      return true
    } catch (e) {
      return false
    }
  }

  // Test duplicate email
  const testDuplicateEmail = async () => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin + '/auth/callback'
        }
      })

      if (error?.message?.includes('already registered')) {
        addTestResult('Duplicate Email Check', true)
      } else {
        addTestResult('Duplicate Email Check', false, 'Should reject duplicate email')
      }
    } catch (err) {
      addTestResult('Duplicate Email Check', false, err.message)
    }
  }

  // Test Supabase connection
  const testSupabaseConnection = async () => {
    try {
      console.log('🔄 Testing Supabase connection...')
      
      // Test auth endpoint
      const { data: authData, error: authError } = await supabase.auth.getSession()
      console.log('📥 Auth Test Response:', {
        success: !authError,
        error: authError,
        session: authData?.session
      })

      // Test database connection
      const { data: dbData, error: dbError } = await supabase
        .from('users')
        .select('count')
        .limit(1)
      
      console.log('📥 Database Test Response:', {
        success: !dbError,
        error: dbError,
        data: dbData
      })

      // Log environment
      console.log('🌍 Environment:', {
        nodeEnv: process.env.NODE_ENV,
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      })

      return !authError && !dbError
    } catch (err) {
      console.error('❌ Connection Test Error:', err)
      return false
    }
  }

  // Run connection test on mount
  useEffect(() => {
    testSupabaseConnection()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <Head>
        <title>{isLogin ? 'Sign In' : 'Sign Up'} - Talk2D2</title>
      </Head>

      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center mb-8">
          <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center transform rotate-45">
            <span className="text-black text-xl font-bold transform -rotate-45">T2</span>
          </div>
          <h1 className="ml-4 text-3xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-200 bg-clip-text text-transparent">
            Talk2D2
          </h1>
        </div>

        {/* Auth Form */}
        <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-yellow-500/10">
          <h2 className="text-2xl font-bold text-gray-100 mb-6">
            {isLogin ? 'Welcome Back!' : 'Create Your Account'}
          </h2>

          <form onSubmit={isLogin ? handleSignIn : handleSignUp} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2.5 bg-gray-900/50 border border-gray-700 rounded-xl text-gray-100
                  focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500/50
                  placeholder-gray-500 transition-all duration-200"
                style={{
                  WebkitTextFillColor: '#F3F4F6',
                  boxShadow: '0 0 0 1000px rgb(17 24 39 / 0.5) inset',
                  WebkitBoxShadow: '0 0 0 1000px rgb(17 24 39 / 0.5) inset'
                }}
              />
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  Display Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="How should we call you?"
                  className="w-full px-4 py-2.5 bg-gray-900/50 border border-gray-700 rounded-xl text-gray-100
                    focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500/50
                    placeholder-gray-500 transition-all duration-200"
                  style={{
                    WebkitTextFillColor: '#F3F4F6',
                    boxShadow: '0 0 0 1000px rgb(17 24 39 / 0.5) inset',
                    WebkitBoxShadow: '0 0 0 1000px rgb(17 24 39 / 0.5) inset'
                  }}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2.5 bg-gray-900/50 border border-gray-700 rounded-xl text-gray-100
                  focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500/50
                  placeholder-gray-500 transition-all duration-200"
                style={{
                  WebkitTextFillColor: '#F3F4F6',
                  boxShadow: '0 0 0 1000px rgb(17 24 39 / 0.5) inset',
                  WebkitBoxShadow: '0 0 0 1000px rgb(17 24 39 / 0.5) inset'
                }}
              />
            </div>

            {error && (
              <div className="text-red-400 text-sm bg-red-500/10 px-4 py-2.5 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`
                w-full py-2.5 px-4 rounded-xl text-sm font-medium transition-all duration-200
                ${loading
                  ? 'bg-yellow-500/50 cursor-not-allowed'
                  : 'bg-yellow-500 hover:bg-yellow-400 active:bg-yellow-600'
                }
                text-gray-900
              `}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {isLogin ? 'Signing in...' : 'Creating account...'}
                </span>
              ) : (
                <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-gray-400 hover:text-yellow-400 transition-colors"
            >
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}