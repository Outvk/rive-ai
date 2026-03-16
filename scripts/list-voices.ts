import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function listVoices() {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
        console.error('Missing ELEVENLABS_API_KEY');
        return;
    }

    try {
        const response = await fetch('https://api.elevenlabs.io/v1/voices', {
            headers: { 'xi-api-key': apiKey }
        });
        const data = await response.json() as any;
        if (data.voices) {
            console.log('Available Voices:');
            data.voices.forEach((v: any) => {
                console.log(`- ${v.name} (${v.voice_id}) [${v.category}]`);
            });
        } else {
            console.log('No voices found or error:', data);
        }
    } catch (err: any) {
        console.error('Failed to list voices:', err);
    }
}

listVoices();
