'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function saveGeneration(prompt: string, result: string, type: 'text' | 'image' | 'summary') {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    // Save generation to history
    const { error } = await supabase
        .from('ai_generations')
        .insert({
            user_id: user.id,
            tool_type: type,
            prompt,
            result,
            cost: 10
        })

    if (error) {
        console.error("Failed to save generation:", error)
        return { error: 'Failed to save to history' }
    }

    revalidatePath('/dashboard/text')
    revalidatePath('/dashboard/credits')
    return { success: true }
}

export async function saveConversation(
    conversationId: string,
    title: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    messages: Record<string, any>[]
) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { error } = await supabase
        .from('chat_conversations')
        .upsert({
            id: conversationId,
            user_id: user.id,
            title,
            messages,
            updated_at: new Date().toISOString(),
        }, { onConflict: 'id' })

    if (error) {
        console.error("Failed to save conversation:", error)
        return { error: error.message }
    }

    revalidatePath('/dashboard/text')
    return { success: true }
}

