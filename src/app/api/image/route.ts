import { createClient } from '@/utils/supabase/server'
import Replicate from 'replicate'

export const runtime = 'nodejs'

const REPLICATE_MODEL = 'google/imagen-4'

const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN!,
})

export async function POST(req: Request) {
    const supabase = await createClient()

    if (!process.env.REPLICATE_API_TOKEN) {
        return new Response(JSON.stringify({ error: 'Missing REPLICATE_API_TOKEN' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        })
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return new Response('Unauthorized', { status: 401 })
    }

    const { data: success, error: rpcError } = await supabase.rpc('deduct_credits', {
        charge_amount: 10,
        tool_name: 'Image Generator'
    })

    if (rpcError) {
        return new Response(rpcError.message, { status: 500 })
    }
    if (!success) {
        return new Response('Insufficient credits', { status: 402 })
    }

    const { prompt } = await req.json()
    if (!prompt || typeof prompt !== 'string') {
        return new Response('Missing prompt', { status: 400 })
    }

    try {
        const output = await replicate.run(REPLICATE_MODEL, {
            input: { prompt },
        })

        const firstOutput = Array.isArray(output) ? output[0] : output

        if (!firstOutput) {
            return new Response(JSON.stringify({ error: 'No image returned from model' }), {
                status: 502,
                headers: { 'Content-Type': 'application/json' },
            })
        }

        let base64: string

        if (typeof firstOutput === 'object' && firstOutput !== null) {
            const fileOutput = firstOutput as { blob?: () => Promise<Blob>; url?: () => string; arrayBuffer?: () => Promise<ArrayBuffer> }

            if (typeof fileOutput.blob === 'function') {
                const blob = await fileOutput.blob()
                const arrayBuffer = await blob.arrayBuffer()
                base64 = Buffer.from(arrayBuffer).toString('base64')
            } else if (typeof fileOutput.arrayBuffer === 'function') {
                const arrayBuffer = await fileOutput.arrayBuffer()
                base64 = Buffer.from(arrayBuffer).toString('base64')
            } else if (typeof fileOutput.url === 'function') {
                const imageRes = await fetch(fileOutput.url())
                base64 = Buffer.from(await imageRes.arrayBuffer()).toString('base64')
            } else {
                return new Response(JSON.stringify({ error: 'Unsupported output type from model' }), {
                    status: 502,
                    headers: { 'Content-Type': 'application/json' },
                })
            }
        } else if (typeof firstOutput === 'string') {
            const imageRes = await fetch(firstOutput)
            if (!imageRes.ok) {
                return new Response(JSON.stringify({ error: 'Failed to fetch generated image' }), {
                    status: 502,
                    headers: { 'Content-Type': 'application/json' },
                })
            }
            base64 = Buffer.from(await imageRes.arrayBuffer()).toString('base64')
        } else {
            return new Response(JSON.stringify({ error: 'Unexpected output format from model' }), {
                status: 502,
                headers: { 'Content-Type': 'application/json' },
            })
        }

        return new Response(JSON.stringify({ image: base64 }), {
            headers: { 'Content-Type': 'application/json' },
        })
    } catch (err) {
        console.error('Image generation exception', err)
        const message = err instanceof Error ? err.message : 'Image generation error'
        return new Response(JSON.stringify({ error: message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        })
    }
}