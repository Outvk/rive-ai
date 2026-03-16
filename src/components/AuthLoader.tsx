'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'

interface AuthLoaderContextType {
    showLoader: (message?: string) => void
    hideLoader: () => void
    isLoading: boolean
}

const AuthLoaderContext = createContext<AuthLoaderContextType | undefined>(undefined)

export function AuthLoaderProvider({ children }: { children: React.ReactNode }) {
    const [isLoading, setIsLoading] = useState(false)
    const [message, setMessage] = useState('Initializing...')
    const [progress, setProgress] = useState(0)
    const pathname = usePathname()

    const showLoader = (msg: string = 'Initializing...') => {
        setMessage(msg)
        setIsLoading(true)
        setProgress(0)
    }

    const hideLoader = () => {
        setIsLoading(false)
        setProgress(0)
    }

    // Progress bar animation simulation (5 seconds total)
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isLoading) {
            setProgress(0);
            const startTime = Date.now();
            const duration = 5000; // 5 seconds

            interval = setInterval(() => {
                const elapsed = Date.now() - startTime;
                const newProgress = Math.min((elapsed / duration) * 100, 100);
                
                setProgress(newProgress);

                if (newProgress >= 100) {
                    clearInterval(interval);
                    // Add a tiny delay at 100% before hiding
                    setTimeout(() => hideLoader(), 500);
                }
            }, 50);
        }
        return () => clearInterval(interval);
    }, [isLoading]);

    return (
        <AuthLoaderContext.Provider value={{ showLoader, hideLoader, isLoading }}>
            {children}
            <AnimatePresence>
                {isLoading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-black"
                    >
                        <div className="relative w-48 h-48 flex items-center justify-center">
                            {/* Loader Video */}
                            <video
                                src="/loader.mp4"
                                autoPlay
                                loop
                                muted
                                playsInline
                                className="w-full h-full object-contain"
                            />
                        </div>

                        {/* Loading Text and Bar */}
                        <div className="mt-4 flex flex-col items-center gap-4 w-64 text-center">
                            <motion.p
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-zinc-500 text-[9px] font-bold uppercase tracking-[0.3em] font-ibm-mono"
                            >
                                {message}
                            </motion.p>
                            
                            {/* Progress Bar Container */}
                            <div className="w-full h-[1px] bg-zinc-900 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                                    initial={{ width: '0%' }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 0.3 }}
                                />
                            </div>
                        </div>

                        {/* Background subtle glow */}
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.05)_0%,transparent_50%)] pointer-events-none" />
                    </motion.div>
                )}
            </AnimatePresence>
        </AuthLoaderContext.Provider>
    )
}

export const useAuthLoader = () => {
    const context = useContext(AuthLoaderContext)
    if (!context) {
        throw new Error('useAuthLoader must be used within an AuthLoaderProvider')
    }
    return context
}
