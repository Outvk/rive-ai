// Enable server-side execution for the dashboard actions.
'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

// Action to securely sign the user out of the application.
export async function logoutAction() {
    const supabase = await createClient()
    // Invalidate the session on the Supabase authentication server.
    await supabase.auth.signOut()
    // Automatically redirect the user back to the login page.
    redirect('/login')
}

