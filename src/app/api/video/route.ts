// Import the Hugging Face inference client and the Supabase server-side client.
import { InferenceClient } from '@huggingface/inference'
import { createClient } from '@/utils/supabase/server'

// Use Node.js runtime for compatibility with large data buffers and environment variables.
export const runtime = 'nodejs'

// Define default models and fallback providers to ensure high availability of the video generation service.
const DEFAULT_VIDEO_MODEL = 'tencent/HunyuanVideo-1.5'
const DEFAULT_IMAGE_TO_VIDEO_MODEL = 'Lightricks/LTX-Video'
const DEFAULT_PROVIDER_FALLBACKS = ['hf-inference', 'replicate', 'novita', 'wavespeed', 'together']

// Utility function to simplify sending JSON responses with specific status codes.
function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

// Convert a base64 encoded image string into a raw Buffer for processing.
function parseBase64Image(imageBase64: string) {
  const cleaned = imageBase64.replace(/^data:image\/[a-zA-Z0-9.+-]+;base64,/, '')
  return Buffer.from(cleaned, 'base64')
}

// Convert a Blob (binary data) into a Data URL string for easier frontend rendering.
async function blobToDataUrl(blob: Blob) {
  const mimeType = blob.type || 'video/mp4'
  const buffer = Buffer.from(await blob.arrayBuffer())
  return `data:${mimeType};base64,${buffer.toString('base64')}`
}

// Check if an error indicates that a specific task (like text-to-video) isn't supported by a provider.
function isUnsupportedTaskForProviderError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error || '')
  return /not supported for task text-to-video|supported task:\s*image-to-video/i.test(message)
}

// Check if an error is due to insufficient balance on the external provider (fal.ai).
function isFalPrepaidCreditError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error || '')
  return /pre-paid credits are required.*fal-ai|auto selected provider:\s*fal-ai/i.test(message)
}

// Retrieve fallback providers from environment variables or use the defaults.
function parseProviderFallbacks() {
  const raw = process.env.HUGGINGFACE_VIDEO_PROVIDER_FALLBACKS
  if (!raw) return DEFAULT_PROVIDER_FALLBACKS
  return raw
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

// Handle the main POST request for generating videos based on text prompts or images.
export async function POST(req: Request) {
  const supabase = await createClient()
  let creditsCharged = false

  // Refund credits to the user if the video generation fails at any stage.
  const refundCredits = async (reason: string) => {
    if (!creditsCharged) return
    const { error } = await supabase.rpc('add_credits', {
      add_amount: 20, // 20 credits per video generation.
      reason,
    })
    if (error) {
      console.error('CREDIT REFUND ERROR:', error)
    } else {
      creditsCharged = false
    }
  }

  try {
    // Ensure the secondary API keys specifically for Hugging Face video generation are configured.
    const apiKeys = [
        process.env.HUGGINGFACE_API_KEY_2,
        process.env.HUGGINGFACE_API_KEY_3,
        process.env.HUGGINGFACE_API_KEY_4
    ].filter(Boolean) as string[];

    if (apiKeys.length === 0) {
      return json({ error: 'Missing Secondary HUGGINGFACE_API_KEY bindings for Video Generator' }, 500)
    }

    const videoApiKey = apiKeys[Math.floor(Math.random() * apiKeys.length)];

    // Authenticate the user.
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return json({ error: 'Unauthorized' }, 401)
    }

    // Parse and validate the request body parameters.
    const body = await req.json().catch(() => null)
    if (!body?.prompt || typeof body.prompt !== 'string') {
      return json({ error: 'Missing prompt' }, 400)
    }

    const prompt = body.prompt.trim()
    const mode = body.mode === 'image' ? 'image' : 'text'
    const imageBase64 = typeof body.imageBase64 === 'string' ? body.imageBase64 : undefined
    const negativePrompt = typeof body.negativePrompt === 'string' ? body.negativePrompt : undefined

    if (!prompt) {
      return json({ error: 'Missing prompt' }, 400)
    }

    if (mode === 'image' && !imageBase64) {
      return json({ error: 'Missing image' }, 400)
    }

    // Deduct 20 credits from the user's account before starting the generation.
    const { data: success, error: rpcError } = await supabase.rpc('deduct_credits', {
      charge_amount: 20,
      tool_name: 'Video Generator',
    })

    if (rpcError) {
      return json({ error: rpcError.message }, 500)
    }

    if (!success) {
      return json({ error: 'Insufficient credits' }, 402)
    }
    creditsCharged = true

    // Initialize the Hugging Face client with the selected load-balanced key exclusively for video.
    const client = new InferenceClient(videoApiKey)
    const configuredProvider = process.env.HUGGINGFACE_VIDEO_PROVIDER

    let videoBlob: Blob | null = null
    
    // Logic for Image-to-Video generation mode.
    if (mode === 'image') {
      const imageBuffer = parseBase64Image(imageBase64!)
      const imageBlob = new Blob([imageBuffer], { type: 'image/png' })
      const imageVideoModel = process.env.HUGGINGFACE_IMAGE_TO_VIDEO_MODEL || DEFAULT_IMAGE_TO_VIDEO_MODEL

      // Nested function to run the actual AI inference.
      const runImageToVideo = async (provider?: string) => {
        const args: Record<string, unknown> = {
          model: imageVideoModel,
          inputs: imageBlob,
          parameters: {
            prompt,
            num_frames: 49,
            num_inference_steps: 30,
            negative_prompt: negativePrompt || undefined,
          },
        }
        if (provider) args.provider = provider
        return client.imageTextToVideo(args as any)
      }

      try {
        videoBlob = await runImageToVideo(configuredProvider)
      } catch (error) {
        // Implement automatic retry with different providers if one fails.
        if (isFalPrepaidCreditError(error)) {
          let lastError = error
          for (const candidate of parseProviderFallbacks()) {
            if (candidate === configuredProvider) continue
            try {
              videoBlob = await runImageToVideo(candidate)
              lastError = null
              break
            } catch (innerError) {
              lastError = innerError
            }
          }
          if (lastError) throw lastError
        } else {
          throw error
        }
      }
    } 
    // Logic for Text-to-Video generation mode.
    else {
      const textVideoModel = process.env.HUGGINGFACE_VIDEO_MODEL || DEFAULT_VIDEO_MODEL
      const runTextToVideo = async (model: string, provider?: string) => {
        const args: Record<string, unknown> = {
          model,
          inputs: prompt,
          parameters: {
            num_frames: 49,
            num_inference_steps: 30,
            negative_prompt: negativePrompt || undefined,
          },
        }
        if (provider) args.provider = provider
        return client.textToVideo(args as any)
      }

      try {
        videoBlob = await runTextToVideo(textVideoModel, configuredProvider)
      } catch (error) {
        // Complex fallback logic: try different providers and then different models if needed.
        const canRetryProvider = isFalPrepaidCreditError(error)
        const canRetryModel = textVideoModel !== DEFAULT_VIDEO_MODEL && isUnsupportedTaskForProviderError(error)

        if (canRetryProvider) {
          let lastError: unknown = error
          for (const candidate of parseProviderFallbacks()) {
            if (candidate === configuredProvider) continue
            try {
              videoBlob = await runTextToVideo(textVideoModel, candidate)
              lastError = null
              break
            } catch (innerError) {
              if (textVideoModel !== DEFAULT_VIDEO_MODEL && isUnsupportedTaskForProviderError(innerError)) {
                try {
                  videoBlob = await runTextToVideo(DEFAULT_VIDEO_MODEL, candidate)
                  lastError = null
                  break
                } catch (fallbackModelError) {
                  lastError = fallbackModelError
                }
              } else {
                lastError = innerError
              }
            }
          }
          if (lastError) throw lastError
        } else if (canRetryModel) {
          videoBlob = await runTextToVideo(DEFAULT_VIDEO_MODEL, configuredProvider)
        } else {
           throw error
        }
      }
    }

    // Verify that we actually received video data from the API.
    if (!videoBlob) {
      throw new Error('Video generation failed to return a valid blob.')
    }

    // Convert the resulting video binary into a URL format.
    const url = await blobToDataUrl(videoBlob)

    // Log the generation in the database history table.
    const { error: insertError } = await supabase.from('ai_generations').insert({
      user_id: user.id,
      tool_type: 'video',
      prompt,
      result: url,
    })

    if (insertError) {
      console.error('Failed to save to ai_generations:', insertError)
    }

    // Return the final video URL to the client.
    return json({ url })
  } catch (err) {
    // Ensure credits are refunded if any error occurs in the entire pipeline.
    await refundCredits('Video generation failed before creation')
    console.error('HF VIDEO API ERROR:', err)
    return json(
      { error: err instanceof Error ? err.message : 'Video generation failed' },
      500
    )
  }
}

// GET method is explicitly disabled as this provider doesn't support task polling.
export async function GET() {
  return json({ error: 'Hugging Face mode does not support polling' }, 410)
}

