import { VideoGeneratorForm } from '@/components/VideoGeneratorForm'
import { createClient } from '@/utils/supabase/server'
import { VideoIcon } from '@radix-ui/react-icons'

export const metadata = {
    title: 'Video Generator - Rive AI',
    description: 'Generate videos from text or images using PixVerse AI.',
}

export default async function VideoGeneratorPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { data: profile } = await supabase
        .from('profiles')
        .select('credits')
        .eq('id', user?.id)
        .single()

    const credits = profile?.credits ?? 0
    
    // Fetch History
    const { data: rawHistory } = await supabase
        .from('ai_generations')
        .select('id, result, prompt, created_at')
        .eq('user_id', user?.id)
        .eq('tool_type', 'video')
        .order('created_at', { ascending: false })
        .limit(20)
        
    const history = rawHistory?.map(h => ({
        id: h.id,
        url: h.result,
        prompt: h.prompt,
        created_at: h.created_at
    })) || []

    return (
        <div className="max-w-4xl mx-auto space-y-6 fade-in h-full flex flex-col">
            <div>
                <h1 className="text-2xl font-semibold text-zinc-100 mb-1 flex items-center gap-2">
                    <VideoIcon className="w-6 h-6 text-violet-400" />
                    Video Generator
                </h1>
                <p className="text-sm text-zinc-400">
                    Generate stunning videos from text prompts or images using PixVerse AI.
                </p>
            </div>

            <div className="flex-1 min-h-0 relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-violet-500/5 rounded-full blur-3xl pointer-events-none -z-10" />
                <VideoGeneratorForm initialCredits={credits} initialHistory={history} />
            </div>
        </div>
    )
}