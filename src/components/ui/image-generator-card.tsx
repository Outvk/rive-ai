"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ImageIcon, Sparkles, Wand2 } from "lucide-react";

export default function ImageGeneratorCard() {
    const [prompt, setPrompt] = useState("");

    return (
        <div className="w-full max-w-2xl">
            <div className="relative bg-black/60 backdrop-blur-md rounded-xl border border-neutral-700 overflow-hidden">
                <div className="p-4 border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-[#7405FF]" />
                        <span className="text-sm font-medium text-white/90">Image Generator</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="text-[10px] text-zinc-500 bg-zinc-900 px-2 py-0.5 rounded border border-white/5">DALL-E 3</div>
                        <div className="text-[10px] text-zinc-500 bg-zinc-900 px-2 py-0.5 rounded border border-white/5">1024x1024</div>
                    </div>
                </div>

                <Textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe the image you want to create..."
                    className={cn(
                        "w-full px-4 py-4 resize-none border-none",
                        "bg-transparent text-white text-sm",
                        "focus-visible:ring-0 focus-visible:ring-offset-0",
                        "placeholder:text-neutral-500 min-h-[120px]"
                    )}
                />

                <div className="flex items-center justify-between p-3 border-t border-white/5 bg-white/[0.02]">
                    <div className="flex gap-2">
                        <Button variant="ghost" size="sm" className="h-8 text-[11px] text-zinc-400 hover:text-white">
                            High Quality
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 text-[11px] text-zinc-400 hover:text-white">
                            Cinematic
                        </Button>
                    </div>

                    <Button className="bg-[#7405FF] hover:bg-[#C190FF] text-white h-9 px-4 rounded-lg flex items-center gap-2 group transition-all">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span className="text-xs font-semibold">Generate</span>
                    </Button>
                </div>
            </div>

            <div className="flex items-center justify-center flex-wrap gap-2 mt-6">
                <PromptTag label="Futuristic Cyberpunk City" />
                <PromptTag label="Abstract Liquid Gold" />
                <PromptTag label="Hyper-realistic Portrait" />
                <PromptTag label="Surreal Low Poly Nature" />
            </div>
        </div>
    );
}

function PromptTag({ label }: { label: string }) {
    return (
        <button className="px-3 py-1.5 rounded-full border border-neutral-800 bg-black/40 text-[10px] text-zinc-400 hover:text-white hover:border-neutral-600 transition-colors">
            {label}
        </button>
    );
}
