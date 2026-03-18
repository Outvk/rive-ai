"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { saveGeneration } from "@/app/dashboard/text/actions"
import {
    Mic2,
    Sparkles,
    Loader2,
    Play,
    Pause,
    History,
    AlertCircle,
    Music,
    Volume2,
    Globe,
    ArrowLeft,
    Clock,
    Search,
    Download,
    Trash2,
    Check
} from "lucide-react"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

type Voice = {
    id: string
    name: string
    gender: 'male' | 'female'
    preview_url: string
}

const LANGUAGES = [
    { code: 'en', label: 'English' },
    { code: 'ar', label: 'Arabic' },
    { code: 'fr', label: 'French' },
    { code: 'es', label: 'Spanish' },
    { code: 'de', label: 'German' },
    { code: 'it', label: 'Italian' },
    { code: 'pt', label: 'Portuguese' },
    { code: 'ja', label: 'Japanese' },
    { code: 'ko', label: 'Korean' },
    { code: 'zh', label: 'Chinese' },
]

interface HistoryItem {
    id: string
    prompt: string
    result: string
    created_at: string
    alignment?: any
    metadata?: any
}

interface AISpeechGenerationProps {
    initialHistory?: any[]
    initialCredits?: number
}

export function AISpeechGeneration({ initialHistory = [], initialCredits = 10 }: AISpeechGenerationProps) {
    const router = useRouter()
    const [hasMounted, setHasMounted] = useState(false)
    const [selectedItemId, setSelectedItemId] = useState<string | null>(null)
    const [showHistory, setShowHistory] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [currentCredits, setCurrentCredits] = useState(initialCredits)
    const [text, setText] = useState('')
    const [audioBase64, setAudioBase64] = useState<string | null>(null)
    const [history, setHistory] = useState<HistoryItem[]>(initialHistory)
    const [alignment, setAlignment] = useState<any>(null)
    const [activeWordIndex, setActiveWordIndex] = useState<number>(-1)

    const audioRef = useRef<HTMLAudioElement>(null)
    const previewRef = useRef<HTMLAudioElement>(null)

    const [maleVoices, setMaleVoices] = useState<Voice[]>([])
    const [femaleVoices, setFemaleVoices] = useState<Voice[]>([])
    const [voicesLoading, setVoicesLoading] = useState(true)
    const [selectedVoice, setSelectedVoice] = useState<Voice | null>(null)
    const [selectedGender, setSelectedGender] = useState<'male' | 'female'>('female')
    const [selectedLanguage, setSelectedLanguage] = useState('en')
    const [isPlaying, setIsPlaying] = useState(false)
    const [progress, setProgress] = useState(0)

    const [currentTime, setCurrentTime] = useState(0)
    const [duration, setDuration] = useState(0)

    useEffect(() => {
        // Map metadata.alignment to the alignment property for history items
        const mappedHistory = initialHistory.map(item => ({
            ...item,
            alignment: item.metadata?.alignment || item.alignment
        }))
        setHistory(mappedHistory)
    }, [initialHistory])

    useEffect(() => {
        setHasMounted(true)
        const fetchVoices = async () => {
            try {
                const res = await fetch('/api/speech')
                if (!res.ok) {
                    toast.error('Failed to load voices.')
                    return
                }
                const data = await res.json()
                if (data.male && data.female) {
                    setMaleVoices(data.male)
                    setFemaleVoices(data.female)
                    setSelectedVoice(data.female[0] ?? null)
                }
            } catch (err) {
                console.error('Voices fetch error', err)
                toast.error('Failed to load voices.')
            } finally {
                setVoicesLoading(false)
            }
        }
        fetchVoices()
    }, [])

    useEffect(() => {
        if (!isLoading) {
            setProgress(0)
            return
        }

        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 95) {
                    return 95
                }
                return prev + 2
            })
        }, 100)

        return () => clearInterval(interval)
    }, [isLoading])

    const handleGenderSwitch = (gender: 'male' | 'female') => {
        setSelectedGender(gender)
        const voices = gender === 'male' ? maleVoices : femaleVoices
        setSelectedVoice(voices[0] ?? null)
    }

    const handlePreview = async (voice: Voice) => {
        if (!voice.preview_url) return
        try {
            const res = await fetch('/api/speech/preview', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ preview_url: voice.preview_url }),
            })
            const data = await res.json()
            if (data.audio && previewRef.current) {
                previewRef.current.src = `data:audio/mpeg;base64,${data.audio}`
                previewRef.current.play()
                toast.success(`Previewing ${voice.name}'s voice`)
            }
        } catch (err) {
            toast.error('Failed to preview voice.')
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (currentCredits < 10) {
            toast.error('Insufficient credits. Each generation costs 10 credits.')
            return
        }
        if (!text.trim()) return

        setIsLoading(true)
        setError(null)
        setAudioBase64(null)
        setShowHistory(false)
        setSelectedItemId(null)

        try {
            const res = await fetch('/api/speech', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: text.trim(),
                    voiceId: selectedVoice?.id,
                    language: selectedLanguage,
                }),
            })

            const data = await res.json()
            if (!res.ok) throw new Error(data?.error || 'Generation failed')

            if (data.audio) {
                setAudioBase64(data.audio)
                setAlignment(data.alignment)
                setCurrentCredits(prev => Math.max(0, prev - 10))
                setProgress(100)

                const newItem = {
                    id: Date.now().toString(),
                    prompt: text.trim(),
                    result: data.audio,
                    created_at: new Date().toISOString(),
                    alignment: data.alignment // Store alignment in local session history
                }
                setHistory(prev => [newItem, ...prev])

                await saveGeneration(text.trim(), data.audio, 'speech', { alignment: data.alignment })
                router.refresh()
            }
        } catch (err: any) {
            console.error('Text-to-speech error', err)
            setError(err.message || 'Failed to generate speech.')
            toast.error(err.message || 'Failed to generate speech.')
        } finally {
            setIsLoading(false)
        }
    }

    const handleDownload = () => {
        if (!audioBase64) return
        const link = document.createElement('a')
        link.href = `data:audio/mpeg;base64,${audioBase64}`
        link.download = `speech-${Date.now()}.mp3`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    const handleSelectHistoryItem = (item: HistoryItem) => {
        setAudioBase64(item.result)
        setText(item.prompt)
        setAlignment(item.alignment || null)
        setSelectedItemId(item.id)
        setShowHistory(false)
        setActiveWordIndex(-1)
    }

    const formatTime = (time: number) => {
        if (isNaN(time)) return "0:00"
        const mins = Math.floor(time / 60)
        const secs = Math.floor(time % 60)
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr)
        const now = new Date()
        const diffMs = now.getTime() - date.getTime()
        const diffMins = Math.round(diffMs / 60000)

        if (diffMins < 1) return "Just now"
        if (diffMins < 60) return `${diffMins}m ago`
        return date.toLocaleDateString()
    }

    const filteredHistory = history.filter(item =>
        item.prompt.toLowerCase().includes(searchQuery.toLowerCase())
    )

    if (!hasMounted) return null

    const displayedVoices = selectedGender === 'male' ? maleVoices : femaleVoices

    return (
        <div className="flex h-auto min-h-full w-full bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
            {/* LEFT SIDE: FORM & HISTORY */}
            <div className="w-[420px] border-r border-zinc-800 flex flex-col bg-zinc-950 min-h-full">
                {/* Header */}
                <div className="p-4 flex items-center justify-between border-b border-zinc-800">
                    <div>
                        <h3 className="text-sm font-semibold text-zinc-100">Speech Studio</h3>
                        <p className="text-[10px] text-zinc-500 font-medium">Credits: <span className="text-amber-400">{currentCredits}</span></p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setShowHistory(!showHistory)}
                        className={`p-2 rounded-lg transition-colors ${showHistory ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-500 hover:bg-zinc-800 hover:text-zinc-100'}`}
                    >
                        <History className="w-4 h-4" />
                    </button>
                </div>

                {error && (
                    <div className="mx-4 mt-4 px-3 py-2 flex items-center gap-2 text-xs text-red-400 bg-red-900/20 rounded-lg border border-red-900/50 scale-in">
                        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                        <p>{error}</p>
                    </div>
                )}

                {showHistory ? (
                    /* History View */
                    <div className="flex-1 flex flex-col p-4 space-y-4 overflow-hidden">
                        <div className="flex items-center gap-2 text-zinc-100">
                            <button
                                onClick={() => setShowHistory(false)}
                                className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4" />
                            </button>
                            <h3 className="text-sm font-medium">Recently Generated</h3>
                        </div>

                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
                            <Input
                                placeholder="Search history..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-8 bg-zinc-900/50 border-zinc-800 h-8 text-xs focus-visible:ring-amber-500/50"
                            />
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                            {filteredHistory.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-center py-8 opacity-40">
                                    <Clock className="w-8 h-8 mb-2" />
                                    <p className="text-xs">No generations found</p>
                                </div>
                            ) : (
                                filteredHistory.map((item) => (
                                    <div
                                        key={item.id}
                                        className={`p-3 rounded-xl border transition-all cursor-pointer group relative ${selectedItemId === item.id
                                            ? 'bg-amber-500/10 border-amber-500/30'
                                            : 'bg-zinc-900/30 border-zinc-800/50 hover:border-zinc-700'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3" onClick={() => handleSelectHistoryItem(item)}>
                                            <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-amber-400 transition-colors">
                                                <Volume2 className="w-4 h-4" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs text-zinc-200 truncate font-medium">{item.prompt}</p>
                                                <p className="text-[10px] text-zinc-500 mt-0.5">{formatDate(item.created_at)}</p>
                                            </div>
                                            <button
                                                onClick={async (e) => {
                                                    e.stopPropagation()
                                                    e.preventDefault()
                                                    const confirmed = window.confirm('Delete this from history?')
                                                    if (!confirmed) return

                                                    try {
                                                        const res = await fetch(`/api/history/delete?id=${item.id}&table=ai_generations`, { method: 'DELETE' })
                                                        if (!res.ok) throw new Error('Failed to delete')

                                                        setHistory(prev => prev.filter(i => i.id !== item.id))
                                                        if (selectedItemId === item.id) {
                                                            setAudioBase64(null)
                                                            setSelectedItemId(null)
                                                        }
                                                        toast.success("Audio removed")
                                                        router.refresh()
                                                    } catch (err) {
                                                        console.error('Delete error:', err)
                                                        toast.error('Failed to delete item.')
                                                    }
                                                }}
                                                className="p-1.5 rounded-md text-zinc-600 hover:text-red-400 hover:bg-red-400/10 opacity-0 group-hover:opacity-100 transition-all"
                                                title="Delete audio"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                ) : (
                    /* Settings Form */
                    <form onSubmit={handleSubmit} className="flex-1 flex flex-col p-4 space-y-3">
                        {/* Voice Controls */}
                        <div className="space-y-3">
                            <div className="space-y-1.5">
                                <Label className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">Gender</Label>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => handleGenderSwitch('female')}
                                        className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-all ${selectedGender === 'female'
                                            ? 'bg-amber-500/10 border-amber-500/40 text-amber-400'
                                            : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                                            }`}
                                    >
                                        Female
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleGenderSwitch('male')}
                                        className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-all ${selectedGender === 'male'
                                            ? 'bg-amber-500/10 border-amber-500/40 text-amber-400'
                                            : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                                            }`}
                                    >
                                        Male
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">Select Voice</Label>
                                {voicesLoading ? (
                                    <div className="flex items-center gap-2 py-2 text-zinc-500 text-xs">
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                        Loading ElevenLabs voices...
                                    </div>
                                ) : (
                                    <div className="flex gap-2">
                                        <Select
                                            value={selectedVoice?.id}
                                            onValueChange={(value) => {
                                                const voice = displayedVoices.find(v => v.id === value)
                                                if (voice) setSelectedVoice(voice)
                                            }}
                                        >
                                            <SelectTrigger className="w-full bg-zinc-900 border-zinc-800 h-10 text-xs text-zinc-100 font-outfit">
                                                <SelectValue placeholder="Select a voice" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-zinc-900 border-zinc-700 text-zinc-100 font-outfit">
                                                {displayedVoices.map((voice) => (
                                                    <div key={voice.id} className="flex items-center group/item pr-2">
                                                        <SelectItem value={voice.id} className="flex-1 text-xs focus:bg-zinc-800 focus:text-amber-400">
                                                            {voice.name}
                                                        </SelectItem>
                                                        {voice.preview_url && (
                                                            <button
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    e.stopPropagation();
                                                                    handlePreview(voice);
                                                                }}
                                                                className="h-6 w-6 flex items-center justify-center rounded-md bg-zinc-800 hover:bg-amber-500/20 text-zinc-500 hover:text-amber-400 transition-colors"
                                                            >
                                                                <Play className="w-2.5 h-2.5" />
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                            </SelectContent>
                                        </Select>

                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">Language</Label>
                                <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                                    <SelectTrigger className="w-full bg-zinc-900 border-zinc-800 h-9 text-xs font-outfit">
                                        <div className="flex items-center gap-2">
                                            <Globe className="w-3.5 h-3.5 text-zinc-500" />
                                            <SelectValue />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-100 font-outfit">
                                        {LANGUAGES.map((lang) => (
                                            <SelectItem key={lang.code} value={lang.code} className="text-xs focus:bg-zinc-800">
                                                {lang.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">Text Input</Label>
                                <Textarea
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    placeholder="Enter your script here..."
                                    className="min-h-[100px] bg-zinc-900 border-zinc-800 text-sm focus-visible:ring-amber-500/40 resize-none font-outfit"
                                />
                                <div className="flex justify-between items-center px-1">
                                    <span className="text-[10px] text-zinc-600 font-mono">{text.length} characters</span>
                                    <span className="text-[10px] text-zinc-600 font-mono">10 Credits</span>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4">
                            <Button
                                type="submit"
                                disabled={isLoading || !text.trim() || voicesLoading || currentCredits < 10}
                                className="w-full h-11 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:shadow-[0_0_25px_rgba(245,158,11,0.3)] disabled:opacity-50"
                            >
                                {isLoading ? (
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                ) : (
                                    <Mic2 className="w-4 h-4 mr-2" />
                                )}
                                {isLoading ? 'Generating...' : 'Synthesize Speech'}
                            </Button>
                        </div>
                    </form>
                )}
            </div>

            {/* RIGHT SIDE: PREVIEW & PLAYER */}
            <div className="flex-1 bg-black flex flex-col items-center justify-center relative p-12 min-h-[600px]">
                <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/20 rounded-full blur-[120px]" />
                </div>

                <div className="w-full max-w-xl z-10 flex flex-col items-center">
                    {!audioBase64 && !isLoading ? (
                        <div className="flex flex-col items-center text-center space-y-6 py-20 animate-in fade-in zoom-in duration-700">
                            <div className="w-24 h-24 rounded-3xl bg-zinc-900/50 border border-zinc-800/50 flex items-center justify-center shadow-2xl">
                                <Music className="w-10 h-10 text-zinc-700" />
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-xl font-semibold text-zinc-200">Ready to Speak</h2>
                                <p className="text-sm text-zinc-500 max-w-xs">Configure your voice settings and enter some text to generate natural speech.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="w-full flex justify-center animate-in slide-in-from-bottom-4 duration-700">
                            {isLoading ? (
                                /* Generation Loading State */
                                <div className="w-full max-w-md space-y-8 p-12 bg-zinc-900/40 rounded-[35px] border border-zinc-800/50 backdrop-blur-sm">
                                    <div className="flex flex-col items-center justify-center gap-8">
                                        <div className="flex items-center gap-2 h-16">
                                            {[...Array(12)].map((_, i) => (
                                                <div
                                                    key={i}
                                                    className="w-1.5 bg-amber-500/60 rounded-full animate-wave"
                                                    style={{
                                                        height: `${Math.random() * 100}%`,
                                                        animationDelay: `${i * 0.1}s`,
                                                        animationDuration: '1s'
                                                    }}
                                                />
                                            ))}
                                        </div>
                                        <div className="w-full space-y-3">
                                            <div className="flex justify-between text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
                                                <span>Synthesizing Voice</span>
                                                <span>{progress}%</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-amber-500 transition-all duration-300"
                                                    style={{ width: `${progress}%` }}
                                                />
                                            </div>
                                            <p className="text-center text-xs text-zinc-500 font-medium animate-pulse mt-2">Mastering audio stream...</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                /* Unified Music Card Player */
                                <div className="flex flex-col items-center w-full gap-8">
                                    {/* Synced Text Animation */}
                                    {alignment?.words && alignment.words.length > 0 ? (
                                        <div className="w-full text-center px-4 py-8 min-h-[120px] flex flex-wrap justify-center items-center gap-x-2 gap-y-1 transition-all">
                                            {alignment.words.map((wordObj: any, idx: number) => {
                                                const isActive = currentTime >= wordObj.start_time && currentTime <= wordObj.end_time;
                                                const isPast = currentTime > wordObj.end_time;

                                                return (
                                                    <span
                                                        key={idx}
                                                        className={cn(
                                                            "text-2xl font-bold transition-all duration-300",
                                                            isActive
                                                                ? "text-white scale-110 translate-y-[-2px]"
                                                                : isPast
                                                                    ? "text-zinc-200 opacity-100"
                                                                    : "text-zinc-600 opacity-10"
                                                        )}
                                                    >
                                                        {wordObj.word}
                                                    </span>
                                                )
                                            })}
                                        </div>
                                    ) : audioBase64 && (
                                        <div className="w-full text-center px-4 py-8 min-h-[120px] flex flex-wrap justify-center items-center gap-x-2 gap-y-1 transition-all">
                                            <p className="text-xl font-medium text-zinc-400 leading-relaxed max-w-lg">
                                                {text}
                                            </p>
                                        </div>
                                    )}

                                    <div className={`main-music-card ${isPlaying ? 'playing' : ''}`}>
                                        <div className="track-info justify-center flex-col text-center">
                                            <div className="volume-bars justify-center mb-2">
                                                <div className="bar" style={{ "--delay": "0s" } as any}></div>
                                                <div className="bar" style={{ "--delay": "0.1s" } as any}></div>
                                                <div className="bar" style={{ "--delay": "0.2s" } as any}></div>
                                                <div className="bar" style={{ "--delay": "0.3s" } as any}></div>
                                                <div className="bar" style={{ "--delay": "0.4s" } as any}></div>
                                                <div className="bar" style={{ "--delay": "0.5s" } as any}></div>
                                                <div className="bar" style={{ "--delay": "0.6s" } as any}></div>
                                                <div className="bar" style={{ "--delay": "0.7s" } as any}></div>
                                            </div>
                                            <div className="track-details">
                                                <div className="artist-name">{selectedVoice?.name} Voice</div>
                                            </div>
                                        </div>

                                        <div className="playback-controls">
                                            <div className="time-info">
                                                <span className="current-time">{formatTime(currentTime)}</span>
                                                <span className="remaining-time">-{formatTime(duration - currentTime)}</span>
                                            </div>
                                            <div
                                                className="progress-bar-container"
                                                onClick={(e) => {
                                                    const rect = e.currentTarget.getBoundingClientRect();
                                                    const pos = (e.clientX - rect.left) / rect.width;
                                                    if (audioRef.current) {
                                                        audioRef.current.currentTime = pos * duration;
                                                    }
                                                }}
                                            >
                                                <div className="progress-fill" style={{ width: `${(currentTime / duration) * 100}%` }}></div>
                                            </div>

                                            <div className="button-row">
                                                <button
                                                    className="control-button secondary-btn"
                                                    onClick={() => {
                                                        setAudioBase64(null);
                                                        setAlignment(null);
                                                        setActiveWordIndex(-1);
                                                    }}
                                                    title="Clear"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>

                                                <div className="main-control-btns">
                                                    <button
                                                        className="control-button"
                                                        onClick={() => {
                                                            if (audioRef.current) audioRef.current.currentTime -= 5;
                                                        }}
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" viewBox="0 0 16 16">
                                                            <path d="M.5 3.5A.5.5 0 0 0 0 4v8a.5.5 0 0 0 1 0V8.753l6.267 3.636c.54.313 1.233-.066 1.233-.697v-2.94l6.267 3.636c.54.314 1.233-.065 1.233-.696V4.308c0-.63-.693-1.01-1.233-.696L8.5 7.248v-2.94c0-.63-.692-1.01-1.233-.696L1 7.248V4a.5.5 0 0 0-.5-.5"></path>
                                                        </svg>
                                                    </button>

                                                    <button
                                                        className="control-button play-pause-button"
                                                        onClick={() => {
                                                            if (isPlaying) audioRef.current?.pause();
                                                            else audioRef.current?.play();
                                                        }}
                                                    >
                                                        {isPlaying ? (
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" viewBox="0 0 16 16">
                                                                <path d="M5.5 3.5A1.5 1.5 0 0 1 7 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5m5 0A1.5 1.5 0 0 1 12 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5"></path>
                                                            </svg>
                                                        ) : (
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" viewBox="0 0 16 16">
                                                                <path d="M11.596 8.697l-6.363 3.692c-.54.314-1.233-.065-1.233-.696V4.308c0-.63.693-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393"></path>
                                                            </svg>
                                                        )}
                                                    </button>

                                                    <button
                                                        className="control-button"
                                                        onClick={() => {
                                                            if (audioRef.current) audioRef.current.currentTime += 5;
                                                        }}
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" viewBox="0 0 16 16">
                                                            <path d="M15.5 3.5a.5.5 0 0 1 .5.5v8a.5.5 0 0 1-1 0V8.753l-6.267 3.636c-.54.313-1.233-.066-1.233-.697v-2.94l-6.267 3.636C.693 12.703 0 12.324 0 11.693V4.308c0-.63.693-1.01 1.233-.696L7.5 7.248v-2.94c0-.63.693-1.01 1.233-.696L15 7.248V4a.5.5 0 0 1 .5-.5"></path>
                                                        </svg>
                                                    </button>
                                                </div>

                                                <button
                                                    className="control-button secondary-btn"
                                                    onClick={handleDownload}
                                                    title="Download"
                                                >
                                                    <Download className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Real Hidden Audio Element for Logic */}
                                        <audio
                                            ref={audioRef}
                                            src={`data:audio/mpeg;base64,${audioBase64}`}
                                            onPlay={() => setIsPlaying(true)}
                                            onPause={() => setIsPlaying(false)}
                                            onEnded={() => {
                                                setIsPlaying(false);
                                                setCurrentTime(0);
                                                setActiveWordIndex(-1);
                                            }}
                                            onTimeUpdate={() => {
                                                if (audioRef.current) {
                                                    setCurrentTime(audioRef.current.currentTime);
                                                }
                                            }}
                                            onLoadedMetadata={() => {
                                                if (audioRef.current) {
                                                    setDuration(audioRef.current.duration);
                                                }
                                            }}
                                            className="hidden"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Visual Audio Preview Hidden */}
                <audio ref={previewRef} className="hidden" />
            </div>

            <style jsx global>{`
                @keyframes wave {
                    0%, 100% { transform: scaleY(0.4); opacity: 0.3; }
                    50% { transform: scaleY(1); opacity: 1; }
                }
                .animate-wave {
                    animation: wave linear infinite;
                    transform-origin: bottom;
                }
                .scale-in {
                    animation: scale-in 0.2s ease-out;
                }
                @keyframes scale-in {
                    from { transform: scale(0.95); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }

                .animate-in {
                    animation-fill-mode: forwards;
                }

                /* Custom Music Card Styles */
                .main-music-card {
                    max-width: 440px;
                    width: 100%;
                    padding: 24px;
                    border-radius: 35px;
                    background: #000;
                    border: 1px solid #27272a;
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                    font-family: -apple-system, system-ui, sans-serif;
                    color: white;
                    transition: all 0.3s ease;
                }

                .track-info {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }

                .album-art {
                    width: 80px;
                    height: 80px;
                    border-radius: 20px;
                    background: linear-gradient(135deg, #f59e0b, #d97706);
                    box-shadow: 0 4px 15px rgba(245, 158, 11, 0.3);
                    flex-shrink: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: transform 0.3s ease;
                }

                .album-art:hover {
                    transform: scale(1.05);
                }

                .track-details {
                    flex-grow: 1;
                    overflow: hidden;
                }

                .track-title {
                    font-size: 1.25em;
                    font-weight: 700;
                    white-space: nowrap;
                    text-overflow: ellipsis;
                    overflow: hidden;
                    color: #fff;
                }

                .artist-name {
                    font-size: 0.9em;
                    color: #a1a1aa;
                    margin-top: 4px;
                    font-weight: 500;
                }

                .volume-bars {
                    display: flex;
                    align-items: flex-end;
                    gap: 3px;
                    width: auto;
                    height: 32px;
                }

                .volume-bars .bar {
                    width: 3px;
                    background: linear-gradient(180deg, #f59e0b, #d97706);
                    border-radius: 2px;
                    animation: bounce 0.8s infinite ease-in-out;
                    animation-delay: var(--delay);
                    animation-play-state: paused;
                }

                .playing .volume-bars .bar {
                    animation-play-state: running;
                }

                @keyframes bounce {
                    0%, 100% { height: 6px; }
                    50% { height: 26px; }
                }

                .playback-controls {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .time-info {
                    display: flex;
                    justify-content: space-between;
                    font-size: 0.8em;
                    color: #71717a;
                    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
                }

                .progress-bar-container {
                    width: 100%;
                    height: 6px;
                    background-color: rgba(255, 255, 255, 0.05);
                    border-radius: 3px;
                    position: relative;
                    cursor: pointer;
                    overflow: hidden;
                }

                .progress-fill {
                    height: 100%;
                    background: linear-gradient(90deg, #f59e0b, #d97706);
                    border-radius: 3px;
                    transition: width 0.1s linear;
                }

                .button-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 12px;
                    margin-top: 8px;
                }

                .control-button {
                    width: 48px;
                    height: 48px;
                    border-radius: 50%;
                    border: none;
                    background: none;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    cursor: pointer;
                    transition: all 0.2s;
                    color: #fff;
                }

                .control-button:hover {
                    background: rgba(255, 255, 255, 0.1);
                    transform: scale(1.05);
                }

                .main-control-btns {
                    flex: 1;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: 24px;
                }

                .play-pause-button {
                    width: 60px;
                    height: 60px;
                    background: #fff !important;
                    color: #000 !important;
                    box-shadow: 0 0 20px rgba(255, 255, 255, 0.2);
                }

                .play-pause-button:hover {
                    transform: scale(1.1);
                    background: #f4f4f5 !important;
                }

                .secondary-btn {
                    color: #71717a;
                }

                .secondary-btn:hover {
                    color: #f59e0b;
                }
            `}</style>
        </div>
    )
}
