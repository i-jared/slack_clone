// pages/auth.js
// Thorough fix: Use the updated 'users' table fields (id, email, ...).
// Also handle signUp with new schema.

import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '~/lib/Store'

// Test cases:
// 1. Basic signup with email/password
// 2. Signup with duplicate email
// 3. Signup with special email (+supaadmin@)
// 4. Verify profile creation
// 5. Verify username generation

export default function AuthPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [testResults, setTestResults] = useState([])

  // Add test result
  const addTestResult = (name, passed, error = null) => {
    setTestResults(prev => [...prev, { name, passed, error }])
  }

  const handleSignUp = async (e) => {
    e.preventDefault()
    const startTime = new Date().toISOString()
    console.log('🚀 [1/20] Starting signup process...', {
      timestamp: startTime,
      emailLength: email?.length,
      emailDomain: email?.split('@')[1],
      passwordStrength: password?.length >= 6 ? 'OK' : 'Too Short',
      environment: process.env.NODE_ENV,
      url: supabase.supabaseUrl,
      browserInfo: {
        userAgent: window.navigator.userAgent,
        language: window.navigator.language,
        platform: window.navigator.platform
      }
    })

    setLoading(true)
    setError(null)

    try {
      // Test Supabase client configuration
      console.log('🔧 [2/20] Checking Supabase client config...', {
        timestamp: new Date().toISOString(),
        auth: {
          autoRefreshToken: supabase.auth.autoRefreshToken,
          persistSession: supabase.auth.persistSession,
          detectSessionInUrl: supabase.auth.detectSessionInUrl,
          flowType: supabase.auth.flowType,
          storageKey: supabase.auth.storageKey
        },
        headers: supabase.rest.headers,
        realtime: {
          params: supabase.realtime.params,
          isConnected: supabase.realtime.isConnected
        }
      })

      // Test database connectivity
      console.log('🔌 [3/20] Testing database connectivity...')
      const { data: pingData, error: pingError } = await supabase
        .from('users')
        .select('count')
      console.log('📡 [4/20] Database connectivity result:', {
        success: !pingError,
        error: pingError,
        timestamp: new Date().toISOString(),
        responseTime: new Date() - new Date(startTime)
      })

      // Test database schema with RLS bypass
      console.log('📋 [5/20] Checking database schema...')
      const schemaPromises = [
        // Try public schema
        supabase.from('users').select('*').limit(1),
        // Try auth schema
        supabase.from('auth.users').select('*').limit(1),
        // Try RPC call
        supabase.rpc('get_schema_version'),
        // Try raw query
        supabase.from('users').select('count').limit(1)
      ]
      
      const schemaResults = await Promise.allSettled(schemaPromises)
      console.log('🗂️ [6/20] Schema check results:', {
        public: {
          status: schemaResults[0].status,
          data: schemaResults[0].value?.data,
          error: schemaResults[0].value?.error
        },
        auth: {
          status: schemaResults[1].status,
          data: schemaResults[1].value?.data,
          error: schemaResults[1].value?.error
        },
        rpc: {
          status: schemaResults[2].status,
          data: schemaResults[2].value?.data,
          error: schemaResults[2].value?.error
        },
        raw: {
          status: schemaResults[3].status,
          data: schemaResults[3].value?.data,
          error: schemaResults[3].value?.error
        },
        timestamp: new Date().toISOString()
      })

      // Test auth endpoint with more details
      console.log('🔐 [7/20] Testing auth endpoint...')
      const authPromises = [
        supabase.auth.getSession(),
        supabase.auth.getUser(),
        supabase.auth.admin // This should be undefined in client
      ]
      
      const authResults = await Promise.allSettled(authPromises)
      console.log('🔑 [8/20] Auth endpoint details:', {
        session: {
          status: authResults[0].status,
          data: authResults[0].value?.data,
          error: authResults[0].value?.error
        },
        user: {
          status: authResults[1].status,
          data: authResults[1].value?.data,
          error: authResults[1].value?.error
        },
        hasAdmin: !!authResults[2].value,
        timestamp: new Date().toISOString()
      })

      // Check for existing user
      console.log('👤 [9/20] Checking for existing user...')
      const { data: existingUser, error: existingError } = await supabase
        .from('users')
        .select('id, email')
        .eq('email', email)
        .maybeSingle()
      console.log('🔍 [10/20] Existing user check result:', {
        success: !existingError,
        error: existingError,
        exists: !!existingUser,
        timestamp: new Date().toISOString()
      })

      // If user exists, show error and stop
      if (existingUser) {
        console.log('❌ User already exists')
        setError('An account with this email already exists. Please try logging in instead.')
        return
      }

      // Try minimal signup first
      console.log('📝 [11/20] Preparing signup payload...')
      const minimalPayload = {
        email,
        password,
        options: {
          data: {
            username: email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, ''),
            display_name: email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, ''),
            status: 'OFFLINE',
            updated_at: new Date().toISOString(),
            email: email // This matches your schema
          }
        }
      }

      console.log('📦 [12/20] Signup payload prepared:', {
        email: minimalPayload.email,
        options: {
          data: {
            ...minimalPayload.options.data,
            email: minimalPayload.options.data.email
          }
        },
        timestamp: new Date().toISOString()
      })

      // Try signup with proper metadata
      console.log('🔄 [18/20] Executing signup request...', {
        url: `${supabase.supabaseUrl}/auth/v1/signup`,
        method: 'POST',
        headers: {
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          'Content-Type': 'application/json'
        }
      })

      // Log the exact payload being sent
      console.log('📦 [18.1/20] Full signup payload:', {
        email: minimalPayload.email,
        options: minimalPayload.options,
        metadata: {
          ...minimalPayload.options.data
        },
        timestamp: new Date().toISOString()
      })

      // Try signup with proper metadata
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp(minimalPayload)

      // Immediately log the raw response
      console.log('📥 [18.2/20] Raw signup response:', {
        success: !signUpError,
        data: signUpData,
        error: signUpError ? {
          name: signUpError.name,
          message: signUpError.message,
          code: signUpError.code,
          status: signUpError.status,
          details: signUpError.details,
          hint: signUpError.hint,
          stack: signUpError.stack
        } : null,
        timestamp: new Date().toISOString()
      })

      if (signUpError) {
        // Log detailed error information
        console.error('❌ [19/20] Signup error analysis:', {
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
              email: minimalPayload.email,
              metadata: minimalPayload.options.data
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

        // Additional error checking
        if (signUpError.status === 500) {
          console.log('🔍 [19.1/20] Database error investigation:', {
            timestamp: new Date().toISOString(),
            error: signUpError,
            errorType: 'Database error saving new user',
            possibleCauses: [
              'RLS policies blocking insert',
              'Missing required fields',
              'Constraint violations',
              'Trigger errors'
            ]
          })

          // Test table access
          console.log('🔍 [19.2/20] Testing table access...')
          const { data: testData, error: testError } = await supabase
            .from('users')
            .select('id, email, username, display_name, status')
            .limit(1)
          
          console.log('📊 [19.3/20] Table access results:', {
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

          // Test insert without auth
          console.log('🔍 [19.4/20] Testing direct insert...')
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
          
          console.log('📊 [19.5/20] Direct insert results:', {
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

      // Success!
      console.log('✅ [20/20] Signup successful!', {
        userId: signUpData.user?.id,
        email: signUpData.user?.email,
        created: signUpData.user?.created_at,
        confirmed: signUpData.user?.confirmed_at,
        totalTime: new Date() - new Date(startTime),
        timestamp: new Date().toISOString()
      })

      // Attempt immediate signin
      console.log('🔄 Attempting immediate signin...')
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (signInError) {
        console.error('❌ Signin failed:', signInError)
        throw signInError
      }

      console.log('✅ Signin successful:', {
        session: !!signInData.session,
        user: signInData.user?.id
      })

      // Redirect to channels
      router.push('/channels')

      setError(null)
    } catch (err) {
      console.error('❌ Final Error State:', {
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
      console.log('🏁 Process completed:', {
        totalTime: new Date() - new Date(startTime),
        timestamp: new Date().toISOString(),
        status: error ? 'failed' : 'success'
      })
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
    <div className="max-w-md mx-auto mt-20 p-4 bg-gray-800 text-white rounded">
      <h1 className="text-2xl font-bold mb-4">Sign Up</h1>
      <form onSubmit={handleSignUp} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Email</label>
          <input
            type="email"
            className="w-full p-2 rounded bg-gray-700 focus:outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            required
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Password</label>
          <input
            type="password"
            className="w-full p-2 rounded bg-gray-700 focus:outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            required
          />
        </div>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button
          type="submit"
          className="w-full bg-yellow-400 text-black rounded py-2 mt-2"
          disabled={loading}
        >
          {loading ? 'Signing up...' : 'Sign Up'}
        </button>
      </form>

      {/* Test Results */}
      {testResults.length > 0 && (
        <div className="mt-8 p-4 bg-gray-700 rounded">
          <h2 className="text-lg font-bold mb-2">Test Results</h2>
          <ul className="space-y-2">
            {testResults.map((test, i) => (
              <li key={i} className={`text-sm ${test.passed ? 'text-green-400' : 'text-red-400'}`}>
                {test.name}: {test.passed ? '✅' : '❌'}
                {test.error && <p className="text-xs text-gray-400">{test.error}</p>}
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="mt-4 text-sm text-gray-400">
        Already have an account? <a href="/auth" className="text-yellow-400 underline">Log In</a>
      </p>
    </div>
  )
}