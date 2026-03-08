'use client'

import { useState } from 'react'
import { PlusIcon } from '@radix-ui/react-icons'
import { CreditBadge } from './CreditBadge'
import { BuyCreditsModal } from './BuyCreditsModal'
import Link from 'next/link'
import { useSidebar } from './SidebarContext'
import { LayoutList, LayoutGrid } from 'lucide-react'
import GradualBlur from './ui/GradualBlur'
import { cn } from '@/lib/utils'

type TopNavbarProps = {
    credits: number
    userEmail?: string
    userInitial?: string
    avatarUrl?: string
}

export function TopNavbar({ credits, userEmail, userInitial = 'U', avatarUrl }: TopNavbarProps) {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const { sidebarVersion, setSidebarVersion } = useSidebar()

    return (
        <>
            <header className={cn(
                "sticky top-0 z-50 w-full transition-all duration-300",
                sidebarVersion === 'v2'
                    ? "bg-gradient-to-b from-zinc-950 via-zinc-950/80 to-transparent"
                    : "border-b border-white/5 bg-zinc-950/80 backdrop-blur-xl"
            )}>
                <div className="relative z-20 flex h-16 items-center justify-end px-8 w-full max-w-6xl mx-auto gap-4">

                    <button
                        onClick={() => setSidebarVersion(sidebarVersion === 'v1' ? 'v2' : 'v1')}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 shadow-inner border border-white/5 text-xs font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all"
                        title="Switch Sidebar Design"
                    >
                        {sidebarVersion === 'v1' ? (
                            <><LayoutGrid className="w-3.5 h-3.5" /> Classic Design</>
                        ) : (
                            <><LayoutList className="w-3.5 h-3.5" /> Modern Design</>
                        )}
                    </button>

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

                    <div className="ml-4 pl-4 border-l border-white/10 flex items-center">
                        <Link
                            href="/dashboard/profile"
                            className="relative flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-tr from-zinc-800 to-zinc-700 border border-white/10 hover:border-indigo-500/50 hover:shadow-[0_0_15px_rgba(99,102,241,0.2)] transition-all group overflow-hidden"
                        >
                            {avatarUrl ? (
                                <img src={avatarUrl} alt="U" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-sm font-semibold text-zinc-300 group-hover:text-white transition-colors uppercase">
                                    {userInitial}
                                </span>
                            )}

                            {/* Tooltip */}
                            <span className="absolute -bottom-8 right-0 bg-zinc-800 text-zinc-200 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                                {userEmail || 'Profile Settings'}
                            </span>
                        </Link>
                    </div>

                </div>

                {sidebarVersion === 'v2' && (
                    <GradualBlur
                        target="parent"
                        position="top"
                        height="4rem"
                        strength={3}
                        divCount={10}
                        curve="ease-out"
                        exponential
                        opacity={1}
                        zIndex={10}
                    />
                )}
            </header>

            <BuyCreditsModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </>
    )
}
