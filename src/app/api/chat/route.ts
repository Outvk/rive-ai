import { streamText } from 'ai'
import { createHuggingFace } from '@ai-sdk/huggingface'
import { createClient } from '@/utils/supabase/server'

const huggingface = createHuggingFace({
    apiKey: process.env.HUGGINGFACE_API_KEY!,
})

export const runtime = 'nodejs'

export async function POST(req: Request) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
        })
    }

    const { data: success, error: rpcError } = await supabase.rpc('deduct_credits', {
        charge_amount: 10,
        tool_name: 'Chat AI'
    })

    if (rpcError) {
        return new Response(JSON.stringify({ error: rpcError.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        })
    }

    if (!success) {
        return new Response(JSON.stringify({ error: 'Insufficient credits' }), {
            status: 402,
            headers: { 'Content-Type': 'application/json' },
        })
    }

    let body: any
    try {
        body = await req.json()
    } catch {
        return new Response(JSON.stringify({ error: 'Invalid request body' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        })
    }

    const rawMessages: any[] = body.messages ?? []

    const messages = rawMessages.map((m: any) => ({
        role: m.role as 'user' | 'assistant',
        content: typeof m.content === 'string'
            ? m.content
            : Array.isArray(m.parts)
                ? m.parts.filter((p: any) => p.type === 'text').map((p: any) => p.text).join('')
                : '',
    })).filter((m) => m.content.trim() !== '')

    const result = streamText({
        model: huggingface('meta-llama/Llama-3.2-3B-Instruct'),
        system: `You are Rive Intelligence, a sophisticated and helpful AI assistant. 
        When a user provides document context (delimited by [DOCUMENT CONTEXT]), prioritize that information to answer their specific questions.
        Always use bold Markdown titles (e.g., ### **Title**) to organize your responses. 
        Focus on clarity, premium structure, and professional formatting. 
        Use bold text for emphasis and lists for structured information.`,
        messages,
    })

    return result.toUIMessageStreamResponse()
}