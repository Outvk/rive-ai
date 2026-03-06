export const runtime = 'nodejs'

export async function POST(req: Request) {
    const { preview_url } = await req.json()

    if (!preview_url) {
        return new Response(JSON.stringify({ error: 'Missing preview_url' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        })
    }

    try {
        const res = await fetch(preview_url, {
            headers: {
                'xi-api-key': process.env.ELEVENLABS_API_KEY!,
            },
        })

        if (!res.ok) {
            return new Response(JSON.stringify({ error: 'Failed to fetch preview' }), {
                status: res.status,
                headers: { 'Content-Type': 'application/json' },
            })
        }

        const arrayBuffer = await res.arrayBuffer()
        const base64 = Buffer.from(arrayBuffer).toString('base64')

        return new Response(JSON.stringify({ audio: base64 }), {
            headers: { 'Content-Type': 'application/json' },
        })
    } catch (err) {
        return new Response(JSON.stringify({ error: 'Preview fetch failed' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        })
    }
}