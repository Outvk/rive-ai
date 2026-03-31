'use client'

import { useState, useRef, useEffect } from 'react'
import { saveGeneration } from '@/app/dashboard/text/actions'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { PaperPlaneIcon, UpdateIcon, PlayIcon, SpeakerLoudIcon } from '@radix-ui/react-icons'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

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

export function TextToSpeechForm({ initialCredits = 0 }: { initialCredits?: number }) {
    const router = useRouter()
    const [text, setText] = useState(() => typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('prompt') || '' : '')
    const [currentCredits, setCurrentCredits] = useState(initialCredits)
    const [isLoading, setIsLoading] = useState(false)
    const [audioBase64, setAudioBase64] = useState<string | null>(null)
    const audioRef = useRef<HTMLAudioElement>(null)
    const previewRef = useRef<HTMLAudioElement>(null)

    const [maleVoices, setMaleVoices] = useState<Voice[]>([])
    const [femaleVoices, setFemaleVoices] = useState<Voice[]>([])
    const [voicesLoading, setVoicesLoading] = useState(true)
    const [selectedVoice, setSelectedVoice] = useState<Voice | null>(null)
    const [selectedGender, setSelectedGender] = useState<'male' | 'female'>('female')
    const [selectedLanguage, setSelectedLanguage] = useState('en')

    useEffect(() => {
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
        setAudioBase64(null)
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
                setCurrentCredits(prev => Math.max(0, prev - 10))
                router.refresh()
                await saveGeneration(text.trim(), data.audio, 'speech')
            }
        } catch (err: unknown) {
            console.error('Text-to-speech error', err)
            toast.error(err instanceof Error ? err.message : 'Failed to generate speech.')
        } finally {
            setIsLoading(false)
        }
    }

    const displayedVoices = selectedGender === 'male' ? maleVoices : femaleVoices

    return (
        <div className="flex flex-col w-full max-w-4xl mx-auto relative px-4 sm:px-6 pb-10">

            {/* Audio output */}
       
          <div className="mt-10 flex flex-col justify-center items-center min-h-[140px] rounded-xl bg-zinc-800/30 border border-zinc-700/40">
    {isLoading ? (
        <div className="flex flex-col items-center gap-3 text-zinc-500">
            <UpdateIcon className="w-8 h-8 animate-spin" />
            <span className="text-sm">Generating audio...</span>
        </div>
    ) : audioBase64 ? (
        <div className="w-full px-6 py-4 space-y-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                    <span className="text-sm font-medium text-zinc-300">Audio ready</span>
                    <button
                        type="button"
                        onClick={() => audioRef.current?.play()}
                        className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 transition-colors text-sm"
                    >
                        <PlayIcon className="w-3 h-3" />
                        Play
                    </button>
                </div>
                <button
                    type="button"
                    onClick={() => {
                        setAudioBase64(null)
                        if (audioRef.current) {
                            audioRef.current.pause()
                            audioRef.current.src = ''
                        }
                    }}
                    className="text-xs text-zinc-500 hover:text-red-400 transition-colors border border-white/10 hover:border-red-400/30 px-3 py-1.5 rounded-lg"
                >
                    Remove
                </button>
            </div>
            <audio ref={audioRef} controls className="w-full" src={`data:audio/mpeg;base64,${audioBase64}`} />
        </div>
    ) : (
        <span className="text-zinc-600 text-sm">Your audio will appear here</span>
    )}
</div>

            {/* Gender toggle */}
            <div className="mt-6">
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Voice Gender</p>
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={() => handleGenderSwitch('female')}
                        className={`px-5 py-2 rounded-full text-sm border transition-all ${
                            selectedGender === 'female'
                                ? 'bg-amber-500/15 border-amber-500/50 text-amber-300'
                                : 'bg-zinc-800/40 border-white/10 text-zinc-400 hover:border-white/20'
                        }`}
                    >
                        Female
                    </button>
                    <button
                        type="button"
                        onClick={() => handleGenderSwitch('male')}
                        className={`px-5 py-2 rounded-full text-sm border transition-all ${
                            selectedGender === 'male'
                                ? 'bg-amber-500/15 border-amber-500/50 text-amber-300'
                                : 'bg-zinc-800/40 border-white/10 text-zinc-400 hover:border-white/20'
                        }`}
                    >
                        Male
                    </button>
                </div>
            </div>

            <div className="mt-4">
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Voice</p>
                {voicesLoading ? (
                    <div className="flex items-center gap-2 text-zinc-500 text-sm">
                        <UpdateIcon className="w-4 h-4 animate-spin" />
                        Loading voices...
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
                            <SelectTrigger className="w-full bg-zinc-800/40 border-zinc-700/50 text-zinc-100 h-11 font-outfit">
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
                                                <PlayIcon className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </SelectContent>
                        </Select>

                    </div>
                )}
                <audio ref={previewRef} className="hidden" />
            </div>

            {/* Language selector */}
            <div className="mt-6">
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Language</p>
                <div className="flex flex-wrap gap-2">
                    {LANGUAGES.map((lang) => (
                        <button
                            key={lang.code}
                            type="button"
                            onClick={() => setSelectedLanguage(lang.code)}
                            className={`px-3 py-1.5 rounded-full text-sm border transition-all font-outfit ${
                                selectedLanguage === lang.code
                                    ? 'bg-amber-500/15 border-amber-500/50 text-amber-300'
                                    : 'bg-zinc-800/40 border-white/10 text-zinc-400 hover:border-white/20 hover:text-zinc-300'
                            }`}
                        >
                            {lang.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Text input */}
            <form onSubmit={handleSubmit} className="space-y-4 pt-6">
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Enter text to convert to speech..."
                    className="w-full bg-zinc-800/40 backdrop-blur-xl rounded-lg p-4 text-zinc-100 placeholder:text-zinc-500 resize-none min-h-[140px] border border-white/10 focus:outline-none focus:ring-2 focus:ring-amber-500/50 font-outfit"
                    rows={5}
                />
                <div className="flex items-center justify-between">
                    <button
                        type="submit"
                        disabled={isLoading || !text.trim() || currentCredits < 10 || voicesLoading}
                        className="bg-amber-500 hover:bg-amber-400 text-zinc-900 font-medium disabled:bg-zinc-800 disabled:text-zinc-600 h-10 px-6 rounded-full flex items-center justify-center transition-all duration-300 active:scale-90"
                    >
                        {isLoading ? <UpdateIcon className="w-5 h-5 animate-spin" /> : <PaperPlaneIcon className="w-4 h-4" />}
                        <span className="ml-2">Generate speech</span>
                    </button>
                    <span className="text-sm text-zinc-400">Credits: {currentCredits}</span>
                </div>
            </form>
        </div>
    )
}