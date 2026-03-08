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

    const messages = (rawMessages || []).map((m: any) => {
        let content = '';
        if (typeof m.content === 'string') {
            content = m.content;
        } else if (Array.isArray(m.content)) {
            content = m.content.filter((p: any) => p.type === 'text').map((p: any) => p.text).join('');
        } else if (Array.isArray(m.parts)) {
            content = m.parts.filter((p: any) => p.type === 'text').map((p: any) => p.text).join('');
        }
        return {
            role: m.role as 'user' | 'assistant',
            content: content
        };
    }).filter((m) => m.content.trim() !== '')

    console.log("[CHAT] Sending messages to HuggingFace:", JSON.stringify(messages, null, 2));

    const result = streamText({
        model: huggingface('Qwen/Qwen2.5-7B-Instruct'),
        system: `You are Rive Intelligence, a sophisticated and helpful AI assistant. 
        When a user provides document context, prioritize that information to answer their specific questions.
        Always use bold Markdown titles (e.g., ### **Title**) to organize your responses. 
        Focus on clarity, premium structure, and professional formatting. 
        Use bold text for emphasis and lists for structured information.`,
        messages,
        onFinish: ({ text }) => {
            console.log(`[CHAT] Server-side onFinish. Length: ${text?.length ?? 0}`);
            if (text) console.log(`[CHAT] Snippet: ${text.substring(0, 50)}...`);
        }
    })

    return result.toUIMessageStreamResponse()
}