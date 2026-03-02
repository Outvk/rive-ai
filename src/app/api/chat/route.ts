import { streamText, convertToModelMessages } from 'ai'
import { createHuggingFace } from '@ai-sdk/huggingface'
import { createClient } from '@/utils/supabase/server'

const huggingface = createHuggingFace({
    apiKey: process.env.HUGGINGFACE_API_KEY!,
})

export const runtime = 'edge'

export async function POST(req: Request) {
    const supabase = await createClient()

    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return new Response('Unauthorized', { status: 401 })
    }

    // Deduct 10 credits for the chat message
    const { data: success, error: rpcError } = await supabase.rpc('deduct_credits', {
        charge_amount: 10,
        tool_name: 'Chat AI'
    })

    if (rpcError) {
        return new Response(rpcError.message, { status: 500 })
    }

    if (!success) {
        return new Response('Insufficient credits', { status: 402 })
    }

    const { messages } = await req.json()

    return streamText({
        model: huggingface('meta-llama/Llama-3.2-3B-Instruct'),
        system: `You are Rive Intelligence, a sophisticated and helpful AI assistant. 
        Always use bold Markdown titles (e.g., ### **Title**) to organize your responses. 
        Focus on clarity, premium structure, and professional formatting. 
        Use bold text for emphasis and lists for structured information.`,
        messages: await convertToModelMessages(messages),
    }).toUIMessageStreamResponse()
}