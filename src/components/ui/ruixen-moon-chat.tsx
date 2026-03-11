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
    PlusIcon,
    Code2,
    Palette,
    Layers,
    Rocket,
} from "lucide-react";

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

export default function RuixenMoonChat() {
    const [message, setMessage] = useState("");
    const { textareaRef, adjustHeight } = useAutoResizeTextarea({
        minHeight: 48,
        maxHeight: 150,
    });

    return (
        <div className="w-full max-w-2xl">
            {/* Input Box Section */}
            <div className="relative bg-black/60 backdrop-blur-md rounded-xl border border-neutral-700 overflow-hidden">
                <Textarea
                    ref={textareaRef}
                    value={message}
                    onChange={(e) => {
                        setMessage(e.target.value);
                        adjustHeight();
                    }}
                    placeholder="Type your request..."
                    className={cn(
                        "w-full px-4 py-3 resize-none border-none",
                        "bg-transparent text-white text-sm",
                        "focus-visible:ring-0 focus-visible:ring-offset-0",
                        "placeholder:text-neutral-400 min-h-[48px]"
                    )}
                    style={{ overflow: "hidden" }}
                />

                {/* Footer Buttons */}
                <div className="flex items-center justify-between p-3 border-t border-white/5 ">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-white hover:bg-neutral-700"
                    >
                        <Paperclip className="w-4 h-4" />
                    </Button>

                    <div className="flex items-center gap-2">
                        <Button
                            disabled
                            className={cn(
                                "flex items-center gap-1 px-3 py-2 h-9 rounded-lg transition-colors",
                                "bg-neutral-700 text-neutral-400 cursor-not-allowed"
                            )}
                        >
                            <ArrowUpIcon className="w-4 h-4" />
                            <span className="sr-only">Send</span>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center justify-center flex-wrap gap-2 mt-6 mb-20">
                <QuickAction icon={<Code2 className="w-3.5 h-3.5" />} label="Code" />
                <QuickAction icon={<Rocket className="w-3.5 h-3.5" />} label="Launch" />
                <QuickAction icon={<Layers className="w-3.5 h-3.5" />} label="UI" />
                <QuickAction icon={<Palette className="w-3.5 h-3.5" />} label="Theme" />
                <QuickAction icon={<CircleUserRound className="w-3.5 h-3.5" />} label="User" />
                <QuickAction icon={<MonitorIcon className="w-3.5 h-3.5" />} label="Landing" />
                <QuickAction icon={<FileUp className="w-3.5 h-3.5" />} label="Docs" />
                <QuickAction icon={<ImageIcon className="w-3.5 h-3.5" />} label="Assets" />
            </div>
        </div>
    );
}

interface QuickActionProps {
    icon: React.ReactNode;
    label: string;
}

function QuickAction({ icon, label }: QuickActionProps) {
    return (
        <Button
            variant="outline"
            className="flex items-center gap-1.5 h-8 rounded-full border-neutral-700 bg-black/50 text-neutral-300 hover:text-white hover:bg-neutral-700 px-3"
        >
            {icon}
            <span className="text-[10px] sm:text-xs">{label}</span>
        </Button>
    );
}
