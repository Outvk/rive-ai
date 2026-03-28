"use client"

import React, { useState, useRef, useEffect, useCallback } from "react"
import { useTheme } from "next-themes"
import { AnimatePresence, motion } from "framer-motion"
import { Send, Loader2, Sparkles, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { askRuixen } from "@/app/actions/ruixen"

type Message = {
    role: 'user' | 'assistant'
    content: string
}

interface OrbProps {
    dimension?: string
    className?: string
    tones?: {
        base?: string
        accent1?: string
        accent2?: string
        accent3?: string
    }
    spinDuration?: number
}

const ColorOrb: React.FC<OrbProps> = ({
    dimension = "192px",
    className,
    tones,
    spinDuration = 20,
}) => {
    const fallbackTones = {
        base: "oklch(95% 0.02 264.695)",
        accent1: "oklch(75% 0.15 350)",
        accent2: "oklch(80% 0.12 200)",
        accent3: "oklch(78% 0.14 280)",
    }
    const palette = { ...fallbackTones, ...tones }
    const dimValue = parseInt(dimension.replace("px", ""), 10)
    const blurStrength = dimValue < 50 ? Math.max(dimValue * 0.008, 1) : Math.max(dimValue * 0.015, 4)
    const contrastStrength = dimValue < 50 ? Math.max(dimValue * 0.004, 1.2) : Math.max(dimValue * 0.008, 1.5)
    const adjustedContrast = dimValue < 30 ? 1.1 : dimValue < 50 ? Math.max(contrastStrength * 1.2, 1.3) : contrastStrength
    const pixelDot = dimValue < 50 ? Math.max(dimValue * 0.004, 0.05) : Math.max(dimValue * 0.008, 0.1)
    const shadowRange = dimValue < 50 ? Math.max(dimValue * 0.004, 0.5) : Math.max(dimValue * 0.008, 2)
    const maskRadius = dimValue < 30 ? "0%" : dimValue < 50 ? "5%" : dimValue < 100 ? "15%" : "25%"

    return (
        <div
            className={cn("color-orb overflow-hidden rounded-full relative", className)}
            style={{
                width: dimension,
                height: dimension,
                "--base": palette.base,
                "--accent1": palette.accent1,
                "--accent2": palette.accent2,
                "--accent3": palette.accent3,
                "--spin-duration": `${spinDuration}s`,
                "--blur": `${blurStrength}px`,
                "--contrast": adjustedContrast,
                "--dot": `${pixelDot}px`,
                "--shadow": `${shadowRange}px`,
                "--mask": maskRadius,
            } as React.CSSProperties}
        >
            <style jsx>{`
                @property --angle {
                    syntax: "<angle>";
                    inherits: false;
                    initial-value: 0deg;
                }
                .color-orb { display: grid; grid-template-areas: "stack"; transform: scale(1.1); }
                .color-orb::before, .color-orb::after { content: ""; display: block; grid-area: stack; width: 100%; height: 100%; border-radius: 50%; transform: translateZ(0); }
                .color-orb::before {
                    background:
                        conic-gradient(from calc(var(--angle) * 2) at 25% 70%, var(--accent3), transparent 20% 80%, var(--accent3)),
                        conic-gradient(from calc(var(--angle) * 2) at 45% 75%, var(--accent2), transparent 30% 60%, var(--accent2)),
                        conic-gradient(from calc(var(--angle) * -3) at 80% 20%, var(--accent1), transparent 40% 60%, var(--accent1)),
                        conic-gradient(from calc(var(--angle) * 2) at 15% 5%, var(--accent2), transparent 10% 90%, var(--accent2)),
                        conic-gradient(from calc(var(--angle) * 1) at 20% 80%, var(--accent1), transparent 10% 90%, var(--accent1)),
                        conic-gradient(from calc(var(--angle) * -2) at 85% 10%, var(--accent3), transparent 20% 80%, var(--accent3));
                    box-shadow: inset var(--base) 0 0 var(--shadow) calc(var(--shadow) * 0.2);
                    filter: blur(var(--blur)) contrast(var(--contrast));
                    animation: spin var(--spin-duration) linear infinite;
                }
                .color-orb::after {
                    background-image: radial-gradient(circle at center, var(--base) var(--dot), transparent var(--dot));
                    background-size: calc(var(--dot) * 2) calc(var(--dot) * 2);
                    backdrop-filter: blur(calc(var(--blur) * 2)) contrast(calc(var(--contrast) * 2));
                    mix-blend-mode: overlay;
                }
                .color-orb[style*="--mask: 0%"]::after { mask-image: none; }
                .color-orb:not([style*="--mask: 0%"])::after { mask-image: radial-gradient(black var(--mask), transparent 75%); }
                @keyframes spin { to { --angle: 360deg; } }
                @media (prefers-reduced-motion: reduce) { .color-orb::before { animation: none; } }
            `}</style>
        </div>
    )
}

const SPEED_FACTOR = 1
const FORM_WIDTH = 400
const FORM_HEIGHT = 450

export function MorphPanel() {
    const { theme } = useTheme()
    const wrapperRef = useRef<HTMLDivElement>(null)
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const scrollRef = useRef<HTMLDivElement>(null)
    const [showForm, setShowForm] = useState(false)
    const [input, setInput] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: "Greetings! I am Ruixen AI, your creative co-pilot. How can I help you navigate the Rive AI ecosystem today?" }
    ])

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages, showForm])

    const handleSend = async () => {
        if (!input.trim() || isLoading) return

        const userMsg = input.trim()
        setInput('')
        setMessages(prev => [...prev, { role: 'user', content: userMsg }])
        setIsLoading(true)

        try {
            const response = await askRuixen(userMsg, messages)
            setMessages(prev => [...prev, { role: 'assistant', content: response.content }])
        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', content: "I've encountered a neural sync error. Please try asking again." }])
        } finally {
            setIsLoading(false)
        }
    }

    const triggerClose = useCallback(() => setShowForm(false), [])
    const triggerOpen = useCallback(() => {
        setShowForm(true)
        setTimeout(() => textareaRef.current?.focus(), 300)
    }, [])

    return (
        <div className="fixed bottom-6 right-4 z-[10000]">
            <motion.div
                ref={wrapperRef}
                className={cn(
                    "bg-white/80 dark:bg-zinc-950/80 backdrop-blur-2xl relative flex flex-col overflow-hidden border border-zinc-200 dark:border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.1)] dark:shadow-[0_0_50px_rgba(0,0,0,0.5)]",
                    showForm ? "p-0" : "p-1"
                )}
                initial={false}
                animate={{
                    width: showForm ? FORM_WIDTH : 55,
                    height: showForm ? FORM_HEIGHT : 55,
                    borderRadius: showForm ? 50 : 50,
                }}
                transition={{
                    type: "spring",
                    stiffness: 550 / SPEED_FACTOR,
                    damping: 45,
                    mass: 0.7,
                }}
            >
                <AnimatePresence mode="wait">
                    {!showForm ? (
                        <motion.button
                            key="dock"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={triggerOpen}
                            className="flex h-full w-full items-center justify-center "
                        >
                            <ColorOrb dimension="33px" tones={{ base: "oklch(22.64% 0 0)" }} />
                        </motion.button>
                    ) : (
                        <motion.div
                            key="expanded"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex h-full flex-col"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 dark:border-white/5 bg-zinc-50/50 dark:bg-white/[0.02]">
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <ColorOrb dimension="24px" tones={{ base: theme === "dark" ? "oklch(22.64% 0 0)" : "oklch(95% 0 0)" }} />
                                        <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white dark:border-zinc-950" />
                                    </div>
                                    <div>
                                        <h3 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-widest leading-none mb-0.5 font-outfit">Ruixen AI</h3>
                                        <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium font-outfit">Assistant is online</p>
                                    </div>
                                </div>
                                <Button variant="ghost" size="icon" onClick={triggerClose} className="w-8 h-8 rounded-full text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5">
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>

                            {/* Chat Area */}
                            <div 
                               ref={scrollRef} 
                               className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide bg-zinc-950/20"
                            >
                               {messages.map((m, i) => (
                                   <div key={i} className={cn(
                                       "flex w-full",
                                       m.role === 'user' ? "justify-end" : "justify-start"
                                   )}>
                                       <div className={cn(
                                           "max-w-[85%] p-3 rounded-2xl text-xs font-outfit leading-relaxed whitespace-pre-wrap",
                                           m.role === 'user' 
                                               ? "bg-indigo-600 text-white rounded-br-none shadow-lg shadow-indigo-600/10" 
                                               : "bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-200 border border-zinc-200 dark:border-white/5 rounded-bl-none"
                                       )}>
                                           {m.content}
                                       </div>
                                   </div>
                               ))}
                               {isLoading && (
                                   <div className="flex justify-start">
                                       <div className="bg-zinc-100 dark:bg-zinc-900 p-3 rounded-2xl rounded-bl-none border border-zinc-200 dark:border-white/5 flex gap-1">
                                           <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                           <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                           <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" />
                                       </div>
                                   </div>
                               )}
                           </div>

                            {/* Input — enabled */}
                            <div className="p-4 bg-zinc-50/50 dark:bg-zinc-900/50 border-t border-zinc-100 dark:border-white/5">
                                <div className="relative">
                                    <textarea
                                        ref={textareaRef}
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                                        placeholder="Message Ruixen AI..."
                                        className="w-full bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-xl px-4 py-3 pr-12 text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none transition-all resize-none h-[48px] shadow-sm dark:shadow-none no-scrollbar"
                                    />
                                    <button
                                        onClick={handleSend}
                                        disabled={isLoading || !input.trim()}
                                        className={cn(
                                           "absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-lg transition-all",
                                           input.trim() ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-600"
                                        )}
                                    >
                                       {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                                    </button>
                                </div>
                                <div className="mt-2 flex items-center justify-center px-1">
                                    <span className="text-[9px] text-zinc-400 dark:text-zinc-600 font-bold uppercase tracking-widest font-outfit">Powered by Ruixen AI</span>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    )
}

export default MorphPanel