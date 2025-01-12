import { createClient } from '@supabase/supabase-js'
import { logger } from './logger'

// We'll store only one reference for the supabase user client
// We'll only create the admin client on server side to avoid duplication
const supabaseLogger = logger.withPrefix('Supabase')

// project config
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL')
}
if (!supabaseAnonKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY')
}
// We can conditionally use supabaseServiceKey only in server environment
// if we truly need an admin client. For now, let's guard it to avoid duplications.

const GLOBAL_KEY = '__talk2d2_supabase__'
const GLOBAL_ADMIN_KEY = '__talk2d2_supabase_admin__'

// Single supabase client for front end
function initSupabaseClient() {
  if (typeof window !== 'undefined') {
    // If in the browser, check if we already have a global instance
    if (!globalThis[GLOBAL_KEY]) {
      const client = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          storageKey: 'supabase.auth.token',
          debug: false,
        },
        db: { schema: 'public' },
        global: { headers: { 'x-my-custom-header': 'talk2d2' } },
      })
      globalThis[GLOBAL_KEY] = client
      supabaseLogger.debug('✅ Created browser supabase client (globalThis).')
    } else {
      supabaseLogger.debug('Reusing existing browser supabase client.')
    }
    return globalThis[GLOBAL_KEY]
  } else {
    // If on server, we can create a new client each time or store globally
    if (!global[GLOBAL_KEY]) {
      const client = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          debug: false,
        },
        db: { schema: 'public' },
      })
      global[GLOBAL_KEY] = client
      supabaseLogger.debug('✅ Created server supabase client (global).')
    } else {
      supabaseLogger.debug('Reusing existing server supabase client.')
    }
    return global[GLOBAL_KEY]
  }
}

// Only create an admin client on server, not in the browser
function initSupabaseAdminClient() {
  if (typeof window !== 'undefined') {
    // do not create an admin client in the browser
    return null
  }
  if (!supabaseServiceKey) {
    supabaseLogger.warn('No service role key provided. Admin client will be null.')
    return null
  }
  if (!global[GLOBAL_ADMIN_KEY]) {
    const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false, autoRefreshToken: false, debug: false },
      db: { schema: 'public' },
    })
    global[GLOBAL_ADMIN_KEY] = adminClient
    supabaseLogger.debug('✅ Created server supabase admin client.')
  } else {
    supabaseLogger.debug('Reusing existing server supabase admin client.')
  }
  return global[GLOBAL_ADMIN_KEY]
}

export const supabase = initSupabaseClient()
// We only export supabaseAdmin if needed
export const supabaseAdmin = initSupabaseAdminClient()