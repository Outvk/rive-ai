"use client"

import * as React from "react"
import { cn } from "@/lib/utils";
import { motion } from "motion/react";

export interface ImageGenerationProps {
    children: React.ReactNode;
    duration?: number;
    isGenerating?: boolean;
    onComplete?: () => void;
}

export function ImageGeneration({ children, duration = 3000, isGenerating = false, onComplete }: ImageGenerationProps) {
    const [progress, setProgress] = React.useState(0);
    const [loadingState, setLoadingState] = React.useState<
        "waiting" | "generating" | "revealing" | "completed"
    >(isGenerating ? "generating" : "completed");

    // Phase 1: Handling the API loading state changes
    React.useEffect(() => {
        if (isGenerating) {
            setLoadingState("generating");
            setProgress(0);
        } else if (loadingState === "generating") {
            // Only trigger reveal if we were just generating
            setLoadingState("revealing");
        }
    }, [isGenerating, loadingState]);

    // Handle immediate completion if we aren't generating anymore and weren't in the middle of a reveal
    React.useEffect(() => {
        if (!isGenerating && loadingState === "waiting") {
            setLoadingState("completed");
        }
    }, [isGenerating, loadingState]);

    // Phase 2: Handling the Reveal animation (after image is ready)
    React.useEffect(() => {
        if (loadingState !== "revealing") return;

        const revealDuration = 1200; // Faster reveal for better UX
        const startTime = Date.now();

        const interval = setInterval(() => {
            const elapsedTime = Date.now() - startTime;
            const progressPercentage = Math.min(
                100,
                (elapsedTime / revealDuration) * 100
            );

            setProgress(progressPercentage);

            if (progressPercentage >= 100) {
                clearInterval(interval);
                setLoadingState("completed");
                if (onComplete) onComplete();
            }
        }, 16);

        return () => clearInterval(interval);
    }, [loadingState, onComplete]);

    return (
        <div className="flex flex-col gap-2 w-full h-full">
            <motion.span
                className="bg-[linear-gradient(110deg,#94a3b8,35%,#f8fafc,50%,#94a3b8,75%,#94a3b8)] bg-[length:200%_100%] bg-clip-text text-transparent text-base font-medium"
                initial={{ backgroundPosition: "200% 0" }}
                animate={{
                    backgroundPosition:
                        loadingState === "completed" ? "0% 0" : "-200% 0",
                }}
                transition={{
                    repeat: loadingState === "completed" ? 0 : Infinity,
                    duration: 3,
                    ease: "linear",
                }}
            >
                {loadingState === "generating" && "Generating image..."}
                {loadingState === "revealing" && "Revealing image..."}
                {loadingState === "completed" && "Image created."}
                {loadingState === "waiting" && !isGenerating && "Ready to generate."}
            </motion.span>
            <div className="relative rounded-xl bg-card w-full h-full overflow-hidden flex items-center justify-center">
                {children}

                {/* Reveal Overlay - Only show if not completed */}
                {loadingState !== "completed" && (
                    <motion.div
                        className="absolute inset-0 pointer-events-none backdrop-blur-3xl z-10"
                        initial={{ opacity: 1 }}
                        animate={{
                            clipPath: `polygon(0 ${progress}%, 100% ${progress}%, 100% 100%, 0 100%)`,
                            opacity: 1,
                        }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        style={{
                            clipPath: `polygon(0 ${progress}%, 100% ${progress}%, 100% 100%, 0 100%)`,
                            maskImage:
                                progress === 0
                                    ? "linear-gradient(to bottom, black -5%, black 100%)"
                                    : `linear-gradient(to bottom, transparent ${progress - 5}%, transparent ${progress}%, black ${progress}%)`,
                            WebkitMaskImage:
                                progress === 0
                                    ? "linear-gradient(to bottom, black -5%, black 100%)"
                                    : `linear-gradient(to bottom, transparent ${progress - 5}%, transparent ${progress}%, black ${progress}%)`,
                        }}
                    />
                )}
            </div>
        </div>
    );
}

ImageGeneration.displayName = "ImageGeneration";
