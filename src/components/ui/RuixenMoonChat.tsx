"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { toast } from "sonner";
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
    History,
    Trash2,
    MessageSquare,
    X as CloseIcon,
    AlertTriangle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import GradualBlurMemo from "./GradualBlur";

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
    history?: any[];
    onDeleteConversation?: (id: string, e: React.MouseEvent) => void;
    onSelectConversation?: (id: string) => void;
    currentConversationId?: string;
}

// Helper to identify and render color previews in text
const renderContentWithColors = (content: any): any => {
    if (typeof content !== 'string') {
        if (Array.isArray(content)) {
            return content.map((c, i) => <React.Fragment key={i}>{renderContentWithColors(c)}</React.Fragment>);
        }
        return content;
    }

    const colorRegex = /(#(?:[0-9a-fA-F]{3}){1,2}\b|rgba?\(\d+,\s*\d+,\s*\d+(?:,\s*[0-9.]+)?\)|hsla?\(\d+,\s*\d+%,\s*\d+%(?:,\s*[0-9.]+)?\))/g;
    const parts = content.split(colorRegex);
    if (parts.length <= 1) return content;

    return parts.map((part, i) => {
        if (i % 2 === 1) { // It's a match
            return (
                <span key={i} className="inline-flex items-center gap-1.5 align-middle px-1.5 py-0.5 mx-0.5 rounded bg-white/5 border border-white/10 group/color cursor-default transition-colors hover:bg-white/10">
                    <span
                        className="w-3.5 h-3.5 rounded-sm border border-white/20 shadow-sm"
                        style={{ backgroundColor: part }}
                    />
                    <span className="font-mono text-[11px] text-zinc-300 select-all">{part}</span>
                </span>
            );
        }
        return part;
    });
};

export default function RuixenMoonChat({
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    credits,
    onQuickAction,
    onFileSelect,
    selectedFile,
    history = [],
    onDeleteConversation,
    onSelectConversation,
    currentConversationId
}: RuixenMoonChatProps) {
    const { textareaRef, adjustHeight } = useAutoResizeTextarea({
        minHeight: 48,
        maxHeight: 200,
    });

    const [isDragging, setIsDragging] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
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
        if (!m) return '';
        // Handle parts first (modern AI SDK)
        if (Array.isArray(m.parts)) {
            const textParts = m.parts.filter((p: any) => p.type === 'text');
            if (textParts.length > 0) return textParts.map((p: any) => p.text).join('');
        }
        // Fallback to content string or array
        if (typeof m.content === 'string') return m.content;
        if (Array.isArray(m.content)) {
            const textParts = m.content.filter((p: any) => p.type === 'text');
            if (textParts.length > 0) return textParts.map((p: any) => p.text).join('');
        }
        return m.text || ''; // Last resort
    }

    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Optimized scroll to bottom that doesn't feel laggy
    useEffect(() => {
        const scrollToBottom = () => {
            if (messagesEndRef.current) {
                messagesEndRef.current.scrollIntoView({ behavior: "auto" });
            }
        };

        // Only scroll if we are already at the bottom (or very near it)
        // This prevents the "jump" if the user is reading something earlier
        const container = messagesEndRef.current?.parentElement?.parentElement;
        if (container) {
            const isAtBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 150;
            if (isAtBottom || messages.length <= 1) {
                scrollToBottom();
            }
        } else {
            scrollToBottom();
        }
    }, [messages, isLoading]);

    return (
        <div
            className="relative w-full h-full overflow-hidden flex flex-row bg-black"
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

            {/* History Sidebar */}
            <AnimatePresence>
                {showHistory && (
                    <motion.div
                        initial={{ x: -300, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -300, opacity: 0 }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="w-72 h-full bg-zinc-950 border-r border-white/5 flex flex-col z-40"
                    >
                        <div className="p-6 border-b border-white/5 flex items-center justify-between">
                            <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-[0.2em]">History</h2>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setShowHistory(false)}
                                className="w-8 h-8 rounded-full text-zinc-500 hover:text-white hover:bg-white/5"
                            >
                                <CloseIcon className="w-4 h-4" />
                            </Button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-3 space-y-1 no-scrollbar">
                            <Button
                                variant="ghost"
                                onClick={() => onSelectConversation?.('new')}
                                className="w-full justify-start gap-3 h-11 px-4 rounded-xl text-zinc-400 font-medium hover:bg-white/5 hover:text-white group"
                            >
                                <PlusIcon className="w-4 h-4 text-indigo-500" />
                                <span className="text-sm">New Chat</span>
                            </Button>

                            <div className="pt-4 pb-2 px-3">
                                <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Recent Activity</span>
                            </div>

                            {history.length === 0 ? (
                                <div className="px-4 py-8 text-center">
                                    <p className="text-[11px] text-zinc-600 italic">No history yet</p>
                                </div>
                            ) : (
                                history.map((item) => (
                                    <div
                                        key={item.id}
                                        className={cn(
                                            "group relative flex items-center gap-3 w-full px-4 h-11 rounded-xl cursor-pointer transition-all border border-transparent",
                                            currentConversationId === item.id
                                                ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-400"
                                                : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
                                        )}
                                        onClick={() => onSelectConversation?.(item.id)}
                                    >
                                        <MessageSquare className={cn(
                                            "w-4 h-4 shrink-0 transition-colors",
                                            currentConversationId === item.id ? "text-indigo-500" : "text-zinc-600 group-hover:text-zinc-400"
                                        )} />
                                        <span className="text-xs font-medium truncate flex-1">
                                            {item.displayTitle}
                                        </span>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDeleteConversation?.(item.id, e);
                                            }}
                                            className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/20 hover:text-red-400 rounded-lg transition-all"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Chat Area */}
            <div className="relative flex-1 h-full flex flex-col items-center">
                {/* Elegant Dark Background Depth */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(17,24,39,1)_0%,rgba(0,0,0,1)_100%)] pointer-events-none -z-10" />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-10 pointer-events-none -z-10" />

                {/* Modern History Toggle Button */}
                {!showHistory && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowHistory(true)}
                        className="absolute top-6 left-6 z-30 w-10 h-10 rounded-2xl bg-zinc-900 shadow-xl border border-white/5 text-zinc-400 hover:text-white hover:border-white/10 transition-all active:scale-95 group"
                    >
                        <History className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                    </Button>
                )}

                {/* Messages Area - Absolute to cover full height and scroll */}
                <div style={{ backgroundColor: "#09090B" , }} className="absolute inset-0 overflow-y-auto px-4 pt-10 pb-64 no-scrollbar">
                    <div style={{ backgroundColor: "#09090B" , }} className="w-full max-w-3xl mx-auto flex flex-col items-center min-h-[calc(100vh-10rem)] justify-center">
                        {messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center text-center">
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.8 }}
                                >
                                    <h1 style={{ fontFamily: '"Noto Serif", serif', color: "#ddddddff" }} className="text-5xl font-black text-white drop-shadow-[0_0_25px_rgba(255,255,255,0.1)] mb-4 tracking-tighter font-noto">
                                        Bonsoir river ✧
                                    </h1>
                                    <p className="text-zinc-400 text-xl max-w-sm font-light leading-relaxed font-outfit">
                                        How can I help you elevate your creativity today?
                                    </p>
                                </motion.div>
                            </div>
                        ) : (
                            <div className="w-full space-y-10 mt-auto">
                                <AnimatePresence mode="popLayout">
                                    {(() => {
                                        // Deduplicate messages efficiently
                                        const uniqueMessages = messages.reduce((acc: any[], current: any) => {
                                            const x = acc.find(item => item.id === current.id);
                                            if (!x) return acc.concat([current]);
                                            return acc;
                                        }, []);

                                        return uniqueMessages.map((m, idx, arr) => {
                                            // Hide assistant message while it's still generating (loading)
                                            if (m.role === "assistant" && isLoading && idx === arr.length - 1) return null;

                                            return (
                                                <motion.div
                                                    key={m.id || `msg-${idx}`}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className={cn(
                                                        "flex w-full gap-5",
                                                        m.role === "user" ? "justify-end" : "flex-row text-left"
                                                    )}
                                                >
                                                    {m.role !== "user" && (
                                                        <div className={cn(
                                                            "w-9 h-9 rounded-full flex items-center justify-center text-[10px] shrink-0 shadow-lg transition-transform",
                                                            "bg-gradient-to-tr from-indigo-200 to-purple-900 font-black text-white"
                                                        )}>
                                                            R
                                                        </div>
                                                    )}

                                                    <div className={cn(
                                                        "flex-1 min-w-0 pt-1",
                                                        m.role === "user" ? "flex flex-col items-end" : "text-left"
                                                    )}>
                                                        {m.role !== "user" && (
                                                            <div className="text-[10px] font-bold uppercase tracking-widest mb-2 opacity-40 text-zinc-400">
                                                                Ruixen
                                                            </div>
                                                        )}

                                                        <div className={cn(
                                                            "text-lg leading-relaxed break-words font-outfit",
                                                            m.role === "user" 
                                                                ? "text-zinc-100 font-medium bg-[#262624] px-5 py-3 rounded-2xl w-fit max-w-[90%] border border-white/5 shadow-sm" 
                                                                : "text-zinc-300 font-light"
                                                        )}>
                                                            {(() => {
                                                                const rawContent = getMessageContent(m);
                                                                const fileMatch = rawContent.match(/\[\[CONTEXT_FILE:(.*?)\]\]/);
                                                                const fileName = fileMatch ? fileMatch[1] : null;

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
                                                                        {!cleanContent && m.role !== 'user' ? (
                                                                            <div className="flex flex-col gap-2">
                                                                                <span className="text-xs text-zinc-500 italic">Empty response content from provider...</span>
                                                                                {m.status && <span className="text-[10px] text-zinc-600 uppercase font-bold tracking-widest">Status: {m.status}</span>}
                                                                            </div>
                                                                        ) : (
                                                                            <ReactMarkdown
                                                                                components={{
                                                                                    p: ({ children }) => <p className="mb-5 last:mb-0 text-[17px] leading-[1.6]">{renderContentWithColors(children)}</p>,
                                                                                    h1: ({ children }) => <h1 style={{ fontFamily: '"Noto Serif", serif', color: "#ddddddff" }} className="text-4xl font-black text-white mb-6 mt-8 tracking-tight ">{children}</h1>,
                                                                                    h2: ({ children }) => <h2 className="text-3xl font-bold text-white mb-5 mt-7 tracking-tight ">{children}</h2>,
                                                                                    h3: ({ children }) => <h3 className="text-2xl font-semibold text-white mb-4 mt-6 tracking-tight ">{children}</h3>,
                                                                                    ul: ({ children }) => <ul className="list-disc ml-6 mb-5 space-y-3 text-[16px]">{children}</ul>,
                                                                                    ol: ({ children }) => <ol className="list-decimal ml-6 mb-5 space-y-3 text-[16px]">{children}</ol>,
                                                                                    li: ({ children }) => <li className="pl-2">{renderContentWithColors(children)}</li>,
                                                                                    blockquote: ({ children }) => {
                                                                                        const getRecursiveText = (node: any): string => {
                                                                                            if (typeof node === 'string') return node;
                                                                                            if (Array.isArray(node)) return node.map(getRecursiveText).join("");
                                                                                            if (node?.props?.children) return getRecursiveText(node.props.children);
                                                                                            return "";
                                                                                        };
                                                                                        const textContent = getRecursiveText(children);
                                                                                        const isWarning = textContent.includes("WARNING:");
                                                                                        if (isWarning) {
                                                                                            return (
                                                                                                <div className="my-8 relative overflow-hidden rounded-2xl border border-red-500/10 bg-red-500/[0.03] p-6 backdrop-blur-sm group transition-all hover:bg-red-500/[0.05]">
                                                                                                    <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-red-500/0 via-red-500/40 to-red-500/0" />
                                                                                                    <div className="flex items-start gap-5">
                                                                                                        <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.15)]">
                                                                                                            <AlertTriangle className="h-5 w-5" />
                                                                                                        </div>
                                                                                                        <div className="flex flex-col space-y-1">
                                                                                                            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-red-500/80">System Warning</span>
                                                                                                            <div className="text-[14px] leading-relaxed text-zinc-300 font-light prose-zinc prose-invert max-w-none">
                                                                                                                {children}
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                </div>
                                                                                            );
                                                                                        }
                                                                                        return (
                                                                                            <div className="border-l-4 border-indigo-500/30 bg-white/5 p-4 my-4 rounded-r-lg text-zinc-300 italic text-sm">
                                                                                                {children}
                                                                                            </div>
                                                                                        );
                                                                                    },
                                                                                    code: ({ inline, className, children, ...props }: any) => {
                                                                                        const text = String(children);
                                                                                        const match = /language-(\w+)/.exec(className || "");
                                                                                        const colorRegex = /^#(?:[0-9a-fA-F]{3}){1,2}$|^rgba?\(\d+,\s*\d+,\s*\d+(?:,\s*[0-9.]+)?\)$|^hsla?\(\d+,\s*\d+%,\s*\d+%(?:,\s*[0-9.]+)?\)$/;

                                                                                        if (inline && colorRegex.test(text.trim())) {
                                                                                            return renderContentWithColors(text.trim());
                                                                                        }

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
                                                                                                {renderContentWithColors(children)}
                                                                                            </code>
                                                                                        );
                                                                                    }
                                                                                }}
                                                                            >
                                                                                {cleanContent}
                                                                            </ReactMarkdown>
                                                                        )}
                                                                    </>
                                                                );
                                                            })()}
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            );
                                        });
                                    })()}
                                </AnimatePresence>
                                {isLoading && (
                                    <div className="flex w-full gap-5 justify-start animate-in fade-in slide-in-from-left-2 duration-300">
                                        <div className="w-9 h-9 flex items-center justify-center shrink-0 mt-1">
                                            <RuixenLoader isMini />
                                        </div>
                                        <div className="flex-1 pt-1">
                                            <div className="text-[10px] font-bold uppercase tracking-widest mb-2 opacity-40 text-zinc-400">
                                                Ruixen
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-[11px] text-zinc-500 font-bold uppercase tracking-[0.2em] animate-pulse">Is Thinking...</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>
                        )}
                    </div>
                </div>

                {/* Fixed Input Bottom Section - Layered on top */}
                <div className="absolute bottom-0 inset-x-0 w-full flex flex-col items-center pointer-events-none ">
                    {/* Visual fade-out effect for messages scrolling behind */}
                    <div className="w-full h-32 bg-gradient-to-t from-[#09090B] via-[#09090B]/80 to-transparent" />

                    <div style={{ backgroundColor: "#09090B" , }} className="w-full max-w-3xl px-4 pb-10 bg-black pointer-events-auto">
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
                                    "w-full resize-none border-none font-outfit",
                                    "bg-transparent text-zinc-100 text-[17px]",
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

const RUIXEN_LOADER_STYLES = `
    .loader-wrapper {
      --fill-color: #6366f1;
      --shine-color: rgba(99, 102, 241, 0.4);
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      filter: drop-shadow(0 0 10px var(--shine-color));
    }

    .loader-wrapper #pegtopone {
      position: absolute;
      animation: flowe-one 1s linear infinite;
    }

    .loader-wrapper #pegtoptwo {
      position: absolute;
      opacity: 0;
      transform: scale(0) translateY(-200px) translateX(-100px);
      animation: flowe-two 1s linear infinite;
      animation-delay: 0.3s;
    }

    .loader-wrapper #pegtopthree {
      position: absolute;
      opacity: 0;
      transform: scale(0) translateY(-200px) translateX(100px);
      animation: flowe-three 1s linear infinite;
      animation-delay: 0.6s;
    }

    .loader-wrapper svg g path:first-child {
      fill: var(--fill-color);
    }

    @keyframes flowe-one {
      0% { transform: scale(0.5) translateY(-50px); opacity: 0; }
      25% { transform: scale(0.75) translateY(-25px); opacity: 1; }
      50% { transform: scale(1) translateY(0px); opacity: 1; }
      75% { transform: scale(0.5) translateY(15px); opacity: 1; }
      100% { transform: scale(0) translateY(30px); opacity: 0; }
    }

    @keyframes flowe-two {
      0% { transform: scale(0.5) rotateZ(-10deg) translateY(-50px) translateX(-40px); opacity: 0; }
      25% { transform: scale(1) rotateZ(-5deg) translateY(-25px) translateX(-20px); opacity: 1; }
      50% { transform: scale(1) rotateZ(0deg) translateY(0px) translateX(-10px); opacity: 1; }
      75% { transform: scale(0.5) rotateZ(5deg) translateY(15px) translateX(0px); opacity: 1; }
      100% { transform: scale(0) rotateZ(10deg) translateY(30px) translateX(10px); opacity: 0; }
    }

    @keyframes flowe-three {
      0% { transform: scale(0.5) rotateZ(10deg) translateY(-50px) translateX(40px); opacity: 0; }
      25% { transform: scale(1) rotateZ(5deg) translateY(-25px) translateX(20px); opacity: 1; }
      50% { transform: scale(1) rotateZ(0deg) translateY(0px) translateX(10px); opacity: 1; }
      75% { transform: scale(0.5) rotateZ(-5deg) translateY(15px) translateX(0px); opacity: 1; }
      100% { transform: scale(0) rotateZ(-10deg) translateY(40px) translateX(-10px); opacity: 0; }
    }
`;

const RuixenLoader = React.memo(({ isMini }: { isMini?: boolean }) => {
    return (
        <div className="ruixen-custom-loader-container">
            <style dangerouslySetInnerHTML={{ __html: RUIXEN_LOADER_STYLES }} />
            <div className="loader-wrapper" style={{
                transform: `scale(${isMini ? '0.35' : '0.6'})`,
                width: isMini ? '40px' : '100px',
                height: isMini ? '40px' : '60px',
            }}>
                <svg id="pegtopone" viewBox="0 0 100 100">
                    <defs>
                        <filter id="shine-1"><feGaussianBlur stdDeviation="3" /></filter>
                        <mask id="mask-1"><path d="M63,37c-6.7-4-4-27-13-27s-6.3,23-13,27-27,4-27,13,20.3,9,27,13,4,27,13,27,6.3-23,13-27,27-4,27-13-20.3-9-27-13Z" fill="white" /></mask>
                        <radialGradient id="grad-1-1" cx="50" cy="66" r="30" gradientTransform="translate(0 35) scale(1 0.5)" gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor="black" stopOpacity="0.3" /><stop offset="100%" stopColor="black" stopOpacity="0" /></radialGradient>
                    </defs>
                    <g>
                        <path d="M63,37c-6.7-4-4-27-13-27s-6.3,23-13,27-27,4-27,13,20.3,9,27,13,4,27,13,27,6.3-23,13-27,27-4,27-13-20.3-9-27-13Z" fill="currentColor" />
                        <path d="M63,37c-6.7-4-4-27-13-27s-6.3,23-13,27-27,4-27,13,20.3,9,27,13,4,27,13,27,6.3-23,13-27,27-4,27-13-20.3-9-27-13Z" fill="url(#grad-1-1)" />
                    </g>
                </svg>
                <svg id="pegtoptwo" viewBox="0 0 100 100">
                    <g>
                        <path d="M63,37c-6.7-4-4-27-13-27s-6.3,23-13,27-27,4-27,13,20.3,9,27,13,4,27,13,27,6.3-23,13-27,27-4,27-13-20.3-9-27-13Z" fill="currentColor" />
                        <path d="M63,37c-6.7-4-4-27-13-27s-6.3,23-13,27-27,4-27,13,20.3,9,27,13,4,27,13,27,6.3-23,13-27,27-4,27-13-20.3-9-27-13Z" fill="url(#grad-1-1)" />
                    </g>
                </svg>
                <svg id="pegtopthree" viewBox="0 0 100 100">
                    <g>
                        <path d="M63,37c-6.7-4-4-27-13-27s-6.3,23-13,27-27,4-27,13,20.3,9,27,13,4,27,13,27,6.3-23,13-27,27-4,27-13-20.3-9-27-13Z" fill="currentColor" />
                        <path d="M63,37c-6.7-4-4-27-13-27s-6.3,23-13,27-27,4-27,13,20.3,9,27,13,4,27,13,27,6.3-23,13-27,27-4,27-13-20.3-9-27-13Z" fill="url(#grad-1-1)" />
                    </g>
                </svg>
            </div>
        </div>
    );
});
