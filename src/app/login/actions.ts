// Mark this file as a collection of Server Actions, ensuring all logic runs on the server side securely.
'use server'

// Import the Supabase server client and Next.js headers utility.
import { createClient } from '@/utils/supabase/server'
import { headers } from 'next/headers'

// Helper function to dynamically determine the base URL of the site for redirects.
const getBaseURL = async () => {
    const host = (await headers()).get('host')
    if (!host) {
        // Fallback to environment variable or local development URL if host header is missing.
        return process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    }
    // Automatically switch between HTTP (local) and HTTPS (production).
    const protocol = host.includes('localhost') ? 'http' : 'https'
    return `${protocol}://${host}`
}

async function verifyTurnstile(token: string) {
    const secretKey = process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY;
    if (!secretKey) {
        console.warn("Cloudflare Turnstile secret key is missing. Skipping verification.");
        return true;
    }

    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `secret=${encodeURIComponent(secretKey)}&response=${encodeURIComponent(token)}`,
    });

    const outcome = await response.json();
    return outcome.success;
}

// Action to handle existing user login.
export async function loginAction(formData: FormData) {
    const supabase = await createClient()

    // Cloudflare Turnstile Verification
    const turnstileToken = formData.get('cf-turnstile-response') as string;
    const isHuman = await verifyTurnstile(turnstileToken);
    if (!isHuman) {
        return { error: "Bot verification failed. Please try again." }
    }

    // Extract credentials from the form submission.
    const data = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
    }

    // Attempt to sign in the user via Supabase Auth.
    const { error } = await supabase.auth.signInWithPassword(data)

    // Handle potential login errors (e.g., wrong password).
    if (error) {
        return { error: error.message }
    }

    // Success indicates the user is now authenticated.
    return { success: true }
}

// Action to handle new user registration (Sign Up).
export async function signupAction(formData: FormData) {
    const supabase = await createClient()

    // Cloudflare Turnstile Verification
    const turnstileToken = formData.get('cf-turnstile-response') as string;
    const isHuman = await verifyTurnstile(turnstileToken);
    if (!isHuman) {
        return { error: "Bot verification failed. Please try again." }
    }

    const data = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
        options: {
            data: {
                // Store additional user metadata (like full name) in the Supabase auth table.
                full_name: formData.get('full_name') as string,
            }
        }
    }

    // Create a new user account in Supabase.
    const { error } = await supabase.auth.signUp(data)

    if (error) {
        return { error: error.message }
    }

    return { success: true }
}

// Action to handle password reset requests.
export async function forgotPasswordAction(formData: FormData) {
    const supabase = await createClient()
    const email = formData.get('email') as string

    const baseURL = await getBaseURL()
    // Send a reset link to the user's email with a specific redirect back to the profile page.
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${baseURL}/dashboard/profile?reset=true`,
    })

    if (error) {
        return { error: error.message }
    }

    return { success: true }
}

// Action to initiate Google OAuth (Single Sign-On).
export async function signInWithGoogleAction() {
    const supabase = await createClient()
    const baseURL = await getBaseURL()
    // Redirect the user to Google's login page and handle the callback securely.
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: `${baseURL}/auth/callback`,
        },
    })

    if (error) {
        return { error: error.message }
    }

    // Return the generated Google OAuth URL to the frontend for redirection.
    if (data.url) {
        return { url: data.url }
    }

    return { error: "Failed to generate Google login URL" }
}

