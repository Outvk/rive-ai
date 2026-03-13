import { createClient } from '@/utils/supabase/server'
import { EnhanceForm } from '@/components/EnhanceForm'

export const metadata = {
    title: 'Photo Enhance Tools - Rive AI',
    description: 'Background removal, AI Background Replacement, and Watermark Remover.',
}

export default async function EnhancePage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    let credits = 10
    let history: any[] = []
    if (user) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('credits')
            .eq('id', user.id)
            .single()
        credits = profile?.credits ?? 10
        
        // Fetch history
        const { data: images, error: historyError } = await supabase
            .from('ai_images')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(20)

        if (images) {
            history = images
                .filter((img: any) => img.settings?.mode === 'enhance')
                .map((img: any) => ({
                    id: img.id.toString(),
                    type: 'image',
                    url: img.image_url.startsWith('data:') || img.image_url.startsWith('http') ? img.image_url : `data:image/png;base64,${img.image_url}`,
                    prompt: img.prompt,
                    timestamp: new Date(img.created_at)
                }))
        }
    }

    return (
        <div className="w-full h-full flex flex-col items-center justify-start p-4 overflow-x-hidden overflow-y-auto custom-scrollbar">
            <div className="text-center mt-8 mb-4 space-y-3">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-br from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent">
                    AI Photo Enhance
                </h1>
                <p className="text-zinc-400 text-lg max-w-xl mx-auto">
                    Remove backgrounds, generate new backgrounds with AI, and remove watermarks in seconds.
                </p>
            </div>
            
            <EnhanceForm initialCredits={credits} initialHistory={history} />
        </div>
    )
}
