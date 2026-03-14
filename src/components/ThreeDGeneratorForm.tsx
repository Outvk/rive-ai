'use client'

import React, { useEffect, useState, useRef } from 'react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { UpdateIcon, CubeIcon } from '@radix-ui/react-icons'
import { ArrowLeft, Clock, History, Search, Download, Image as LucideImageIcon, Wand2 } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'

// ✅ FIX 1: Declare model-viewer as a valid JSX element for TypeScript
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          src?: string
          alt?: string
          poster?: string
          ar?: boolean | string
          'auto-rotate'?: boolean | string
          'camera-controls'?: boolean | string
          'shadow-intensity'?: string
          'environment-image'?: string
          'touch-action'?: string
          'camera-orbit'?: string
          'ar-modes'?: string
          exposure?: string
          crossorigin?: string
          autoplay?: boolean | string
          style?: React.CSSProperties
        },
        HTMLElement
      >
    }
  }
}

type HistoryItem = {
  id: string
  url: string
  prompt: string
  created_at: string
}

type Props = {
  initialCredits?: number
  initialHistory?: HistoryItem[]
}

export function ThreeDGeneratorForm({ initialCredits = 0, initialHistory = [] }: Props) {
  const router = useRouter()

  const [prompt, setPrompt] = useState('')
  const [currentCredits, setCurrentCredits] = useState(initialCredits)
  const [isLoading, setIsLoading] = useState(false)
  const [modelUrl, setModelUrl] = useState<string | null>(null)
  const [mode, setMode] = useState<'text' | 'image'>('text')
  const [imageBase64, setImageBase64] = useState<string | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [status, setStatus] = useState('')
  const [texture, setTexture] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewerReady, setViewerReady] = useState(false)
  const [history, setHistory] = useState<HistoryItem[]>(initialHistory)
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const modelViewerRef = useRef<HTMLElement | null>(null)

  // ✅ FIX 2: Load model-viewer script properly on client only
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (customElements.get('model-viewer')) {
      setViewerReady(true)
      return
    }
    const script = document.createElement('script')
    script.type = 'module'
    script.src = 'https://ajax.googleapis.com/ajax/libs/model-viewer/4.2.0/model-viewer.min.js'
    script.onload = () => setViewerReady(true)
    script.onerror = () => console.error('Failed to load model-viewer')
    document.head.appendChild(script)
    setIsMounted(true)
    return () => {
      // Don't remove — model-viewer needs to stay loaded
    }
  }, [])

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

  const pollStatus = async (taskId: string, finalPrompt: string) => {
    let attempts = 0
    const maxAttempts = 150

    const check = async () => {
      if (attempts >= maxAttempts) {
        setIsLoading(false)
        setStatus('')
        toast.error('3D generation timed out.')
        return
      }

      attempts++
      setStatus(`Orchestrating AI 3D Model... (${attempts * 3}s)`)

      try {
        const res = await fetch(`/api/3d?taskId=${taskId}`)
        if (!res.ok) {
          const text = await res.text()
          throw new Error(text)
        }

        const data = await res.json()
        const taskStatus = data.data.status

        if (taskStatus === 'success') {
          const mUrl =
            data.data.output?.model ||
            data.data.output?.base_model ||
            data.data.output?.pbr_model

          if (mUrl) {
            setModelUrl(mUrl)
            setCurrentTaskId(taskId)
            setIsLoading(false)
            setIsEditing(false)
            setStatus('')

            const newItem: HistoryItem = {
              id: Date.now().toString(),
              url: `tripo://${taskId}`,
              prompt: finalPrompt,
              created_at: new Date().toISOString(),
            }
            setHistory((prev) => [newItem, ...prev])

            fetch('/api/3d/save', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ prompt: finalPrompt, taskId: taskId }),
            })
            .then(async (r) => {
              if (!r.ok) {
                const text = await r.text()
                toast.error('DB Error: ' + text)
              }
            })
            .catch((e) => console.error('Failed to save 3D history:', e))

            router.refresh()
            toast.success('3D Model generated!')
          } else {
            throw new Error('No model URL found in API response.')
          }
        } else if (
          taskStatus === 'failed' ||
          taskStatus === 'banned' ||
          taskStatus === 'cancelled'
        ) {
          setIsLoading(false)
          setStatus('')
          toast.error(`3D generation ${taskStatus}.`)
        } else {
          pollRef.current = setTimeout(check, 3000)
        }
      } catch (err: unknown) {
        setIsLoading(false)
        setStatus('')
        toast.error(
          'Failed to check 3D status: ' +
          (err instanceof Error ? err.message : 'Unknown error')
        )
      }
    }

    check()
  }

  useEffect(() => {
    return () => {
      if (pollRef.current) clearTimeout(pollRef.current)
    }
  }, [])

  useEffect(() => setHistory(initialHistory), [initialHistory])
  useEffect(() => setCurrentCredits(initialCredits), [initialCredits])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (currentCredits < 30) {
      toast.error('Insufficient credits. Each 3D model costs 30 credits.')
      return
    }
    if (mode === 'text' && !prompt.trim()) {
      toast.error('Please enter a prompt.')
      return
    }
    if (mode === 'image' && !imageBase64) {
      toast.error('Please upload an image.')
      return
    }

    setIsLoading(true)
    setModelUrl(null)
    setStatus('Starting 3D generation...')

    try {
      const res = await fetch('/api/3d', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          mode,
          imageBase64: mode === 'image' ? imageBase64 : undefined,
          texture,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Generation failed')

      if (data.taskId) {
        setStatus('Task submitted. Waiting for generation...')
        setCurrentTaskId(data.taskId)
        const finalPrompt = mode === 'image' ? 'Image to 3D Model' : prompt.trim()
        pollStatus(data.taskId, finalPrompt)
      } else {
        throw new Error('No task ID returned.')
      }
    } catch (err: unknown) {
      setIsLoading(false)
      setStatus('')
      toast.error(err instanceof Error ? err.message : 'Failed to generate model.')
    }
  }

  const handleMeshEdit = async (editType: 'quad' | 'obj' | 'stl') => {
    if (!currentTaskId) {
      toast.error('Generate a model first to use mesh tools.')
      return
    }

    if (currentCredits < 30) {
      toast.error('Insufficient credits for mesh editing (30 credits required).')
      return
    }

    setIsLoading(true)
    setIsEditing(true)
    setStatus(`Converting mesh to ${editType.toUpperCase()}...`)

    try {
      const res = await fetch('/api/3d', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          editType,
          originalTaskId: currentTaskId
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Mesh editing failed')

      if (data.taskId) {
        setStatus(`Optimization task submitted...`)
        pollStatus(data.taskId, `Mesh Edit: ${editType}`)
      }
    } catch (err: any) {
      setIsLoading(false)
      setIsEditing(false)
      setStatus('')
      toast.error(err.message || 'Failed to edit mesh.')
    }
  }

  const handleAnimate = async (animationType: string) => {
    if (!currentTaskId) {
      toast.error('Generate a model first to animate.')
      return
    }

    if (currentCredits < 30) {
      toast.error('Insufficient credits for animation (30 credits required).')
      return
    }

    setIsLoading(true)
    setIsEditing(true)
    setStatus(`Rigging and Animating (${animationType.toUpperCase()})...`)

    try {
      const res = await fetch('/api/3d', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          animationType,
          originalTaskId: currentTaskId
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Animation failed')

      if (data.taskId) {
        setStatus(`Rigging task submitted...`)
        pollStatus(data.taskId, `Animation: ${animationType}`)
      }
    } catch (err: any) {
      setIsLoading(false)
      setIsEditing(false)
      setStatus('')
      toast.error(err.message || 'Failed to animate model.')
    }
  }

  const filteredHistory = history.filter((item) =>
    item.prompt.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // ─── SUB-RENDERS ────────────────────────────────────────────────────────────

  const renderHeader = () => (
    <div className="p-4 flex items-center justify-between border-b border-zinc-800">
      <div className="flex items-center gap-3">
        <div>
          <h3 className="text-sm font-semibold text-zinc-100">3D Studio</h3>
          <p className="text-[10px] text-zinc-500 font-medium">
            Credits: <span className="text-pink-400">{currentCredits}</span>
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={() => setShowHistory(true)}
        className={`p-2 rounded-lg transition-colors ${showHistory
            ? 'bg-zinc-800 text-zinc-100'
            : 'text-zinc-500 hover:bg-zinc-800 hover:text-zinc-100'
          }`}
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
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
        <input
          type="text"
          placeholder="Search models..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-8 py-2 bg-zinc-900 border border-zinc-800 rounded-md text-xs text-zinc-200 focus:outline-none focus:ring-1 focus:ring-pink-500"
        />
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {filteredHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <Clock className="w-6 h-6 text-zinc-700 mb-2" />
            <p className="text-xs text-zinc-500">No models yet</p>
          </div>
        ) : (
          filteredHistory.map((item) => (
            <div
              key={item.id}
              onClick={async () => {
                if (item.prompt !== 'Image to 3D Model') setPrompt(item.prompt)
                setShowHistory(false)
                
                if (item.url && item.url.startsWith('tripo://')) {
                  const savedTaskId = item.url.replace('tripo://', '')
                  setCurrentTaskId(savedTaskId)
                  setIsLoading(true)
                  setStatus('Restoring 3D model from Tripo3D network...')
                  try {
                    const res = await fetch(`/api/3d?taskId=${savedTaskId}`)
                    const data = await res.json()
                    const mUrl = data.data?.output?.model || data.data?.output?.base_model || data.data?.output?.pbr_model
                    if (mUrl) {
                      setModelUrl(mUrl)
                      setIsLoading(false)
                      setStatus('')
                    } else {
                      throw new Error("Could not find active model in Tripo3D response")
                    }
                  } catch (e: any) {
                    setIsLoading(false)
                    setStatus('')
                    toast.error('Failed to restore model: ' + e.message)
                  }
                } else {
                  setModelUrl(item.url)
                  setCurrentTaskId(null)
                }
              }}
              className="flex items-center gap-3 p-2 rounded-lg bg-zinc-900/30 hover:bg-zinc-800 border border-transparent hover:border-zinc-700 cursor-pointer transition-all"
            >
              <div className="relative w-12 h-12 rounded-md overflow-hidden flex-shrink-0 bg-zinc-800 flex items-center justify-center">
                <CubeIcon className="w-6 h-6 text-zinc-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-zinc-200 truncate">{item.prompt}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-[10px] text-zinc-500">
                    {new Date(item.created_at).toLocaleDateString()}
                  </span>
                  <span className="text-[8px] text-zinc-700">•</span>
                  <span className="text-[10px] text-zinc-400">3D Model</span>
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
      {/* Mode tabs */}
      <div className="flex bg-zinc-900 border border-zinc-800 p-1 rounded-lg w-full">
        <button
          type="button"
          onClick={() => {
            setMode('text')
            setImagePreview(null)
            setImageBase64(null)
          }}
          className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-all duration-300 flex items-center justify-center gap-1.5 ${mode === 'text'
              ? 'bg-zinc-800 text-white shadow-sm'
              : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'
            }`}
        >
          <CubeIcon className="w-3.5 h-3.5" />
          Text to 3D
        </button>
        <button
          type="button"
          onClick={() => {
            setMode('image')
            setPrompt('')
          }}
          className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-all duration-300 flex items-center justify-center gap-1.5 ${mode === 'image'
              ? 'bg-zinc-800 text-white shadow-sm'
              : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'
            }`}
        >
          <LucideImageIcon className="w-3.5 h-3.5" />
          Image to 3D
        </button>
      </div>

      {/* Image upload zone */}
      {mode === 'image' && (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 flex flex-col items-center justify-center min-h-[140px] border-dashed hover:bg-zinc-800 transition-colors relative cursor-pointer group"
        >
          {imagePreview ? (
            <div className="relative w-full flex flex-col items-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imagePreview}
                alt="Preview"
                className="max-h-32 rounded-lg object-contain"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setImagePreview(null)
                  setImageBase64(null)
                  if (fileInputRef.current) fileInputRef.current.value = ''
                }}
                className="absolute top-1 right-1 bg-zinc-900/80 p-1.5 rounded-md hover:bg-red-500/20 text-zinc-400 hover:text-red-400 transition z-20 text-xs"
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

      {/* Text prompt */}
      {mode === 'text' && (
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <div className="flex items-center gap-2 px-1">
              <Wand2 className="w-3.5 h-3.5 text-zinc-400" />
              <span className="text-xs font-medium text-zinc-300">Prompt</span>
            </div>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your 3D model in detail... (e.g. A futuristic hovering racing car)"
              className="w-full bg-zinc-900/50 border-zinc-800 rounded-xl p-3 text-sm text-zinc-200 placeholder:text-zinc-600 resize-none min-h-[90px] focus:outline-none focus-visible:ring-1 focus-visible:ring-pink-500 focus-visible:border-pink-500/50"
            />
          </div>
        </div>
      )}

      {/* Texture Selection Dropdown */}
      <div className="space-y-2 px-1">
        <div className="flex items-center gap-2 px-1">
          <Label className="text-xs font-medium text-zinc-300">Texture Quality</Label>
        </div>
        {isMounted ? (
          <Select 
            value={texture ? 'pbr' : 'vertex'} 
            onValueChange={(val) => setTexture(val === 'pbr')}
          >
            <SelectTrigger className="w-full bg-zinc-900/50 border-zinc-800 rounded-xl h-10 text-xs text-zinc-200 focus:ring-pink-500">
              <SelectValue placeholder="Select texture mode" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-950 border-zinc-800 text-zinc-200">
              <SelectItem value="vertex" className="text-xs focus:bg-zinc-800 focus:text-white">
                Vertex Color (Fastest)
              </SelectItem>
              <SelectItem value="pbr" className="text-xs focus:bg-zinc-800 focus:text-white">
                PBR Texture (High Quality)
              </SelectItem>
            </SelectContent>
          </Select>
        ) : (
          <div className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl h-10 animate-pulse" />
        )}
        <p className="text-[10px] text-zinc-500 px-1 italic">
          PBR includes metallic, roughness, and normal maps for realistic lighting.
        </p>
      </div>

      <div className="pt-2 mt-auto">
        <button
          type="submit"
          disabled={
            isLoading ||
            (mode === 'text' && !prompt.trim()) ||
            (mode === 'image' && !imageBase64) ||
            currentCredits < 30
          }
          className="w-full h-11 flex items-center justify-center gap-2 bg-pink-600 hover:bg-pink-500 disabled:opacity-50 disabled:hover:bg-pink-600 text-white text-sm font-semibold rounded-xl transition-all shadow-[0_0_15px_rgba(236,72,153,0.2)] hover:shadow-[0_0_20px_rgba(236,72,153,0.4)]"
        >
          {isLoading ? (
            <UpdateIcon className="w-4 h-4 animate-spin" />
          ) : (
            <CubeIcon className="w-4 h-4" />
          )}
          {isLoading ? 'Generating Model...' : 'Generate 3D Model (30 Credits)'}
        </button>
      </div>
    </form>
  )

  const renderPreview = () => {
    // ── LOADING STATE ────────────────────────────────────────────────────────
    if (isLoading) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-black/60 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(236,72,153,0.05),transparent_60%)] pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative w-full max-w-xl aspect-square bg-zinc-900/40 rounded-xl overflow-hidden shadow-2xl flex flex-col items-center justify-center border border-zinc-800/50 backdrop-blur-md">
            <div className="relative mb-6 w-24 h-24">
              <CubeIcon className="w-16 h-16 text-pink-500/20 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              {/* ✅ FIX 3: Removed invalid inline style string — now proper JSX */}
              <div className="w-24 h-24 border-[3px] border-pink-500/10 rounded-full absolute inset-0" />
              <div
                className="w-24 h-24 border-[3px] border-pink-500 border-t-transparent rounded-full animate-spin absolute inset-0"
                style={{ animationDuration: '2s' }}
              />
              <div
                className="w-24 h-24 border-[3px] border-purple-500 border-b-transparent rounded-full animate-spin absolute inset-0"
                style={{ animationDuration: '1.5s', animationDirection: 'reverse' }}
              />
            </div>
            <div className="space-y-1.5 text-center">
              <p className="animate-pulse font-medium text-pink-100 text-sm tracking-wide">
                {status || 'Orchestrating AI 3D Model...'}
              </p>
              <p className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase opacity-70">
                Synthesizing Geometry
              </p>
            </div>
          </div>
        </div>
      )
    }

    // ── MODEL READY ──────────────────────────────────────────────────────────
    if (modelUrl) {
      return (
        <div className="w-full h-full flex flex-col relative items-center justify-center p-6 bg-black">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(236,72,153,0.08),transparent_50%)] pointer-events-none" />

          <div className="w-full h-full flex flex-col justify-center max-w-6xl">
            {/* Header row */}
            <div className="flex justify-between items-center mb-4 px-2 z-10 w-full">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
                <span className="text-sm font-semibold text-zinc-200">Generation Complete</span>
              </div>
              <button
                type="button"
                onClick={() => setModelUrl(null)}
                className="text-xs text-zinc-500 hover:text-red-400 transition hover:bg-red-400/10 px-3 py-1.5 rounded-lg border border-transparent hover:border-red-400/20"
              >
                Clear View
              </button>
            </div>

            {/* ✅ FIX 4: model-viewer as direct JSX — NOT React.createElement */}
            <div className="relative w-full flex-1 min-h-0 bg-zinc-900/60 rounded-xl overflow-hidden border border-zinc-800 flex items-center justify-center shadow-2xl">
              {viewerReady ? (
                <model-viewer
                  ref={modelViewerRef as React.RefObject<HTMLElement>}
                  src={`/api/3d/proxy?url=${encodeURIComponent(modelUrl)}`}
                  crossorigin="anonymous"
                  alt="A 3D model generated by AI"
                  auto-rotate
                  autoplay
                  camera-controls
                  shadow-intensity="1.5"
                  environment-image="neutral"
                  exposure="1.2"
                  camera-orbit="45deg 55deg 2.5m"
                  style={{
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'transparent',
                    '--poster-color': 'transparent',
                  } as React.CSSProperties}
                />
              ) : (
                // ✅ FIX 5: Fallback while model-viewer script loads
                <div className="flex flex-col items-center gap-3 text-zinc-500">
                  <UpdateIcon className="w-6 h-6 animate-spin text-pink-500" />
                  <p className="text-xs">Loading 3D viewer...</p>
                </div>
              )}

              <div className="absolute bottom-4 left-4 pointer-events-none z-10">
                <div className="px-3 py-1.5 bg-black/50 backdrop-blur border border-white/10 rounded-full text-[10px] text-zinc-400 flex items-center gap-2 shadow-lg">
                  <CubeIcon className="w-3.5 h-3.5 text-pink-400" />
                  Drag to rotate · Scroll to zoom
                </div>
              </div>
            </div>

            {/* Footer row */}
            <div className="mt-4 flex flex-col gap-4 px-2 z-10 w-full">
              {/* Mesh Tools */}
              <div className="flex flex-wrap items-center gap-2 p-3 bg-zinc-900/50 rounded-xl border border-zinc-800">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mr-2">Mesh Tools</span>
                <button
                  type="button"
                  disabled={isEditing || isLoading}
                  onClick={() => handleMeshEdit('quad')}
                  className="px-3 py-1.5 bg-zinc-800 hover:bg-pink-600/20 text-zinc-300 hover:text-pink-400 text-[10px] font-medium rounded-md border border-zinc-700 transition disabled:opacity-50"
                >
                  Convert to Quad
                </button>
                <button
                   type="button"
                   disabled={isEditing || isLoading}
                   onClick={() => handleMeshEdit('obj')}
                   className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] font-medium rounded-md border border-zinc-700 transition disabled:opacity-50"
                >
                  OBJ Format
                </button>
                <button
                   type="button"
                   disabled={isEditing || isLoading}
                   onClick={() => handleMeshEdit('stl')}
                   className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] font-medium rounded-md border border-zinc-700 transition disabled:opacity-50"
                >
                  STL (3D Print)
                </button>
              </div>

              {/* Animation Tools */}
              <div className="flex flex-wrap items-center gap-2 p-3 bg-zinc-900/50 rounded-xl border border-zinc-800">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mr-2">Rigging & Animation</span>
                <button
                  type="button"
                  disabled={isEditing || isLoading}
                  onClick={() => handleAnimate('walk')}
                  className="px-3 py-1.5 bg-zinc-800 hover:bg-emerald-600/20 text-zinc-300 hover:text-emerald-400 text-[10px] font-medium rounded-md border border-zinc-700 transition disabled:opacity-50"
                >
                  Walk Cycle
                </button>
                <button
                   type="button"
                   disabled={isEditing || isLoading}
                   onClick={() => handleAnimate('run')}
                   className="px-3 py-1.5 bg-zinc-800 hover:bg-emerald-600/20 text-zinc-300 hover:text-emerald-400 text-[10px] font-medium rounded-md border border-zinc-700 transition disabled:opacity-50"
                >
                  Run Cycle
                </button>
                <button
                   type="button"
                   disabled={isEditing || isLoading}
                   onClick={() => handleAnimate('dive_classic')}
                   className="px-3 py-1.5 bg-zinc-800 hover:bg-emerald-600/20 text-zinc-300 hover:text-emerald-400 text-[10px] font-medium rounded-md border border-zinc-700 transition disabled:opacity-50"
                >
                  Classic Dive
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs font-mono text-zinc-500">
                  <span className="px-2 py-1 bg-zinc-900 rounded-md border border-zinc-800 text-pink-500/80">
                    {mode.toUpperCase()}
                  </span>
                  <span className="px-2 py-1 bg-zinc-900 rounded-md border border-zinc-800">
                    {modelUrl.toLowerCase().includes('.glb') ? 'GLB FORMAT' : 
                     modelUrl.toLowerCase().includes('.obj') ? 'OBJ FORMAT' : 
                     modelUrl.toLowerCase().includes('.stl') ? 'STL FORMAT' : '3D MODEL'}
                  </span>
                </div>
                <a
                  href={modelUrl}
                  download={`3d-model-${Date.now()}.${modelUrl.split('.').pop() || 'glb'}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-6 py-2.5 bg-zinc-100 hover:bg-white text-zinc-900 text-xs font-bold rounded-lg transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] active:scale-95"
                >
                  <Download className="w-4 h-4" />
                  Download Model
                </a>
              </div>
            </div>
          </div>
        </div>
      )
    }

    // ── EMPTY STATE ──────────────────────────────────────────────────────────
    return (
      <div className="w-full h-full flex flex-col justify-center items-center relative bg-black/80">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02),transparent_40%)] pointer-events-none" />

        <div className="flex flex-col items-center gap-6 text-zinc-600 relative z-10 w-full max-w-sm p-8 rounded-3xl border border-white/5 bg-zinc-950/50 backdrop-blur-sm shadow-2xl">
          <div className="w-20 h-20 rounded-2xl bg-zinc-900 flex items-center justify-center border border-zinc-800 rotate-12 shadow-inner">
            <CubeIcon className="w-10 h-10 text-pink-500/40" />
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-zinc-200 font-semibold tracking-wide text-lg">3D Viewer</h3>
            <p className="text-xs font-medium text-zinc-500 leading-relaxed">
              Your generated 3D model will appear here as an interactive element. Provide a
              prompt or image to begin.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // ─── ROOT ────────────────────────────────────────────────────────────────────
  return (
    <div className="w-full max-w-[1200px] mx-auto h-[750px] bg-[#09090b] border border-zinc-800/80 rounded-2xl flex overflow-hidden shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] mt-10 p-0 relative">
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-pink-500/5 to-transparent z-0 w-[400px]" />

      {/* LEFT: Settings & History */}
      <div className="w-[340px] flex flex-col border-r border-zinc-800/80 bg-[#0c0c0e]/80 backdrop-blur z-10 shrink-0">
        {renderHeader()}
        <div className="flex-1 overflow-y-auto relative">
          {showHistory ? renderHistory() : renderForm()}
        </div>
      </div>

      {/* RIGHT: Preview */}
      <div className="flex-1 bg-black relative overflow-hidden flex flex-col z-0">
        {renderPreview()}
      </div>
    </div>
  )
}