import { createClient } from '@/utils/supabase/server'

export const runtime = 'nodejs'

export async function GET() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
        })
    }

    // Hardcoded reliable ElevenLabs premade voices
    const female = [
        { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel', gender: 'female', preview_url: 'https://storage.googleapis.com/eleven-public-prod/premade/voices/21m00Tcm4TlvDq8ikWAM/df6788f9-5c96-470d-8312-aab3b3d8f50a.mp3' },
        { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella', gender: 'female', preview_url: 'https://storage.googleapis.com/eleven-public-prod/premade/voices/EXAVITQu4vr4xnSDxMaL/04363f5a-7258-4f69-8099-b1ef561e9ece.mp3' },
        { id: 'MF3mGyEYCl7XYWbV9V6O', name: 'Elli', gender: 'female', preview_url: 'https://storage.googleapis.com/eleven-public-prod/premade/voices/MF3mGyEYCl7XYWbV9V6O/ded4d912-8fed-4c5d-94ea-2a0c0b8fad64.mp3' },
    ]

    const male = [
        { id: 'TxGEqnHWrfWFTfGW9XjX', name: 'Josh', gender: 'male', preview_url: 'https://storage.googleapis.com/eleven-public-prod/premade/voices/TxGEqnHWrfWFTfGW9XjX/2e3c55a8-b36e-4e9c-a462-2abf5be57c75.mp3' },
        { id: 'VR6AewLTigWG4xSOukaG', name: 'Arnold', gender: 'male', preview_url: 'https://storage.googleapis.com/eleven-public-prod/premade/voices/VR6AewLTigWG4xSOukaG/a5d40a8a-9e85-4817-a2e7-b4cf868efa22.mp3' },
        { id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam', gender: 'male', preview_url: 'https://storage.googleapis.com/eleven-public-prod/premade/voices/pNInz6obpgDQGcFmaJgB/e7a28f11-82c3-4208-9a91-cc8cacca6c58.mp3' },
    ]

    return new Response(JSON.stringify({ male, female }), {
        headers: { 'Content-Type': 'application/json' },
    })
}

// POST - generate speech
export async function POST(req: Request) {
    const supabase = await createClient()

    if (!process.env.ELEVENLABS_API_KEY) {
        return new Response(JSON.stringify({ error: 'Missing ELEVENLABS_API_KEY' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        })
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
        })
    }

    const { data: success, error: rpcError } = await supabase.rpc('deduct_credits', {
        charge_amount: 10,
        tool_name: 'Text to Speech'
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

    let text: string
    let voiceId: string
    let language: string

    try {
        const body = await req.json()
        text = body.text
        voiceId = body.voiceId || '21m00Tcm4TlvDq8ikWAM'
        language = body.language || 'en'
    } catch {
        return new Response(JSON.stringify({ error: 'Invalid request body' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        })
    }

    if (!text || typeof text !== 'string') {
        return new Response(JSON.stringify({ error: 'Missing text' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        })
    }

    try {
        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
            method: 'POST',
            headers: {
                'xi-api-key': process.env.ELEVENLABS_API_KEY!,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text,
                model_id: 'eleven_turbo_v2_5',
                language_code: language,
                voice_settings: {
                    stability: 0.5,
                    similarity_boost: 0.75,
                },
            }),
        })

        if (!response.ok) {
            const err = await response.text()
            return new Response(JSON.stringify({ error: err || 'ElevenLabs request failed' }), {
                status: response.status,
                headers: { 'Content-Type': 'application/json' },
            })
        }

        const arrayBuffer = await response.arrayBuffer()
        const base64 = Buffer.from(arrayBuffer).toString('base64')

        return new Response(JSON.stringify({ audio: base64 }), {
            headers: { 'Content-Type': 'application/json' },
        })
    } catch (err) {
        console.error('TTS error', err)
        const message = err instanceof Error ? err.message : 'Speech generation failed'
        return new Response(JSON.stringify({ error: message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        })
    }
}