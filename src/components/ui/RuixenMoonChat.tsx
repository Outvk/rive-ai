"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
    ImageIcon,
    FileUp,
    MonitorIcon,
    CircleUserRound,
    ArrowUpIcon,
    Paperclip,
    Plus as PlusIcon,
    Code2,
    Palette,
    Layers,
    Rocket,
    Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";

interface AutoResizeProps {
    minHeight: number;
    maxHeight?: number;
}

function useAutoResizeTextarea({ minHeight, maxHeight }: AutoResizeProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const adjustHeight = useCallback(
        (reset?: boolean) => {
            const textarea = textareaRef.current;
            if (!textarea) return;

            if (reset) {
                textarea.style.height = `${minHeight}px`;
                return;
            }

            textarea.style.height = `${minHeight}px`; // reset first
            const newHeight = Math.max(
                minHeight,
                Math.min(textarea.scrollHeight, maxHeight ?? Infinity)
            );
            textarea.style.height = `${newHeight}px`;
        },
        [minHeight, maxHeight]
    );

    useEffect(() => {
        if (textareaRef.current) textareaRef.current.style.height = `${minHeight}px`;
    }, [minHeight]);

    return { textareaRef, adjustHeight };
}

interface RuixenMoonChatProps {
    messages: any[];
    input: string;
    handleInputChange: (e: any) => void;
    handleSubmit: (e: any) => void;
    isLoading: boolean;
    credits: number;
    onQuickAction?: (label: string) => void;
    onFileSelect?: (file: File | null) => void;
    selectedFile?: File | null;
}

export default function RuixenMoonChat({
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    credits,
    onQuickAction,
    onFileSelect,
    selectedFile
}: RuixenMoonChatProps) {
    const { textareaRef, adjustHeight } = useAutoResizeTextarea({
        minHeight: 48,
        maxHeight: 200,
    });

    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFile(file);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleFile = (file: File) => {
        if (file.type === "application/pdf") {
            onFileSelect?.(file);
        } else {
            toast.error("Only PDF files are supported for now.");
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const file = e.dataTransfer.files?.[0];
        if (file) handleFile(file);
    };

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

    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Original onKeyDown logic moved to Textarea prop
    // const onKeyDown = (e: React.KeyboardEvent) => {
    //     if (e.key === "Enter" && !e.shiftKey) {
    //         e.preventDefault();
    //         handleSubmit(e);
    //         adjustHeight(true);
    //     }
    // };

    return (
        <div
            className="relative w-full h-full overflow-hidden flex flex-col items-center bg-black"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            {/* Drag Overlay */}
            <AnimatePresence>
                {isDragging && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-50 bg-indigo-600/10 backdrop-blur-sm flex items-center justify-center p-8"
                    >
                        <div className="w-full h-full border-4 border-dashed border-indigo-500/50 rounded-3xl flex flex-col items-center justify-center gap-4 bg-indigo-500/5">
                            <div className="w-20 h-20 rounded-full bg-indigo-500/20 flex items-center justify-center shadow-[0_0_50px_rgba(99,102,241,0.2)]">
                                <FileUp className="w-10 h-10 text-indigo-400 animate-bounce" />
                            </div>
                            <div className="text-center">
                                <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">Drop PDF to Analyze</h3>
                                <p className="text-indigo-300/60 text-sm font-medium uppercase tracking-widest">Ruixen Intelligence is ready</p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Elegant Dark Background Depth */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(17,24,39,1)_0%,rgba(0,0,0,1)_100%)] pointer-events-none -z-10" />
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-10 pointer-events-none -z-10" />

            {/* Messages Area - Absolute to cover full height and scroll */}
            <div className="absolute inset-0 overflow-y-auto px-4 pt-10 pb-64 no-scrollbar scroll-smooth">
                <div className="w-full max-w-3xl mx-auto flex flex-col items-center min-h-[calc(100vh-10rem)] justify-center">
                    {messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center text-center">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.8 }}
                            >
                                <h1 className="text-6xl font-black text-white drop-shadow-[0_0_25px_rgba(255,255,255,0.1)] mb-6 tracking-tighter">
                                    Ruixen AI
                                </h1>
                                <p className="text-zinc-400 text-lg max-w-sm font-light leading-relaxed">
                                    How can I help you elevate your creativity today?
                                </p>
                            </motion.div>
                        </div>
                    ) : (
                        <div className="w-full space-y-10 mt-auto">
                            <AnimatePresence mode="popLayout">
                                {messages.map((m) => (
                                    <motion.div
                                        key={m.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={cn(
                                            "flex w-full gap-5",
                                            m.role === "user" ? "flex-row-reverse" : "flex-row text-left"
                                        )}
                                    >
                                        <div className={cn(
                                            "w-9 h-9 rounded-full flex items-center justify-center text-[10px] shrink-0 shadow-lg transition-transform",
                                            m.role === "user"
                                                ? "bg-indigo-600 font-bold text-white uppercase"
                                                : "bg-gradient-to-tr from-indigo-500 to-purple-600 font-black text-white"
                                        )}>
                                            {m.role === "user" ? "U" : "R"}
                                        </div>

                                        <div className={cn(
                                            "flex-1 min-w-0 pt-1",
                                            m.role === "user" ? "text-right" : "text-left"
                                        )}>
                                            <div className={cn(
                                                "text-[10px] font-bold uppercase tracking-widest mb-2 opacity-40",
                                                m.role === "user" ? "text-indigo-400" : "text-zinc-400"
                                            )}>
                                                {m.role === "user" ? "You" : "Ruixen"}
                                            </div>

                                            <div className={cn(
                                                "text-base leading-relaxed break-words",
                                                m.role === "user" ? "text-zinc-100 font-medium" : "text-zinc-200 font-light"
                                            )}>
                                                {(() => {
                                                    const rawContent = getMessageContent(m);
                                                    const fileMatch = rawContent.match(/\[\[CONTEXT_FILE:(.*?)\]\]/);
                                                    const fileName = fileMatch ? fileMatch[1] : null;

                                                    // Remove the metadata and the bulk context from rendering
                                                    const cleanContent = rawContent
                                                        .replace(/\[\[CONTEXT_FILE:.*?\]\]/, "")
                                                        .replace(/\[DOCUMENT_CONTEXT_START\][\s\S]*?\[DOCUMENT_CONTEXT_END\]/, "")
                                                        .trim();

                                                    return (
                                                        <>
                                                            {fileName && (
                                                                <div className={cn(
                                                                    "mb-4 p-3 bg-white/5 border border-white/10 rounded-xl flex items-center gap-3 w-fit hover:bg-white/10 transition-colors group/card cursor-default",
                                                                    m.role === "user" ? "ml-auto" : ""
                                                                )}>
                                                                    <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                                                                        <Paperclip className="w-4 h-4" />
                                                                    </div>
                                                                    <div className={cn(
                                                                        "flex flex-col",
                                                                        m.role === "user" ? "items-end" : "items-start"
                                                                    )}>
                                                                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest leading-none mb-1">Attached Context</span>
                                                                        <span className="text-xs font-semibold text-zinc-200 truncate max-w-[180px]">{fileName}</span>
                                                                    </div>
                                                                </div>
                                                            )}
                                                            <ReactMarkdown
                                                                components={{
                                                                    p: ({ children }) => <p className="mb-4 last:mb-0">{children}</p>,
                                                                    h1: ({ children }) => <h1 className="text-2xl font-bold text-white mb-4">{children}</h1>,
                                                                    h2: ({ children }) => <h2 className="text-xl font-bold text-white mb-3">{children}</h2>,
                                                                    h3: ({ children }) => <h3 className="text-lg font-bold text-white mb-2">{children}</h3>,
                                                                    ul: ({ children }) => <ul className="list-disc ml-6 mb-4 space-y-2">{children}</ul>,
                                                                    ol: ({ children }) => <ol className="list-decimal ml-6 mb-4 space-y-2">{children}</ol>,
                                                                    li: ({ children }) => <li className="pl-1">{children}</li>,
                                                                    code: ({ inline, className, children, ...props }: any) => {
                                                                        const match = /language-(\w+)/.exec(className || "");
                                                                        return !inline && match ? (
                                                                            <div className="relative group/code my-6 rounded-xl overflow-hidden border border-white/10 bg-zinc-950/80 shadow-2xl">
                                                                                <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/5">
                                                                                    <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">{match[1]}</span>
                                                                                    <Button
                                                                                        variant="ghost"
                                                                                        size="sm"
                                                                                        className="h-6 px-2 text-[10px] text-zinc-400 hover:text-white"
                                                                                        onClick={() => navigator.clipboard.writeText(String(children))}
                                                                                    >
                                                                                        Copy Code
                                                                                    </Button>
                                                                                </div>
                                                                                <pre className="p-5 overflow-x-auto no-scrollbar font-mono text-sm leading-relaxed text-indigo-100">
                                                                                    {children}
                                                                                </pre>
                                                                            </div>
                                                                        ) : (
                                                                            <code className="bg-white/10 px-1.5 py-0.5 rounded text-indigo-300 font-mono text-[13px]" {...props}>
                                                                                {children}
                                                                            </code>
                                                                        );
                                                                    }
                                                                }}
                                                            >
                                                                {cleanContent}
                                                            </ReactMarkdown>
                                                        </>
                                                    );
                                                })()}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                            {isLoading && (
                                <div className="flex w-full gap-4 justify-start">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-[10px] font-black text-white shrink-0 animate-pulse">R</div>
                                    <div className="bg-black/40 border border-white/10 backdrop-blur-md px-4 py-3 rounded-2xl flex items-center gap-2">
                                        <Loader2 className="w-3 h-3 animate-spin text-zinc-400" />
                                        <span className="text-xs text-zinc-400 font-medium">Ruixen is thinking...</span>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    )}
                </div>
            </div>

            {/* Fixed Input Bottom Section - Layered on top */}
            <div className="absolute bottom-0 inset-x-0 w-full flex flex-col items-center pointer-events-none">
                {/* Visual fade-out effect for messages scrolling behind */}
                <div className="w-full h-32 bg-gradient-to-t from-black via-black/80 to-transparent" />

                <div className="w-full max-w-3xl px-4 pb-10 bg-black pointer-events-auto">
                    {/* File Badge */}
                    {selectedFile && (
                        <motion.div
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-2 mb-3 px-3 py-1.5 bg-indigo-500/20 border border-indigo-500/30 rounded-lg w-fit group"
                        >
                            <Paperclip className="w-3 h-3 text-indigo-400" />
                            <span className="text-xs text-indigo-100 font-medium truncate max-w-[200px]">{selectedFile.name}</span>
                            <button
                                onClick={() => onFileSelect?.(null)}
                                className="ml-2 bg-indigo-500/20 hover:bg-indigo-500/40 rounded-full p-0.5 transition-colors"
                            >
                                <PlusIcon className="w-3 h-3 text-indigo-300 rotate-45" />
                            </button>
                        </motion.div>
                    )}

                    <div className="relative bg-zinc-900/50 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.3)] group focus-within:border-indigo-500/50 transition-all duration-300">
                        <Textarea
                            ref={textareaRef}
                            value={input}
                            onChange={(e) => {
                                handleInputChange(e);
                                adjustHeight();
                            }}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSubmit(e);
                                }
                            }}
                            placeholder="Type a message or ask about your PDF..."
                            className={cn(
                                "w-full resize-none border-none",
                                "bg-transparent text-zinc-100 text-base",
                                "focus-visible:ring-0 focus-visible:ring-offset-0 focus:ring-0",
                                "placeholder:text-zinc-500 min-h-[48px]",
                                "py-4 px-6 overflow-hidden"
                            )}
                            style={{ overflow: "hidden" }}
                        />

                        {/* Hidden File Input */}
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="application/pdf"
                            className="hidden"
                        />

                        {/* Footer Buttons */}
                        <div className="flex items-center justify-between px-4 py-2 border-t border-white/5">
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-7 h-7 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                                >
                                    <Paperclip className="w-3.5 h-3.5" />
                                </Button>
                                <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
                                    Add context
                                </span>
                            </div>

                            <div className="flex items-center gap-2">
                                <Button
                                    onClick={handleSubmit}
                                    disabled={isLoading || !input.trim() || credits < 10}
                                    className={cn(
                                        "flex items-center gap-2 h-9 px-4 rounded-xl transition-all active:scale-95",
                                        isLoading || !input.trim() || credits < 10
                                            ? "bg-zinc-800 text-zinc-500"
                                            : "bg-white text-black hover:bg-zinc-200 shadow-lg shadow-white/5"
                                    )}
                                >
                                    {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ArrowUpIcon className="w-3.5 h-3.5" />}
                                    <span className="text-xs font-bold uppercase tracking-wide">Send</span>
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions - Only show when no messages */}
                    {messages.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="flex items-center justify-center flex-wrap gap-2 mt-6"
                        >
                            <QuickAction
                                icon={<Code2 className="w-3.5 h-3.5" />}
                                label="Generate Code"
                                onClick={() => onQuickAction?.("Generate Code")}
                            />
                            <QuickAction
                                icon={<Rocket className="w-3.5 h-3.5" />}
                                label="Launch App"
                                onClick={() => onQuickAction?.("Launch App")}
                            />
                            <QuickAction
                                icon={<Layers className="w-3.5 h-3.5" />}
                                label="UI Components"
                                onClick={() => onQuickAction?.("UI Components")}
                            />
                            <QuickAction
                                icon={<Palette className="w-3.5 h-3.5" />}
                                label="Theme Ideas"
                                onClick={() => onQuickAction?.("Theme Ideas")}
                            />
                            <QuickAction
                                icon={<CircleUserRound className="w-3.5 h-3.5" />}
                                label="Marketing"
                                onClick={() => onQuickAction?.("Marketing")}
                            />
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
}

interface QuickActionProps {
    icon: React.ReactNode;
    label: string;
    onClick?: () => void;
}

function QuickAction({ icon, label, onClick }: QuickActionProps) {
    return (
        <Button
            variant="outline"
            onClick={onClick}
            className="flex items-center gap-2 rounded-full border-white/5 bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 hover:border-white/20 h-8 px-4 transition-all"
        >
            {icon}
            <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
        </Button>
    );
}
