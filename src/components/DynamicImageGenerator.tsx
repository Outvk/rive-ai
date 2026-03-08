"use client";

import React from "react";
import { useSidebar } from "./SidebarContext";
import { ImageGeneratorForm } from "./ImageGeneratorForm";
import { AIMultiModalGeneration } from "./ui/ai-gen";

interface DynamicImageGeneratorProps {
    initialCredits?: number;
    initialHistory?: any[];
}

export function DynamicImageGenerator({ initialCredits = 10, initialHistory = [] }: DynamicImageGeneratorProps) {
    const { sidebarVersion } = useSidebar();

    if (sidebarVersion === "v1") {
        return (
            <div className="w-full max-w-4xl mx-auto">
                <ImageGeneratorForm initialCredits={initialCredits} />
            </div>
        );
    }

    return (
        <div className="dark w-full h-[750px] flex items-center justify-center">
            <AIMultiModalGeneration initialCredits={initialCredits} initialHistory={initialHistory} />
        </div>
    );
}
