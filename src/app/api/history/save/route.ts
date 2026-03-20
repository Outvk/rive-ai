// Import the server-side Supabase client and Next.js response utilities.
import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

// Handle POST requests to permanently save generated AI content to the user's history.
export async function POST(req: Request) {
    try {
        const supabase = await createClient()
        // Authenticate the user to ensure the history is linked to the correct account.
        const { data: { user } } = await supabase.auth.getUser()

        // If not logged in, reject the request with a 401 status.
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Parse the generation details (prompt, image URL, and settings used) from the body.
        const { prompt, imageUrl, settings } = await req.json()

        // Validate that an image URL was actually provided for saving.
        if (!imageUrl) {
            return NextResponse.json({ error: 'No image provided' }, { status: 400 })
        }

        // Insert a new record into the 'ai_images' table.
        const { data, error } = await supabase
            .from('ai_images')
            .insert({
                user_id: user.id,
                prompt: prompt || 'AI Generated Image',
                image_url: imageUrl,
                settings: settings || {},
                cost: 10 // Track the credit cost associated with this specific generation.
            })
            .select()

        // Handle database insertion errors.
        if (error) {
            console.error('Supabase Save Error:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        // Acknowledge the successful save operation.
        return NextResponse.json({ success: true, data })
    } catch (err: any) {
        // Handle unexpected API or parsing errors.
        console.error('API Save Error:', err)
        return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
    }
}

