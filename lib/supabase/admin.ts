import { createClient } from '@supabase/supabase-js'

// Note: This client uses the service role key and bypasses RLS.
// It should ONLY be used in secure Server Environments (Server Components, Server Actions, Route Handlers)
// NEVER expose this client to the browser.
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-key'

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}
