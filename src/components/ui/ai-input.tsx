"use client"

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react"
import { useChat } from "@ai-sdk/react"
import { AnimatePresence, motion } from "framer-motion"
import { Paperclip, Send, Loader2, Sparkles, X, ChevronRight } from "lucide-react"
import ReactMarkdown from "react-markdown"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

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

    const blurStrength =
        dimValue < 50 ? Math.max(dimValue * 0.008, 1) : Math.max(dimValue * 0.015, 4)

    const contrastStrength =
        dimValue < 50 ? Math.max(dimValue * 0.004, 1.2) : Math.max(dimValue * 0.008, 1.5)

    const adjustedContrast =
        dimValue < 30 ? 1.1 : dimValue < 50 ? Math.max(contrastStrength * 1.2, 1.3) : contrastStrength

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

        .color-orb {
          display: grid;
          grid-template-areas: "stack";
          transform: scale(1.1);
        }

        .color-orb::before,
        .color-orb::after {
          content: "";
          display: block;
          grid-area: stack;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          transform: translateZ(0);
        }

        .color-orb::before {
          background:
            conic-gradient(
              from calc(var(--angle) * 2) at 25% 70%,
              var(--accent3),
              transparent 20% 80%,
              var(--accent3)
            ),
            conic-gradient(
              from calc(var(--angle) * 2) at 45% 75%,
              var(--accent2),
              transparent 30% 60%,
              var(--accent2)
            ),
            conic-gradient(
              from calc(var(--angle) * -3) at 80% 20%,
              var(--accent1),
              transparent 40% 60%,
              var(--accent1)
            ),
            conic-gradient(
              from calc(var(--angle) * 2) at 15% 5%,
              var(--accent2),
              transparent 10% 90%,
              var(--accent2)
            ),
            conic-gradient(
              from calc(var(--angle) * 1) at 20% 80%,
              var(--accent1),
              transparent 10% 90%,
              var(--accent1)
            ),
            conic-gradient(
              from calc(var(--angle) * -2) at 85% 10%,
              var(--accent3),
              transparent 20% 80%,
              var(--accent3)
            );
          box-shadow: inset var(--base) 0 0 var(--shadow) calc(var(--shadow) * 0.2);
          filter: blur(var(--blur)) contrast(var(--contrast));
          animation: spin var(--spin-duration) linear infinite;
        }

        .color-orb::after {
          background-image: radial-gradient(
            circle at center,
            var(--base) var(--dot),
            transparent var(--dot)
          );
          background-size: calc(var(--dot) * 2) calc(var(--dot) * 2);
          backdrop-filter: blur(calc(var(--blur) * 2)) contrast(calc(var(--contrast) * 2));
          mix-blend-mode: overlay;
        }

        .color-orb[style*="--mask: 0%"]::after {
          mask-image: none;
        }

        .color-orb:not([style*="--mask: 0%"])::after {
          mask-image: radial-gradient(black var(--mask), transparent 75%);
        }

        @keyframes spin {
          to {
            --angle: 360deg;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .color-orb::before {
            animation: none;
          }
        }
      `}</style>
        </div>
    )
}

const SPEED_FACTOR = 1
const FORM_WIDTH = 400
const FORM_HEIGHT = 450 // Increased to show response

interface ContextShape {
    showForm: boolean
    triggerOpen: () => void
    triggerClose: () => void
    messages: any[]
    isLoading: boolean
    input: string
    handleInputChange: (e: any) => void
    handleSubmit: (e: any) => void
    textareaRef: React.RefObject<HTMLTextAreaElement | null>
}

const FormContext = React.createContext({} as ContextShape)
const useFormContext = () => React.useContext(FormContext)

export function MorphPanel() {
    const wrapperRef = useRef<HTMLDivElement>(null)
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const [showForm, setShowForm] = useState(false)

    const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
        api: "/api/chat",
    })

    const triggerClose = useCallback(() => {
        setShowForm(false)
    }, [])

    const triggerOpen = useCallback(() => {
        setShowForm(true)
        // Focus the textarea after the panel expands
        setTimeout(() => {
            textareaRef.current?.focus()
        }, 300)
    }, [])

    useEffect(() => {
        function clickOutsideHandler(e: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node) && showForm) {
                // triggerClose() // Optional: keep open if interactive
            }
        }
        document.addEventListener("mousedown", clickOutsideHandler)
        return () => document.removeEventListener("mousedown", clickOutsideHandler)
    }, [showForm, triggerClose])

    const ctx = useMemo(
        () => ({
            showForm,
            triggerOpen,
            triggerClose,
            messages: messages || [],
            isLoading,
            input: input || "",
            handleInputChange,
            handleSubmit,
            textareaRef
        }),
        [showForm, triggerOpen, triggerClose, messages, isLoading, input, handleInputChange, handleSubmit, textareaRef]
    )

    return (
        <div className="fixed bottom-8 right-8 z-[10000]">
            <motion.div
                ref={wrapperRef}
                className={cn(
                    "bg-zinc-950/80 backdrop-blur-2xl relative flex flex-col overflow-hidden border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)]",
                    showForm ? "p-0" : "p-1"
                )}
                initial={false}
                animate={{
                    width: showForm ? FORM_WIDTH : 56,
                    height: showForm ? FORM_HEIGHT : 56,
                    borderRadius: showForm ? 24 : 28,
                }}
                transition={{
                    type: "spring",
                    stiffness: 550 / SPEED_FACTOR,
                    damping: 45,
                    mass: 0.7,
                }}
            >
                <FormContext.Provider value={ctx}>
                    <AnimatePresence mode="wait">
                        {!showForm ? <DockBar key="dock" /> : <AIExpandedPanel key="expanded" />}
                    </AnimatePresence>
                </FormContext.Provider>
            </motion.div>
        </div>
    )
}

function DockBar() {
    const { triggerOpen } = useFormContext()
    return (
        <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={triggerOpen}
            className="flex h-full w-full items-center justify-center hover:bg-white/5 transition-colors group"
        >
            <ColorOrb dimension="28px" tones={{ base: "oklch(22.64% 0 0)" }} />
        </motion.button>
    )
}

function AIExpandedPanel() {
    const { triggerClose, messages, isLoading, input, handleInputChange, handleSubmit, textareaRef } = useFormContext()
    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages])

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex h-full flex-col"
        >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 bg-white/[0.02]">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <ColorOrb dimension="24px" tones={{ base: "oklch(22.64% 0 0)" }} />
                        <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-zinc-950 animate-pulse" />
                    </div>
                    <div>
                        <h3 className="text-xs font-bold text-white uppercase tracking-widest leading-none mb-0.5">Ruixen AI</h3>
                        <p className="text-[10px] text-zinc-500 font-medium">Assistant is online</p>
                    </div>
                </div>
                <Button variant="ghost" size="icon" onClick={triggerClose} className="w-8 h-8 rounded-full text-zinc-500 hover:text-white hover:bg-white/5">
                    <X className="w-4 h-4" />
                </Button>
            </div>

            {/* Messages / Response Area */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-5 space-y-4 no-scrollbar scroll-smooth bg-gradient-to-b from-transparent to-zinc-950/50"
            >
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center px-4">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-4 border border-indigo-500/20">
                            <Sparkles className="w-6 h-6 text-indigo-400" />
                        </div>
                        <p className="text-xs text-zinc-400 font-medium leading-relaxed">
                            Hello! I'm Ruixen. <br /> Ask me anything about this page or generate creative ideas.
                        </p>
                    </div>
                ) : (
                    messages.map((m, idx) => (
                        <div key={m.id} className={cn("flex flex-col gap-2", m.role === "user" ? "items-end" : "items-start")}>
                            <div className={cn(
                                "max-w-[85%] px-4 py-3 rounded-2xl text-xs leading-relaxed",
                                m.role === "user"
                                    ? "bg-indigo-600 text-white rounded-tr-none shadow-lg shadow-indigo-600/10"
                                    : "bg-white/5 border border-white/10 text-zinc-200 rounded-tl-none"
                            )}>
                                <ReactMarkdown
                                    components={{
                                        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                                        h3: ({ children }) => <h3 className="text-sm font-bold text-white mb-2">{children}</h3>,
                                        code: ({ children }) => <code className="bg-black/50 px-1 rounded font-mono text-indigo-300">{children}</code>
                                    }}
                                >
                                    {m.content}
                                </ReactMarkdown>
                            </div>
                        </div>
                    ))
                )}
                {isLoading && (
                    <div className="flex items-center gap-2 text-zinc-500 px-1">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Thinking...</span>
                    </div>
                )}
            </div>

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="p-4 bg-zinc-900/50 border-t border-white/5">
                <div className="relative group">
                    <textarea
                        ref={textareaRef}
                        value={input}
                        onChange={handleInputChange}
                        placeholder="Type your message..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-12 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50 transition-all resize-none h-[48px] no-scrollbar"
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                handleSubmit(e);
                            }
                        }}
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !(input || "").trim()}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-lg bg-indigo-600 text-white disabled:bg-zinc-800 disabled:text-zinc-600 transition-all active:scale-90"
                    >
                        <Send className="w-3.5 h-3.5" />
                    </button>
                </div>
                <div className="mt-2 flex items-center justify-between px-1">
                    <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">Powered by Ruixen AI</span>
                    <button type="button" className="text-[9px] text-zinc-500 hover:text-zinc-300 transition-colors">Clear Chat</button>
                </div>
            </form>
        </motion.div>
    )
}

export default MorphPanel
