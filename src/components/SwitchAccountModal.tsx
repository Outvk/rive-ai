'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Cross2Icon } from '@radix-ui/react-icons'
import { AuthFormContainer } from './ui/auth-fuse'
import { cn } from '@/lib/utils'

export function SwitchAccountModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
    const [isSignIn, setIsSignIn] = useState(true)
    const [isLoading, setIsLoading] = useState(false)

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/80 backdrop-blur-md"
                        onClick={() => !isLoading && onClose()}
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className={cn(
                            "w-full relative z-[101] overflow-hidden max-w-[24rem]",
                        )}
                    >
                        <div className="bg-zinc-950/90 border border-white/10 p-8 rounded-[2rem] backdrop-blur-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden">
                            {/* Glow Decoration */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none" />
                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px] pointer-events-none" />

                            <div className="flex justify-between items-start mb-6 relative">
                                <div>
                                    <h2 className="text-xl font-bold text-white tracking-tight">Switch Account</h2>
                                    <p className="text-xs text-zinc-400 mt-1">Sign in to another account.</p>
                                </div>
                                <button 
                                    onClick={() => !isLoading && onClose()} 
                                    disabled={isLoading}
                                    className="p-1 hover:bg-white/10 rounded-full text-zinc-500 hover:text-white transition disabled:opacity-50"
                                >
                                    <Cross2Icon className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="relative z-10 w-full flex flex-col items-center">
                                <div className="w-[105%] max-w-[320px]">
                                    <AuthFormContainer 
                                        isSignIn={isSignIn} 
                                        onToggle={() => setIsSignIn(!isSignIn)} 
                                        isLoading={isLoading} 
                                        setIsLoading={setIsLoading} 
                                    />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
