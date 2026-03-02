'use client'

import { useChat, type UIMessage } from '@ai-sdk/react'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PaperPlaneIcon, UpdateIcon, CopyIcon, CheckIcon, MagicWandIcon } from '@radix-ui/react-icons'
import { saveGeneration } from '@/app/dashboard/text/actions'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'

export function TextGeneratorForm({ initialCredits = 0 }: { initialCredits?: number }) {
    const router = useRouter()
    const [currentCredits, setCurrentCredits] = useState(initialCredits)
    const [isSaving, setIsSaving] = useState(false)
    const [copiedId, setCopiedId] = useState<string | null>(null)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const [input, setInput] = useState('')

    // Helper to safely get text content from a message (AI SDK 6.0)
    const getMessageContent = (m: any) => {
        if (typeof m.content === 'string') return m.content;
        const contents = Array.isArray(m.content) ? m.content : [];
        const parts = Array.isArray(m.parts) ? m.parts : [];
        const allParts = [...contents, ...parts];
        return allParts
            .filter((p: any) => p.type === 'text')
            .map((p: any) => p.text)
            .join('');
    }

    const { messages, sendMessage, status, error } = useChat<UIMessage>({
        id: 'chat-text-generator',
        onError: (err) => {
            if (err.message.includes('402')) {
                toast.error('Insufficient credits to generate text.')
            } else {
                toast.error('Failed to generate text. Check your Hugging Face API key.')
            }
        },

        onFinish: async (message) => {
            // Deduct credits locally for immediate feedback and sync server state
            setCurrentCredits(prev => Math.max(0, prev - 10))
            router.refresh()

            const userMessages = messages.filter(m => m.role === 'user');
            const promptMsg = userMessages[userMessages.length - 1];
            if (promptMsg) {
                setIsSaving(true)
                const promptContent = getMessageContent(promptMsg)
                const messageContent = getMessageContent(message)
                if (messageContent) {
                    await saveGeneration(promptContent, messageContent, 'text')
                }
                setIsSaving(false)
            }
        },
    })

    const isLoading = status === 'submitted' || status === 'streaming'

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages, status])

    const copyToClipboard = (text: string, id: string) => {
        if (!text) return
        navigator.clipboard.writeText(text)
        setCopiedId(id)
        toast.success('Copied to clipboard')
        setTimeout(() => setCopiedId(null), 2000)
    }

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (currentCredits < 10) {
            toast.error('Insufficient credits. Each message costs 10 credits.')
            return
        }
        if (!isLoading && input.trim()) {
            sendMessage({ text: input.trim() })
            setInput('')
        }
    }

    return (
        <div className="flex flex-col min-h-[80vh] w-full max-w-4xl mx-auto relative px-4 sm:px-6">

            {/* Ambient Background Effects */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">

                <div className="absolute bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-purple-500/10 rounded-full blur-[120px] animate-pulse delay-1000" />
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto pt-10 pb-40 space-y-12 no-scrollbar">
                {messages.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="h-full flex flex-col items-center justify-center pt-20"
                    >
                        <div className="relative group mb-8">
                            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
                            <div className="relative p-5 bg-black rounded-full flex items-center justify-center border border-white/5">
                                <MagicWandIcon className="w-10 h-10 text-white animate-pulse" />
                            </div>
                        </div>
                        <h1 className="text-4xl sm:text-5xl font-medium text-white mb-6 tracking-tight text-center bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
                            How can I help you today?
                        </h1>
                        <p className="text-zinc-400 text-lg max-w-lg text-center font-light leading-relaxed mb-12">
                            Transform your ideas into reality with Llama 3.2. Generate marketing copy, blog posts, or creative content in seconds.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-xl">
                            <button onClick={() => setInput("Write a professional blog post about AI trends in 2024.")} className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-left group">
                                <p className="text-sm font-medium text-zinc-300 group-hover:text-white transition-colors">Write a blog post</p>
                                <p className="text-xs text-zinc-500">About AI trends in 2024</p>
                            </button>
                            <button onClick={() => setInput("Create 5 catchy headlines for a new fitness app.")} className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-left group">
                                <p className="text-sm font-medium text-zinc-300 group-hover:text-white transition-colors">Generate headlines</p>
                                <p className="text-xs text-zinc-500">For a fitness application</p>
                            </button>
                        </div>
                    </motion.div>
                ) : (
                    <div className="space-y-12">
                        <AnimatePresence mode="popLayout">
                            {messages.map((m) => {
                                const content = getMessageContent(m)

                                return (
                                    <motion.div
                                        key={m.id}
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
                                        className="group"
                                    >
                                        <div className={`flex gap-6  max-w-4xl mx-auto ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                            {/* Role Indicator */}
                                            <div className="w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center overflow-hidden border border-white/10 bg-zinc-900 shadow-inner">
                                                {m.role === 'user' ? (
                                                    <div className="w-full h-full bg-indigo-600 flex items-center justify-center text-xs font-bold text-white uppercase ml-">U</div>
                                                ) : (
                                                    <div className="w-full h-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-[10px] font-black text-white">R</div>
                                                )}
                                            </div>

                                            {/* Message Content */}
                                            <div className={`flex-1 pt-1.5 ${m.role === 'user' ? 'text-right' : 'text-left'}`}>
                                                <div className={`flex items-center mb-1  ${m.role === 'user' ? 'justify-end' : 'justify-between'}`}>
                                                    <span className="text-xs font-bold tracking-widest text-zinc-500 uppercase">
                                                        {m.role === 'user' ? 'You' : 'Rive Intelligence'}
                                                    </span>
                                                    {m.role !== 'user' && (
                                                        <button
                                                            onClick={() => copyToClipboard(content, m.id)}
                                                            className="opacity-0 group-hover:opacity-100 transition-all duration-300 p-1.5 hover:bg-white/5 rounded-lg text-zinc-500 hover:text-white"
                                                        >
                                                            {copiedId === m.id ? <CheckIcon className="w-4 h-4 text-emerald-400" /> : <CopyIcon className="w-4 h-4" />}
                                                        </button>
                                                    )}
                                                </div>

                                                <div className={`max-w-xl leading-relaxed whitespace-pre-wrap markdown-content ${m.role === 'user'
                                                    ? 'text-base text-zinc-100 font-medium ml-auto'
                                                    : 'text-lg text-zinc-200 font-light'
                                                    }`}>
                                                    {m.role === 'user' ? (
                                                        content
                                                    ) : (
                                                        <ReactMarkdown
                                                            components={{
                                                                h3: ({ node, ...props }) => <h3 className="text-xl font-bold text-white mt-6 mb-3" {...props} />,
                                                                strong: ({ node, ...props }) => <strong className="font-bold text-white" {...props} />,
                                                                p: ({ node, ...props }) => <p className="mb-4 last:mb-0" {...props} />,
                                                                ul: ({ node, ...props }) => <ul className="list-disc ml-6 mb-4 space-y-2" {...props} />,
                                                                ol: ({ node, ...props }) => <ol className="list-decimal ml-6 mb-4 space-y-2" {...props} />,
                                                                li: ({ node, ...props }) => <li className="pl-1" {...props} />,
                                                            }}
                                                        >
                                                            {content}
                                                        </ReactMarkdown>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )
                            })}
                        </AnimatePresence>

                        {isLoading && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex gap-6 max-w-3xl mx-auto"
                            >
                                <div className="w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center border border-white/10 bg-zinc-900 shadow-inner overflow-hidden">
                                    <div className="w-full h-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-[10px] font-black text-white animate-pulse">R</div>
                                </div>
                                <div className="flex-1 pt-4">
                                    <div className="flex gap-1.5 mb-2">
                                        <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0 }} className="h-1.5 w-1.5 bg-zinc-500 rounded-full" />
                                        <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }} className="h-1.5 w-1.5 bg-zinc-500 rounded-full" />
                                        <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }} className="h-1.5 w-1.5 bg-zinc-500 rounded-full" />
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Bottom Backdrop Blur Zone */}
            <div
                className="fixed bottom-0 left-6/2  -translate-x-5/2 w-full max-w-2xl h-48 pointer-events-none z-40 backdrop-blur-xl bg-black/10"
                style={{
                    maskImage: 'linear-gradient(to top, black 70%, transparent)',
                    WebkitMaskImage: 'linear-gradient(to top, black 40%, transparent)'
                }}
            />

            {/* Input Container (Floating Pill) */}
            <div className="fixed bottom-10 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 z-50">
                <form
                    onSubmit={handleFormSubmit}
                    className="relative group bg-zinc-900/40 backdrop-blur-3xl border border-white/10 rounded-[28px] shadow-2xl overflow-hidden transition-all duration-500 hover:border-white/20 focus-within:border-indigo-500/50 focus-within:ring-1 focus-within:ring-indigo-500/20"
                >
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={currentCredits < 10 ? "Insufficient credits to chat..." : "Type anything..."}
                        disabled={isLoading || currentCredits < 10}
                        className="w-full bg-transparent px-6 py-5 pr-14 text-base text-zinc-100 placeholder:text-zinc-500 outline-none resize-none min-h-[60px] max-h-[200px] transition-all disabled:opacity-50 font-light"
                        rows={1}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault()
                                handleFormSubmit(e)
                            }
                        }}
                    />

                    <div className="absolute right-3 bottom-3">
                        <button
                            type="submit"
                            disabled={isLoading || !input.trim() || currentCredits < 10}
                            className="bg-zinc-100 text-black hover:bg-white disabled:bg-zinc-800 disabled:text-zinc-600 h-10 w-10 rounded-full flex items-center justify-center transition-all duration-300 active:scale-90"
                        >
                            {isLoading ? (
                                <UpdateIcon className="w-5 h-5 animate-spin" />
                            ) : (
                                <PaperPlaneIcon className="w-4 h-4" />
                            )}
                        </button>
                    </div>

                    {/* Gradient Border Trace */}
                    <div className="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
                </form>

                <div className="mt-3 flex justify-center gap-6">
                    <AnimatePresence>
                        {isSaving && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="flex items-center gap-2"
                            >
                                <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" />
                                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Archiving response</span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    {!isSaving && (
                        <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest opacity-50">
                            Rive may display inaccurate info, so double-check its responses.
                        </p>
                    )}
                </div>
            </div>

            {/* Error Overlay */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed top-24 left-1/2 -translate-x-1/2 max-w-md w-full p-4 bg-red-500/10 border border-red-500/20 backdrop-blur-xl z-[60] rounded-2xl flex items-center justify-between"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                            <span className="text-sm font-medium text-red-400">Connection error: Could not reach Hugging Face.</span>
                        </div>
                        <button onClick={() => window.location.reload()} className="text-[10px] font-bold uppercase tracking-widest text-white hover:text-red-400 transition-colors">
                            Retry
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    )
}
