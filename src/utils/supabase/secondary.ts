import { createClient } from '@supabase/supabase-js'

/**
 * Secondary Supabase Admin Client
 * This client uses the SECONDARY_SERVICE_ROLE_KEY to bypass RLS.
 * Used for community posts, likes, comments, notifications, templates.
 */
export const createSecondaryAdminClient = () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_SECONDARY_URL
    const supabaseServiceKey = process.env.SUPABASE_SECONDARY_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error('Missing Secondary Supabase environment variables')
    }

    return createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    })
}
