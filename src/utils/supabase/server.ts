// Import the official Supabase SSR package and the Next.js cookies utility.
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

// This function creates a Supabase client configured for Server Components and Server Actions.
export async function createClient() {
    // Access the incoming request's cookies.
    const cookieStore = await cookies()

    // Initialize the server-side client with the project's URL and anonymous key.
    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            // Define how Supabase should interact with the browser's cookies from the server.
            cookies: {
                // Method to retrieve a cookie by its name.
                get(name: string) {
                    return cookieStore.get(name)?.value
                },
                // Method to set or update a cookie. 
                set(name: string, value: string, options: CookieOptions) {
                    try {
                        // Attempt to set the cookie in the response headers.
                        cookieStore.set({ name, value, ...options })
                    } catch (error) {
                        // Silently handle cases where setting cookies is restricted (e.g., from a static Server Component).
                        // Middleware typically handles session refreshes in these cases.
                    }
                },
                // Method to remove a cookie by setting its value to empty.
                remove(name: string, options: CookieOptions) {
                    try {
                        cookieStore.set({ name, value: '', ...options })
                    } catch (error) {
                        // Similarly handle deletion restrictions from Server Components.
                    }
                },
            },
        }
    )
}

