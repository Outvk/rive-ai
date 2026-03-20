// Import the server-side Supabase client and Next.js response utilities.
import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

// Handle POST requests to save a 3D model generation task to the user's permanent history.
export async function POST(req: Request) {
    try {
        // Parse the request body to extract the prompt and the Tripo3D taskId.
        const body = await req.json()
        const { prompt, taskId } = body

        // Validate that a taskId was provided.
        if (!taskId) {
             return NextResponse.json({ error: 'Missing or invalid taskId' }, { status: 400 })
        }

        const supabase = await createClient()
        // Authenticate the user session to ensure data belongs to the correct account.
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Create a unique URI-style reference to the 3D model stored on Tripo's infrastructure.
        const resultKey = `tripo://${taskId}`

        // Check the database to see if this specific model has already been saved for this user.
        const { data: existing } = await supabase
            .from('ai_generations')
            .select('id')
            .eq('user_id', user.id)
            .eq('result', resultKey)
            .maybeSingle()

        // If it's a duplicate, simply return success without re-inserting.
        if (existing) {
             return NextResponse.json({ success: true, duplicate: true })
        }

        // Insert the metadata (prompt, taskId, and tool type) into the 'ai_generations' table.
        const { error: insertError } = await supabase.from('ai_generations').insert({
            user_id: user.id,
            tool_type: '3d',
            prompt: prompt || '3D Generated Model',
            result: resultKey
        })

        // Raise an error if the database insertion fails.
        if (insertError) {
             throw new Error(insertError.message)
        }

        // Return a successful response to the frontend.
        return NextResponse.json({ success: true })

    } catch (e: any) {
        // Log errors and return a 500 internal server error.
        console.error('ERROR IN 3D SAVE ROUTE:', e);
        return NextResponse.json({ error: e.message || 'Internal Server Error' }, { status: 500 })
    }
}

