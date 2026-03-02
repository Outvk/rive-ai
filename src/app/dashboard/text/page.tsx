import { TextIcon } from '@radix-ui/react-icons'
import { TextGeneratorForm } from '@/components/TextGeneratorForm'
import { createClient } from '@/utils/supabase/server'

export const metadata = {
    title: 'Text Generator - Rive AI',
    description: 'Generate high quality text using AI.',
}

export default async function TextGeneratorPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { data: profile } = await supabase
        .from('profiles')
        .select('credits')
        .eq('id', user?.id)
        .single()

    const credits = profile?.credits ?? 0

    return (
        <div className="max-w-4xl mx-auto space-y-6 fade-in h-full flex flex-col">
            <div>
                <h1 className="text-2xl font-semibold text-zinc-100 mb-1 flex items-center gap-2">
                    <TextIcon className="w-6 h-6 text-indigo-400" />
                    Text Generator
                </h1>
                <p className="text-sm text-zinc-400">Generate articles, summarize content, or brainstorm ideas instantly.</p>
            </div>

            <div className="flex-1 min-h-0 relative">
                {/* Glow effect specific to this tool */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-3xl pointer-events-none -z-10"></div>

                <TextGeneratorForm initialCredits={credits} />
            </div>
        </div>
    )
}
