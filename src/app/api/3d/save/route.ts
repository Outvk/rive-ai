import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { prompt, taskId } = body

        if (!taskId) {
             return NextResponse.json({ error: 'Missing or invalid taskId' }, { status: 400 })
        }

        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const resultKey = `tripo://${taskId}`

        const { data: existing } = await supabase
            .from('ai_generations')
            .select('id')
            .eq('user_id', user.id)
            .eq('result', resultKey)
            .maybeSingle()

        if (existing) {
             return NextResponse.json({ success: true, duplicate: true })
        }

        const { error: insertError } = await supabase.from('ai_generations').insert({
            user_id: user.id,
            tool_type: '3d',
            prompt: prompt || '3D Generated Model',
            result: resultKey
        })

        if (insertError) {
             throw new Error(insertError.message)
        }

        return NextResponse.json({ success: true })

    } catch (e: any) {
        console.error('ERROR IN 3D SAVE ROUTE:', e);
        return NextResponse.json({ error: e.message || 'Internal Server Error' }, { status: 500 })
    }
}
