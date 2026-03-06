'use client'

import React, { useEffect, useState, useRef } from 'react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { PaperPlaneIcon, UpdateIcon, VideoIcon, ImageIcon } from '@radix-ui/react-icons'

type Props = {
  initialCredits?: number
}

export function VideoGeneratorForm({ initialCredits = 0 }: Props) {
  const router = useRouter()

  const [prompt, setPrompt] = useState('')
  const [currentCredits, setCurrentCredits] = useState(initialCredits)
  const [isLoading, setIsLoading] = useState(false)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [mode, setMode] = useState<'text' | 'image'>('text')
  const [imageBase64, setImageBase64] = useState<string | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [status, setStatus] = useState('')

  const fileInputRef = useRef<HTMLInputElement>(null)
  const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      setImagePreview(result)
      setImageBase64(result.split(',')[1])
    }
    reader.readAsDataURL(file)
  }

  const pollStatus = async (videoId: string) => {
    let attempts = 0
    const maxAttempts = 100

    const check = async () => {
      if (attempts >= maxAttempts) {
        setIsLoading(false)
        setStatus('')
        toast.error('Video generation timed out.')
        return
      }

      attempts++
      setStatus(`Processing... (${attempts * 3}s)`)

      try {
        const res = await fetch(`/api/video?videoId=${videoId}`)
        const data = await res.json()

        if (data.status === 'done' && data.url) {
          setVideoUrl(data.url)
          setCurrentCredits((prev) => Math.max(0, prev - 20))
          setIsLoading(false)
          setStatus('')
          router.refresh()
          toast.success('Video generated!')
        } else if (data.status === 'moderated') {
          setIsLoading(false)
          setStatus('')
          toast.error('Video was blocked by content moderation.')
        } else if (data.status === 'failed') {
          setIsLoading(false)
          setStatus('')
          toast.error('Video generation failed.')
        } else {
          pollRef.current = setTimeout(check, 3000)
        }
      } catch {
        setIsLoading(false)
        setStatus('')
        toast.error('Failed to check video status.')
      }
    }

    check()
  }

  useEffect(() => {
    return () => {
      if (pollRef.current) {
        clearTimeout(pollRef.current)
      }
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (currentCredits < 20) {
      toast.error('Insufficient credits. Each video costs 20 credits.')
      return
    }

    if (!prompt.trim()) return

    if (mode === 'image' && !imageBase64) {
      toast.error('Please upload an image.')
      return
    }

    setIsLoading(true)
    setVideoUrl(null)
    setStatus('Starting generation...')

    try {
      const res = await fetch('/api/video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          mode,
          imageBase64: mode === 'image' ? imageBase64 : undefined,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data?.error || 'Generation failed')
      }

      if (data.url) {
        setVideoUrl(data.url)
        setCurrentCredits((prev) => Math.max(0, prev - 20))
        setIsLoading(false)
        setStatus('')
        router.refresh()
        toast.success('Video generated!')
      } else {
        throw new Error('No video output returned.')
      }
    } catch (err: unknown) {
      setIsLoading(false)
      setStatus('')
      toast.error(err instanceof Error ? err.message : 'Failed to generate video.')
    }
  }

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto px-4 pb-10">

      {/* OUTPUT */}
      <div className="mt-10 flex flex-col items-center justify-center min-h-[300px] rounded-xl bg-zinc-800/30 border border-zinc-700/40 overflow-hidden">

        {isLoading ? (
          <div className="flex flex-col items-center gap-4 text-zinc-400">
            <div className="w-14 h-14 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
            <p className="text-sm">{status}</p>
          </div>
        ) : videoUrl ? (
          <div className="w-full p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-zinc-300">Video Ready</span>

              <div className="flex gap-2">
                <a
                  href={videoUrl}
                  download="video.mp4"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs px-3 py-1.5 rounded-lg border border-white/10 hover:border-violet-400/40 hover:text-violet-400 transition"
                >
                  Download
                </a>

                <button
                  type="button"
                  onClick={() => setVideoUrl(null)}
                  className="text-xs px-3 py-1.5 rounded-lg border border-white/10 hover:border-red-400/40 hover:text-red-400 transition"
                >
                  Remove
                </button>
              </div>
            </div>

            <video
              src={videoUrl}
              controls
              autoPlay
              loop
              className="w-full rounded-lg max-h-[400px]"
            />
          </div>
        ) : (
          <div className="text-zinc-600 flex flex-col items-center gap-2">
            <VideoIcon className="w-10 h-10" />
            <span className="text-sm">Your video will appear here</span>
          </div>
        )}
      </div>

      {/* MODE */}
      <div className="mt-6 flex gap-2">
        <button
          type="button"
          onClick={() => setMode('text')}
          className={`px-4 py-2 rounded-full border text-sm flex items-center gap-2 ${mode === 'text'
              ? 'bg-violet-500/20 border-violet-500/50 text-violet-300'
              : 'border-white/10 text-zinc-400'
            }`}
        >
          <PaperPlaneIcon className="w-3 h-3" />
          Text
        </button>

        <button
          type="button"
          onClick={() => setMode('image')}
          className={`px-4 py-2 rounded-full border text-sm flex items-center gap-2 ${mode === 'image'
              ? 'bg-violet-500/20 border-violet-500/50 text-violet-300'
              : 'border-white/10 text-zinc-400'
            }`}
        >
          <ImageIcon className="w-3 h-3" />
          Image
        </button>
      </div>

      {mode === 'image' && (
        <div className="mt-4">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Upload Image</p>
          <div
            onClick={() => fileInputRef.current?.click()}
            className="relative border border-dashed border-white/20 rounded-xl p-6 flex flex-col items-center gap-3 cursor-pointer hover:border-violet-500/40 hover:bg-violet-500/5 transition-all"
          >
            {imagePreview ? (
              <img src={imagePreview} alt="Preview" className="max-h-48 rounded-lg object-contain" />
            ) : (
              <>
                <ImageIcon className="w-8 h-8 text-zinc-600" />
                <p className="text-sm text-zinc-500">Click to upload an image</p>
                <p className="text-xs text-zinc-600">PNG, JPG up to 10MB</p>
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>
          {imagePreview && (
            <button
              type="button"
              onClick={() => {
                setImagePreview(null)
                setImageBase64(null)
              }}
              className="mt-2 text-xs text-zinc-500 hover:text-red-400 transition-colors"
            >
              Remove image
            </button>
          )}
        </div>
      )}

      {/* PROMPT */}
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={
            mode === 'text'
              ? 'Describe your video...'
              : 'Describe how the image should animate...'
          }
          className="w-full bg-zinc-800/40 rounded-lg p-4 min-h-[120px] border border-white/10 focus:ring-2 focus:ring-violet-500/50 outline-none"
        />

        <div className="flex justify-between items-center">
          <button
            type="submit"
            disabled={isLoading || !prompt.trim() || currentCredits < 20}
            className="bg-violet-500 hover:bg-violet-400 disabled:bg-zinc-800 px-6 h-10 rounded-full flex items-center gap-2 transition"
          >
            {isLoading ? (
              <UpdateIcon className="animate-spin" />
            ) : (
              <VideoIcon />
            )}
            Generate
          </button>

          <span className="text-sm text-zinc-400">
            Credits: {currentCredits}
          </span>
        </div>
      </form>
    </div>
  )
}
