import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Debug logging (remove after fixing)
if (typeof window !== 'undefined') {
  console.log('Environment check:');
  console.log('- Supabase URL:', supabaseUrl ? 'Set' : 'Missing');
  console.log('- Supabase Key:', supabaseAnonKey ? 'Set' : 'Missing');
}

if (!supabaseUrl) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
}

if (!supabaseAnonKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable')
}

// Create client with better configuration
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      },
      global: {
        headers: {
          'x-client-info': 'trading-portal@1.0.0'
        }
      },
      db: {
        schema: 'public'
      },
      realtime: {
        params: {
          eventsPerSecond: 10
        }
      }
    })
  : null

// Debug the final client
if (typeof window !== 'undefined') {
  console.log('Supabase client:', supabase ? 'Created successfully' : 'Failed to create');
  
  // Test connection
  if (supabase) {
    supabase.auth.getSession()
      .then(() => console.log('Supabase connection: OK'))
      .catch((error) => console.warn('Supabase connection error:', error));
  }
}