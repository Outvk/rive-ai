'use server'

import { createClient } from '@/utils/supabase/server'

const getURL = () => {
    let url =
        process?.env?.NEXT_PUBLIC_SITE_URL ?? // Set this to your site URL in production env.
        process?.env?.NEXT_PUBLIC_VERCEL_URL ?? // Automatically set by Vercel.
        'http://localhost:3000/'
    // Make sure to include `https://` when not localhost.
    url = url.includes('http') ? url : `https://${url}`
    // Make sure to exclude a trailing `/` for consistency with existing code
    url = url.endsWith('/') ? url.slice(0, -1) : url
    return url
}

export async function loginAction(formData: FormData) {
    const supabase = await createClient()
    const data = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
    }

    const { error } = await supabase.auth.signInWithPassword(data)

    if (error) {
        return { error: error.message }
    }

    return { success: true }
}

export async function signupAction(formData: FormData) {
    const supabase = await createClient()
    const data = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
        options: {
            data: {
                full_name: formData.get('full_name') as string,
            }
        }
    }

    const { error } = await supabase.auth.signUp(data)

    if (error) {
        return { error: error.message }
    }

    return { success: true }
}

export async function forgotPasswordAction(formData: FormData) {
    const supabase = await createClient()
    const email = formData.get('email') as string
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${getURL()}/dashboard/profile?reset=true`,
    })

    if (error) {
        return { error: error.message }
    }

    return { success: true }
}

export async function signInWithGoogleAction() {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: `${getURL()}/auth/callback`,
        },
    })

    if (error) {
        return { error: error.message }
    }

    if (data.url) {
        return { url: data.url }
    }

    return { error: "Failed to generate Google login URL" }
}
