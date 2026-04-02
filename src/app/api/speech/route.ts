// Import the Supabase server client for authentication and credit management.
import { createClient } from '@/utils/supabase/server'

// Set the runtime to 'nodejs' to handle binary data and external API calls efficiently.
export const runtime = 'nodejs'

// Handle GET requests to fetch the list of available voices from ElevenLabs.
export async function GET(req: Request) {
    const supabase = await createClient()

    // Ensure the user is authenticated before providing the voice list.
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
        })
    }

    // Check for the ElevenLabs API key in the environment variables.
    if (!process.env.ELEVENLABS_API_KEY) {
        return new Response(JSON.stringify({ error: 'Missing ELEVENLABS_API_KEY' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        })
    }

    try {
        // Fetch all available voices from the ElevenLabs API.
        const response = await fetch('https://api.elevenlabs.io/v1/voices', {
            headers: { 'xi-api-key': process.env.ELEVENLABS_API_KEY! }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch voices from ElevenLabs');
        }

        const data = await response.json();
        
        // Categorize the returned voices into 'male' and 'female' for a better UI experience.
        const female = data.voices
            .filter((v: any) => v.labels?.gender === 'female' || v.name.toLowerCase().includes('female'))
            .map((v: any) => ({
                id: v.voice_id,
                name: v.name,
                gender: 'female',
                preview_url: v.preview_url
            }));

        const male = data.voices
            .filter((v: any) => v.labels?.gender === 'male' || v.name.toLowerCase().includes('male'))
            .map((v: any) => ({
                id: v.voice_id,
                name: v.name,
                gender: 'male',
                preview_url: v.preview_url
            }));

        // Return the organized voice lists to the frontend.
        return new Response(JSON.stringify({ male, female }), {
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (err: any) {
        // Log errors and return a 500 status if the external API call fails.
        console.error('Failed to fetch voices:', err);
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}

// Handle POST requests to generate speech from text (Text-to-Speech).
export async function POST(req: Request) {
    const supabase = await createClient()

    // Validate the presence of the API key.
    if (!process.env.ELEVENLABS_API_KEY) {
        return new Response(JSON.stringify({ error: 'Missing ELEVENLABS_API_KEY' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        })
    }

    // Authenticate the user.
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
        })
    }

    // Deduct 10 credits for using the 'Text to Speech' feature.
    const { data: success, error: rpcError } = await supabase.rpc('deduct_credits', {
        charge_amount: 10,
        tool_name: 'Text to Speech'
    })

    if (rpcError) {
        return new Response(JSON.stringify({ error: rpcError.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        })
    }

    // Stop the process if the user doesn't have enough credits.
    if (!success) {
        return new Response(JSON.stringify({ error: 'Insufficient credits' }), {
            status: 402,
            headers: { 'Content-Type': 'application/json' },
        })
    }

    // Parse the request body for text, voice ID, and language settings.
    let text: string
    let voiceId: string
    let language: string

    try {
        const body = await req.json()
        text = body.text
        voiceId = body.voiceId || 'EXAVITQu4vr4xnSDxMaL'
        language = body.language || 'en'
    } catch {
        return new Response(JSON.stringify({ error: 'Invalid request body' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        })
    }

    // Basic validation to ensure text content exists.
    if (!text || typeof text !== 'string') {
        return new Response(JSON.stringify({ error: 'Missing text' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        })
    }

    try {
        // Send the generation request to ElevenLabs, asking for character/timestamp alignment for potential lip-syncing.
        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/with-timestamps`, {
            method: 'POST',
            headers: {
                'xi-api-key': process.env.ELEVENLABS_API_KEY!,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text,
                model_id: 'eleven_multilingual_v2', // High-quality multilingual model.
                language_code: language,
                voice_settings: {
                    stability: 0.5,
                    similarity_boost: 0.75,
                },
            }),
        })

        if (!response.ok) {
            const err = await response.text()
            return new Response(JSON.stringify({ error: err || 'ElevenLabs request failed' }), {
                status: response.status,
                headers: { 'Content-Type': 'application/json' },
            })
        }

        const data = await response.json()

        // Helper function: Processes the raw character-level timestamps into word-level timestamps for easier UI synchronization.
        const processAlignment = (alignment: any, fullText: string) => {
            if (!alignment) return { words: [] };

            const charStartTimes = alignment.char_start_times_ms ||
                alignment.character_start_times_seconds?.map((s: number) => s * 1000);
            const charDurations = alignment.char_durations_ms ||
                (alignment.character_end_times_seconds &&
                    alignment.character_start_times_seconds &&
                    alignment.character_end_times_seconds.map((e: number, i: number) =>
                        (e - alignment.character_start_times_seconds[i]) * 1000));
            const characters = alignment.characters;

            if (!charStartTimes || !characters) {
                return { words: [] };
            }

            const words: { word: string; start_time: number; end_time: number }[] = [];
            let currentWord = "";
            let wordStartTime = 0;

            for (let i = 0; i < characters.length; i++) {
                const char = characters[i];
                const startTime = charStartTimes[i] / 1000; 

                // Detect word boundaries (spaces and line breaks).
                const isWhitespace = char === " " || char === "\n" || char === "\t" || char === "\r";

                if (isWhitespace) {
                    if (currentWord.length > 0) {
                        words.push({
                            word: currentWord,
                            start_time: wordStartTime,
                            end_time: startTime 
                        });
                        currentWord = "";
                    }
                } else {
                    if (currentWord.length === 0) {
                        wordStartTime = startTime;
                    }
                    currentWord += char;
                }
            }

            // Capture the final word in the sequence.
            if (currentWord.length > 0) {
                const lastIdx = characters.length - 1;
                const lastCharEndTime = charDurations ? (charStartTimes[lastIdx] + charDurations[lastIdx]) / 1000 : charStartTimes[lastIdx] / 1000 + 0.1;
                words.push({
                    word: currentWord,
                    start_time: wordStartTime,
                    end_time: lastCharEndTime
                });
            }

            return { words };
        };

        // Align the text with the generated audio precisely.
        const processedAlignment = processAlignment(data.alignment || data.normalized_alignment, text);

        // Return the base64 audio and the calculated word alignment data.
        return new Response(JSON.stringify({
            audio: data.audio_base64,
            alignment: processedAlignment
        }), {
            headers: { 'Content-Type': 'application/json' },
        })
    } catch (err) {
        // Final fallback for unexpected errors.
        console.error('TTS error', err)
        const message = err instanceof Error ? err.message : 'Speech generation failed'
        return new Response(JSON.stringify({ error: message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        })
    }
}