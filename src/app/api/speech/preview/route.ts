export const runtime = 'nodejs'

export async function POST(req: Request) {
    try {
        const { preview_url } = await req.json()
        
        if (!preview_url) {
            return new Response(JSON.stringify({ error: 'Missing preview_url' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            })
        }

        const response = await fetch(preview_url)
        if (!response.ok) {
            throw new Error('Failed to fetch preview from ElevenLabs')
        }

        const buffer = await response.arrayBuffer()
        const base64 = Buffer.from(buffer).toString('base64')

        return new Response(JSON.stringify({ audio: base64 }), {
            headers: { 'Content-Type': 'application/json' },
        })
    } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        })
    }
}
