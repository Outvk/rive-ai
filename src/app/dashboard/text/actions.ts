'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function saveGeneration(prompt: string, result: string, type: 'text' | 'image' | 'summary' | 'speech', metadata: any = {}) {
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
            cost: 10,
            metadata
        })

    if (error) {
        console.error("Failed to save generation:", error)
        return { error: 'Failed to save to history' }
    }

    revalidatePath('/dashboard/text')
    revalidatePath('/dashboard/credits')
    return { success: true }
}

export async function saveImageGeneration(prompt: string, result: string, settings: any) {
    console.log("--- Server Action: saveImageGeneration ---");
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        console.error("SAVE ERROR: Unauthorized");
        return { error: 'Unauthorized' }
    }

    console.log(`Saving image for user: ${user.id}`);
    console.log(`Payload size: ${Math.round(result.length / 1024)} KB`);

    const { data, error } = await supabase
        .from('ai_images')
        .insert({
            user_id: user.id,
            prompt,
            image_url: result,
            settings,
            cost: 10
        })
        .select()

    if (error) {
        console.error("SUPABASE DB ERROR:", error);
        return { error: error.message || 'Failed to save to history' }
    }

    console.log("SUCCESS: Image saved to ai_images", data);
    revalidatePath('/dashboard/image-prompt')
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
        .upsert(
            {
                id: conversationId,
                user_id: user.id,
                title,
                messages,
                updated_at: new Date().toISOString(),
            },
            { onConflict: 'id' }
        )

    if (error) {
        console.error("Failed to save conversation:", error)
        return { error: error.message }
    }

    revalidatePath('/dashboard/text')
    return { success: true }
}

export async function deleteConversation(conversationId: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { error } = await supabase
        .from('chat_conversations')
        .delete()
        .eq('id', conversationId)
        .eq('user_id', user.id)

    if (error) {
        console.error('Failed to delete conversation:', error)
        return { error: error.message }
    }

    revalidatePath('/dashboard/text')
    return { success: true }
}

