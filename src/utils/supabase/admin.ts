import { createClient } from '@supabase/supabase-js'

/**
 * Supabase Admin Client
 * This client uses the SERVICE_ROLE_KEY to bypass Row Level Security (RLS).
 * It must ONLY be used in server-side code (API routes, Server Actions).
 * NEVER expose this key to the frontend.
 */
export const createAdminClient = () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error('Missing Supabase environment variables for admin client')
    }

    return createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    })
}
