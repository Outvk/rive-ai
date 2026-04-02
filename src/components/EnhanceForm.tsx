'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, 
  Upload, 
  Download, 
  Trash2, 
  Layers, 
  Image as ImageIcon, 
  Sparkles, 
  FileText, 
  ChevronRight, 
  Cpu,
  History,
  Zap,
  ArrowRight,
  Maximize2,
  RefreshCw
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

type EnhanceAction = 'remove-background' | 'ai-backgrounds' | 'text-removal'

interface EnhanceFormProps {
  initialCredits?: number
  initialHistory?: any[]
}

export function EnhanceForm({ 
  initialCredits = 0,
  initialHistory = [] 
}: EnhanceFormProps) {
  const [activeTab, setActiveTab] = useState<EnhanceAction>('remove-background')
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [prompt, setPrompt] = useState<string>('')
  const [textMode, setTextMode] = useState<'ai.all' | 'ai.artificial' | 'ai.natural'>('ai.all')
  const [isLoading, setIsLoading] = useState(false)
  const [resultBase64, setResultBase64] = useState<string | null>(null)
  const [currentCredits, setCurrentCredits] = useState(initialCredits)
  const [history, setHistory] = useState<any[]>(initialHistory)
  const [showHistory, setShowHistory] = useState(false)
  const [viewMode, setViewMode] = useState<'single' | 'compare'>('single')
  
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0]
      setFile(selectedFile)
      setPreviewUrl(URL.createObjectURL(selectedFile))
      setResultBase64(null)
      setViewMode('single')
    }
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (currentCredits < 10) {
      toast.error('Insufficient credits. Cost is 10 credits.')
      return
    }
    if (!file) {
      toast.error('Please upload an image first.')
      return
    }
    if (activeTab === 'ai-backgrounds' && !prompt.trim()) {
      toast.error('Please enter a prompt for the AI background.')
      return
    }

    setIsLoading(true)
    setResultBase64(null)

    try {
      const formData = new FormData()
      formData.append('action', activeTab)
      formData.append('imageFile', file)
      if (activeTab === 'ai-backgrounds') {
        formData.append('prompt', prompt)
      }
      if (activeTab === 'text-removal') {
        formData.append('textMode', textMode)
      }

      const res = await fetch('/api/enhance', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || 'Enhancement failed')
      }

      if (data.image) {
        setResultBase64(data.image)
        setCurrentCredits(prev => Math.max(0, prev - 10))
        
        try {
            await fetch('/api/history/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: activeTab === 'ai-backgrounds' ? prompt.trim() : `Enhanced via ${activeTab}`,
                    imageUrl: `data:image/png;base64,${data.image}`,
                    settings: { mode: 'enhance', action: activeTab }
                })
            })
            router.refresh()
        } catch (saveErr) {
            console.error("History save error:", saveErr)
        }
      }
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'Failed to enhance image')
    } finally {
      setIsLoading(false)
    }
  }

  const downloadResult = () => {
    if (!resultBase64) return
    const link = document.createElement('a')
    link.href = `data:image/png;base64,${resultBase64}`
    link.download = `rive-enhanced-${activeTab}.png`
    link.click()
  }

  const tools = [
    { 
      id: 'remove-background', 
      label: 'Background Removal', 
      icon: Layers, 
      color: 'indigo',
      description: 'Remove backgrounds instantly with high precision.'
    },
    { 
      id: 'ai-backgrounds', 
      label: 'Background Changer', 
      icon: Sparkles, 
      color: 'violet',
      description: 'Generate stunning professional backgrounds with prompts.'
    },
    { 
      id: 'text-removal', 
      label: 'Text Removal', 
      icon: FileText, 
      color: 'cyan',
      description: 'Clean up images by removing unwanted text or watermarks.'
    }
  ]

  const currentTool = tools.find(t => t.id === activeTab)

  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 lg:px-12 mt-4 mb-20">
      <div className="relative bg-[#09090b] border border-white/5 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col lg:flex-row h-auto lg:h-[800px]">
        
        {/* Left Side: Sidebar Tools */}
        <div className="w-full lg:w-80 bg-zinc-950/50 border-r border-white/5 flex flex-col">
          <div className="p-8 border-b border-white/5">
            <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-[0.2em] mb-6">Suite of Tools</h2>
            <div className="space-y-3">
              {tools.map((tool) => {
                const isActive = activeTab === tool.id
                const Icon = tool.icon
                return (
                  <button
                    key={tool.id}
                    onClick={() => {
                        setActiveTab(tool.id as EnhanceAction)
                        setResultBase64(null)
                    }}
                    className={cn(
                      "w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-500 group relative overflow-hidden",
                      isActive 
                        ? "bg-white/5 text-white border border-white/10" 
                        : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5 border border-transparent"
                    )}
                  >
                    <div className={cn(
                        "p-2 rounded-xl transition-colors",
                        isActive ? "bg-indigo-500/20 text-indigo-400" : "bg-zinc-900 text-zinc-600 group-hover:text-zinc-400"
                    )}>
                        <Icon size={20} />
                    </div>
                    <div className="text-left">
                        <div className="text-sm font-bold">{tool.label}</div>
                        {isActive && <div className="text-[10px] text-zinc-500 font-medium">Active Engine</div>}
                    </div>
                    {isActive && (
                      <motion.div 
                        layoutId="active-indicator"
                        className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500" 
                      />
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="p-8 flex-1 overflow-y-auto no-scrollbar">
            <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-[0.2em] mb-6">Configuration</h2>
            
            <div className="space-y-8">
                {activeTab === 'ai-backgrounds' && (
                    <div className="space-y-4">
                        <label className="text-xs font-semibold text-zinc-400">Environment Prompt</label>
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="e.g., A minimalist workspace with soft morning light..."
                            className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl p-4 text-sm text-zinc-200 placeholder:text-zinc-600 resize-none h-32 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all font-medium"
                        />
                    </div>
                )}

                {activeTab === 'text-removal' && (
                    <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl">
                        <div className="flex items-center gap-2 mb-2">
                             <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                             <span className="text-xs font-bold text-amber-500 uppercase tracking-widest">Coming Soon</span>
                        </div>
                        <p className="text-[11px] text-zinc-500 leading-relaxed">
                            Our advanced text and watermark removal model is currently being retrained.
                        </p>
                    </div>
                )}

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-zinc-400">Credit Cost</label>
                        <span className="text-xs font-bold text-white px-2 py-1 bg-white/5 rounded-lg border border-white/5">10 Credits</span>
                    </div>
                    
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading || !file || (activeTab === 'ai-backgrounds' && !prompt.trim()) || activeTab === 'text-removal' || currentCredits < 10}
                        className="w-full group relative h-14 rounded-2xl overflow-hidden shadow-xl disabled:opacity-50 disabled:grayscale transition-all active:scale-95"
                    >
                        <div className="absolute inset-0 bg-indigo-600 group-hover:bg-indigo-500 transition-colors" />
                        <div className="relative flex items-center justify-center gap-2 font-bold text-sm text-white">
                            {isLoading ? (
                                <RefreshCw className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <span>Process Image</span>
                                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </div>
                    </button>
                    
                    <div className="flex items-center justify-center gap-4 py-2 border-t border-white/5">
                        <span className="text-[10px] text-zinc-600 uppercase tracking-widest font-bold">Balance: {currentCredits} Credits</span>
                    </div>
                </div>
            </div>
          </div>
        </div>

        {/* Central Component: Preview & Results */}
        <div className="flex-1 flex flex-col bg-black relative">
            {/* Toolbar Top */}
            <div className="h-14 border-b border-white/5 px-6 flex items-center justify-between bg-zinc-950/50">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-none mt-0.5">Engine Ready</span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {resultBase64 && (
                        <div className="flex bg-zinc-900 border border-white/5 rounded-lg p-0.5 mr-2">
                            <button 
                                onClick={() => setViewMode('single')}
                                className={cn("px-3 py-1 rounded-md text-[10px] font-bold transition-all", viewMode === 'single' ? "bg-white/10 text-white" : "text-zinc-500 hover:text-white")}
                            >
                                Single
                            </button>
                            <button 
                                onClick={() => setViewMode('compare')}
                                className={cn("px-3 py-1 rounded-md text-[10px] font-bold transition-all", viewMode === 'compare' ? "bg-white/10 text-white" : "text-zinc-500 hover:text-white")}
                            >
                                Compare
                            </button>
                        </div>
                    )}
                    <button 
                      onClick={() => setShowHistory(!showHistory)}
                      className={cn(
                        "p-2 rounded-lg transition-all",
                        showHistory ? "bg-indigo-500/20 text-indigo-400" : "text-zinc-500 hover:text-white hover:bg-white/5"
                      )}
                      title="History"
                    >
                        <History size={18} />
                    </button>
                </div>
            </div>

            <div className="flex-1 relative flex items-center justify-center overflow-hidden p-8 lg:p-12">
                {/* Visual Depth Background */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.05)_0%,transparent_50%)] pointer-events-none" />
                
                <AnimatePresence mode="wait">
                    {!file ? (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full max-w-xl aspect-[4/3] rounded-3xl border-2 border-dashed border-white/10 bg-zinc-900/40 hover:bg-zinc-900/60 hover:border-indigo-500/50 transition-all duration-500 flex flex-col items-center justify-center group cursor-pointer"
                        >
                            <input 
                                ref={fileInputRef}
                                type="file" 
                                accept="image/*" 
                                onChange={handleFileChange} 
                                className="hidden" 
                            />
                            <div className="w-20 h-20 rounded-[2rem] bg-zinc-900/80 border border-white/10 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-500 mb-6">
                                <Upload className="w-8 h-8 text-zinc-500 group-hover:text-indigo-400" />
                            </div>
                            <h3 className="text-lg font-bold text-white mb-2">Initialize Canvas</h3>
                            <p className="text-zinc-500 text-sm max-w-xs text-center">Drag and drop your asset or click to browse the filesystem.</p>
                            <div className="mt-8 px-4 py-2 rounded-full border border-white/10 text-[10px] font-bold text-zinc-500 uppercase tracking-widest group-hover:text-zinc-300">
                                Supports PNG, JPG, WEBP
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div 
                            key={resultBase64 ? 'result' : 'preview'}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="relative w-full h-full flex items-center justify-center"
                        >
                            {isLoading ? (
                                <div className="flex flex-col items-center gap-6">
                                    <div className="relative w-24 h-24">
                                        <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full" />
                                        <div className="absolute inset-0 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Cpu className="w-8 h-8 text-indigo-500 animate-pulse" />
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        <h3 className="text-lg font-bold text-white">Synthesizing Pixels</h3>
                                        <p className="text-zinc-500 text-sm animate-pulse mt-1">Our neural engine is processing your asset...</p>
                                    </div>
                                </div>
                            ) : resultBase64 ? (
                                <div className="relative group w-full h-full flex items-center justify-center">
                                    {viewMode === 'compare' ? (
                                        <div className="grid grid-cols-2 gap-4 w-full h-full p-4 lg:p-8">
                                            <div className="relative flex flex-col">
                                                <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 px-1">Source</div>
                                                <div className="flex-1 rounded-2xl overflow-hidden border border-white/5 bg-zinc-900 flex items-center justify-center relative">
                                                    <img src={previewUrl!} className="max-w-full max-h-full object-contain" alt="Original" />
                                                </div>
                                            </div>
                                            <div className="relative flex flex-col">
                                                <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-2 px-1">Enhanced</div>
                                                <div className="flex-1 rounded-2xl overflow-hidden border border-indigo-500/30 bg-zinc-900 flex items-center justify-center relative shadow-[0_0_50px_rgba(99,102,241,0.1)]">
                                                    <img src={`data:image/png;base64,${resultBase64}`} className="max-w-full max-h-full object-contain" alt="Result" />
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="relative max-w-full max-h-full aspect-auto rounded-2xl overflow-hidden border border-white/10 bg-zinc-900 shadow-2xl">
                                            <img 
                                                src={`data:image/png;base64,${resultBase64}`} 
                                                className="max-w-full max-h-[600px] object-contain" 
                                                alt="Result" 
                                            />
                                        </div>
                                    )}
                                    
                                    <div className="absolute bottom-10 right-10 flex gap-3 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                                        <button 
                                            onClick={() => fileInputRef.current?.click()}
                                            className="bg-black/60 backdrop-blur-xl border border-white/10 text-white px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-white hover:text-black transition-all shadow-2xl"
                                        >
                                            <Plus size={16} /> New Asset
                                        </button>
                                        <button 
                                            onClick={downloadResult}
                                            className="bg-indigo-600 border border-indigo-400/20 text-white px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-indigo-500 transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)]"
                                        >
                                            <Download size={16} /> Export HD
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="relative group max-w-full max-h-full aspect-auto rounded-3xl overflow-hidden border border-white/10 bg-zinc-900/50 shadow-2xl">
                                    <img src={previewUrl!} className="max-w-full max-h-[600px] object-contain opacity-50 contrast-[0.8]" alt="Original Preview" />
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <div className="bg-black/60 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full text-[10px] font-bold text-white uppercase tracking-widest">
                                            Editing Mode
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => {
                                            setFile(null)
                                            setPreviewUrl(null)
                                        }}
                                        className="absolute top-6 right-6 p-3 bg-red-500/10 hover:bg-red-500 hover:text-white text-red-400 border border-red-500/20 rounded-2xl transition-all opacity-0 group-hover:opacity-100"
                                        title="Remove Image"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* History Drawer Overlay */}
                <AnimatePresence>
                    {showHistory && (
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="absolute inset-y-0 right-0 w-80 lg:w-96 bg-[#0c0c0e] border-l border-white/5 z-40 p-8 shadow-[-20px_0_50px_rgba(0,0,0,0.5)]"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-sm font-bold text-white uppercase tracking-widest">Asset History</h3>
                                <button onClick={() => setShowHistory(false)} className="text-zinc-500 hover:text-white transition-colors">
                                    <Plus className="rotate-45" size={20} />
                                </button>
                            </div>

                            <div className="overflow-y-auto h-[calc(100%-4rem)] no-scrollbar space-y-4">
                                {history.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                                        <ImageIcon size={40} className="mb-4 text-zinc-600" />
                                        <p className="text-xs font-medium text-zinc-500 uppercase tracking-widest">No assets found</p>
                                    </div>
                                ) : (
                                    history.map((item) => (
                                        <motion.div 
                                            key={item.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="group relative rounded-2xl overflow-hidden bg-zinc-900 border border-white/5 aspect-[4/3] cursor-pointer"
                                        >
                                            <img 
                                                src={item.url} 
                                                alt={item.prompt} 
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end">
                                                <p className="text-[10px] text-zinc-300 font-bold uppercase truncate mb-3">{item.prompt}</p>
                                                <div className="flex gap-2">
                                                    <button 
                                                        onClick={() => {
                                                            const link = document.createElement('a');
                                                            link.href = item.url;
                                                            link.download = `archive-${item.id}.png`;
                                                            link.click();
                                                        }}
                                                        className="flex-1 bg-white text-black py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2"
                                                    >
                                                        <Download size={14} /> Export
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
      </div>

      {/* Hero Header Integrated below or above? Let's do a bottom feature grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 px-4">
          <div className="flex gap-4">
              <div className="w-12 h-12 shrink-0 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <Cpu size={24} />
              </div>
              <div>
                  <h4 className="font-bold text-white text-sm mb-1 uppercase tracking-widest">Neural Upscaling</h4>
                  <p className="text-xs text-zinc-500 leading-relaxed font-medium">Advanced deep learning models that restore lost resolution and clarity.</p>
              </div>
          </div>
          <div className="flex gap-4">
              <div className="w-12 h-12 shrink-0 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
                  <Sparkles size={24} />
              </div>
              <div>
                  <h4 className="font-bold text-white text-sm mb-1 uppercase tracking-widest">Magic Masking</h4>
                  <p className="text-xs text-zinc-500 leading-relaxed font-medium">Automatic object detection for pixel-perfect background isolation.</p>
              </div>
          </div>
          <div className="flex gap-4">
              <div className="w-12 h-12 shrink-0 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                  <ImageIcon size={24} />
              </div>
              <div>
                  <h4 className="font-bold text-white text-sm mb-1 uppercase tracking-widest">Creative Context</h4>
                  <p className="text-xs text-zinc-500 leading-relaxed font-medium">Change environments while maintaining subject lighting and shadows.</p>
              </div>
          </div>
      </div>
    </div>
  )
}
