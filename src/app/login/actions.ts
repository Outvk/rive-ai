'use server'

import { createClient } from '@/utils/supabase/server'
import { headers } from 'next/headers'

const getBaseURL = async () => {
    const host = (await headers()).get('host')
    if (!host) {
        return process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    }
    const protocol = host.includes('localhost') ? 'http' : 'https'
    return `${protocol}://${host}`
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
    
    const baseURL = await getBaseURL()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${baseURL}/dashboard/profile?reset=true`,
    })

    if (error) {
        return { error: error.message }
    }

    return { success: true }
}

export async function signInWithGoogleAction() {
    const supabase = await createClient()
    const baseURL = await getBaseURL()
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: `${baseURL}/auth/callback`,
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
