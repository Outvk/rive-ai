"use client";

import { useRef } from "react";
import { useScroll, useTransform, motion, useSpring } from "framer-motion";
import { cn } from "@/lib/utils";

interface Feature {
    icon: any;
    title: string;
    description: string;
    image: string;
}

interface ScrollCarouselProps {
    features: Feature[];
    className?: string;
    maxScrollHeight?: number;
}

export default function ScrollCarousel({
    features,
    className,
    maxScrollHeight = 4000,
}: ScrollCarouselProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"],
    });

    // Calculate progress-based translation
    const xRaw = useTransform(scrollYProgress,
        [0, 0.1, 0.9, 1],
        ["0vw", "0vw", `-${(features.length - 1) * 88}vw`, `-${(features.length - 1) * 88}vw`]
    );

    // Apply spring physics for ultra-smooth movement
    const xTransform = useSpring(xRaw, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    return (
        <div
            ref={containerRef}
            className={cn("relative", className)}
            style={{ height: `${maxScrollHeight}px` }}
        >
            <div className="sticky top-0 h-[100vh] w-full flex items-center overflow-hidden">
                <motion.div
                    style={{ x: xTransform, willChange: "transform" }}
                    className="flex gap-[3vw] px-[7.5vw] items-center"
                >
                    {features.map((feature, idx) => (
                        <div
                            key={idx}
                            className="flex-shrink-0 w-[85vw] max-w-[1200px] h-[82vh] rounded-[3rem] border border-white/10 bg-white/5 backdrop-blur-[60px] shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center gap-12 p-8 md:p-16"
                        >
                            {/* Left Side - Visual Component */}
                            <div className="flex-1 w-full h-[300px] md:h-full rounded-2xl overflow-hidden relative group">
                                <img
                                    src={feature.image}
                                    alt={feature.title}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 pointer-events-none" />
                                <div className="absolute top-6 left-6 w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center">
                                    <feature.icon className="w-6 h-6 text-[#C190FF]" />
                                </div>
                            </div>

                            {/* Right Side - Content */}
                            <div className="flex-1 text-left flex flex-col justify-center max-w-xl">
                                <span className="text-[#C190FF] text-sm font-semibold tracking-widest uppercase mb-4 block">Feature {idx + 1}</span>
                                <h2 className="text-4xl md:text-6xl font-bold text-white mb-8 tracking-tighter leading-tight italic">
                                    {feature.title}
                                </h2>
                                <p className="text-zinc-400 text-lg md:text-xl leading-relaxed">
                                    {feature.description}
                                </p>
                                <div className="mt-12 flex items-center gap-8">
                                    <div className="flex flex-col">
                                        <span className="text-white font-bold text-2xl">99%</span>
                                        <span className="text-zinc-500 text-sm">Accuracy</span>
                                    </div>
                                    <div className="w-[1px] h-12 bg-white/10" />
                                    <div className="flex flex-col">
                                        <span className="text-white font-bold text-2xl">0.4s</span>
                                        <span className="text-zinc-500 text-sm">Response</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </motion.div>
            </div>
        </div>
    );
}
