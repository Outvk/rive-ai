'use client'

import { useState } from 'react'
import { logoutAction } from '@/app/dashboard/actions'
import { useAuthLoader } from '@/components/AuthLoader'
import { PlusIcon } from '@radix-ui/react-icons'
import { CreditBadge } from './CreditBadge'
import { BuyCreditsModal } from './BuyCreditsModal'
import Link from 'next/link'
import { useSidebar } from './SidebarContext'
import { LayoutList, LayoutGrid, Crown, Globe, LogOut, Users } from 'lucide-react'
import GradualBlur from './ui/GradualBlur'
import { cn } from '@/lib/utils'
import { NotificationBell } from './NotificationBell'
import { SwitchAccountModal } from './SwitchAccountModal'

type TopNavbarProps = {
    credits: number
    userEmail?: string
    userInitial?: string
    avatarUrl?: string
    userId: string
    fullName?: string
}

export function TopNavbar({ credits, userEmail, userInitial = 'U', avatarUrl, userId, fullName = 'User' }: TopNavbarProps) {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isSwitchModalOpen, setIsSwitchModalOpen] = useState(false)
    const { sidebarVersion, setSidebarVersion } = useSidebar()
    const { showLoader } = useAuthLoader()

    const handleLogout = async () => {
        showLoader("Signing out of your session...");
        await logoutAction();
    }

    const handleLanguageChange = (langCode: string) => {
        // Most reliable way to control Google Translate custom UI is setting the cookie & reloading
        const expire = new Date()
        expire.setTime(expire.getTime() + 30 * 24 * 60 * 60 * 1000)
        
        // Clear old cookies to ensure smooth transition
        document.cookie = `googtrans=/en/${langCode}; expires=${expire.toUTCString()}; path=/`
        document.cookie = `googtrans=/en/${langCode}; expires=${expire.toUTCString()}; path=/; domain=${location.host}`
        
        window.location.reload()
    }

    return (
        <>
            <header className="sticky top-0 z-50 w-full bg-gradient-to-b from-black/80 to-transparent transition-all duration-300">
                <div className="relative z-20 flex h-16 items-center justify-end px-8 w-full max-w-6xl mx-auto gap-4 ">

                    <div className="flex items-center gap-2 mr-auto">
                        <button
                            onClick={() => setSidebarVersion(sidebarVersion === 'v1' ? 'v2' : 'v1')}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 shadow-inner border border-white/5 text-xs font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all "
                            title="Switch Sidebar Design"
                        >
                            {sidebarVersion === 'v1' ? (
                                <><LayoutGrid className="w-3.5 h-3.5" /> Rive V1.0</>
                            ) : (
                                <><LayoutList className="w-3.5 h-3.5" /> Rive V2.0</>
                            )}
                        </button>

                        {/* Custom Premium Dropdown UI */}
                        <div className="relative group z-50">
                            <button style={{ cursor: 'pointer' ,}} className="flex items-center justify-center w-7 h-7 rounded-full bg-zinc-900 border border-white/5 hover:bg-zinc-800 transition-colors">
                                <Globe className="w-4 h-4 text-zinc-400" />
                            </button>
                            <div className="absolute top-full mt-2 left-0 w-36 bg-zinc-950/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all flex flex-col p-1.5 z-50">
                                <button onClick={() => handleLanguageChange('en')} className="px-3 py-2 text-xs font-medium text-left text-zinc-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors">English (EN)</button>
                                <button onClick={() => handleLanguageChange('fr')} className="px-3 py-2 text-xs font-medium text-left text-zinc-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors">Français (FR)</button>
                                <button onClick={() => handleLanguageChange('es')} className="px-3 py-2 text-xs font-medium text-left text-zinc-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors">Español (ES)</button>
                                <button onClick={() => handleLanguageChange('de')} className="px-3 py-2 text-xs font-medium text-left text-zinc-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors">Deutsch (DE)</button>
                                <button onClick={() => handleLanguageChange('ar')} className="px-3 py-2 text-xs font-medium text-left text-zinc-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors flex justify-between">
                                    <span>العربية (AR)</span><span className="text-[10px] text-zinc-500">RTL</span>
                                </button>
                                <button onClick={() => handleLanguageChange('ja')} className="px-3 py-2 text-xs font-medium text-left text-zinc-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors">日本語 (JA)</button>
                            </div>
                        </div>
                    </div>

                    {/* Hidden Native Translator */}
                    <div id="google_translate_element" className="absolute opacity-0 pointer-events-none z-[-1]"></div>

                    <NotificationBell userId={userId} />

                    <div className="flex items-center gap-3 bg-zinc-900/50 px-3 py-1.5 rounded-full border border-white/5 shadow-inner ml-2">
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
                                <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]" />
                                <span className="text-xs font-semibold tracking-tight text-white/90">Get Pro Credits</span>
                                <span className="text-[8px] font-black bg-amber-500 text-zinc-950 px-1 rounded-sm ml-0.5 tracking-tighter">PRO</span>
                            </div>
                            {/* Hover shimmer */}
                            <div className="absolute inset-[1px] opacity-0 transition-opacity duration-300 bg-gradient-to-r from-[#7405FF]/20 via-[#C190FF]/10 to-[#7405FF]/20 group-hover:opacity-100 rounded-xl"></div>
                        </button>
                    </div>


                    <div className="ml-0 pl-0 flex items-center relative group">
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
                                            <span className="text-xl font-bold text-zinc-300 uppercase">{userInitial}</span>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-white truncate">
                                            {fullName}
                                        </p>
                                        <p className="text-xs text-zinc-500 truncate">
                                            {userEmail}
                                        </p>
                                    </div>
                                </div>
                                <div className="h-[1px] w-full bg-white/5 my-3" />
                                <div className="space-y-1">
                                    <Link
                                        href="/dashboard/profile"
                                        className="w-full py-2 bg-white/5 hover:bg-white/10 text-zinc-300 text-sm font-medium rounded-lg transition-colors flex items-center justify-center"
                                    >
                                        Manage Account
                                    </Link>
                                    <button
                                        onClick={() => setIsSwitchModalOpen(true)}
                                        className="w-full py-2 bg-white/5 hover:bg-white/10 text-zinc-300 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 group"
                                    >
                                        <Users className="w-4 h-4 text-zinc-400 group-hover:text-zinc-300" />
                                        Switch Account
                                    </button>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-500 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 group"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        Sign Out
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                {sidebarVersion === 'v2' && (
                    <GradualBlur
                        target="parent"
                        position="top"
                        height="4rem"
                        strength={1}
                        divCount={10}
                        curve="ease-out"
                        exponential
                        opacity={1}
                        zIndex={10}
                    />
                )}
            </header>

            <BuyCreditsModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
            <SwitchAccountModal isOpen={isSwitchModalOpen} onClose={() => setIsSwitchModalOpen(false)} />
        </>
    )
}
