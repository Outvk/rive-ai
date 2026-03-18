'use client'

import { useChat, type UIMessage } from '@ai-sdk/react'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PaperPlaneIcon, UpdateIcon, CopyIcon, CheckIcon, MagicWandIcon } from '@radix-ui/react-icons'
import { saveGeneration, saveConversation, deleteConversation } from '@/app/dashboard/text/actions'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'

import { useSidebar } from './SidebarContext'
import RuixenMoonChat from './ui/RuixenMoonChat'
import { createClient } from '@/utils/supabase/client'


export function TextGeneratorForm({
    initialCredits = 0,
    userName = 'User',
    conversationId: propConversationId,
    initialChatMessages = [],
}: {
    initialCredits?: number
    userName?: string
    conversationId?: string
    initialChatMessages?: UIMessage[]
}) {
    const router = useRouter()
    const { sidebarVersion } = useSidebar()
    const [currentCredits, setCurrentCredits] = useState(initialCredits)
    const [isSaving, setIsSaving] = useState(false)
    const [copiedId, setCopiedId] = useState<string | null>(null)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const [input, setInput] = useState('')
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [convId] = useState<string>(() => propConversationId ?? crypto.randomUUID())
    const [history, setHistory] = useState<any[]>([])

    const fetchHistory = async () => {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data, error } = await supabase
            .from('chat_conversations')
            .select('id, title, updated_at')
            .eq('user_id', user.id)
            .order('updated_at', { ascending: false })
            .limit(50)

        if (!error && data) {
            // Format titles to 3 words max
            const formatted = data.map(c => ({
                ...c,
                displayTitle: c.title.split(' ').slice(0, 3).join(' ') + (c.title.split(' ').length > 3 ? '...' : '')
            }))
            setHistory(formatted)
        }
    }

    useEffect(() => {
        fetchHistory()
        
        // Auto-fill prompt if user was redirected from the landing page
        const pendingPrompt = localStorage.getItem("pendingPrompt");
        if (pendingPrompt) {
            setInput(pendingPrompt);
            localStorage.removeItem("pendingPrompt");
        }
    }, [])

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

    const { messages, setMessages, sendMessage: chatAppend, status, error } = useChat<UIMessage>({
        id: convId,
        initialMessages: initialChatMessages,
        api: '/api/chat',
        onError: (err: Error) => {
            if (err.message.includes('402')) {
                toast.error('Insufficient credits to generate text.')
            } else {
                toast.error('Failed to generate text.')
            }
        },
        onFinish: async (event: any) => {
            const isNew = !propConversationId;
            // In newer AI SDK versions, event might be { message, messages, ... }
            const finalMessage = event.message || event;
            const messageContent = getMessageContent(finalMessage) ||
                (event.messages && event.messages.length > 0 ? getMessageContent(event.messages[event.messages.length - 1]) : '');



            setCurrentCredits(prev => Math.max(0, prev - 10))

            // Deduplicate: filter out the final message if it's already in the messages array
            const baseHistory = (messages || []).filter(m => m.id !== finalMessage.id);
            const updatedHistory = [...baseHistory, {
                role: 'assistant' as const,
                content: messageContent,
                id: finalMessage.id || Date.now().toString()
            }]

            const userMessages = messages.filter((m: any) => m.role === 'user');
            const promptMsg = userMessages[userMessages.length - 1];

            if (promptMsg) {
                setIsSaving(true)
                const promptContent = getMessageContent(promptMsg)
                if (messageContent) {
                    await saveGeneration(promptContent, messageContent, 'text')
                }
                const title = promptContent.substring(0, 40) || 'New Conversation'
                await saveConversation(convId, title, updatedHistory)
                setIsSaving(false)
            }
            if (isNew) {
                // Update URL without full refresh to preserve state if possible
                window.history.replaceState(null, '', `/dashboard/text?cid=${convId}`);
            }

            // Small delay to ensure DB consistency before server refresh
            setTimeout(() => {
                router.refresh()
                fetchHistory()
            }, 800)
        },
    } as any)

    const isLoading = status === 'submitted' || status === 'streaming'

    useEffect(() => {
        if (initialChatMessages.length > 0) {
            setMessages(initialChatMessages)
        }
    }, [initialChatMessages])

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

    const extractTextFromPDF = async (file: File): Promise<string> => {
        try {
            // Dynamic import to avoid SSR issues with DOMMatrix/Canvas
            const pdfjs = await import('pdfjs-dist');
            pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

            const arrayBuffer = await file.arrayBuffer()
            const loadingTask = pdfjs.getDocument({ data: arrayBuffer })
            const pdf = await loadingTask.promise
            let fullText = ""

            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i)
                const textContent = await page.getTextContent()
                const pageText = textContent.items
                    .map((item: any) => (item as any).str)
                    .join(" ")
                fullText += pageText + "\n"
            }

            return fullText
        } catch (error) {
            console.error("PDF extraction error:", error)
            throw new Error("Failed to extract text from PDF")
        }
    }

    const handleSendWithContext = async (options: { text: string }) => {
        let finalPrompt = options.text

        if (selectedFile) {
            toast.loading("Analyzing PDF context...", { id: "pdf-loading" })
            try {
                const pdfText = await extractTextFromPDF(selectedFile)
                finalPrompt = `[[CONTEXT_FILE:${selectedFile.name}]]\n[DOCUMENT_CONTEXT_START]\n${pdfText}\n[DOCUMENT_CONTEXT_END]\n\n${options.text}`
                toast.success("PDF analysis complete", { id: "pdf-loading" })
            } catch (err) {
                toast.error("Failed to read PDF. Sending message without PDF context.", { id: "pdf-loading" })
            }
        }

        // Use the chat SDK to send the message
        chatAppend({
            role: 'user',
            content: finalPrompt,
        } as any)

        setInput('')
        setSelectedFile(null)
    }

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!input.trim() || isLoading) return

        if (currentCredits < 10) {
            toast.error('Insufficient credits. Each message costs 10 credits.')
            return
        }

        await handleSendWithContext({ text: input })
    }

    const handleQuickAction = async (label: string) => {
        if (currentCredits < 10) {
            toast.error('Insufficient credits. Each message costs 10 credits.')
            return
        }

        let prompt = ""
        switch (label) {
            case "Generate Code": prompt = "Help me generate some high-quality code for my project."; break;
            case "Launch App": prompt = "Guide me through the steps to launch my application."; break;
            case "UI Components": prompt = "Suggest some modern UI components for a premium web app."; break;
            case "Theme Ideas": prompt = "Give me some creative theme and color palette ideas."; break;
            case "Marketing": prompt = "Help me write some compelling marketing copy for my product."; break;
            default: prompt = label;
        }

        if (prompt && !isLoading) {
            await handleSendWithContext({ text: prompt })
        }
    }

    const handleDeleteConversation = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation()
        const res = await deleteConversation(id)
        if (res.success) {
            toast.success('Conversation deleted')
            setHistory(prev => prev.filter(c => c.id !== id))
            if (convId === id) {
                router.push('/dashboard/text')
            }
        } else {
            toast.error('Failed to delete conversation')
        }
    }

    const handleSelectConversation = (id: string) => {
        router.push(`/dashboard/text?cid=${id}`)
    }

    // Conditionally render the new design for V2
    if (sidebarVersion === 'v2') {
        return (
            <RuixenMoonChat
                messages={messages}
                input={input}
                userName={userName}
                handleInputChange={(e) => setInput(e.target.value)}
                handleSubmit={handleFormSubmit}
                isLoading={isLoading}
                credits={currentCredits}
                onQuickAction={handleQuickAction}
                onFileSelect={setSelectedFile}
                selectedFile={selectedFile}
                history={history}
                onDeleteConversation={handleDeleteConversation}
                onSelectConversation={handleSelectConversation}
                currentConversationId={convId}
            />
        )
    }

    // Legacy design for V1
    return (
        <div className="flex flex-col min-h-[80vh] w-full max-w-4xl mx-auto relative px-4 sm:px-6">
            {/* Ambient Background */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-purple-500/10 rounded-full blur-[120px] animate-pulse delay-1000" />
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto pt-10 pb-52 space-y-12 no-scrollbar">
                {messages.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="h-full flex flex-col items-start justify-start pt-20"
                    >
                        <div className="relative group mb-4">
                            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
                            <div className="relative p-3 bg-black rounded-full flex items-center justify-center border border-white/5">
                                <MagicWandIcon className="w-6 h-6 text-white animate-pulse" />
                            </div>
                        </div>
                        <h1 className="text-4xl sm:text-5xl font-black text-white mb-4 tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60 font-outfit">
                            How can I help you today?
                        </h1>
                        <p className="text-zinc-400 text-base max-w-md font-light leading-relaxed mb-8 font-outfit">
                            Transform your ideas into reality with Llama 3.2. Generate marketing copy, blog posts, or creative content in seconds.
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-md">
                            <button onClick={() => setInput("Write a professional blog post about AI trends in 2024.")} className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-left group">
                                <p className="text-sm font-bold text-zinc-300 group-hover:text-white transition-colors font-outfit">Write a blog post</p>
                                <p className="text-xs text-zinc-500 font-medium font-outfit">About AI trends in 2024</p>
                            </button>
                            <button onClick={() => setInput("Create 5 catchy headlines for a new fitness app.")} className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-left group">
                                <p className="text-sm font-bold text-zinc-300 group-hover:text-white transition-colors font-outfit">Generate headlines</p>
                                <p className="text-xs text-zinc-500 font-medium font-outfit">For a fitness application</p>
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
                                        <div className="flex gap-6 max-w-4xl mr-auto ml-0">
                                            <div className="w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center overflow-hidden border border-white/10 bg-zinc-900 shadow-inner">
                                                {m.role === 'user' ? (
                                                    <div className="w-full h-full bg-indigo-600 flex items-center justify-center text-xs font-bold text-white uppercase">U</div>
                                                ) : (
                                                    <div className="w-full h-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-[10px] font-black text-white">R</div>
                                                )}
                                            </div>
                                            <div className="flex-1 pt-1.5 text-left">
                                                <div className="flex items-center mb-1 justify-between">
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
                                                <div className={`max-w-xl leading-relaxed whitespace-pre-wrap markdown-content font-outfit ${m.role === 'user'
                                                    ? 'text-[17px] text-zinc-100 font-medium'
                                                    : 'text-lg text-zinc-300 font-light'
                                                    }`}>
                                                    {m.role === 'user' ? (
                                                        content
                                                    ) : (
                                                        <ReactMarkdown
                                                            components={{
                                                                h3: ({ node, ...props }: any) => <h3 className="text-2xl font-black text-white mt-8 mb-4 font-outfit" {...props} />,
                                                                strong: ({ node, ...props }: any) => <strong className="font-bold text-white font-outfit" {...props} />,
                                                                p: ({ node, ...props }: any) => <p className="mb-5 last:mb-0 text-[17px] leading-[1.6]" {...props} />,
                                                                ul: ({ node, ...props }: any) => <ul className="list-disc ml-6 mb-5 space-y-3" {...props} />,
                                                                ol: ({ node, ...props }: any) => <ol className="list-decimal ml-6 mb-5 space-y-3" {...props} />,
                                                                li: ({ node, ...props }: any) => <li className="pl-2 font-outfit" {...props} />,
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
                                className="flex gap-6 max-w-3xl mr-auto ml-0"
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

            {/* Bottom Blur */}
            <div
                className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-48 pointer-events-none z-40 backdrop-blur-xl bg-black/10"
                style={{
                    maskImage: 'linear-gradient(to top, black 70%, transparent)',
                    WebkitMaskImage: 'linear-gradient(to top, black 40%, transparent)'
                }}
            />

            {/* Input Form for V1 */}
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
                        className="w-full bg-transparent px-6 py-5 pr-14 text-lg text-zinc-100 placeholder:text-zinc-500 outline-none resize-none min-h-[60px] max-h-[200px] transition-all disabled:opacity-50 font-light font-outfit"
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
                            {isLoading ? <UpdateIcon className="w-5 h-5 animate-spin" /> : <PaperPlaneIcon className="w-4 h-4" />}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
