// Import the server-side Supabase client.
import { createClient } from '@/utils/supabase/server'

// Use the standard Node.js runtime for high-performance database operations.
export const runtime = 'nodejs'

// Helper function to return JSON responses with custom status codes and headers.
function json(data: unknown, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: { 'Content-Type': 'application/json' },
    })
}

// Handle DELETE requests to remove a specific generation from the user's history.
export async function DELETE(req: Request) {
    const supabase = await createClient()

    // Authenticate the user session to verify they are deleting their own data.
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return json({ error: 'Unauthorized' }, 401)
    }

    // Extract the entry ID and the target table from the URL search parameters.
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    const table = searchParams.get('table') || 'ai_generations'

    // Validate that a specific record ID was provided.
    if (!id) {
        return json({ error: 'Missing id' }, 400)
    }

    // Perform the deletion in the database, ensuring the record actually belongs to the user.
    const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

    // Handle database deletion errors.
    if (error) {
        console.error('Delete error:', error)
        return json({ error: 'Failed to delete' }, 500)
    }

    // Return success to the frontend.
    return json({ success: true })
}

