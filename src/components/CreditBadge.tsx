'use client'

import { useEffect, useState } from 'react'
import { motion, useSpring, useTransform } from 'framer-motion'

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
            <div
                className={`h-2 w-2 rounded-full shadow-[0_0_8px_currentColor] transition-colors duration-500 ${credits > 5 ? 'bg-green-500 text-green-500' : credits > 0 ? 'bg-amber-500 text-amber-500' : 'bg-red-500 text-red-500'
                    }`}
            ></div>
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
