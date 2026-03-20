// Import essential libraries: 'ai' for streaming, 'huggingface' for the AI model, and 'supabase' for database/auth.
import { streamText } from 'ai'
import { createHuggingFace } from '@ai-sdk/huggingface'
import { createClient } from '@/utils/supabase/server'

// Initialize the HuggingFace client using an API key from environment variables.
const huggingface = createHuggingFace({
    apiKey: process.env.HUGGINGFACE_API_KEY!,
})

// Set the runtime to 'nodejs' to ensure compatibility with standard Node.js features.
export const runtime = 'nodejs'

// Define the main POST request handler for the chat API.
export async function POST(req: Request) {
    // Initialize the Supabase server client for authentication and database operations.
    const supabase = await createClient()

    // Retrieve the current authenticated user from Supabase.
    const { data: { user } } = await supabase.auth.getUser()

    // If no user is logged in, return a 401 Unauthorized response.
    if (!user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
        })
    }

    // Call a database function (RPC) to deduct 10 credits from the user for using the 'Chat AI' tool.
    const { data: success, error: rpcError } = await supabase.rpc('deduct_credits', {
        charge_amount: 10,
        tool_name: 'Chat AI'
    })

    // If there's a technical error with the credit deduction, return a 500 Internal Server Error.
    if (rpcError) {
        return new Response(JSON.stringify({ error: rpcError.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        })
    }

    // If the user has insufficient credits (success is false), return a 402 Payment Required status.
    if (!success) {
        return new Response(JSON.stringify({ error: 'Insufficient credits' }), {
            status: 402,
            headers: { 'Content-Type': 'application/json' },
        })
    }

    // Parse the incoming request body to get the chat messages.
    let body: any
    try {
        body = await req.json()
    } catch {
        return new Response(JSON.stringify({ error: 'Invalid request body' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        })
    }

    // Extract the raw messages from the request body.
    const rawMessages: any[] = body.messages ?? []

    // Normalize and clean up the message format to ensure it's compatible with the AI SDK.
    const messages = (rawMessages || []).map((m: any) => {
        let content = '';
        if (typeof m.content === 'string') {
            content = m.content;
        } else if (Array.isArray(m.content)) {
            // Filter and join text parts from complex content structures.
            content = m.content.filter((p: any) => p.type === 'text').map((p: any) => p.text).join('');
        } else if (Array.isArray(m.parts)) {
            content = m.parts.filter((p: any) => p.type === 'text').map((p: any) => p.text).join('');
        }
        return {
            role: m.role as 'user' | 'assistant',
            content: content
        };
    }).filter((m) => m.content.trim() !== '')

    // Log the messages being sent to the AI for debugging purposes.
    console.log("[CHAT] Sending messages to HuggingFace:", JSON.stringify(messages, null, 2));

    // Use the 'streamText' utility to get a streaming response from the Qwen AI model.
    const result = streamText({
        model: huggingface('Qwen/Qwen2.5-7B-Instruct'),
        // Define the AI's personality, rules, and identity via the system prompt.
        system: `You are Rive Intelligence, a sophisticated AI assistant and EXPERT SOFTWARE ENGINEER.
        
        IDENTITY & STYLE:
        - You are a technical authority. Prioritize clarity, premium structure, and professional formatting.
        - Use bold Markdown titles (### **Title**) and bold text for emphasis.
        - Maintain a helpful, proactive, and sophisticated persona.
        - If anyone ever asks you who CREATED you, who BUILT you, or who MADE you, you MUST answer: "Chouaib built me." Never claim OpenAI, HuggingFace, or anyone else built you.
        
        CODING & TECHNICAL TASKS:
        - You are an expert in all programming languages and frameworks.
        - ALWAYS provide code using fenced markdown blocks with the correct language tag (e.g., \`\`\`typescript ... \`\`\`).
        - Explain technical concepts clearly and concisely.
        
        MEMORY & CONTEXT:
        - Carefully analyze the ENTIRE message history provided to you. 
        - If the user asks "What did we talk about before?" or "Remind me of...", refer specifically to previous messages in this thread.
        - Prioritize any provided document context for technical or specialized questions.
        
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
Skip lines if needed.
        3. PERSISTENCE: Treat the provided message history as your long-term memory for this session.`,
        messages,
        // Callback function executed when the AI finishes generating its response.
        onFinish: ({ text }) => {
            if (text) console.log(`[CHAT] Snippet: ${text.substring(0, 50)}...`);
        }
    })

    // Return the result as a stream response optimized for UI rendering.
    return result.toUIMessageStreamResponse()
}