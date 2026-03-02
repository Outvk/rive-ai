'use client'

import { useState } from 'react'
import { PlusIcon } from '@radix-ui/react-icons'
import { CreditBadge } from './CreditBadge'
import { BuyCreditsModal } from './BuyCreditsModal'

export function TopNavbar({ credits }: { credits: number }) {
    const [isModalOpen, setIsModalOpen] = useState(false)

    return (
        <>
            <header className="sticky top-0 z-40 w-full border-b border-white/5 bg-zinc-950/80 backdrop-blur-xl">
                <div className="flex h-16 items-center justify-end px-8 w-full max-w-6xl mx-auto">

                    <div className="flex items-center gap-4 bg-zinc-900/50 px-3 py-1.5 rounded-full border border-white/5 shadow-inner">
                        <CreditBadge credits={credits} />

                        <div className="w-[1px] h-4 bg-white/10" />

                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center gap-1.5 bg-indigo-500 hover:bg-indigo-400 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-[0_0_15px_rgba(99,102,241,0.3)] transition-all"
                        >
                            <PlusIcon className="w-3.5 h-3.5" />
                            Buy Credits
                        </button>
                    </div>

                </div>
            </header>

            <BuyCreditsModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </>
    )
}
