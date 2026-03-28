'use client'

import React, { useState, useRef, useEffect } from 'react'
import { MessageSquare, X, Send, Sparkles, Bot, User, Loader2, MinusCircle, Maximize2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { askRuixen } from '@/app/actions/ruixen'

type Message = {
    role: 'user' | 'assistant'
    content: string
}

export default function RuixenAssistant() {
    const [isOpen, setIsOpen] = useState(false)
    const [isMinimized, setIsMinimized] = useState(false)
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: "Greetings! I am Ruixen AI, your creative co-pilot. How can I help you navigate the Rive AI ecosystem today?" }
    ])
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages, isOpen, isMinimized])

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

    if (!isOpen) {
        return (
            <button 
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 text-white shadow-2xl shadow-purple-500/20 flex items-center justify-center hover:scale-110 transition-all duration-300 z-[100] group"
            >
                <div className="absolute inset-0 rounded-full bg-white/20 animate-ping group-hover:animate-none opacity-40" />
                <Bot className="w-7 h-7 relative z-10" />
            </button>
        )
    }

    return (
        <div className={cn(
            "fixed bottom-6 right-6 w-[380px] bg-zinc-950 border border-white/10 rounded-3xl shadow-3xl z-[100] flex flex-col overflow-hidden transition-all duration-500 animate-in slide-in-from-bottom-5",
            isMinimized ? "h-[64px]" : "h-[600px] max-h-[85vh]"
        )}>
            {/* Header */}
            <div className="bg-gradient-to-r from-zinc-900 to-black p-4 flex items-center justify-between border-b border-white/5">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30 flex items-center justify-center relative">
                        <img src="/agent.webp" alt="Ruixen" className="w-full h-full object-cover rounded-2xl" />
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-black" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-white tracking-tight">Ruixen AI</h3>
                        <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">Active Sync</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => setIsMinimized(!isMinimized)} className="p-2 hover:bg-white/5 rounded-xl transition-colors text-zinc-500">
                        {isMinimized ? <Maximize2 className="w-4 h-4" /> : <MinusCircle className="w-4 h-4" />}
                    </button>
                    <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-red-500/20 hover:text-red-400 rounded-xl transition-all text-zinc-500">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {!isMinimized && (
                <>
                    {/* Chat Area */}
                    <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide bg-zinc-950/50">
                        {messages.map((m, i) => (
                            <div key={i} className={cn(
                                "flex w-full",
                                m.role === 'user' ? "justify-end" : "justify-start"
                            )}>
                                <div className={cn(
                                    "max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed",
                                    m.role === 'user' 
                                        ? "bg-purple-600 text-white rounded-br-none shadow-lg shadow-purple-600/10" 
                                        : "bg-zinc-900/80 text-zinc-200 border border-white/5 rounded-bl-none"
                                )}>
                                    {m.content}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-zinc-900/80 p-3 rounded-2xl rounded-bl-none border border-white/5 flex gap-1">
                                    <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                    <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                    <div className="w-1.5 h-1.5 bg-purple-300 rounded-full animate-bounce" />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-zinc-900/50 border-t border-white/5">
                        <div className="relative group">
                            <input 
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Quantum query here..."
                                className="w-full bg-black/40 border border-white/10 rounded-2xl py-3 pl-4 pr-12 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all backdrop-blur-md"
                            />
                            <button 
                                onClick={handleSend}
                                disabled={isLoading || !input.trim()}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:scale-100"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="mt-3 flex items-center justify-center gap-1.5">
                            <Sparkles className="w-3 h-3 text-purple-400" />
                            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-tighter">Powered by Ruixen Creative Brain</span>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
