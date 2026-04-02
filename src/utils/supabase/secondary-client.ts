import { createBrowserClient } from '@supabase/ssr'

export function createSecondaryClient() {
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_SECONDARY_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_SECONDARY_ANON_KEY!
    )
}
