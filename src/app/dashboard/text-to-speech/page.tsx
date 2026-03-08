import { TextToSpeechContainer } from '@/components/TextToSpeechContainer'
import { createClient } from '@/utils/supabase/server'

export const metadata = {
    title: 'Text to Speech - Rive AI',
    description: 'Convert text to natural speech using ElevenLabs.',
}

export default async function TextToSpeechPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    // Fetch user profile for credits
    const { data: profile } = await supabase
        .from('profiles')
        .select('credits')
        .eq('id', user.id)
        .single()

    const credits = profile?.credits ?? 0

    // Fetch last 50 speech generations for history
    const { data: history } = await supabase
        .from('ai_generations')
        .select('*')
        .eq('user_id', user.id)
        .eq('tool_type', 'speech')
        .order('created_at', { ascending: false })
        .limit(50)

    return (
        <TextToSpeechContainer
            credits={credits}
            history={history ?? []}
        />
    )
}
