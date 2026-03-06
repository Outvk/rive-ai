import { createClient } from '@/utils/supabase/server'

export const runtime = 'nodejs'

function json(data: unknown, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: { 'Content-Type': 'application/json' },
    })
}

export async function DELETE(req: Request) {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return json({ error: 'Unauthorized' }, 401)
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
        return json({ error: 'Missing id' }, 400)
    }

    const { error } = await supabase
        .from('ai_generations')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

    if (error) {
        console.error('Delete error:', error)
        return json({ error: 'Failed to delete' }, 500)
    }

    return json({ success: true })
}
