export const runtime = 'nodejs'

export async function POST(req: Request) {
    if (!process.env.ELEVENLABS_API_KEY) {
        return new Response(JSON.stringify({ error: 'Missing ELEVENLABS_API_KEY' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        })
    }

    try {
        const body = await req.json()
        const { prompt, duration_seconds } = body

        if (!prompt) {
            return new Response(JSON.stringify({ error: 'Prompt is required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            })
        }

        console.log('Generating SFX with prompt:', prompt)

        const response = await fetch('https://api.elevenlabs.io/v1/sound-generation', {
            method: 'POST',
            headers: {
                'xi-api-key': process.env.ELEVENLABS_API_KEY || '',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text: prompt,
                model_id: 'eleven_text_to_sound_v2',
                duration_seconds: duration_seconds || 5,
                prompt_influence: 0.3,
            }),
        })

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const detailedError = errorData.detail?.message 
                || errorData.detail 
                || errorData.message 
                || JSON.stringify(errorData) 
                || `HTTP Error ${response.status}`;
            
            console.error('ElevenLabs SFX Error:', detailedError);
            return new Response(JSON.stringify({ error: detailedError }), {
                status: response.status,
                headers: { 'Content-Type': 'application/json' },
            })
        }

        const buffer = await response.arrayBuffer()
        const base64Audio = Buffer.from(buffer).toString('base64')

        return new Response(JSON.stringify({ audio: base64Audio }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        })
    } catch (error: any) {
        console.error('Sound generator route error:', error)
        return new Response(JSON.stringify({ error: error.message || 'Internal Server Error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        })
    }
}
