import { createHuggingFace } from '@ai-sdk/huggingface'
import { streamText } from 'ai'
import dotenv from 'dotenv'
import path from 'path'

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const huggingface = createHuggingFace({
    apiKey: process.env.HUGGINGFACE_API_KEY!,
})

async function main() {
    console.log('Starting HF chat test with llama-3.2-3b-instruct...');
    try {
        const result = streamText({
            model: huggingface('meta-llama/Llama-3.2-3B-Instruct'),
            prompt: 'Explain quantum physics in one sentence.',
        });

        console.log('Stream started. Reading chunks...');
        let fullText = '';
        for await (const textPart of result.textStream) {
            process.stdout.write(textPart);
            fullText += textPart;
        }
        console.log('\n\nFull text length:', fullText.length);

        if (fullText.length === 0) {
            console.log('WARNING: Received 0 characters from model.');
        }
    } catch (err) {
        console.error('Error during chat test:', err);
    }
}

main();
