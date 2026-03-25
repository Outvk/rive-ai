"use client"

import React from 'react'
import { motion } from 'framer-motion'

export default function SilkBackground() {
    return (
        <div className="fixed inset-0 z-[-1] bg-[#000] overflow-hidden isolate">
            {/* Base Silk Dark Depth */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_#0a001a_0%,_#000_100%)]" />

            {/* Moving Silk Folds (More Visible) */}
            <div className="absolute inset-0 overflow-hidden">
                <motion.div 
                    animate={{ 
                        scale: [1, 1.2, 1],
                        rotate: [0, 10, 0],
                        x: ["-5%", "5%", "-5%"],
                    }}
                    transition={{ 
                        duration: 25, 
                        repeat: Infinity, 
                        ease: "easeInOut" 
                    }}
                    className="absolute top-[-20%] left-[-20%] w-[140%] h-[140%] opacity-[0.25] pointer-events-none"
                    style={{
                        background: 'radial-gradient(circle at 30% 30%, #7405FF 0%, transparent 60%), radial-gradient(circle at 70% 70%, #C190FF 0%, transparent 60%)',
                        filter: 'blur(120px)'
                    }}
                />
            </div>

            {/* Reflective Sheen Layers */}
            <motion.div 
                animate={{ 
                    opacity: [0.15, 0.4, 0.15],
                    backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"]
                }}
                transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.05)_50%,transparent_75%)] bg-[length:200%_200%] pointer-events-none"
            />

            {/* Sharp Gloss Lines (Silk Highlights) */}
            <div className="absolute inset-0 opacity-20">
                <div className="absolute top-[10%] left-[-10%] w-[120%] h-[1px] bg-gradient-to-r from-transparent via-[#C190FF]/40 to-transparent blur-[2px] rotate-[15deg] transform-gpu" />
                <div className="absolute bottom-[20%] right-[-10%] w-[120%] h-[1px] bg-gradient-to-r from-transparent via-[#7405FF]/40 to-transparent blur-[3px] rotate-[-8deg] transform-gpu" />
            </div>

            {/* Fine Noise Texture */}
            <div className="absolute inset-0 opacity-[0.04] pointer-events-none mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
            
            {/* Deep Ambient Glow */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <motion.div 
                    animate={{ 
                        scale: [1, 1.3, 1],
                        opacity: [0.3, 0.5, 0.3]
                    }}
                    transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                    className="w-[80vw] h-[80vw] bg-[radial-gradient(circle_at_50%_50%,_rgba(116,5,255,0.1),_transparent_70%)] blur-[100px]"
                />
            </div>
        </div>
    )
}
