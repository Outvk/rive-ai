import { createClient } from '@/utils/supabase/server'

export const runtime = 'nodejs'

export async function GET(req: Request) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
        })
    }

    if (!process.env.ELEVENLABS_API_KEY) {
        return new Response(JSON.stringify({ error: 'Missing ELEVENLABS_API_KEY' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        })
    }

    try {
        const response = await fetch('https://api.elevenlabs.io/v1/voices', {
            headers: { 'xi-api-key': process.env.ELEVENLABS_API_KEY! }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch voices from ElevenLabs');
        }

        const data = await response.json();
        
        // Categorize voices by gender label
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

        return new Response(JSON.stringify({ male, female }), {
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (err: any) {
        console.error('Failed to fetch voices:', err);
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}

// POST - generate speech
export async function POST(req: Request) {
    const supabase = await createClient()

    if (!process.env.ELEVENLABS_API_KEY) {
        return new Response(JSON.stringify({ error: 'Missing ELEVENLABS_API_KEY' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        })
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
        })
    }

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

    if (!success) {
        return new Response(JSON.stringify({ error: 'Insufficient credits' }), {
            status: 402,
            headers: { 'Content-Type': 'application/json' },
        })
    }

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

    if (!text || typeof text !== 'string') {
        return new Response(JSON.stringify({ error: 'Missing text' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        })
    }

    try {
        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/with-timestamps`, {
            method: 'POST',
            headers: {
                'xi-api-key': process.env.ELEVENLABS_API_KEY!,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text,
                model_id: 'eleven_multilingual_v2', // or eleven_turbo_v2_5 if supported by the endpoint
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

        // Helper to process character-level timestamps into word-level
        const processAlignment = (alignment: any, fullText: string) => {
            if (!alignment) return { words: [] };

            // Check for potential different property names in ElevenLabs response
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
                const startTime = charStartTimes[i] / 1000; // Convert to seconds

                // Punctuation characters that usually shouldn't start a word or should be included in previous word
                const isWhitespace = char === " " || char === "\n" || char === "\t" || char === "\r";

                if (isWhitespace) {
                    if (currentWord.length > 0) {
                        words.push({
                            word: currentWord,
                            start_time: wordStartTime,
                            end_time: startTime // End right at the start of the whitespace
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

            // Push the last word if it exists
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

        const processedAlignment = processAlignment(data.alignment || data.normalized_alignment, text);

        return new Response(JSON.stringify({
            audio: data.audio_base64,
            alignment: processedAlignment
        }), {
            headers: { 'Content-Type': 'application/json' },
        })
    } catch (err) {
        console.error('TTS error', err)
        const message = err instanceof Error ? err.message : 'Speech generation failed'
        return new Response(JSON.stringify({ error: message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        })
    }
}