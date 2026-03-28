'use server'

import { createHuggingFace } from '@ai-sdk/huggingface';
import { generateText } from 'ai';

export async function askRuixen(message: string, history: { role: 'user' | 'assistant', content: string }[]) {
  try {
    const apiKey = process.env.HUGGINGFACE_API_KEY;

    if (!apiKey) {
      throw new Error('Hugging Face API key not found');
    }

    const huggingface = createHuggingFace({
        apiKey: apiKey,
    });

    const systemPrompt = `You are Ruixen AI, the official assistant for the Rive AI platform. 
Rive AI is an advanced all-in-one AI creative suite designed for next-generation content creators.

Key Features you should know:
- **Image Intelligence**: Generate hyper-realistic and artistic images using state-of-the-art diffusion models.
- **Motion Engine**: Transform text or static images into cinematic 4K video clips.
- **3D Forge**: Create production-ready 3D models with Tripo AI integration (PBR textures included).
- **Voice Nexus**: Professional-grade speech synthesis powered by ElevenLabs.
- **Universal Community**: A flagship feature where users share, explore, and download high-quality GLB files and MP4 videos for free.
- **Workflow Templates**: Commercial-ready starting points for social media, marketing, and business.

Rules:
1. Always be professional, futuristic, and concise.
2. Mention the "Community" section if users ask about finding inspiration or assets.
3. If users ask about pricing, mention our flexible credit-based system (Standard, Pro, Agency).
4. Never mention other AI platforms (like ChatGPT or Midjourney) unless comparing Rive's superiority.
5. Address yourself consistently as Ruixen AI.`;

    const messages: any[] = [
      ...history,
      { role: 'user', content: message }
    ];

    const { text } = await generateText({
        model: huggingface('Qwen/Qwen2.5-7B-Instruct'),
        system: systemPrompt,
        messages: messages,
    });

    return { content: text || "I'm sorry, I'm experiencing a high-load futuristic glitch. Please try again in a moment." };

  } catch (error) {
    console.error('Ruixen Asst Error:', error);
    return { content: "System connection failure. Ruixen's neural pathways are currently recalibrating." };
  }
}
