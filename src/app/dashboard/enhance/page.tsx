import { createClient } from '@/utils/supabase/server'
import { EnhanceForm } from '@/components/EnhanceForm'
import { Sparkles } from 'lucide-react'

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
        <div className="w-full h-full flex flex-col items-center justify-start p-4 lg:p-8">
            <div className="text-center mt-12 mb-10 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-2">
                    <Sparkles className="w-3 h-3" />
                    <span>Experimental Neural Engines</span>
                </div>
                <h1 className="text-5xl md:text-6xl font-black tracking-tighter bg-gradient-to-b from-white via-zinc-200 to-zinc-600 bg-clip-text text-transparent">
                    Visual Workspace
                </h1>
                <p className="text-zinc-500 text-base font-medium max-w-lg mx-auto leading-relaxed">
                    Transform your assets with industry-grade AI enhancement tools. Professional results in single clicks.
                </p>
            </div>
            
            <EnhanceForm initialCredits={credits} initialHistory={history} />
        </div>
    )
}
