import { DynamicImageGenerator } from '@/components/DynamicImageGenerator'
import { createClient } from '@/utils/supabase/server'

export const metadata = {
    title: 'Prompt to Image - Rive AI',
    description: 'Generate images from text prompts using AI.',
}

export default async function ImagePromptPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    let credits = 10
    let history: any[] = []

    if (user) {
        try {
            // Fetch credits
            const { data: profile } = await supabase
                .from('profiles')
                .select('credits')
                .eq('id', user.id)
                .single()
            credits = profile?.credits ?? 10

            // Fetch history from the dedicated table first (Limit to 6 to avoid massive payload)
            const { data: images, error: historyError } = await supabase
                .from('ai_images')
                .select('id, image_url, prompt, created_at')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(6)

            if (historyError) {
                console.error("Supabase Images Table Error:", historyError)
            }

            if (images && images.length > 0) {
                history = images.map(img => ({
                    id: img.id.toString(),
                    type: 'image',
                    url: img.image_url,
                    prompt: img.prompt,
                    timestamp: new Date(img.created_at),
                    sourceTable: 'ai_images'
                }))
            }

            // Fallback: If dedicated table is sparse, check ai_generations (limit 6)
            if (history.length < 6) {
                const { data: fallbackImages } = await supabase
                    .from('ai_generations')
                    .select('id, result, prompt, created_at')
                    .eq('user_id', user.id)
                    .eq('tool_type', 'image')
                    .order('created_at', { ascending: false })
                    .limit(6)

                if (fallbackImages && fallbackImages.length > 0) {
                    const fallbackHistory = fallbackImages.map(img => ({
                        id: img.id.toString(),
                        type: 'image',
                        url: img.result.startsWith('http') ? img.result : `data:image/png;base64,${img.result}`,
                        prompt: img.prompt,
                        timestamp: new Date(img.created_at),
                        sourceTable: 'ai_generations'
                    }))
                    
                    // Merge and deduplicate (by prompt or ID)
                    const existingPrompts = new Set(history.map(h => h.prompt))
                    fallbackHistory.forEach(item => {
                        if (!existingPrompts.has(item.prompt)) {
                            history.push(item)
                        }
                    })
                }
            }

            // Final sort and limit
            history = history.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 8)
            console.log(`Fetched ${history.length} combined images for user ${user.id}`)

        } catch (err) {
            console.error("CRITICAL ERROR: Failed to fetch image history:", err)
        }
    }

    return (
        <div className="w-full h-full flex flex-col items-center justify-start p-4 overflow-hidden">
            <DynamicImageGenerator initialCredits={credits} initialHistory={history} />
        </div>
    )
}

