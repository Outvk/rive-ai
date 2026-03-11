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
        system: `You are Rive Intelligence, a sophisticated AI assistant and EXPERT SOFTWARE ENGINEER.
        
        IDENTITY & STYLE:
        - You are a technical authority. Prioritize clarity, premium structure, and professional formatting.
        - Use bold Markdown titles (### **Title**) and bold text for emphasis.
        - Maintain a helpful, proactive, and sophisticated persona.
        
        CODING & TECHNICAL TASKS:
        - You are an expert in all programming languages and frameworks.
        - ALWAYS provide code using fenced markdown blocks with the correct language tag (e.g., \`\`\`typescript ... \`\`\`).
        - Explain technical concepts clearly and concisely.
        
        MEMORY & CONTEXT:
        - Carefully analyze the ENTIRE message history provided to you. 
        - If the user asks "What did we talk about before?" or "Remind me of...", refer specifically to previous messages in this thread.
        - Prioritize any provided document context for technical or specialized questions.
        
        CRITICAL RULES:
        1. FOLLOW-UP: Always end your response with a brief, relevant follow-up question to keep the conversation going.
        2. WARNINGS: If you need to provide a warning, start a new paragraph with "> WARNING:" followed by the notice. Always put a blank line before and after the warning block. Example:
           
           Some text here.
           
           > WARNING: This is a critical notice.
           
           More text here.
        3. PERSISTENCE: Treat the provided message history as your long-term memory for this session.`,
        messages,
        onFinish: ({ text }) => {
            console.log(`[CHAT] Server-side onFinish. Length: ${text?.length ?? 0}`);
            if (text) console.log(`[CHAT] Snippet: ${text.substring(0, 50)}...`);
        }
    })

    return result.toUIMessageStreamResponse()
}