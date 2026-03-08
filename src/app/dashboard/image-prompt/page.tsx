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
        // Fetch credits
        const { data: profile } = await supabase
            .from('profiles')
            .select('credits')
            .eq('id', user.id)
            .single()
        credits = profile?.credits ?? 10

        // Fetch history from the NEW DEDICATED table
        const { data: images, error: historyError } = await supabase
            .from('ai_images')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(20)

        if (historyError) {
            console.error("Supabase Images Table Error:", historyError)
        }

        console.log(`Fetched ${images?.length ?? 0} images from dedicated table for user ${user.id}`)

        if (images) {
            history = images.map(img => ({
                id: img.id.toString(),
                type: 'image',
                url: img.image_url,
                prompt: img.prompt,
                timestamp: new Date(img.created_at)
            }))
        }
    }

    return (
        <div className="w-full h-full flex flex-col items-center justify-start p-4 overflow-hidden">
            <DynamicImageGenerator initialCredits={credits} initialHistory={history} />
        </div>
    )
}

