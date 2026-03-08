import { InferenceClient } from '@huggingface/inference';

const apiKey = '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';
const client = new InferenceClient(apiKey);
const DEFAULT_VIDEO_MODEL = 'tencent/HunyuanVideo-1.5';

async function main() {
    console.log('Starting HF textToVideo...');
    try {
        const videoBlob = await client.textToVideo({
            model: DEFAULT_VIDEO_MODEL,
            inputs: 'A dog running in a field',
            parameters: {
                num_frames: 10,
                num_inference_steps: 10,
            },
        } as any);
        console.log('Got Blob:', videoBlob.type, videoBlob.size);
    } catch (err) {
        console.error('Error:', err);
    }
}

main();
