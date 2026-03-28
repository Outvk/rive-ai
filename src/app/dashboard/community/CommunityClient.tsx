'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { 
  Search, 
  Filter, 
  Heart, 
  MessageSquare, 
  Zap, 
  Play, 
  Pause,
  Image as ImageIcon, 
  Video, 
  Type, 
  Mic2, 
  Box, 
  ArrowUpRight,
  Plus,
  Compass,
  Layout,
  Users,
  Target,
  Sparkles,
  Loader2,
  Copy,
  Check,
  Download
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { 
  getCommunityWorks, 
  getTemplates, 
  toggleLikePost, 
  useTemplateAction, 
  addComment,
  getComments,
  type CommunityWork, 
  type Template 
} from './actions'
import { useAuthLoader } from '@/components/AuthLoader'
import { useRouter } from 'next/navigation'
import { ShareWorkModal } from './ShareWorkModal'

// --- Constants ---

type ToolType = 'All' | 'Image' | 'Video' | 'Text' | 'Audio' | '3D'
type SortType = 'Trending' | 'Latest' | 'Most Liked'
type TemplateCategory = 'All' | 'Marketing' | 'Social Media' | 'Education' | 'Business' | 'Creative'

// --- 3D Model Viewer Component ---
const Interactive3DCard = ({ src, title, prompt, author }: { src: string, title: string, prompt: string, author: string }) => {
  return (
    <div className="group relative flex flex-col bg-zinc-900/40 border border-white/10 rounded-3xl overflow-hidden hover:border-purple-500/30 transition-all duration-500 backdrop-blur-sm h-[400px]">
      <div className="relative flex-1 bg-zinc-950/50">
        {/* @ts-ignore */}
        <model-viewer
          src={src}
          alt={title}
          auto-rotate
          camera-controls
          shadow-intensity="1"
          style={{ width: '100%', height: '100%', '--poster-color': 'transparent' } as any}
          touch-action="pan-y"
          ar
        >
          <div slot="poster" className="absolute inset-0 flex items-center justify-center bg-zinc-900/40 animate-pulse">
            <Box className="w-12 h-12 text-zinc-700" />
          </div>
        </model-viewer>
        
        <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 text-[10px] font-bold uppercase tracking-widest backdrop-blur-md">
            Interactive 3D
        </div>
      </div>
      
      <div className="p-5 flex flex-col gap-2 bg-gradient-to-t from-black to-zinc-900/80">
        <h3 className="text-white font-bold text-sm">{title}</h3>
        <p className="text-xs text-zinc-500 italic line-clamp-1">"{prompt}"</p>
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
           <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-tighter">By {author}</span>
           <div className="flex items-center gap-4">
               <button 
                onClick={() => {
                    navigator.clipboard.writeText(prompt);
                    alert("Prompt copied!");
                }}
                className="text-[10px] font-bold text-purple-400 hover:text-white transition-colors"
               >
                 COPY PROMPT
               </button>
               <button 
                onClick={() => {
                    const link = document.createElement('a');
                    link.href = src;
                    link.download = `${title.replace(/\s+/g, '_')}.glb`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                }}
                className="text-[10px] font-bold text-zinc-400 hover:text-white transition-colors flex items-center gap-1"
               >
                 <Download className="w-3 h-3" />
                 DOWNLOAD
               </button>
           </div>
        </div>
      </div>
    </div>
  )
}

const InteractiveVideoCard = ({ src, title, prompt, author }: { src: string, title: string, prompt: string, author: string }) => {
    const videoRef = React.useRef<HTMLVideoElement>(null)
    const [isPlaying, setIsPlaying] = useState(false)

    const togglePlay = (e: React.MouseEvent) => {
        e.stopPropagation()
        if (!videoRef.current) return
        if (isPlaying) {
            videoRef.current.pause()
        } else {
            videoRef.current.play()
        }
        setIsPlaying(!isPlaying)
    }

    return (
      <div className="group relative flex flex-col bg-zinc-900/40 border border-white/10 rounded-3xl overflow-hidden hover:border-purple-500/30 transition-all duration-500 backdrop-blur-sm h-[400px]">
        <div className="relative flex-1 bg-zinc-950 overflow-hidden cursor-pointer" onClick={togglePlay}>
          <video 
            ref={videoRef}
            src={src} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            muted
            loop
            playsInline
            preload="none"
          />
          
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 transition-opacity">
             <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-2xl hover:scale-110 transition-transform">
                {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
             </div>
          </div>

          <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-blue-500/20 border border-blue-500/40 text-black text-[10px] font-bold uppercase tracking-widest backdrop-blur-md">
              Featured Video
          </div>
        </div>
        
        <div className="p-5 flex flex-col gap-2 bg-gradient-to-t from-black to-zinc-900/80">
          <h3 className="text-white font-bold text-sm">{title}</h3>
          <p className="text-xs text-zinc-500 italic line-clamp-1">"{prompt}"</p>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
             <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-tighter">By {author}</span>
             <div className="flex items-center gap-4">
                 <button 
                  onClick={() => {
                      navigator.clipboard.writeText(prompt);
                      alert("Prompt copied!");
                  }}
                  className="text-[10px] font-bold text-blue-400 hover:text-white transition-colors"
                 >
                   COPY PROMPT
                 </button>
                 <button 
                  onClick={() => {
                      const link = document.createElement('a');
                      link.href = src;
                      link.download = `${title.replace(/\s+/g, '_')}.mp4`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                  }}
                  className="text-[10px] font-bold text-zinc-400 hover:text-white transition-colors flex items-center gap-1"
                 >
                   <Download className="w-3 h-3" />
                   DOWNLOAD
                 </button>
             </div>
          </div>
        </div>
      </div>
    )
  }


const ToolIcon = ({ type, className }: { type: string, className?: string }) => {
  switch (type) {
    case 'Image': return <ImageIcon className={className} />
    case 'Video': return <Video className={className} />
    case 'Text': return <Type className={className} />
    case 'Audio': return <Mic2 className={className} />
    case '3D': return <Box className={className} />
    default: return <Sparkles className={className} />
  }
}

export function CommunityClient() {
  const [activeTab, setActiveTab] = useState<'community' | 'templates'>('community')
  const [isLoading, setIsLoading] = useState(true)
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const router = useRouter()
  const { showLoader } = useAuthLoader()

  // Community State
  const [works, setWorks] = useState<CommunityWork[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [toolFilter, setToolFilter] = useState<ToolType>('All')
  const [sortBy, setSortBy] = useState<SortType>('Latest')

  // Templates State
  const [templates, setTemplates] = useState<Template[]>([])
  const [categoryFilter, setCategoryFilter] = useState<TemplateCategory>('All')

  // Comments State
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({})
  const [commentsData, setCommentsData] = useState<Record<string, any[]>>({})
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({})
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const [activeCommentId, setActiveCommentId] = useState<string | null>(null)

  // Fetch Data on Mount and when filters change
  useEffect(() => {
    async function loadData() {
      setIsLoading(true)
      try {
        if (activeTab === 'community') {
            const data = await getCommunityWorks(toolFilter, sortBy)
            setWorks(data || [])
        } else {
            const data = await getTemplates(categoryFilter)
            setTemplates(data || [])
        }
      } catch (error) {
        console.error("Failed to fetch data:", error)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [activeTab, toolFilter, sortBy, categoryFilter])

  // Client-side filtering for search query
  const filteredWorks = useMemo(() => {
    if (!searchQuery) return works
    return works.filter(w => 
      w.prompt.toLowerCase().includes(searchQuery.toLowerCase()) || 
      w.profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [works, searchQuery])

  // Interaction Handlers
  const handleLike = async (postId: string) => {
    // Optimistic UI toggle immediately
    setWorks(prev => prev.map(w => {
         if(w.id === postId) {
             const isLiking = !w.has_liked;
             return {...w, has_liked: isLiking, likes_count: w.likes_count + (isLiking ? 1 : -1)}
         }
         return w
    }))

    try {
        const res = await toggleLikePost(postId)
        if (!res.success) {
            // Silently swallow fail here or add toast
        } else {
            // Strictly sync with server true-state
            setWorks(prev => prev.map(w => {
                if(w.id === postId) {
                    return {...w, has_liked: res.action === 'liked'}
                }
                return w
           }))
        }
    } catch (err) {
        console.error("Error liking:", err)
    }
  }

  const handleToggleComments = async (postId: string) => {
    setExpandedComments(prev => ({ ...prev, [postId]: !prev[postId] }))
    if (!commentsData[postId]) {
      const data = await getComments(postId)
      setCommentsData(prev => ({ ...prev, [postId]: data }))
    }
  }

  const handleSubmitComment = async (postId: string) => {
    const text = commentInputs[postId]
    if (!text?.trim() || isSubmittingComment) return

    setIsSubmittingComment(true)
    setActiveCommentId(postId)
    const res = await addComment(postId, text)
    if (res.success) {
      const data = await getComments(postId)
      setCommentsData(prev => ({ ...prev, [postId]: data }))
      setCommentInputs(prev => ({ ...prev, [postId]: '' }))
      setWorks(prev => prev.map(w => w.id === postId ? { ...w, comments_count: w.comments_count + 1 } : w))
    }
    setIsSubmittingComment(false)
    setActiveCommentId(null)
  }

  const handleUseTemplate = async (template: Template) => {
    showLoader(`Setting up ${template.title}...`)
    await useTemplateAction(template.id)
    const toolRoute = template.tool_type.toLowerCase() === 'image' ? '/dashboard/image-prompt' : `/dashboard/${template.tool_type.toLowerCase()}`
    setTimeout(() => router.push(toolRoute), 800)
  }

  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  if (!mounted) return <div className="min-h-screen bg-black" />

  return (
    <div className="flex flex-col gap-10 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Hero Banner Section */}
      <div className="relative group overflow-hidden rounded-[2.5rem] border border-white/10 min-h-[400px] flex flex-col items-center justify-center gap-6 shadow-2xl transition-all">
        <img 
          src="/banner.png" 
          alt="Community Hero" 
          className="absolute w-full h-full object-cover scale-x-[-1]"
        />
        <div className="absolute inset-0 bg-black/5 backdrop-blur-[2px]" />
        
        <div className="absolute top-8 right-10 z-20 flex flex-col items-start leading-none gap-0.5">
            <span className="text-xl font-bold text-zinc-900/60 uppercase tracking-widest font-[family-name:var(--font-audiowide)]">
                beyond
            </span>
            <span className="text-[10px] font-medium text-zinc-800/40 uppercase tracking-[0.5em] font-[family-name:var(--font-audiowide)]">
                creativity.
            </span>
        </div>

        {/* Top Left "Rive Community" Identifier */}
        <div className="absolute top-12 left-12 z-20">
            <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.5em] font-[family-name:var(--font-audiowide)]">
                rive community
            </span>
        </div>
        
        {/* Animated Orbs for Premium feel */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-600/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-indigo-600/20 rounded-full blur-[120px] animate-pulse delay-700" />

        {/* Narrative Text (Left Center) */}
        <div className="absolute top-1/2 -translate-y-1/2 left-12 z-10 max-w-2xl text-left">
          <h2 className="text-4xl md:text-5xl font-black text-white leading-[1.1] tracking-tighter mb-6">
            Join the elite circle <br /> of AI creators.
          </h2>
          <p className="text-lg md:text-xl font-medium text-zinc-400 leading-relaxed max-w-lg">
            Share your <span className="bg-black/80 px-2 py-0.5 rounded-lg text-white font-bold">masterpieces, inspire</span> the world, <br className="hidden md:block" />
            and build the future of digital art.
          </p>
        </div>

        {/* Company Logos / Trusted By (Bottom Left) */}
        <div className="absolute bottom-12 left-12 z-20 flex items-center gap-6 opacity-40">
           <div className="flex flex-col gap-1">
             <span className="text-[8px] font-bold text-white uppercase tracking-widest mb-1">Empowering</span>
             <div className="flex items-center gap-4">
               <div className="flex items-center gap-1.5 grayscale hover:grayscale-0 transition-all cursor-default">
                  <Zap className="w-4 h-4 text-purple-400" />
                  <span className="text-xs font-bold text-white">GEN-AI</span>
               </div>
               <div className="flex items-center gap-1.5 grayscale hover:grayscale-0 transition-all cursor-default">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-white">CREATIVE</span>
               </div>
               <div className="flex items-center gap-1.5 grayscale hover:grayscale-0 transition-all cursor-default">
                  <Layout className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-bold text-white">STUDIO</span>
               </div>
             </div>
           </div>
        </div>

        {/* Action Buttons (Bottom Right) */}
        <div className="absolute bottom-12 right-12 z-20 flex flex-wrap items-center gap-4">
          <button 
              onClick={() => setIsShareModalOpen(true)}
              className="flex items-center gap-3 bg-white text-black px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-110 transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)] active:scale-95"
          >
              <Plus className="w-5 h-5 font-black" />
              Share Work
          </button>
          <button 
              onClick={() => {
                  const scrollTarget = document.getElementById('browse-section');
                  scrollTarget?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex items-center gap-3 bg-zinc-900/80 backdrop-blur-md text-white border border-white/10 px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-white/10 transition-all active:scale-95"
          >
              <Compass className="w-5 h-5" />
              Browse Feed
          </button>
        </div>
      </div>

      {/* Header & Tab Switcher */}
      <div id="browse-section" className="flex flex-col md:flex-row md:items-end justify-between gap-6 mt-4">
        <div>
          <h1 className="text-4xl font-bold text-white tracking-tight mb-2 font-[family-name:var(--font-audiowide)]">Explore</h1>
          <p className="text-zinc-400 text-sm">Discover what's possible with Rive AI's creative engine.</p>
        </div>

        <div className="flex bg-zinc-900/50 p-1 rounded-xl border border-white/5 backdrop-blur-sm self-start">
          <button 
            onClick={() => setActiveTab('community')}
            className={cn(
              "flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-medium transition-all duration-300",
              activeTab === 'community' ? "bg-white text-black shadow-lg" : "text-zinc-400 hover:text-white"
            )}
          >
            <Compass className="w-4 h-4" />
            Community
          </button>
          <button 
            onClick={() => setActiveTab('templates')}
            className={cn(
              "flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-medium transition-all duration-300",
              activeTab === 'templates' ? "bg-white text-black shadow-lg" : "text-zinc-400 hover:text-white"
            )}
          >
            <Layout className="w-4 h-4" />
            Templates
          </button>
        </div>
      </div>


      {activeTab === 'community' ? (
        <>
          {/* Community Controls */}
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-purple-400 transition-colors" />
              <input 
                type="text" 
                placeholder="Search prompts or creators..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-900/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all backdrop-blur-md"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
              {(['All', 'Image', 'Video', 'Text', 'Audio', '3D'] as ToolType[]).map((tool) => (
                <button
                  key={tool}
                  onClick={() => setToolFilter(tool)}
                  className={cn(
                    "px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all border",
                    toolFilter === tool 
                      ? "bg-purple-600/20 border-purple-500/50 text-purple-300" 
                      : "bg-zinc-900/50 border-white/5 text-zinc-500 hover:text-zinc-300 hover:border-white/10"
                  )}
                >
                  {tool}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 bg-zinc-900/40 border border-white/10 rounded-xl px-4 py-2 text-zinc-300">
              <Filter className="w-4 h-4 text-zinc-500" />
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortType)}
                className="bg-transparent text-sm text-zinc-300 focus:outline-none cursor-pointer border-none p-0"
              >
                <option value="Latest">Latest</option>
                <option value="Trending">Trending</option>
                <option value="Most Liked">Most Liked</option>
              </select>
            </div>
          </div>

          {/* Banner removed from here to top */}


          {/* Loading Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="aspect-[4/3] rounded-2xl bg-zinc-900/40 animate-pulse border border-white/5" />
                ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Prepend Hardcoded 3D Masterpieces if 3D filter is active */}
                {toolFilter === '3D' && (
                    <>
                        <Interactive3DCard 
                            src="/3d/tripo_pbr_model_24451ae5-43df-491d-95c5-14cabac6bf08.glb"
                            title="Futuristic Mecha Core"
                            prompt="High-detail industrial mecha core with exposed wiring and metallic plating, 8k PBR textures"
                            author="TripoCreator"
                        />
                        <Interactive3DCard 
                            src="/3d/tripo_pbr_model_24ce6a20-8bbc-4aca-a934-de061e0dfb15.glb"
                            title="Bio-Mechanical Organism"
                            prompt="Organic 3D sculpture blending biological fibers with mechanical hardware, hyper-realistic"
                            author="AIArchitect"
                        />
                        <Interactive3DCard 
                            src="/3d/tripo_pbr_model_89fefafc-9b19-43cb-a561-41e842eecedf.glb"
                            title="Cyber-Relic Prototype"
                            prompt="An ancient relic reimagined with futuristic technology, glowing sigils and copper finish"
                            author="DigitalRelics"
                        />
                        <Interactive3DCard 
                            src="/3d/tripo_pbr_model_e5d8862c-2fe1-488f-ab85-4cd69e6bdd95.glb"
                            title="Synthetic Neural Node"
                            prompt="Abstract 3D representation of a synthetic neural network, translucent glass and golden paths"
                            author="NeuralMind"
                        />
                    </>
                )}

                {/* Prepend Hardcoded Video Masterpieces if Video filter is active */}
                {toolFilter === 'Video' && (
                    <>
                        <InteractiveVideoCard 
                            src="/video.mp4"
                            title="Cinematic Urban Night"
                            prompt="High-speed drone footage through a rainy cyberpunk city, hyper-realistic, 8k"
                            author="UrbanDrone"
                        />
                        <InteractiveVideoCard 
                            src="/image.mp4"
                            title="Organic Nature Bloom"
                            prompt="Time-lapse macro of an otherworldly flower blooming under neon moonlight"
                            author="NatureAI"
                        />
                        <InteractiveVideoCard 
                            src="/sound.mp4"
                            title="Abstract Soundscape"
                            prompt="Visual rhythmic waves reacting to deep synthetic bass, colorful and vibrant"
                            author="VibeMaster"
                        />
                        <InteractiveVideoCard 
                            src="/text.mp4"
                            title="Futuristic Typography"
                            prompt="Animated 3D text 'BEYOND' shifting into digital artifacts, gold finish"
                            author="TypeTech"
                        />
                    </>
                )}


                {filteredWorks.map((work) => (
                <div key={work.id} className="group relative flex flex-col bg-zinc-900/40 border border-white/10 rounded-2xl overflow-hidden hover:border-purple-500/30 transition-all duration-500 backdrop-blur-sm">
                    {/* Preview Image */}
                    <div className="relative aspect-[4/3] overflow-hidden bg-zinc-950">
                        {work.tool_type === 'Video' ? (
                            <div className="w-full h-full relative group/vid">
                                <video 
                                    src={work.preview_url} 
                                    className="w-full h-full object-cover cursor-pointer"
                                    onClick={e => {
                                        const v = e.currentTarget;
                                        if (v.paused) v.play();
                                        else v.pause();
                                    }}
                                    muted
                                    loop
                                    playsInline
                                    preload="none"
                                />
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity">
                                    <div className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center text-white">
                                       <Play className="w-6 h-6 fill-current ml-1 opacity-70" />
                                    </div>
                                </div>
                            </div>
                        ) : work.tool_type === 'Audio' ? (
                            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-amber-500/20 to-purple-500/20 group/audio">
                                <Mic2 className="w-12 h-12 text-zinc-500 group-hover:text-amber-400 transition-colors mb-4" />
                                <audio 
                                    src={work.preview_url}
                                    controls
                                    className="w-[80%] h-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                />
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none group-hover:opacity-0 transition-opacity">
                                    <div className="flex gap-1">
                                        {[...Array(5)].map((_, i) => (
                                            <div key={i} className="w-1 h-8 bg-zinc-700 rounded-full animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : work.tool_type === '3D' ? (
                            <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900 group/3d">
                                <Box className="w-16 h-16 text-zinc-700 group-hover:text-pink-500 transition-all group-hover:scale-110" />
                                <div className="absolute bottom-3 right-3 px-2 py-1 bg-pink-500/20 border border-pink-500/40 text-pink-400 text-[8px] font-bold rounded uppercase">
                                    Interactive 3D
                                </div>
                            </div>
                        ) : (
                            <img 
                                loading="lazy"
                                src={work.preview_url} 
                                alt="AI Preview" 
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop'
                                }}
                            />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                        
                        <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-bold text-white uppercase tracking-wider">
                            <ToolIcon type={work.tool_type} className="w-3 h-3 text-purple-400" />
                            {work.tool_type}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-5 flex flex-col flex-1 gap-4">
                    <p className="text-sm text-zinc-300 line-clamp-2 italic font-medium">
                        "{work.prompt}"
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-white/5 mt-auto">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full border border-white/10 overflow-hidden bg-zinc-800 flex items-center justify-center">
                                {work.profiles?.avatar_url ? (
                                    <img src={work.profiles.avatar_url} alt="Ava" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-[10px] font-bold text-zinc-500">{work.profiles?.full_name?.charAt(0) || 'U'}</span>
                                )}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[11px] font-bold text-white leading-tight">{work.profiles?.full_name || 'Anonymous User'}</span>
                                <span className="text-[10px] text-zinc-500">
                                    {new Date(work.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <button 
                                onClick={() => handleLike(work.id)}
                                className={cn(
                                    "flex items-center gap-1.5 transition-colors",
                                    work.has_liked ? "text-red-500" : "text-zinc-400 hover:text-red-400"
                                )}
                            >
                                <Heart className={cn("w-4 h-4", work.has_liked && "fill-red-500")} />
                                <span className="text-xs font-medium">{work.likes_count}</span>
                            </button>
                            <button 
                                onClick={() => handleToggleComments(work.id)}
                                className="flex items-center gap-1.5 text-zinc-400 hover:text-purple-400 transition-colors"
                            >
                                <MessageSquare className="w-4 h-4" />
                                <span className="text-xs font-medium">{work.comments_count}</span>
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button 
                            onClick={async () => {
                                showLoader("Preparing download...");
                                try {
                                    const response = await fetch(work.preview_url);
                                    const blob = await response.blob();
                                    const url = window.URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = `rive-ai-work-${work.id}.${blob.type.split('/')[1] || 'png'}`;
                                    document.body.appendChild(a);
                                    a.click();
                                    window.URL.revokeObjectURL(url);
                                    document.body.removeChild(a);
                                } catch (e) {
                                    alert("Download failed. Please try again.");
                                }
                            }}
                            className="bg-white/5 hover:bg-white/10 border border-white/10 p-3 rounded-xl text-zinc-400 hover:text-white transition-all flex items-center gap-2 group/dl"
                        >
                            <Download className="w-4 h-4 group-hover/dl:scale-110 transition-transform" />
                            <span className="text-[10px] font-bold uppercase tracking-tighter hidden md:block">Download</span>
                        </button>
                        <button 
                            onClick={() => {
                                showLoader("Copying prompt...")
                                navigator.clipboard.writeText(work.prompt)
                                setTimeout(() => {
                                    const tt = work.tool_type.toLowerCase()
                                    let toolRoute = `/dashboard/${tt}`
                                    if (tt === 'image') toolRoute = '/dashboard/image-prompt'
                                    if (tt === 'video') toolRoute = '/dashboard/video'
                                    if (tt === 'audio') toolRoute = '/dashboard/text-to-speech'
                                    if (tt === '3d') toolRoute = '/dashboard/3d'
                                    
                                    router.push(toolRoute)
                                }, 500)
                            }}
                            className="flex-1 flex items-center justify-center gap-2 bg-purple-600/10 hover:bg-purple-600/20 border border-purple-500/20 py-3 rounded-xl text-xs font-bold text-purple-400 transition-all hover:gap-3"
                        >
                            Use this prompt
                            <ArrowUpRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Expandable Comments Section */}
                {expandedComments[work.id] && (
                    <div className="border-t border-white/5 bg-zinc-950/80 p-5 flex flex-col gap-4">
                        <div className="flex gap-2">
                            <input 
                                type="text" 
                                placeholder="Write a comment..." 
                                value={commentInputs[work.id] || ''}
                                onChange={(e) => setCommentInputs(prev => ({...prev, [work.id]: e.target.value}))}
                                onKeyDown={(e) => { if (e.key === 'Enter') handleSubmitComment(work.id) }}
                                className="flex-1 bg-zinc-900 border border-white/10 rounded-xl px-4 py-2 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-purple-500/50"
                            />
                            <button 
                                onClick={() => handleSubmitComment(work.id)} 
                                disabled={isSubmittingComment || !commentInputs[work.id]?.trim()}
                                className="bg-purple-600 hover:bg-purple-500 text-white rounded-xl px-4 py-2 text-[11px] font-extrabold uppercase tracking-wide disabled:opacity-50 transition-colors flex items-center justify-center min-w-[60px]"
                            >
                                {isSubmittingComment && activeCommentId === work.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'POST'}
                            </button>
                        </div>
                        
                        <div className="flex flex-col gap-3 max-h-56 overflow-y-auto custom-scrollbar pr-2 mt-2">
                            {!commentsData[work.id] ? (
                                <div className="flex justify-center py-4"><Loader2 className="w-4 h-4 animate-spin text-zinc-600" /></div>
                            ) : commentsData[work.id].length === 0 ? (
                                <p className="text-[10px] text-zinc-500/60 uppercase tracking-widest text-center py-4 font-bold border border-dashed border-white/5 rounded-xl">No comments yet</p>
                            ) : (
                                commentsData[work.id].map((c: any) => (
                                    <div key={c.id} className="flex gap-3 animate-in fade-in slide-in-from-top-1 duration-300">
                                        <div className="w-6 h-6 rounded-full overflow-hidden bg-zinc-800 shrink-0 border border-white/10 mt-1 flex items-center justify-center">
                                            {c.profiles?.avatar_url ? (
                                                <img src={c.profiles.avatar_url} className="w-full h-full object-cover"/>
                                            ) : (
                                                <span className="text-[9px] font-black text-zinc-500 text-center uppercase">{c.profiles?.full_name?.charAt(0) || 'U'}</span>
                                            )}
                                        </div>
                                        <div className="flex flex-col bg-zinc-900/60 px-3 py-2 rounded-2xl rounded-tl-sm border border-white/5 relative group/cmt">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <span className="text-[10px] font-bold text-zinc-300">{c.profiles?.full_name || 'Anonymous User'}</span>
                                                <span className="text-[8px] text-zinc-600 font-medium">{new Date(c.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                            <span className="text-xs text-zinc-400 leading-snug break-words">{c.content}</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>
                ))}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && filteredWorks.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 bg-zinc-900/20 rounded-3xl border border-dashed border-white/10">
                <Compass className="w-12 h-12 text-zinc-700 mb-4" />
                <h3 className="text-xl font-bold text-zinc-400">No works found</h3>
                <p className="text-zinc-600 max-w-xs text-center mt-2">Try adjusting your filters or be the first to share something amazing!</p>
            </div>
          )}
        </>
      ) : (
        <>
          {/* Templates Section */}
          <div className="flex flex-col gap-6">
            
            {/* Spotlight Banner Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {templates.filter(t => t.is_featured).slice(0, 2).map(template => (
                <div key={template.id} className="relative group h-[300px] rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
                  <img 
                    src={template.preview_url} 
                    alt={template.title} 
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                  
                  <div className="absolute bottom-0 left-0 p-8 flex flex-col items-start gap-4">
                    <div className="flex gap-2">
                       <span className="px-3 py-1 bg-amber-500/20 border border-amber-500/30 text-amber-400 text-[10px] font-bold uppercase rounded-lg">Spotlight</span>
                       <span className="px-3 py-1 bg-white/10 backdrop-blur-md border border-white/10 text-white text-[10px] font-bold uppercase rounded-lg">{template.category}</span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2">{template.title}</h3>
                      <p className="text-zinc-400 text-sm max-w-sm line-clamp-2">{template.description}</p>
                    </div>
                    <div className="flex gap-2">
                      <button 
                          onClick={() => handleUseTemplate(template)}
                          className="bg-white text-black px-6 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:scale-105 transition-all"
                      >
                        <Zap className="w-4 h-4 fill-current" />
                        Use Template
                      </button>
                      <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            navigator.clipboard.writeText(template.prompt);
                            showLoader("Prompt copied!");
                          }}
                          className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-white/20 transition-all"
                          title="Copy Prompt"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap items-center gap-3">
              {(['All', 'Marketing', 'Social Media', 'Education', 'Business', 'Creative'] as TemplateCategory[]).map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={cn(
                    "px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300",
                    categoryFilter === cat
                      ? "bg-white text-black shadow-lg"
                      : "bg-zinc-900/50 text-zinc-400 border border-white/5 hover:border-white/20 hover:text-white"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Templates Grid */}
            {isLoading ? (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="aspect-video rounded-2xl bg-zinc-900/40 animate-pulse border border-white/5" />
                ))}
              </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates.map((template) => (
                    <div key={template.id} className="group bg-zinc-900/40 border border-white/10 rounded-2xl overflow-hidden hover:translate-y-[-4px] transition-all duration-500">
                    <div className="relative aspect-video overflow-hidden">
                        <img 
                            src={template.preview_url} 
                            alt={template.title} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                            onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1000&auto=format&fit=crop' }}
                        />
                        <div className="absolute top-3 left-3">
                        <div className={cn(
                            "px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-tighter border",
                            template.difficulty === 'Pro' 
                            ? "bg-purple-500/20 border-purple-500/40 text-purple-300" 
                            : "bg-green-500/20 border-green-500/40 text-green-300"
                        )}>
                            {template.difficulty}
                        </div>
                        </div>
                        <div className="absolute bottom-3 left-3 px-2 py-1 rounded-md bg-black/60 backdrop-blur-md text-[9px] font-bold text-white flex gap-1 items-center">
                        <ToolIcon type={template.tool_type} className="w-3 h-3" />
                        {template.tool_type}
                        </div>
                    </div>
                    <div className="p-5 flex flex-col gap-3">
                        <div className="bg-black/20 rounded-xl p-3 border border-white/5 group/prompt relative">
                           <p className="text-[10px] text-zinc-400 line-clamp-2 pr-6 italic">"{template.prompt}"</p>
                           <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                navigator.clipboard.writeText(template.prompt);
                                showLoader("Prompt copied!");
                            }}
                            className="absolute top-2 right-2 p-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-500 hover:text-white transition-all opacity-0 group-hover/prompt:opacity-100"
                           >
                             <Copy className="w-3 h-3" />
                           </button>
                        </div>
                        
                        <div className="flex items-center justify-between">
                            <button 
                                onClick={() => handleUseTemplate(template)}
                                className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold rounded-xl transition-colors border border-white/5 flex items-center justify-center gap-2"
                            >
                            <Zap className="w-3.5 h-3.5" />
                            Use Template
                            </button>
                        </div>
                    </div>
                    </div>
                ))}
            </div>
            )}
          </div>
        </>
      )}

      {/* Share Modal */}
      <ShareWorkModal 
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        onSuccess={() => {
            getCommunityWorks(toolFilter, sortBy).then(setWorks)
        }}
      />
    </div>
  )
}
