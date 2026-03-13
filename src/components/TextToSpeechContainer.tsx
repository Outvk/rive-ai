"use client";

import React from "react";
import { useSidebar } from "./SidebarContext";
import { TextToSpeechForm } from "./TextToSpeechForm";
import { AISpeechGeneration } from "./ui/ai-speech";
import { SpeakerModerateIcon } from "@radix-ui/react-icons";
import { AudioEffectsTool } from "./AudioEffectsTool";

interface TextToSpeechContainerProps {
    credits: number;
    history: any[];
}

export function TextToSpeechContainer({ credits, history }: TextToSpeechContainerProps) {
    const { sidebarVersion } = useSidebar();

    if (sidebarVersion === "v1") {
        return (
            <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6">
                <div className="mb-10 text-center">
                    <h1 className="text-3xl font-bold text-zinc-100 mb-3 tracking-tight">Text to Speech</h1>
                    <p className="text-zinc-400 text-sm max-w-lg mx-auto">
                        Convert your text into high-quality AI voices for narrations, videos, and more.
                    </p>
                </div>
                <div className="bg-zinc-900/20 backdrop-blur-sm border border-white/5 rounded-3xl p-2 sm:p-6 shadow-2xl">
                    <TextToSpeechForm initialCredits={credits} />
                </div>
            </div>
        );
    }

    // V2 Studio design with breakout layout
    return (
        <div className="w-[calc(100%+80px)] max-w-none -m-10 min-h-screen fade-in">
            <div className="h-full relative flex flex-col p-10 pb-20">
                <div className="mb-6">
                    <h1 className="text-2xl font-semibold text-zinc-100 mb-1 flex items-center gap-2 font-display">
                        <SpeakerModerateIcon className="w-6 h-6 text-amber-500" />
                        Text to Speech Studio
                    </h1>
                    <p className="text-sm text-zinc-500">
                        Create natural-sounding narrations with ElevenLabs' most advanced AI voices.
                    </p>
                </div>

                <div className="flex-1 relative z-10 transition-all duration-500">
                    <AISpeechGeneration
                        initialCredits={credits}
                        initialHistory={history}
                    />
                </div>

                {/* New Audio Effects Tool */}
                <AudioEffectsTool />
            </div>
        </div>
    );
}
