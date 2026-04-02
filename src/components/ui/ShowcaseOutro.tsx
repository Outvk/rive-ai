"use client";

import React from 'react';
import { motion } from 'framer-motion';
import LogoLoop from './LogoLoop';
import { techLogos } from './HorizontalShowcase';

export default function ShowcaseOutro() {
    return (
        <section className="h-screen flex items-center justify-center text-center p-12 bg-black border-t border-white/5 relative">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_120%,#7405FF33,transparent_60%)] pointer-events-none" />
            <div className="max-w-3xl relative z-10">
                <motion.h2
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="text-4xl md:text-5xl font-extralight text-white mb-8 tracking-tight leading-tight"
                >
                    Revolutionizing the way you <span className="font-semibold italic">experience the web.</span>
                </motion.h2>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
                    className="text-zinc-500 text-base md:text-lg max-w-xl mx-auto leading-relaxed mb-12 font-light"
                >
                    High-performance AI integrated into every module.
                </motion.p>

                <div className="w-full mt-12 overflow-hidden">
                    <LogoLoop
                        logos={techLogos}
                        speed={40}
                        direction="left"
                        logoHeight={40}
                        gap={80}
                        hoverSpeed={0}
                        scaleOnHover
                        fadeOut
                        fadeOutColor="#000000"
                        ariaLabel="Technology partners"
                    />
                </div>
            </div>

            <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.8 }}
                className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-4 text-zinc-500 text-xs tracking-[0.3em] uppercase"
            >
                Scroll for Footer
            </motion.div>
        </section>
    );
}
