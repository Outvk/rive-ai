import { InferenceClient } from '@huggingface/inference'
import { createClient } from '@/utils/supabase/server'

export const runtime = 'nodejs'

const DEFAULT_VIDEO_MODEL = 'tencent/HunyuanVideo-1.5'
const DEFAULT_IMAGE_TO_VIDEO_MODEL = 'Lightricks/LTX-Video'
const DEFAULT_PROVIDER_FALLBACKS = ['hf-inference', 'replicate', 'novita', 'wavespeed', 'together']

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

function parseBase64Image(imageBase64: string) {
  const cleaned = imageBase64.replace(/^data:image\/[a-zA-Z0-9.+-]+;base64,/, '')
  return Buffer.from(cleaned, 'base64')
}

async function blobToDataUrl(blob: Blob) {
  const mimeType = blob.type || 'video/mp4'
  const buffer = Buffer.from(await blob.arrayBuffer())
  return `data:${mimeType};base64,${buffer.toString('base64')}`
}

function isUnsupportedTaskForProviderError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error || '')
  return /not supported for task text-to-video|supported task:\s*image-to-video/i.test(message)
}

function isFalPrepaidCreditError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error || '')
  return /pre-paid credits are required.*fal-ai|auto selected provider:\s*fal-ai/i.test(message)
}

function parseProviderFallbacks() {
  const raw = process.env.HUGGINGFACE_VIDEO_PROVIDER_FALLBACKS
  if (!raw) return DEFAULT_PROVIDER_FALLBACKS
  return raw
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

export async function POST(req: Request) {
  const supabase = await createClient()
  let creditsCharged = false

  const refundCredits = async (reason: string) => {
    if (!creditsCharged) return
    const { error } = await supabase.rpc('add_credits', {
      add_amount: 20,
      reason,
    })
    if (error) {
      console.error('CREDIT REFUND ERROR:', error)
    } else {
      creditsCharged = false
    }
  }

  try {
    if (!process.env.HUGGINGFACE_API_KEY) {
      return json({ error: 'Missing HUGGINGFACE_API_KEY' }, 500)
    }

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return json({ error: 'Unauthorized' }, 401)
    }

    const body = await req.json().catch(() => null)
    if (!body?.prompt || typeof body.prompt !== 'string') {
      return json({ error: 'Missing prompt' }, 400)
    }

    const prompt = body.prompt.trim()
    const mode = body.mode === 'image' ? 'image' : 'text'
    const imageBase64 = typeof body.imageBase64 === 'string' ? body.imageBase64 : undefined

    if (!prompt) {
      return json({ error: 'Missing prompt' }, 400)
    }

    if (mode === 'image' && !imageBase64) {
      return json({ error: 'Missing image' }, 400)
    }

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

    const client = new InferenceClient(process.env.HUGGINGFACE_API_KEY)
    const configuredProvider = process.env.HUGGINGFACE_VIDEO_PROVIDER

    let videoBlob: Blob | null = null
    if (mode === 'image') {
      const imageBuffer = parseBase64Image(imageBase64!)
      const imageBlob = new Blob([imageBuffer], { type: 'image/png' })
      const imageVideoModel = process.env.HUGGINGFACE_IMAGE_TO_VIDEO_MODEL || DEFAULT_IMAGE_TO_VIDEO_MODEL

      const runImageToVideo = async (provider?: string) => {
        const args: Record<string, unknown> = {
          model: imageVideoModel,
          inputs: imageBlob,
          parameters: {
            prompt,
            num_frames: 49,
            num_inference_steps: 30,
          },
        }
        if (provider) args.provider = provider
        return client.imageTextToVideo(args as any)
      }

      try {
        videoBlob = await runImageToVideo(configuredProvider)
      } catch (error) {
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
    } else {
      const textVideoModel = process.env.HUGGINGFACE_VIDEO_MODEL || DEFAULT_VIDEO_MODEL
      const runTextToVideo = async (model: string, provider?: string) => {
        const args: Record<string, unknown> = {
          model,
          inputs: prompt,
          parameters: {
            num_frames: 49,
            num_inference_steps: 30,
          },
        }
        if (provider) args.provider = provider
        return client.textToVideo(args as any)
      }

      try {
        videoBlob = await runTextToVideo(textVideoModel, configuredProvider)
      } catch (error) {
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
        }
      }
    }

    if (!videoBlob) {
      throw new Error('Video generation failed to return a valid blob.')
    }

    const url = await blobToDataUrl(videoBlob)

    const { error: insertError } = await supabase.from('ai_generations').insert({
      user_id: user.id,
      tool_type: 'video',
      prompt,
      result: url,
    })

    if (insertError) {
      console.error('Failed to save to ai_generations:', insertError)
    }

    return json({ url })
  } catch (err) {
    await refundCredits('Video generation failed before creation')
    console.error('HF VIDEO API ERROR:', err)
    return json(
      { error: err instanceof Error ? err.message : 'Video generation failed' },
      500
    )
  }
}

export async function GET() {
  return json({ error: 'Hugging Face mode does not support polling' }, 410)
}
