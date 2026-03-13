'use client'

import React, { useEffect, useState, useRef } from 'react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { PaperPlaneIcon, UpdateIcon, VideoIcon, ImageIcon as RadixImageIcon } from '@radix-ui/react-icons'
import { ArrowLeft, Clock, History, Search, Download, Video as LucideVideoIcon, Image as LucideImageIcon, RatioIcon as AspectRatio, Palette, Wand2 } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"

type Props = {
  initialCredits?: number
  initialHistory?: any[]
}

export function VideoGeneratorForm({ initialCredits = 0, initialHistory = [] }: Props) {
  const router = useRouter()

  const [prompt, setPrompt] = useState('')
  const [currentCredits, setCurrentCredits] = useState(initialCredits)
  const [isLoading, setIsLoading] = useState(false)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [mode, setMode] = useState<'text' | 'image'>('text')
  const [imageBase64, setImageBase64] = useState<string | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [status, setStatus] = useState('')
  const [showHistory, setShowHistory] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  
  const [history, setHistory] = useState<any[]>(initialHistory)
  const [aspectRatio, setAspectRatio] = useState('16:9')
  const [stylePreset, setStylePreset] = useState('')
  const [negativePrompt, setNegativePrompt] = useState('')

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

  useEffect(() => {
    setHistory(initialHistory)
  }, [initialHistory])

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
      const finalPrompt = `${stylePreset && stylePreset !== 'none_option' ? stylePreset + ', ' : ''}${prompt.trim()} [Aspect ratio: ${aspectRatio}]`
      
      const res = await fetch('/api/video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: finalPrompt,
          mode,
          imageBase64: mode === 'image' ? imageBase64 : undefined,
          negativePrompt: negativePrompt.trim(),
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
        
        const newItem = {
          id: Date.now().toString(),
          url: data.url,
          prompt: finalPrompt,
          created_at: new Date().toISOString()
        }
        setHistory(prev => [newItem, ...prev])

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

  const filteredHistory = history.filter(item => item.prompt.toLowerCase().includes(searchQuery.toLowerCase()))

  const renderHeader = () => (
    <div className="p-4 flex items-center justify-between border-b border-zinc-800">
      <div className="flex items-center gap-3">
        <div>
          <h3 className="text-sm font-semibold text-zinc-100">Video Studio</h3>
          <p className="text-[10px] text-zinc-500 font-medium">Credits: <span className="text-violet-400">{currentCredits}</span></p>
        </div>
      </div>
      <button
        type="button"
        onClick={() => setShowHistory(true)}
        className={`p-2 rounded-lg transition-colors ${showHistory ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-500 hover:bg-zinc-800 hover:text-zinc-100'}`}
      >
        <History className="w-4 h-4" />
      </button>
    </div>
  )

  const renderHistory = () => (
    <div className="flex flex-col h-full p-4 space-y-4">
      <div className="flex items-center gap-2 text-zinc-100">
        <button
          type="button"
          onClick={() => setShowHistory(false)}
          className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h3 className="text-sm font-medium">History</h3>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
        <input
          type="text"
          placeholder="Search videos..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-8 py-2 bg-zinc-900 border border-zinc-800 rounded-md text-xs text-zinc-200 focus:outline-none focus:ring-1 focus:ring-violet-500"
        />
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
        {filteredHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <Clock className="w-6 h-6 text-zinc-700 mb-2" />
            <p className="text-xs text-zinc-500">No videos yet</p>
          </div>
        ) : (
          filteredHistory.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                setVideoUrl(item.url)
                setPrompt(item.prompt) // Fill prompt to be helpful
                setShowHistory(false)
              }}
              className="flex items-center gap-3 p-2 rounded-lg bg-zinc-900/30 hover:bg-zinc-800 border border-transparent hover:border-zinc-700 cursor-pointer transition-all"
            >
              <div className="relative w-12 h-12 rounded-md overflow-hidden flex-shrink-0 bg-zinc-800">
                <video
                  src={item.url}
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-zinc-200 truncate">{item.prompt}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-[10px] text-zinc-500">{new Date(item.created_at).toLocaleDateString()}</span>
                  <span className="text-[8px] text-zinc-700">•</span>
                  <span className="text-[10px] text-zinc-400">Video</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )

  const renderForm = () => (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-4 flex-1">
      {/* Tabs */}
      <div className="flex bg-zinc-900 border border-zinc-800 p-1 rounded-lg w-full">
        <button
          type="button"
          onClick={() => setMode('text')}
          className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-all duration-300 flex items-center justify-center gap-1.5 ${
            mode === 'text' 
              ? 'bg-zinc-800 text-white shadow-sm' 
              : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'
          }`}
        >
          <LucideVideoIcon className="w-3.5 h-3.5" />
          Text to Video
        </button>
        <button
          type="button"
          onClick={() => setMode('image')}
          className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-all duration-300 flex items-center justify-center gap-1.5 ${
            mode === 'image' 
              ? 'bg-zinc-800 text-white shadow-sm' 
              : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'
          }`}
        >
          <LucideImageIcon className="w-3.5 h-3.5" />
          Image to Video
        </button>
      </div>

      {mode === 'image' && (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 flex flex-col items-center justify-center min-h-[140px] border-dashed hover:bg-zinc-800 transition-colors relative cursor-pointer group"
        >
          {imagePreview ? (
            <div className="relative w-full flex flex-col items-center">
              <img src={imagePreview} alt="Preview" className="max-h-32 rounded-lg object-contain" />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setImagePreview(null);
                  setImageBase64(null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                className="absolute top-1 right-1 bg-zinc-900/80 p-1.5 rounded-md hover:bg-red-500/20 text-zinc-400 hover:text-red-400 transition z-20"
              >
                Clear
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-2 text-zinc-500 group-hover:text-zinc-300 transition-colors">
              <LucideImageIcon className="w-6 h-6" />
              <p className="text-xs">Click or drag image to upload</p>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
        </div>
      )}

      {/* Inputs */}
      <div className="space-y-4 pt-2">
        <div className="space-y-2">
          <div className="flex items-center gap-2 px-1">
              <Wand2 className="w-3.5 h-3.5 text-zinc-400" />
              <span className="text-xs font-medium text-zinc-300">Prompt</span>
          </div>
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={
              mode === 'text'
                ? 'Describe your video in detail...'
                : 'Describe how the image should animate...'
            }
            className="w-full bg-zinc-900/50 border-zinc-800 rounded-xl p-3 text-sm text-zinc-200 placeholder:text-zinc-600 resize-none min-h-[90px] focus:outline-none focus-visible:ring-1 focus-visible:ring-violet-500 focus-visible:border-violet-500/50"
          />
        </div>

        <div className="space-y-4 p-3 bg-zinc-900/30 border border-zinc-800/50 rounded-xl">
          <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                  <AspectRatio className="w-3.5 h-3.5 text-zinc-400" />
                  <span className="text-xs text-zinc-400">Ratio</span>
              </div>
              <Select value={aspectRatio} onValueChange={(value) => setAspectRatio(value)}>
                  <SelectTrigger className="w-[180px] h-8 text-xs bg-zinc-900 border-zinc-800 text-zinc-200 focus:ring-violet-500">
                      <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-200">
                      <SelectItem value="16:9" className="text-xs focus:bg-zinc-800">16:9 (Landscape)</SelectItem>
                      <SelectItem value="9:16" className="text-xs focus:bg-zinc-800">9:16 (Portrait)</SelectItem>
                      <SelectItem value="1:1" className="text-xs focus:bg-zinc-800">1:1 (Square)</SelectItem>
                  </SelectContent>
              </Select>
          </div>

          <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                  <Palette className="w-3.5 h-3.5 text-zinc-400" />
                  <span className="text-xs text-zinc-400">Style</span>
              </div>
              <Select value={stylePreset} onValueChange={(value) => setStylePreset(value)}>
                  <SelectTrigger className="w-[180px] h-8 text-xs bg-zinc-900 border-zinc-800 text-zinc-200 focus:ring-violet-500">
                      <SelectValue placeholder="None (Auto)" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-200">
                      <SelectItem value="none_option" className="text-xs focus:bg-zinc-800">None (Auto)</SelectItem>
                      <SelectItem value="Cinematic, Photorealistic, 8k, highly detailed" className="text-xs focus:bg-zinc-800">Cinematic</SelectItem>
                      <SelectItem value="Anime style, Masterpiece, Studio Ghibli style" className="text-xs focus:bg-zinc-800">Anime / Manga</SelectItem>
                      <SelectItem value="Cyberpunk, futuristic, neon lights, sci-fi" className="text-xs focus:bg-zinc-800">Cyberpunk / Sci-Fi</SelectItem>
                      <SelectItem value="3D Animation, Pixar style, Unreal Engine 5 render" className="text-xs focus:bg-zinc-800">3D Animation (Pixar)</SelectItem>
                  </SelectContent>
              </Select>
          </div>
        </div>

        <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-wider font-semibold text-zinc-500 px-1">Negative Prompt <span className="text-zinc-600 normal-case">(Optional)</span></label>
            <Input 
              type="text"
              value={negativePrompt}
              onChange={(e) => setNegativePrompt(e.target.value)}
              placeholder="Things to avoid (e.g., blurry...)"
              className="w-full h-9 bg-zinc-900 border-zinc-800 rounded-lg text-xs text-zinc-300 placeholder:text-zinc-600 focus-visible:ring-1 focus-visible:ring-violet-500"
            />
        </div>
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={isLoading || !prompt.trim() || currentCredits < 20}
          className="w-full h-11 flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:hover:bg-violet-600 text-white text-sm font-semibold rounded-xl transition-all shadow-[0_0_15px_rgba(139,92,246,0.2)] hover:shadow-[0_0_20px_rgba(139,92,246,0.4)]"
        >
          {isLoading ? (
            <UpdateIcon className="w-4 h-4 animate-spin" />
          ) : (
            <VideoIcon className="w-4 h-4" />
          )}
          {isLoading ? 'Generating Video...' : 'Generate Video (20 Credits)'}
        </button>
      </div>
    </form>
  )

  const renderPreview = () => {
      // Determine the aspect ratio styling based on the selection
      let previewRatioClass = "aspect-video" // default 16:9
      if (aspectRatio === "9:16") previewRatioClass = "aspect-[9/16]"
      else if (aspectRatio === "1:1") previewRatioClass = "aspect-square"

      if (isLoading) {
          return (
            <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-black">
                <div className={`relative w-full max-w-xl ${previewRatioClass} bg-zinc-900/40 rounded-xl overflow-hidden shadow-2xl flex flex-col items-center justify-center border border-zinc-800/50`}>
                   <div className="relative mb-6">
                     <div className="w-14 h-14 border-4 border-violet-500/20 rounded-full" />
                     <div className="w-14 h-14 border-4 border-violet-500 border-t-transparent rounded-full animate-spin absolute inset-0" />
                   </div>
                   <div className="space-y-1.5 text-center">
                     <p className="animate-pulse font-medium text-white text-sm">{status || 'Orchestrating AI Video Node...'}</p>
                     <p className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase opacity-70">This will take a few minutes</p>
                   </div>
                </div>
            </div>
          )
      }

      if (videoUrl) {
          return (
             <div className="w-full h-full flex flex-col relative items-center justify-center p-6 bg-black">
                <div className="w-full h-full max-w-4xl flex flex-col justify-center">
                    <div className="flex justify-between items-center mb-4 px-2">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
                            <span className="text-sm font-semibold text-zinc-200">Generation Complete</span>
                        </div>
                        <button
                        type="button"
                        onClick={() => setVideoUrl(null)}
                        className="text-xs text-zinc-500 hover:text-red-400 transition hover:bg-red-400/10 px-3 py-1.5 rounded-lg border border-transparent hover:border-red-400/20"
                        >
                        Clear
                        </button>
                    </div>

                    <div className={`relative ${previewRatioClass} bg-zinc-900/50 rounded-xl overflow-hidden border border-zinc-800 flex items-center justify-center shadow-2xl group`}>
                        <video
                        src={videoUrl}
                        controls
                        autoPlay
                        loop
                        className="w-full h-full object-contain"
                        />
                    </div>

                    <div className="mt-6 flex items-center justify-between animate-in slide-in-from-bottom-2 duration-500 px-2">
                        <div className="flex items-center gap-3 text-xs font-mono text-zinc-500">
                            <span className="px-2 py-1 bg-zinc-900 rounded-md border border-zinc-800">
                                {aspectRatio}
                            </span>
                            <span className="px-2 py-1 bg-zinc-900 rounded-md border border-zinc-800">
                                {mode}
                            </span>
                        </div>
                        <a
                            href={videoUrl}
                            download={`rive-video-${Date.now()}.mp4`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-6 py-2.5 bg-zinc-100 hover:bg-white text-zinc-900 text-xs font-bold rounded-lg transition-all shadow-lg active:scale-95"
                        >
                            <Download className="w-4 h-4" />
                            Download MP4
                        </a>
                    </div>
                </div>
             </div>
          )
      }

      return (
          <div className="w-full h-full flex flex-col justify-center items-center relative bg-black">
              <div className="flex flex-col items-center gap-4 text-zinc-600">
                  <LucideVideoIcon className="w-16 h-16 opacity-20" />
                  <p className="text-sm font-medium">Your generated video will appear here</p>
              </div>
          </div>
      )
  }

  return (
    <div className="w-full max-w-[1200px] mx-auto h-[750px] bg-[#09090b] border border-zinc-800/80 rounded-2xl flex overflow-hidden shadow-2xl mt-10">
        
        {/* LEFT COLUMN: Settings & History */}
        <div className="w-[340px] flex flex-col border-r border-zinc-800/80 bg-[#0c0c0e] shrink-0">
            {renderHeader()}
            <div className="flex-1 overflow-y-auto custom-scrollbar relative">
                {showHistory ? renderHistory() : renderForm()}
            </div>
        </div>

        {/* RIGHT COLUMN: Preview & Output */}
        <div className="flex-1 bg-black relative overflow-hidden flex flex-col">
            {renderPreview()}
        </div>

    </div>
  )
}
