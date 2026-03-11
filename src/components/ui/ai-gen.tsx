"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Image from "next/image"
import { saveGeneration } from "@/app/dashboard/text/actions"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { ImageGeneration } from "@/components/ui/ai-chat-image-generation-1"
import {
    MessageCircle,
    Sparkles,
    Wand2,
    Loader2,
    Play,
    Pause,
    RotateCw,
    History,
    AlertCircle,
    Palette,
    ImageIcon,
    Sun,
    User,
    Monitor,
    Cpu,
    RatioIcon as AspectRatio,
    Film,
    CuboidIcon as Cube,
    ArrowLeft,
    Clock,
    Search,
    Download
} from "lucide-react"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

type GenerationMode = "image" | "avatar"

interface GenerationSettings {
    style: string
    backgroundColor: string
    lighting: string
    pose: string
    aspectRatio: string
    aiModel: string
    resolution: string
    prompt: string
    negativePrompt: string
    seed?: number
    steps?: number
}

interface HistoryItem {
    id: string
    type: GenerationMode
    url: string
    prompt: string
    timestamp: Date
}

interface AIMultiModalGenerationProps {
    initialHistory?: HistoryItem[]
    initialCredits?: number
}

export { AIMultiModalGeneration }

function AIMultiModalGeneration({ initialHistory = [], initialCredits = 10 }: AIMultiModalGenerationProps) {
    const router = useRouter()
    const [hasMounted, setHasMounted] = useState(false)
    const [selectedItemId, setSelectedItemId] = useState<string | null>(null)
    const [mode, setMode] = useState<GenerationMode>("image")
    const [showHistory, setShowHistory] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [advancedMode, setAdvancedMode] = useState(false)
    const [promptSuggestions, setPromptSuggestions] = useState<string[]>([])
    const [searchQuery, setSearchQuery] = useState("")
    const [isPlaying, setIsPlaying] = useState(false)
    const [isRotating, setIsRotating] = useState(false)
    const [currentTextIndex, setCurrentTextIndex] = useState(0)
    const [progress, setProgress] = useState(0)
    const [currentCredits, setCurrentCredits] = useState(initialCredits)

    const [generatedItems, setGeneratedItems] = useState<HistoryItem[]>(initialHistory)

    useEffect(() => {
        setHasMounted(true)
    }, [])

    useEffect(() => {
        if (initialHistory && initialHistory.length > 0) {
            setGeneratedItems(initialHistory)
        }
    }, [initialHistory])

    const [settings, setSettings] = useState<GenerationSettings>({
        style: "artistic",
        backgroundColor: "studio",
        lighting: "studio",
        pose: "profile",
        aspectRatio: "4:5",
        aiModel: "stable-diffusion-xl",
        resolution: "1024x1024",
        prompt: "",
        negativePrompt: "blurry, low quality, distorted features",
    })

    // Different placeholder prompts based on the mode
    const placeholderPrompts = {
        image: "Professional portrait with blue background, studio lighting",
        avatar: "3D avatar of a young professional with glasses, detailed face",
    }

    // Different loading texts based on the mode
    const loadingTexts = {
        image: ["Creating your masterpiece...", "Finding the perfect colors...", "Adding the final touches..."],
        avatar: ["Building 3D mesh...", "Applying textures...", "Finalizing your avatar..."],
    }

    // Different AI models based on the mode
    const aiModels = {
        image: [
            { value: "stable-diffusion-xl", label: "Stable Diffusion XL" },
            { value: "midjourney-v5", label: "Midjourney v5" },
            { value: "dalle-3", label: "DALL-E 3" },
            { value: "imagen", label: "Imagen" },
        ],
        avatar: [
            { value: "dreamshaper-3d", label: "DreamShaper 3D" },
            { value: "3d-diffusion", label: "3D Diffusion" },
            { value: "meshy", label: "Meshy" },
            { value: "luma", label: "Luma AI" },
        ],
    }

    // Different resolutions based on the mode
    const resolutions = {
        image: [
            { value: "512x512", label: "512×512" },
            { value: "768x768", label: "768×768" },
            { value: "1024x1024", label: "1024×1024" },
            { value: "1536x1536", label: "1536×1536" },
        ],
        avatar: [
            { value: "512x512", label: "512×512" },
            { value: "768x768", label: "768×768" },
            { value: "1024x1024", label: "1024×1024" },
            { value: "2048x2048", label: "2048×2048" },
        ],
    }

    useEffect(() => {
        if (mode === "image") {
            setPromptSuggestions([
                "Professional headshot with neutral background",
                "Artistic portrait with dramatic lighting",
                "Casual portrait in natural outdoor setting",
            ])
        } else {
            setPromptSuggestions([
                "Realistic 3D avatar with professional attire",
                "Stylized cartoon character with expressive features",
                "Detailed 3D bust with photorealistic textures",
            ])
        }
    }, [mode])

    useEffect(() => {
        if (!isLoading) {
            setProgress(0)
            return
        }

        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(interval)
                    return 100
                }
                return prev + (mode === "image" ? 1.5 : 0.5)
            })
        }, 30)

        return () => clearInterval(interval)
    }, [isLoading, mode])

    useEffect(() => {
        if (!isLoading) return

        const interval = setInterval(() => {
            setCurrentTextIndex((prev) => (prev + 1) % loadingTexts[mode].length)
        }, 1500)

        return () => clearInterval(interval)
    }, [isLoading, mode])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)
        setShowHistory(false)

        try {
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    mode,
                    prompt: settings.prompt,
                    aiModel: settings.aiModel,
                    resolution: settings.resolution,
                    aspectRatio: settings.aspectRatio,
                    negativePrompt: settings.negativePrompt,
                    style: settings.style,
                    backgroundColor: settings.backgroundColor,
                    lighting: settings.lighting,
                    pose: settings.pose,
                    seed: settings.seed,
                    steps: settings.steps,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || `Failed to generate ${mode}`);
            }

            const newItem: HistoryItem = {
                id: Date.now().toString(),
                type: mode,
                url: data.url,
                prompt: settings.prompt || "AI generated content",
                timestamp: new Date(),
            }

            setGeneratedItems((prev) => [newItem, ...prev])
            setSelectedItemId(newItem.id)
            setCurrentCredits(prev => Math.max(0, prev - 10))

            // PERSIST TO DATABASE (VIA API ROUTE)
            console.log("Saving image via API route...");
            try {
                const saveResponse = await fetch('/api/history/save', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        prompt: settings.prompt || `Generated ${mode}`,
                        imageUrl: data.url,
                        settings: {
                            aspectRatio: settings.aspectRatio,
                            style: settings.style,
                            model: settings.aiModel,
                            mode: mode
                        }
                    })
                });

                const saveResult = await saveResponse.json();

                if (!saveResponse.ok) {
                    console.error("Database Save Error:", saveResult.error);
                    toast.error(`History save failed: ${saveResult.error}`);
                } else {
                    console.log("Image saved successfully to dedicated table!");
                    toast.success("Saved to history");
                    router.refresh();
                }
            } catch (saveErr) {
                console.error("Critical Save Exception:", saveErr);
                toast.error("Network error during save");
            }
        } catch (err: any) {
            console.error("Generation error:", err);
            setError(err.message || `Failed to generate ${mode}. Please try again.`);
        } finally {
            setIsLoading(false)
        }
    }

    const handleBackToSettings = () => {
        setShowHistory(false)
        setError(null)
    }

    const handleModeChange = (newMode: GenerationMode) => {
        setMode(newMode)
        setShowHistory(false)
        setError(null)
    }

    const handleViewHistory = () => {
        setShowHistory(true)
    }

    const handleSelectHistoryItem = (id: string) => {
        const item = generatedItems.find((item) => item.id === id)
        if (item) {
            setMode(item.type)
            setSelectedItemId(item.id)
            setShowHistory(false)
        }
    }

    const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setSettings({ ...settings, prompt: e.target.value })
    }

    const handleNegativePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setSettings({ ...settings, negativePrompt: e.target.value })
    }

    const handleSeedChange = (value: number[]) => {
        setSettings({ ...settings, seed: value[0] })
    }

    const handleStepsChange = (value: number[]) => {
        setSettings({ ...settings, steps: value[0] })
    }

    const applyPromptSuggestion = (suggestion: string) => {
        setSettings({ ...settings, prompt: suggestion })
    }

    const togglePlay = () => setIsPlaying(!isPlaying)
    const toggleRotate = () => setIsRotating(!isRotating)

    const handleDownload = async () => {
        const item = selectedItemId
            ? generatedItems.find(i => i.id === selectedItemId)
            : generatedItems[0]

        if (!item?.url) return

        try {
            const link = document.createElement('a')
            link.href = item.url
            link.download = `rive-ai-${Date.now()}.png`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
        } catch (err) {
            console.error("Download failed:", err)
            setError("Failed to download image. Please try right-clicking and saving instead.")
        }
    }

    const formatDate = (dateInput: Date | string) => {
        const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput
        const now = new Date()
        const diffMs = now.getTime() - date.getTime()
        const diffMins = Math.round(diffMs / 60000)

        if (diffMins < 1) return "Just now"
        if (diffMins < 60) return `${diffMins}m ago`

        const diffHours = Math.floor(diffMins / 60)
        if (diffHours < 24) return `${diffHours}h ago`

        return date.toLocaleDateString()
    }

    const filteredItems = generatedItems.filter((item) => item.prompt.toLowerCase().includes(searchQuery.toLowerCase()))

    // ---------- LEFT SIDE (FORM & HISTORY) ----------
    const renderHeader = () => (
        <div className="p-4 flex items-center justify-between border-b border-zinc-800">
            <div className="flex items-center gap-3">
                <div>
                    <h3 className="text-sm font-semibold text-zinc-100">AI Studio</h3>
                    <p className="text-[10px] text-zinc-500 font-medium">Credits: <span className="text-indigo-400">{currentCredits}</span></p>
                </div>
            </div>
            <button
                type="button"
                onClick={handleViewHistory}
                className={`p-2 rounded-lg transition-colors ${showHistory ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-500 hover:bg-zinc-800 hover:text-zinc-100'}`}
            >
                <History className="w-4 h-4" />
            </button>
        </div>
    )

    const renderError = () =>
        error && (
            <div className="mx-4 mt-4 px-3 py-2 flex items-center gap-2 text-xs text-red-400 bg-red-900/20 rounded-lg border border-red-900/50">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <p>{error}</p>
            </div>
        )

    const renderSettings = () => (
        <div className="space-y-3 p-3 rounded-xl bg-zinc-900/50 border border-zinc-800/50">
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <Cpu className="w-3.5 h-3.5 text-zinc-400" />
                    <span className="text-xs text-zinc-400">AI Model</span>
                </div>
                <Select value={settings.aiModel} onValueChange={(value) => setSettings({ ...settings, aiModel: value })}>
                    <SelectTrigger className="w-[140px] h-7 text-xs bg-zinc-900 border-zinc-800 text-zinc-200">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-200">
                        {aiModels[mode].map((model) => (
                            <SelectItem key={model.value} value={model.value} className="text-xs focus:bg-zinc-800">
                                {model.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <Monitor className="w-3.5 h-3.5 text-zinc-400" />
                    <span className="text-xs text-zinc-400">Resolution</span>
                </div>
                <Select value={settings.resolution} onValueChange={(value) => setSettings({ ...settings, resolution: value })}>
                    <SelectTrigger className="w-[140px] h-7 text-xs bg-zinc-900 border-zinc-800 text-zinc-200">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-200">
                        {resolutions[mode].map((res) => (
                            <SelectItem key={res.value} value={res.value} className="text-xs focus:bg-zinc-800">
                                {res.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <Palette className="w-3.5 h-3.5 text-zinc-400" />
                    <span className="text-xs text-zinc-400">Style</span>
                </div>
                <Select value={settings.style} onValueChange={(value) => setSettings({ ...settings, style: value })}>
                    <SelectTrigger className="w-[140px] h-7 text-xs bg-zinc-900 border-zinc-800 text-zinc-200">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-200">
                        <SelectItem value="professional" className="text-xs focus:bg-zinc-800">Professional</SelectItem>
                        <SelectItem value="artistic" className="text-xs focus:bg-zinc-800">Artistic</SelectItem>
                        <SelectItem value="casual" className="text-xs focus:bg-zinc-800">Casual</SelectItem>
                        <SelectItem value="vintage" className="text-xs focus:bg-zinc-800">Vintage</SelectItem>
                        {mode === "avatar" && <SelectItem value="cartoon" className="text-xs focus:bg-zinc-800">Cartoon</SelectItem>}
                        {mode === "avatar" && <SelectItem value="anime" className="text-xs focus:bg-zinc-800">Anime</SelectItem>}
                    </SelectContent>
                </Select>
            </div>

            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <ImageIcon className="w-3.5 h-3.5 text-zinc-400" />
                    <span className="text-xs text-zinc-400">Background</span>
                </div>
                <Select value={settings.backgroundColor} onValueChange={(value) => setSettings({ ...settings, backgroundColor: value })}>
                    <SelectTrigger className="w-[140px] h-7 text-xs bg-zinc-900 border-zinc-800 text-zinc-200">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-200">
                        <SelectItem value="studio" className="text-xs focus:bg-zinc-800">Studio</SelectItem>
                        <SelectItem value="gradient" className="text-xs focus:bg-zinc-800">Gradient</SelectItem>
                        <SelectItem value="solid" className="text-xs focus:bg-zinc-800">Solid Color</SelectItem>
                        <SelectItem value="transparent" className="text-xs focus:bg-zinc-800">Transparent</SelectItem>
                        {mode !== "avatar" && <SelectItem value="outdoor" className="text-xs focus:bg-zinc-800">Outdoor</SelectItem>}
                        {mode !== "avatar" && <SelectItem value="office" className="text-xs focus:bg-zinc-800">Office</SelectItem>}
                    </SelectContent>
                </Select>
            </div>

            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <Sun className="w-3.5 h-3.5 text-zinc-400" />
                    <span className="text-xs text-zinc-400">Lighting</span>
                </div>
                <Select value={settings.lighting} onValueChange={(value) => setSettings({ ...settings, lighting: value })}>
                    <SelectTrigger className="w-[140px] h-7 text-xs bg-zinc-900 border-zinc-800 text-zinc-200">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-200">
                        <SelectItem value="soft" className="text-xs focus:bg-zinc-800">Soft</SelectItem>
                        <SelectItem value="dramatic" className="text-xs focus:bg-zinc-800">Dramatic</SelectItem>
                        <SelectItem value="natural" className="text-xs focus:bg-zinc-800">Natural</SelectItem>
                        <SelectItem value="studio" className="text-xs focus:bg-zinc-800">Studio</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <AspectRatio className="w-3.5 h-3.5 text-zinc-400" />
                    <span className="text-xs text-zinc-400">Ratio</span>
                </div>
                <Select value={settings.aspectRatio} onValueChange={(value) => setSettings({ ...settings, aspectRatio: value })}>
                    <SelectTrigger className="w-[140px] h-7 text-xs bg-zinc-900 border-zinc-800 text-zinc-200">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-200">
                        <SelectItem value="1:1" className="text-xs focus:bg-zinc-800">1:1 Square</SelectItem>
                        <SelectItem value="4:5" className="text-xs focus:bg-zinc-800">4:5 Portrait</SelectItem>
                        <SelectItem value="3:4" className="text-xs focus:bg-zinc-800">3:4 Portrait</SelectItem>
                        <SelectItem value="16:9" className="text-xs focus:bg-zinc-800">16:9 Landscape</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {true && (
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-zinc-400" />
                        <span className="text-xs text-zinc-400">Pose</span>
                    </div>
                    <Select value={settings.pose} onValueChange={(value) => setSettings({ ...settings, pose: value })}>
                        <SelectTrigger className="w-[140px] h-7 text-xs bg-zinc-900 border-zinc-800 text-zinc-200">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-200">
                            <SelectItem value="headshot" className="text-xs focus:bg-zinc-800">Headshot</SelectItem>
                            <SelectItem value="half-body" className="text-xs focus:bg-zinc-800">Half Body</SelectItem>
                            <SelectItem value="full-body" className="text-xs focus:bg-zinc-800">Full Body</SelectItem>
                            <SelectItem value="profile" className="text-xs focus:bg-zinc-800">Profile</SelectItem>
                            {mode === "avatar" && <SelectItem value="bust" className="text-xs focus:bg-zinc-800">Bust</SelectItem>}
                        </SelectContent>
                    </Select>
                </div>
            )}
        </div>
    )

    const renderForm = () => (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4 flex-1">
            <div className="space-y-4">
                <Tabs value={mode} onValueChange={(value) => handleModeChange(value as GenerationMode)} className="w-full">
                    <TabsList className="grid grid-cols-2 w-full bg-zinc-900 border border-zinc-800 p-1">
                        <TabsTrigger value="image" className="flex items-center justify-center gap-1.5 text-xs data-[state=active]:bg-zinc-800 data-[state=active]:text-white data-[state=active]:shadow-none">
                            <ImageIcon className="w-3.5 h-3.5" />
                            <span>Image</span>
                        </TabsTrigger>
                        <TabsTrigger value="avatar" className="flex items-center justify-center gap-1.5 text-xs data-[state=active]:bg-zinc-800 data-[state=active]:text-white data-[state=active]:shadow-none">
                            <Cube className="w-3.5 h-3.5" />
                            <span>Avatar</span>
                        </TabsTrigger>
                    </TabsList>
                </Tabs>

                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <MessageCircle className="w-3.5 h-3.5 text-zinc-400" />
                            <span className="text-xs font-medium text-zinc-300">Prompt</span>
                        </div>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-6 px-1.5 hover:bg-zinc-800 hover:text-zinc-200 text-zinc-500">
                                    <Wand2 className="w-3 h-3" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-64 p-2 bg-zinc-900 border-zinc-800 shadow-2xl">
                                <div className="space-y-1">
                                    <h4 className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest px-1">Suggestions</h4>
                                    <div className="space-y-0.5">
                                        {promptSuggestions.map((suggestion, index) => (
                                            <button
                                                key={index}
                                                type="button"
                                                onClick={() => applyPromptSuggestion(suggestion)}
                                                className="w-full text-left p-1.5 text-xs text-zinc-300 hover:bg-zinc-800 rounded-md transition-colors"
                                            >
                                                {suggestion}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </PopoverContent>
                        </Popover>
                    </div>
                    <Textarea
                        value={settings.prompt}
                        onChange={handlePromptChange}
                        placeholder={placeholderPrompts[mode]}
                        className="w-full min-h-[90px] bg-zinc-900/50 border-zinc-800 text-sm text-zinc-200 placeholder:text-zinc-600 rounded-xl focus:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500 focus-visible:border-indigo-500/50 resize-none"
                    />
                </div>

                <div className="pt-1">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-11 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600 text-white text-sm font-semibold rounded-xl transition-all shadow-[0_0_15px_rgba(79,70,229,0.3)] hover:shadow-[0_0_20px_rgba(79,70,229,0.5)]"
                    >
                        {isLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Sparkles className="w-4 h-4" />
                        )}
                        {isLoading ? 'Generating...' : `Generate ${mode === "image" ? "Image" : "Avatar"}`}
                    </button>
                </div>

                {renderSettings()}

                <div className="pt-2 border-t border-zinc-800/50">
                    <div className="flex items-center space-x-2 mb-3">
                        <Switch id="advanced-mode" checked={advancedMode} onCheckedChange={setAdvancedMode} className="data-[state=checked]:bg-indigo-500 data-[state=unchecked]:bg-zinc-800 scale-90" />
                        <Label htmlFor="advanced-mode" className="text-xs text-zinc-400 cursor-pointer">
                            Advanced Settings
                        </Label>
                    </div>

                    {advancedMode && (
                        <div className="space-y-3 p-3 bg-zinc-900/30 border border-zinc-800/50 rounded-xl mb-3">
                            <div className="space-y-1.5">
                                <label className="text-[10px] uppercase tracking-wider font-semibold text-zinc-500">Negative Prompt</label>
                                <Textarea
                                    value={settings.negativePrompt}
                                    onChange={handleNegativePromptChange}
                                    placeholder="Elements to avoid in generation"
                                    className="w-full min-h-[60px] bg-zinc-900/80 border-zinc-800/80 text-xs text-zinc-300 placeholder:text-zinc-600 rounded-lg resize-none focus-visible:ring-1 focus-visible:ring-indigo-500"
                                />
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center justify-between">
                                    <label className="text-[10px] uppercase tracking-wider font-semibold text-zinc-500">Seed</label>
                                    <span className="text-[10px] text-zinc-400 font-mono">{settings.seed || 0}</span>
                                </div>
                                <Slider defaultValue={[settings.seed || 0]} max={1000000} step={1} onValueChange={handleSeedChange} className="[&_[role=slider]]:bg-zinc-300 [&_[role=slider]]:border-zinc-500" />
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center justify-between">
                                    <label className="text-[10px] uppercase tracking-wider font-semibold text-zinc-500">Steps</label>
                                    <span className="text-[10px] text-zinc-400 font-mono">{settings.steps || 30}</span>
                                </div>
                                <Slider defaultValue={[settings.steps || 30]} min={10} max={150} step={1} onValueChange={handleStepsChange} className="[&_[role=slider]]:bg-zinc-300 [&_[role=slider]]:border-zinc-500" />
                            </div>
                        </div>
                    )}
                </div>
            </div>

        </form>
    )

    const renderHistory = () => (
        <div className="flex flex-col h-full p-4 space-y-4">
            <div className="flex items-center gap-2 text-zinc-100">
                <button
                    type="button"
                    onClick={handleBackToSettings}
                    className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                </button>
                <h3 className="text-sm font-medium">History</h3>
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
                <Input
                    type="text"
                    placeholder="Search items..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 bg-zinc-900 border-zinc-800 text-xs text-zinc-200 focus-visible:ring-indigo-500"
                />
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                {filteredItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center py-8">
                        <Clock className="w-6 h-6 text-zinc-700 mb-2" />
                        <p className="text-xs text-zinc-500">No generations yet</p>
                    </div>
                ) : (
                    filteredItems.map((item) => (
                        <div
                            key={item.id}
                            onClick={() => handleSelectHistoryItem(item.id)}
                            className="flex items-center gap-3 p-2 rounded-lg bg-zinc-900/30 hover:bg-zinc-800 border border-transparent hover:border-zinc-700 cursor-pointer transition-all"
                        >
                            <div className="relative w-10 h-10 rounded-md overflow-hidden flex-shrink-0 bg-zinc-800">
                                <Image
                                    src={item.url || "/placeholder.svg"}
                                    alt={item.prompt}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs text-zinc-200 truncate">{item.prompt}</p>
                                <div className="flex items-center gap-1.5 mt-1">
                                    <span className="text-[10px] text-zinc-500">{formatDate(item.timestamp)}</span>
                                    <span className="text-[8px] text-zinc-700">•</span>
                                    <span className="text-[10px] text-zinc-400 capitalize">{item.type}</span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )

    // ---------- RIGHT SIDE (PREVIEW) ----------
    const renderPreview = () => {
        // Current main item to display
        const item = selectedItemId
            ? generatedItems.find(i => i.id === selectedItemId)
            : null

        if (!item && !isLoading) {
            return (
                <div className="w-full h-full flex flex-col justify-center items-center relative">
                    <div className="flex flex-col items-center gap-4 text-zinc-600">
                        <ImageIcon className="w-16 h-16 opacity-20" />
                        <p className="text-sm font-medium">Your generated {mode} will appear here</p>
                    </div>
                </div>
            )
        }

        return (
            <div className="w-full h-full flex flex-col relative items-center justify-center p-6 bg-black">
                <div className="w-full max-w-2xl h-full flex flex-col">
                    <div className="flex-1 flex items-center justify-center relative overflow-hidden">
                        <ImageGeneration
                            key={item?.id || 'new'}
                            isGenerating={isLoading}
                            duration={mode === "avatar" ? 45000 : 15000}
                        >
                            <div
                                className="relative w-full max-h-full bg-zinc-900/40 rounded-xl overflow-hidden shadow-2xl flex items-center justify-center transition-all duration-500"
                                style={{ aspectRatio: settings.aspectRatio.replace(':', '/') }}
                            >
                                {item ? (
                                    <Image
                                        src={item.url}
                                        fill
                                        alt={`AI generated ${mode}`}
                                        className={`object-cover w-full h-full transition-opacity duration-500 ${isRotating ? "animate-spin-slow" : ""}`}
                                    />
                                ) : (
                                    <div className="flex flex-col items-center gap-3 text-zinc-700">
                                        <div className="w-12 h-12 rounded-full border-2 border-dashed border-zinc-800 animate-spin-slow" />
                                        <p className="text-[10px] font-mono tracking-widest uppercase opacity-50">Initializing...</p>
                                    </div>
                                )}

                                {item && mode !== "image" && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 group hover:bg-black/40 transition-colors z-20">
                                        <button
                                            type="button"
                                            onClick={togglePlay}
                                            className="w-14 h-14 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-md hover:bg-indigo-600 transition-all scale-100 active:scale-95 text-white"
                                        >
                                            {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
                                        </button>
                                    </div>
                                )}

                                {item && mode === "avatar" && (
                                    <button
                                        type="button"
                                        onClick={toggleRotate}
                                        className="absolute bottom-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-md hover:bg-white/20 transition-all text-white border border-white/10 z-20"
                                    >
                                        <RotateCw className={`w-5 h-5 ${isRotating ? 'animate-spin' : ''}`} />
                                    </button>
                                )}
                            </div>
                        </ImageGeneration>
                    </div>

                    {/* Bottom Actions for Preview */}
                    {item && (
                        <div className="mt-4 flex items-center justify-between w-full animate-in slide-in-from-bottom-2 duration-500">
                            <div className="flex items-center gap-4 text-xs font-mono text-zinc-500">
                                <span className="px-2 py-1 bg-zinc-900 rounded-md border border-zinc-800">
                                    {settings.resolution}
                                </span>
                                <span className="px-2 py-1 bg-zinc-900 rounded-md border border-zinc-800">
                                    {settings.aiModel}
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={handleDownload}
                                className="flex items-center gap-2 px-4 py-2 bg-zinc-100 hover:bg-white text-zinc-900 text-xs font-semibold rounded-lg transition-colors shadow-lg"
                            >
                                <Download className="w-4 h-4" />
                                Download {mode === 'image' ? 'Image' : mode}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        )
    }

    if (!hasMounted) return null

    return (
        <div className="w-full max-w-[1200px] h-[750px] bg-[#09090b] border border-zinc-800/80 rounded-2xl flex overflow-hidden shadow-2xl">
            {/* LEFT COLUMN: Settings & History */}
            <div className="w-[340px] flex flex-col border-r border-zinc-800/80 bg-[#0c0c0e] shrink-0">
                {renderHeader()}
                {renderError()}
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
