'use client'

import { useEffect, useState } from 'react'
import { motion, useSpring, useTransform } from 'framer-motion'
import { Zap } from 'lucide-react'

export function CreditBadge({ credits }: { credits: number }) {
    const [prevCredits, setPrevCredits] = useState(credits)

    // Spring animation for smooth number ticking
    const springCredits = useSpring(credits, {
        stiffness: 100,
        damping: 20,
        mass: 1
    })

    // Transform the spring value to a rounded integer
    const displayCredits = useTransform(springCredits, (latest) => Math.round(latest))

    useEffect(() => {
        springCredits.set(credits)
        setPrevCredits(credits)
    }, [credits, springCredits])

    return (
        <div className="flex items-center gap-1.5 mt-0.5">
        <div className={`w-6 h-6 rounded-full bg-black flex items-center justify-center`}>
            <Zap
                className={`w-3.5 h-3.5 fill-current transition-colors duration-500 ${credits > 5 ? 'text-green-400' : credits > 0 ? 'text-amber-400' : 'text-red-400'}`}
                style={{ filter: credits > 5 ? 'drop-shadow(0 0 2px #4ade80)' : credits > 0 ? 'drop-shadow(0 0 5px #fbbf24)' : 'drop-shadow(0 0 5px #f87171)' }}
            />
        </div>
            <motion.span
                className="text-xs font-semibold tracking-wide text-zinc-300 flex items-center gap-1"
                initial={{ scale: 1 }}
                animate={credits !== prevCredits ? { scale: [1, 1.2, 1], color: ['#a1a1aa', '#fff', '#a1a1aa'] } : {}}
                transition={{ duration: 0.5 }}
            >
                <motion.span>{displayCredits}</motion.span>
                Credits
            </motion.span>
        </div>
    )
}
