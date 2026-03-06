import { TextToSpeechForm } from '@/components/TextToSpeechForm'
import { createClient } from '@/utils/supabase/server'
import { SpeakerModerateIcon } from '@radix-ui/react-icons'

export const metadata = {
    title: 'Text to Speech - Rive AI',
    description: 'Convert text to natural speech using ElevenLabs.',
}

export default async function TextToSpeechPage() {
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
                    <SpeakerModerateIcon className="w-6 h-6 text-amber-400" />
                    Text to Speech
                </h1>
                <p className="text-sm text-zinc-400">
                    Convert text to natural-sounding speech with ElevenLabs.
                </p>
            </div>

            <div className="flex-1 min-h-0 relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-3xl pointer-events-none -z-10" />
                <TextToSpeechForm initialCredits={credits} />
            </div>
        </div>
    )
}