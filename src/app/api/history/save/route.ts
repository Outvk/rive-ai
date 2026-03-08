import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { prompt, imageUrl, settings } = await req.json()

        if (!imageUrl) {
            return NextResponse.json({ error: 'No image provided' }, { status: 400 })
        }

        const { data, error } = await supabase
            .from('ai_images')
            .insert({
                user_id: user.id,
                prompt: prompt || 'AI Generated Image',
                image_url: imageUrl,
                settings: settings || {},
                cost: 10
            })
            .select()

        if (error) {
            console.error('Supabase Save Error:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ success: true, data })
    } catch (err: any) {
        console.error('API Save Error:', err)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
