// Import Next.js request type and the custom session update utility for Supabase.
import { type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

// Execute middleware logic for every incoming request that matches the config pattern.
export async function middleware(request: NextRequest) {
    // Dynamically refresh the user's session from the cookie before the request reaches the route.
    return await updateSession(request)
}

// Define which specific routes and file types the middleware should be applied to.
export const config = {
    matcher: [
        /*
         * Intercept all paths except static assets (like images, fonts, and system files).
         * This ensures the user's authentication state is checked for all dashboard and API routes.
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}

