const fs = require('fs');
const path = require('path');

// Basic env parser
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const apiKeyMatch = envContent.match(/ELEVENLABS_API_KEY=(.*)/);
const apiKey = apiKeyMatch ? apiKeyMatch[1].trim().replace(/^"(.*)"$/, '$1').replace(/^'(.*)'$/, '$1') : null;

async function listVoices() {
    if (!apiKey) {
        console.error('Missing ELEVENLABS_API_KEY in .env.local');
        return;
    }

    try {
        const response = await fetch('https://api.elevenlabs.io/v1/voices', {
            headers: { 'xi-api-key': apiKey }
        });
        const data = await response.json();
        if (data.voices) {
            let output = 'Available Voices:\n';
            data.voices.forEach(v => {
                output += `- ${v.name} (${v.voice_id}) | Preview: ${v.preview_url}\n`;
            });
            fs.writeFileSync(path.join(__dirname, '..', 'voice-list.txt'), output, 'utf8');
            console.log('Voice list with previews written to voice-list.txt');
        } else {
            console.log('No voices found or error:', JSON.stringify(data, null, 2));
        }
    } catch (err) {
        console.error('Failed to list voices:', err);
    }
}

listVoices();
