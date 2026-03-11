"use client";

import React, { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Sparkles, Video, AudioLines, ArrowRight } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const features = [
    {
        icon: Sparkles,
        title: "Image Generation",
        description: "Harness the power of neural generation to turn any conceptual prompt into stunning, ultra-realistic digital art in seconds.",
        image: "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&q=80&w=1200",
        video: "/image.mp4",
        stats: { accuracy: "99%", speed: "0.4s" }
    },

    {
        icon: Video,
        title: "Video Generation",
        description: "Bring static worlds to life. Generate high-fidelity cinematic motion from text or still images, tailored for modern content creation.",
        image: "https://images.unsplash.com/photo-1478720143988-8ada3314138e?auto=format&fit=crop&q=80&w=1200",
        video: "/video.mp4",
        stats: { accuracy: "95%", speed: "1.2s" }
    },
    {
        icon: AudioLines,
        title: "Audio Generation",
        description: "Generate natural, expressive speech from text. Our neural voice engine delivers studio-quality audio with human-like prosody and emotion.",
        image: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&q=80&w=1200",
        video: "/sound.mp4",
        stats: { accuracy: "98%", speed: "0.2s" }
    },

];

export default function HorizontalShowcase() {
    const component = useRef<HTMLDivElement>(null);
    const slider = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        let ctx = gsap.context(() => {
            let panels = gsap.utils.toArray(".panel");

            gsap.to(panels, {
                xPercent: -100 * (panels.length - 1),
                ease: "none",
                scrollTrigger: {
                    trigger: slider.current,
                    pin: true,
                    scrub: 1,
                    snap: 1 / (panels.length - 1),
                    end: () => "+=" + slider.current?.offsetWidth,
                    // Removed markers for production
                }
            });
        }, component);
        return () => ctx.revert();
    }, []);

    return (
        <div ref={component} className="w-full bg-[#030303]">
            {/* Intro Section - Premium Theme */}


            {/* Horizontal Pinned Section */}
            <div id="sectionPin" ref={slider} className="h-screen overflow-hidden flex bg-black">
                <div className="pin-wrap flex h-full">
                    {features.map((feature, idx) => (
                        <div
                            key={idx}
                            className="panel flex-shrink-0 w-screen h-full flex flex-col md:flex-row items-center gap-12 p-8 md:p-24 relative"
                        >
                            {/* Left Side - Visual Component */}
                            <div className="flex-1 w-full h-[40vh] md:h-full rounded-[2.5rem] overflow-hidden relative group border border-white/5 shadow-2xl">
                                {feature.video ? (
                                    <video
                                        src={feature.video}
                                        autoPlay
                                        loop
                                        muted
                                        playsInline
                                        className="w-full h-full object-cover transition-transform duration-1000"
                                    />
                                ) : (
                                    <img
                                        src={feature.image}
                                        alt={feature.title}
                                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                                    />
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                                <div className="absolute top-8 left-8 w-14 h-14 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 flex items-center justify-center">
                                    <feature.icon className="w-7 h-7 text-[#C190FF]" />
                                </div>
                            </div>

                            {/* Right Side - Content */}
                            <div className="flex-1 text-left flex flex-col justify-center max-w-xl">
                                <div className="flex items-center gap-3 mb-6">
                                    <span className="w-8 h-[1px] bg-[#C190FF]" />

                                </div>

                                <h2 className="text-4xl md:text-5xl font-light text-white mb-6 tracking-tight">
                                    {feature.title}
                                </h2>

                                <p className="text-zinc-500 text-base md:text-lg leading-relaxed mb-10 font-light">
                                    {feature.description}
                                </p>

                                <div className="flex items-center gap-10">
                                    <div className="flex flex-col">
                                        <span className="text-white font-extralight text-2xl md:text-4xl tracking-tighter">{feature.stats.accuracy}</span>
                                        <span className="text-zinc-600 text-[10px] uppercase tracking-[0.3em] mt-2">Accuracy</span>
                                    </div>
                                    <div className="w-[1px] h-10 bg-white/5" />
                                    <div className="flex flex-col">
                                        <span className="text-white font-extralight text-2xl md:text-4xl tracking-tighter">{feature.stats.speed}</span>
                                        <span className="text-zinc-600 text-[10px] uppercase tracking-[0.3em] mt-2">Latency</span>
                                    </div>
                                </div>

                                <button className="mt-16 flex items-center gap-3 text-white font-semibold hover:text-[#C190FF] transition-colors group">
                                    <span>Try implementation</span>
                                    <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-2" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Outro Section */}
            <section className="h-screen flex items-center justify-center text-center p-12 bg-black border-t border-white/5 relative">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_120%,#7405FF33,transparent_60%)] pointer-events-none" />
                <div className="max-w-3xl relative z-10">
                    <h2 className="text-4xl md:text-5xl font-extralight text-white mb-8 tracking-tight leading-tight">
                        Revolutionizing the way you <span className="font-semibold italic">experience the web.</span>
                    </h2>
                    <p className="text-zinc-500 text-lg max-w-xl mx-auto leading-relaxed mb-12 font-light">
                        High-performance AI integrated into every module.
                    </p>
                </div>

                <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-4 text-zinc-500 text-xs tracking-[0.3em] uppercase">
                    Scroll for Footer
                </div>
            </section>
        </div>
    );
}
