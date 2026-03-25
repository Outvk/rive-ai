"use server"

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function submitFeedback(rating: number, comment: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!rating || rating < 1 || rating > 10) {
        return { error: "Invalid rating" }
    }

    const { error } = await supabase
        .from('app_feedback')
        .insert({
            user_id: user?.id, // Optional: if logged in
            rating,
            comment
        })

    if (error) {
        console.error('Feedback submission error:', error)
        return { error: "Failed to submit feedback" }
    }

    revalidatePath('/dashboard/admin/feedback') // Placeholder for future admin view
    return { success: true }
}
