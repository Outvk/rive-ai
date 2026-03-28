'use client'

import { useState, useEffect } from 'react'
import { saveGeneration } from '@/app/dashboard/text/actions'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { PaperPlaneIcon, UpdateIcon } from '@radix-ui/react-icons'
import { Share2, Loader2, Check } from 'lucide-react'
import { shareToCommunity } from '@/app/dashboard/community/actions'
import { cn } from '@/lib/utils'

export function ImageGeneratorForm({
    initialCredits = 0,
    initialPrompt,
    initialImageBase64,
}: {
    initialCredits?: number
    initialPrompt?: string
    initialImageBase64?: string
}) {
    const router = useRouter()
    const [prompt, setPrompt] = useState(initialPrompt ?? '')
    const [currentCredits, setCurrentCredits] = useState(initialCredits)
    const [isLoading, setIsLoading] = useState(false)
    const [isSharing, setIsSharing] = useState(false)
    const [isShared, setIsShared] = useState(false)
    const [imageBase64, setImageBase64] = useState<string | null>(initialImageBase64 ?? null)

    useEffect(() => {
        if (initialPrompt !== undefined) setPrompt(initialPrompt)
        setImageBase64(null) // Reset on refresh
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (currentCredits < 10) {
            toast.error('Insufficient credits. Each image costs 10 credits.')
            return
        }
        if (!prompt.trim()) return

        setIsLoading(true)
        setImageBase64(null)
        setIsShared(false)
        try {
            const res = await fetch('/api/image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: prompt.trim() }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data?.error || 'Generation failed')
            if (data.image) {
                console.log("V1 Generator: Image received, saving to ai_images...");
                setImageBase64(data.image)
                setCurrentCredits(prev => Math.max(0, prev - 10))

                try {
                    console.log("V1 Generator: Saving via API route...");
                    const saveRes = await fetch('/api/history/save', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            prompt: prompt.trim(),
                            imageUrl: `data:image/png;base64,${data.image}`,
                            settings: { mode: 'v1' }
                        })
                    });

                    const saveResult = await saveRes.json();

                    if (!saveRes.ok) {
                        console.error("V1 Save Error:", saveResult.error);
                        toast.error(`Save failed: ${saveResult.error}`);
                    } else {
                        console.log("V1 Save Success: Added to ai_images dedicated table.");
                        router.refresh();
                    }
                } catch (saveErr) {
                    console.error("V1 Critical Save Error:", saveErr);
                }
            }
        } catch (err: any) {
            console.error('Image generation error', err)
            toast.error('Failed to generate image.')
        } finally {
            setIsLoading(false)
        }
    }

    const handleShare = async () => {
        if (!imageBase64 || !prompt) return
        setIsSharing(true)
        try {
            const formData = new FormData()
            formData.append('prompt', prompt)
            formData.append('previewUrl', `data:image/png;base64,${imageBase64}`)
            formData.append('toolType', 'Image')

            const res = await shareToCommunity(formData)
            if (res.success) {
                setIsShared(true)
                toast.success('Shared to community!')
            } else {
                toast.error(res.error || 'Failed to share')
            }
        } catch (err) {
            toast.error('Error sharing work')
        } finally {
            setIsSharing(false)
        }
    }

    const handleImageClick = () => {
        if (!imageBase64) return
        const w = window.open()
        if (w) {
            w.document.write(`<img src="data:image/png;base64,${imageBase64}" style="max-width:100%;display:block;margin:auto;" />`)
            w.document.close()
        }
    }

    return (
        <div className="flex flex-col min-h-[80vh] w-full max-w-4xl mx-auto relative px-4 sm:px-6">

            {/* Image area — always reserve space so layout doesn't jump */}
            <div className="mt-10 flex justify-center items-center min-h-[400px] rounded-xl bg-zinc-800/30 border border-zinc-700/40 overflow-hidden relative">
                {isLoading ? (
                    <div className="flex flex-col items-center gap-3 text-zinc-500">
                        <UpdateIcon className="w-8 h-8 animate-spin" />
                        <span className="text-sm">Generating...</span>
                    </div>
                ) : imageBase64 ? (
                    <div className="relative group/img w-full h-full flex items-center justify-center">
                        <img
                            src={`data:image/png;base64,${imageBase64}`}
                            alt="Generated"
                            onClick={handleImageClick}
                            className="max-w-full max-h-[600px] object-contain rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                            title="Click to open full size"
                        />
                        <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); handleShare(); }}
                            disabled={isSharing || isShared}
                            className={cn(
                                "absolute bottom-4 right-4 flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xl backdrop-blur-md border",
                                isShared 
                                    ? "bg-green-500/20 border-green-500/40 text-green-400" 
                                    : "bg-black/60 border-white/10 text-white hover:bg-white hover:text-black opacity-0 group-hover/img:opacity-100"
                            )}
                        >
                            {isSharing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : isShared ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
                            {isShared ? 'Shared' : 'Share to Community'}
                        </button>
                    </div>
                ) : (
                    <span className="text-zinc-600 text-sm">Your image will appear here</span>
                )}
            </div>

            {/* Prompt + controls */}
            <form onSubmit={handleSubmit} className="space-y-4 pt-6 pb-10">
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe the image you want..."
                    className="w-full bg-zinc-800/40 backdrop-blur-xl rounded-lg p-4 text-zinc-100 placeholder:zinc-500 resize-none min-h-[120px]"
                />
                <div className="flex items-center justify-between">
                    <button
                        type="submit"
                        disabled={isLoading || !prompt.trim() || currentCredits < 10}
                        className="bg-zinc-100 text-black hover:bg-white disabled:bg-zinc-800 disabled:text-zinc-600 h-10 px-6 rounded-full flex items-center justify-center transition-all duration-300 active:scale-90"
                    >
                        {isLoading ? <UpdateIcon className="w-5 h-5 animate-spin" /> : <PaperPlaneIcon className="w-4 h-4" />}
                        <span className="ml-2">Generate</span>
                    </button>
                    <span className="text-sm text-zinc-400">Credits: {currentCredits}</span>
                </div>
            </form>
        </div>
    )
}