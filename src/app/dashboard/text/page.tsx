import { TextIcon } from '@radix-ui/react-icons'
import { createClient } from '@/utils/supabase/server'
import type { UIMessage } from '@ai-sdk/react'
import TextGeneratorForm from '@/components/TextGeneratorDynamic'

export const metadata = {
    title: 'Text Generator - Rive AI',
    description: 'Generate high quality text using AI.',
}

export default async function TextGeneratorPage({
    searchParams,
}: {
    searchParams: Promise<{ cid?: string }>
}) {
    const { cid } = await searchParams

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { data: profile } = await supabase
        .from('profiles')
        .select('credits, full_name')
        .eq('id', user?.id)
        .single()

    const credits = profile?.credits ?? 0

    let conversationId: string | undefined
    let initialMessages: UIMessage[] = []

    // More permissive UUID regex for robustness
    const isUUID = cid && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cid)

    if (cid && cid !== 'new' && isUUID && user?.id) {
        console.log(`[PAGE] Fetching conversation: ${cid}`)
        const { data: conv, error } = await supabase
            .from('chat_conversations')
            .select('id, messages')
            .eq('id', cid)
            .eq('user_id', user.id)
            .maybeSingle()

        if (error) {
            console.error('Failed to fetch conversation:', {
                code: error.code,
                message: error.message,
                details: error.details,
                hint: error.hint
            })
        }

        if (conv?.id) {
            conversationId = conv.id
            initialMessages = conv.messages && Array.isArray(conv.messages) ? conv.messages : []
        }
    }

    return (
        <div className="fade-in w-[calc(100%+80px)] max-w-none -m-10 h-[calc(100vh-4rem)] overflow-hidden">
            <div className="h-full relative">
                {/* Glow effect specific to this tool */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-3xl pointer-events-none -z-10"></div>

                <TextGeneratorForm
                    key={conversationId || 'new'}
                    initialCredits={credits}
                    userName={profile?.full_name || 'User'}
                    conversationId={conversationId}
                    initialChatMessages={initialMessages}
                />
            </div>
        </div>
    )
}
