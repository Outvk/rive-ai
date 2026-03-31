'use client'

import { VideoIcon } from '@radix-ui/react-icons'


import { usePathname, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
    DashboardIcon,
    TextIcon,
    ImageIcon,
    ClockIcon,
    ArrowLeftIcon,
    ChatBubbleIcon,
    SpeakerLoudIcon,
    PersonIcon,
    Link2Icon,
    CardStackIcon,
    LockClosedIcon,
} from '@radix-ui/react-icons'
import { LayoutList, Bell, Compass, VenetianMask } from 'lucide-react'
import { ClientSidebarProfile } from '@/components/ClientSidebarProfile'
import { deleteConversation } from '@/app/dashboard/text/actions'

export type ConversationSummary = {
    id: string
    title: string
    updated_at: string
}

export type Generation = {
    id: string
    prompt: string
    result: string
    created_at: string
    tool_type: string
}

type Props = {
    email: string
    fullName: string
    avatarUrl?: string
    conversations: ConversationSummary[]
    recentImages?: Generation[]
    recentSpeech?: Generation[]
    recentVideos?: Generation[]
}

function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'just now'
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    const days = Math.floor(hrs / 24)
    return `${days}d ago`
}

export function DashboardSidebar({ email, fullName, avatarUrl, conversations, recentImages, recentSpeech, recentVideos }: Props) {
    const pathname = usePathname()
    const isTextGenerator = pathname === '/dashboard/text'
    const isImageGenerator = pathname === '/dashboard/image-prompt'
    const isSpeech = pathname === '/dashboard/text-to-speech'
    const isVideoGenerator = pathname === '/dashboard/video'
    const isSettingsMode = ['/dashboard/profile', '/dashboard/privacy', '/dashboard/terms', '/dashboard/api', '/dashboard/docs'].includes(pathname || '')
    const searchParams = useSearchParams()
    const activeCid = searchParams?.get('cid')
    const router = useRouter()

    return (
        <aside className="w-56 flex flex-col border-r border-white/10 bg-zinc-900/40 backdrop-blur-2xl">
            {/* Logo */}
            <div className="p-6 border-b border-white/5">
                <Link href="/dashboard">
                    <h1 className="text-xl font-medium tracking-wide flex items-center gap-2">
                        <span className="h-6 w-6 rounded-md bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
                            <span className="text-white text-xs font-bold leading-none">R</span>
                        </span>
                        Rive AI
                    </h1>
                </Link>
            </div>

            {isTextGenerator ? (
                <nav className="flex-1 p-4 flex flex-col gap-1 overflow-y-auto">
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-2 px-3 py-2 mb-3 text-zinc-400 hover:text-white text-xs font-medium uppercase tracking-widest transition-colors group"
                    >
                        <ArrowLeftIcon className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform" />
                        Overview
                    </Link>

                    <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 mb-4 text-left">
                        <TextIcon className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                        <span className="text-sm font-semibold text-indigo-300">Text Generator</span>
                    </div>
                </nav>

            ) : isImageGenerator ? (
                <nav className="flex-1 p-4 flex flex-col gap-1 overflow-y-auto">
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-2 px-3 py-2 mb-3 text-zinc-400 hover:text-white text-xs font-medium uppercase tracking-widest transition-colors group"
                    >
                        <ArrowLeftIcon className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform" />
                        Overview
                    </Link>

                    <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-purple-500/10 border border-purple-500/20 mb-4 text-left">
                        <ImageIcon className="w-4 h-4 text-purple-400 flex-shrink-0" />
                        <span className="text-sm font-semibold text-purple-300">Prompt to Image</span>
                    </div>
                </nav>

            ) : isSpeech ? (
                /* ── TEXT TO SPEECH MODE ── */
                <nav className="flex-1 p-4 flex flex-col gap-1 overflow-y-auto">
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-2 px-3 py-2 mb-3 text-zinc-400 hover:text-white text-xs font-medium uppercase tracking-widest transition-colors group"
                    >
                        <ArrowLeftIcon className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform" />
                        Overview
                    </Link>

                    <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 mb-4 text-left">
                        <SpeakerLoudIcon className="w-4 h-4 text-amber-400 flex-shrink-0" />
                        <span className="text-sm font-semibold text-amber-300">Text to Speech</span>
                    </div>
                </nav>

            ) : isVideoGenerator ? (
                /* ── VIDEO GENERATOR MODE ── */
                <nav className="flex-1 p-4 flex flex-col gap-1 overflow-y-auto">
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-2 px-3 py-2 mb-3 text-zinc-400 hover:text-white text-xs font-medium uppercase tracking-widest transition-colors group"
                    >
                        <ArrowLeftIcon className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform" />
                        Overview
                    </Link>

                    <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-red-500/10 border border-red-500/20 mb-4 text-left">
                        <VideoIcon className="w-4 h-4 text-red-400 flex-shrink-0" />
                        <span className="text-sm font-semibold text-red-300">Video Generator</span>
                    </div>
                </nav>

            ) : isSettingsMode ? (
                /* ── PROFILE MODE ── */
                <nav className="flex-1 p-4 flex flex-col gap-1 overflow-y-auto">
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-2 px-3 py-2 mb-3 text-zinc-400 hover:text-white text-xs font-medium uppercase tracking-widest transition-colors group"
                    >
                        <ArrowLeftIcon className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform" />
                        Overview
                    </Link>

                    <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 mb-4">
                        <PersonIcon className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                        <span className="text-sm font-semibold text-indigo-300">Settings</span>
                    </div>

                    <div className="pt-2 pb-2">
                        <p className="px-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Configuration</p>
                    </div>

                    <Link
                        href="/dashboard/profile"
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium ${pathname === '/dashboard/profile' ? 'bg-white/10 text-white' : 'hover:bg-white/10 text-zinc-300 hover:text-white'}`}
                    >
                        <PersonIcon className="w-4 h-4 text-zinc-400" />
                        Profile Edit
                    </Link>

                    <Link
                        href="/dashboard/notifications"
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium ${pathname === '/dashboard/notifications' ? 'bg-white/10 text-white' : 'hover:bg-white/10 text-zinc-300 hover:text-white'}`}
                    >
                        <Bell className="w-4 h-4 text-zinc-400" />
                        Activity Hub
                    </Link>



                    <Link
                        href="/dashboard/api"
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium ${pathname === '/dashboard/api' ? 'bg-white/10 text-white' : 'hover:bg-white/10 text-zinc-300 hover:text-white'}`}
                    >
                        <Link2Icon className="w-4 h-4 text-zinc-400" />
                        API Keys
                    </Link>

                    <Link
                        href="/dashboard/docs"
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium ${pathname === '/dashboard/docs' ? 'bg-white/10 text-white' : 'hover:bg-white/10 text-zinc-300 hover:text-white'}`}
                    >
                        <LayoutList className="w-4 h-4 text-zinc-400" />
                        API Documentation
                    </Link>

                    <div className="pt-6 pb-2">
                        <p className="px-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Legal</p>
                    </div>

                    <Link
                        href="/dashboard/privacy"
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium ${pathname === '/dashboard/privacy' ? 'bg-white/10 text-white' : 'hover:bg-white/10 text-zinc-300 hover:text-white'}`}
                    >
                        <LockClosedIcon className="w-4 h-4 text-zinc-400" />
                        Privacy Policy
                    </Link>

                    <Link
                        href="/dashboard/terms"
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium ${pathname === '/dashboard/terms' ? 'bg-white/10 text-white' : 'hover:bg-white/10 text-zinc-300 hover:text-white'}`}
                    >
                        <Link2Icon className="w-4 h-4 text-zinc-400" />
                        Terms of Service
                    </Link>
                </nav>

            ) : (
                /* ── DEFAULT MODE ── */
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    <Link
                        href="/dashboard"
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium ${pathname === '/dashboard' ? 'bg-white/10 text-white shadow-sm' : 'hover:bg-white/10 text-zinc-300 hover:text-white'}`}
                    >
                        <DashboardIcon className={`w-4 h-4 ${pathname === '/dashboard' ? 'text-indigo-400' : 'text-zinc-400'}`} />
                        Overview
                    </Link>

                    <Link
                        href="/dashboard/community"
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium ${pathname === '/dashboard/community' ? 'bg-white/10 text-white shadow-sm' : 'hover:bg-white/10 text-zinc-300 hover:text-white'}`}
                    >
                        <VenetianMask className={`w-4 h-4 ${pathname === '/dashboard/community' ? 'text-indigo-400' : 'text-zinc-400'}`} />
                        Explore Community
                    </Link>


                    <div className="pt-6 pb-2">
                        <p className="px-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">AI Tools</p>
                    </div>

                    <Link
                        href="/dashboard/text"
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium ${pathname === '/dashboard/text' ? 'bg-white/10 text-white shadow-sm' : 'hover:bg-white/10 text-zinc-300 hover:text-white'}`}
                    >
                        <TextIcon className={`w-4 h-4 ${pathname === '/dashboard/text' ? 'text-indigo-400' : 'text-[oklch(74.6%_0.16_232.661)]'}`} />
                        Text Generator
                    </Link>

                    <Link
                        href="/dashboard/image-prompt"
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium ${pathname === '/dashboard/image-prompt' ? 'bg-white/10 text-white shadow-sm' : 'hover:bg-white/10 text-zinc-300 hover:text-white'}`}
                    >
                        <ImageIcon className={`w-4 h-4 ${pathname === '/dashboard/image-prompt' ? 'text-purple-400' : 'text-[oklch(60.6%_0.25_292.717)]'}`} />
                        Prompt to Image
                    </Link>

                    <Link
                        href="/dashboard/text-to-speech"
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium ${pathname === '/dashboard/text-to-speech' ? 'bg-white/10 text-white shadow-sm' : 'hover:bg-white/10 text-zinc-300 hover:text-white'}`}
                    >
                        <SpeakerLoudIcon className={`w-4 h-4 ${pathname === '/dashboard/text-to-speech' ? 'text-amber-400' : 'text-amber-400/70'}`} />
                        Text to Speech
                    </Link>

                    <Link
                        href="/dashboard/video"
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium ${pathname === '/dashboard/video' ? 'bg-white/10 text-white shadow-sm' : 'hover:bg-white/10 text-zinc-300 hover:text-white'}`}
                    >
                        <VideoIcon className={`w-4 h-4 ${pathname === '/dashboard/video' ? 'text-red-400' : 'text-red-600'}`} />
                        Video Generator
                    </Link>

                    <div className="pt-6 pb-2">
                        <p className="px-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Account</p>
                    </div>

                    <Link
                        href="/dashboard/credits"
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium ${pathname === '/dashboard/credits' ? 'bg-white/10 text-white shadow-sm' : 'hover:bg-white/10 text-zinc-300 hover:text-white'}`}
                    >
                        <ClockIcon className={`w-4 h-4 ${pathname === '/dashboard/credits' ? 'text-indigo-400' : 'text-zinc-400'}`} />
                        Transactions History
                    </Link>

                    <Link
                        href="/dashboard/notifications"
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium ${pathname === '/dashboard/notifications' ? 'bg-white/10 text-white shadow-sm' : 'hover:bg-white/10 text-zinc-300 hover:text-white'}`}
                    >
                        <Bell className={`w-4 h-4 ${pathname === '/dashboard/notifications' ? 'text-violet-400' : 'text-zinc-400'}`} />
                        Activity Hub
                    </Link>

                    <Link
                        href="/dashboard/pricing"
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium ${pathname === '/dashboard/pricing' ? 'bg-white/10 text-white shadow-sm' : 'hover:bg-white/10 text-zinc-300 hover:text-white'}`}
                    >
                        <LayoutList className={`w-4 h-4 ${pathname === '/dashboard/pricing' ? 'text-indigo-400' : 'text-zinc-400'}`} />
                        Pricing Plans
                    </Link>

                    <Link
                        href="/dashboard/billing"
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium ${pathname === '/dashboard/billing' ? 'bg-white/10 text-white shadow-sm' : 'hover:bg-white/10 text-zinc-300 hover:text-white'}`}
                    >
                        <CardStackIcon className={`w-4 h-4 ${pathname === '/dashboard/billing' ? 'text-indigo-400' : 'text-zinc-400'}`} />
                        Billing
                    </Link>

                    <Link
                        href="/dashboard/api"
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium ${pathname === '/dashboard/api' ? 'bg-white/10 text-white shadow-sm' : 'hover:bg-white/10 text-zinc-300 hover:text-white'}`}
                    >
                        <Link2Icon className={`w-4 h-4 ${pathname === '/dashboard/api' ? 'text-indigo-400' : 'text-zinc-400'}`} />
                        API Keys
                    </Link>

                    <Link
                        href="/dashboard/docs"
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium ${pathname === '/dashboard/docs' ? 'bg-white/10 text-white shadow-sm' : 'hover:bg-white/10 text-zinc-300 hover:text-white'}`}
                    >
                        <LayoutList className={`w-4 h-4 ${pathname === '/dashboard/docs' ? 'text-indigo-400' : 'text-zinc-400'}`} />
                        API Documentation
                    </Link>

                </nav>
            )}

            <ClientSidebarProfile email={email} fullName={fullName} avatarUrl={avatarUrl} />
        </aside>
    )
}
