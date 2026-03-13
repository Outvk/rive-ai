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
                <div className="relative z-20 flex h-16 items-center justify-end px-8 w-full max-w-6xl mx-auto gap-4 ">

                    <button
                        onClick={() => setSidebarVersion(sidebarVersion === 'v1' ? 'v2' : 'v1')}
                        className="flex mr-auto items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 shadow-inner border border-white/5 text-xs font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all "
                        title="Switch Sidebar Design"
                    >
                        {sidebarVersion === 'v1' ? (
                            <><LayoutGrid className="w-3.5 h-3.5" /> Rive V1.0</>
                        ) : (
                            <><LayoutList className="w-3.5 h-3.5" /> Rive V2.0</>
                        )}
                    </button>

                    <div className="flex items-center gap-4 bg-zinc-900/50 px-3 py-1.5 rounded-full border border-white/5 shadow-inner">
                        <CreditBadge credits={credits} />

                        <div className="w-[1px] h-4 bg-white/10" />

                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="relative h-7 px-4 rounded-xl overflow-hidden transition-all duration-500 group flex items-center justify-center"
                        >
                            {/* Layer 1: Border gradient */}
                            <div className="absolute inset-0 rounded-xl p-[1px] bg-gradient-to-b from-[#7405FF] via-[#15002F] to-[#C190FF]">
                                <div className="absolute inset-0 bg-[#15002F] rounded-xl opacity-90"></div>
                            </div>
                            {/* Layer 2: Dark base */}
                            <div className="absolute inset-[1px] bg-[#15002F] rounded-xl opacity-95"></div>
                            {/* Layer 3: Animated moving gradient */}
                            <div className="absolute inset-[1px] bg-gradient-to-r from-[#15002F] via-[#7405FF] to-[#C190FF] rounded-xl opacity-90 animate-button-gradient"></div>
                            {/* Layer 4: Top highlight */}
                            <div className="absolute inset-[1px] bg-gradient-to-b from-[#7405FF]/30 via-transparent to-[#C190FF]/20 rounded-xl opacity-80"></div>
                            {/* Layer 5: Inner glow */}
                            <div className="absolute inset-[1px] shadow-[inset_0_0_12px_rgba(116,5,255,0.25)] rounded-xl"></div>
                            {/* Content */}
                            <div className="relative flex items-center justify-center gap-1.5">
                                <PlusIcon className="w-3.5 h-3.5 text-[#E9D5FF] drop-shadow-[0_0_8px_rgba(193,144,255,0.9)]" />
                                <span className="text-xs font-semibold tracking-tight text-white/90">Buy Credits🪙</span>
                            </div>
                            {/* Hover shimmer */}
                            <div className="absolute inset-[1px] opacity-0 transition-opacity duration-300 bg-gradient-to-r from-[#7405FF]/20 via-[#C190FF]/10 to-[#7405FF]/20 group-hover:opacity-100 rounded-xl"></div>
                        </button>
                    </div>

                    <div className="ml-4 pl-4 border-l border-white/10 flex items-center relative group">
                        <Link
                            href="/dashboard/profile"
                            className="relative flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-tr from-zinc-800 to-zinc-700 border border-white/10 hover:border-indigo-500/50 hover:shadow-[0_0_15px_rgba(99,102,241,0.2)] transition-all overflow-hidden z-10"
                        >
                            {avatarUrl ? (
                                <img src={avatarUrl} alt={userInitial || 'U'} className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-sm font-semibold text-zinc-300 transition-colors uppercase">
                                    {userInitial}
                                </span>
                            )}
                        </Link>

                        {/* Hover Card */}
                        <div className="absolute right-0 top-[120%] pt-2 opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-300 z-50">
                            <div className="w-64 bg-zinc-950 border border-white/10 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-3xl p-5 relative">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl pointer-events-none" />
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-12 h-12 rounded-full border border-white/10 bg-zinc-900 overflow-hidden flex items-center justify-center shrink-0">
                                        {avatarUrl ? (
                                            <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-xl font-bold text-zinc-300 uppercase">River</span>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-white truncate">
                                            River
                                        </p>
                                        <p className="text-xs text-zinc-500 truncate">
                                            {userEmail}
                                        </p>
                                    </div>
                                </div>
                                <div className="h-[1px] w-full bg-white/5 my-3" />
                                <Link
                                    href="/dashboard/profile"
                                    className="w-full py-2 bg-white/5 hover:bg-white/10 text-zinc-300 text-sm font-medium rounded-lg transition-colors flex items-center justify-center"
                                >
                                    Manage Account
                                </Link>
                            </div>
                        </div>
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
