import { ImageGeneratorForm } from '@/components/ImageGeneratorForm'
import { createClient } from '@/utils/supabase/server'
import { ImageIcon } from '@radix-ui/react-icons'

export const metadata = {
    title: 'Prompt to Image - Rive AI',
    description: 'Generate images from text prompts using AI.',
}

export default async function ImagePromptPage({
    searchParams,
}: {
    searchParams: Promise<{ gid?: string }>
}) {
    const { gid } = await searchParams

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { data: profile } = await supabase
        .from('profiles')
        .select('credits')
        .eq('id', user?.id)
        .single()

    const credits = profile?.credits ?? 0

    let initialPrompt: string | undefined
    let initialImage: string | undefined

    if (gid && user?.id) {
        const { data: gen, error } = await supabase
            .from('ai_generations')
            .select('prompt, result')
            .eq('id', gid)
            .eq('user_id', user.id)
            .maybeSingle()
        if (error) {
            console.error('Failed to load generation:', error)
        }
        if (gen) {
            initialPrompt = gen.prompt
            initialImage = gen.result
        }
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6 fade-in h-full flex flex-col">
            <div>
                <h1 className="text-2xl font-semibold text-zinc-100 mb-1 flex items-center gap-2">
                    <ImageIcon className="w-6 h-6 text-purple-400" />
                    Prompt to Image
                </h1>
                <p className="text-sm text-zinc-400">Type a description and generate images instantly.</p>
            </div>

            <div className="flex-1 min-h-0 relative">
                <ImageGeneratorForm
                    key={gid ?? 'new'}
                    initialCredits={credits}
                    initialPrompt={initialPrompt}
                    initialImageBase64={initialImage}
                />
            </div>
        </div>
    )
}
