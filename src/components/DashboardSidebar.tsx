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
import { LayoutList } from 'lucide-react'
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
    const isSettingsMode = ['/dashboard/profile', '/dashboard/billing', '/dashboard/pricing', '/dashboard/privacy', '/dashboard/terms'].includes(pathname || '')
    const searchParams = useSearchParams()
    const activeCid = searchParams?.get('cid')
    const router = useRouter()

    return (
        <aside className="w-[260px] flex flex-col border-r border-white/10 bg-zinc-900/40 backdrop-blur-2xl">
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

                    <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 mb-4">
                        <TextIcon className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                        <span className="text-sm font-semibold text-indigo-300">Text Generator</span>
                    </div>

                    <div className="px-3 mb-2 flex items-center gap-2">
                        <ChatBubbleIcon className="w-3 h-3 text-zinc-500" />
                        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                            Recent Conversations
                        </p>
                    </div>

                    {conversations.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center gap-2 py-10 text-center">
                            <ChatBubbleIcon className="w-6 h-6 text-zinc-700" />
                            <p className="text-xs text-zinc-600 leading-relaxed max-w-[160px]">
                                No conversations yet. Start generating!
                            </p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-1">
                            {conversations.map((conv) => {
                                const isActive = activeCid === conv.id
                                return (
                                    <div
                                        key={conv.id}
                                        className={`group flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-white/5 transition-all ${isActive ? 'bg-white/10' : ''}`}
                                    >
                                        <Link href={`/dashboard/text?cid=${conv.id}`} className="flex-1">
                                            <p className="text-xs font-medium text-zinc-300 truncate mb-0.5 group-hover:text-white transition-colors">
                                                {conv.title.length > 38 ? conv.title.slice(0, 38) + '…' : conv.title}
                                            </p>
                                            <p className="text-[10px] text-zinc-700 mt-1">{timeAgo(conv.updated_at)}</p>
                                        </Link>
                                        <button
                                            onClick={async (e) => {
                                                e.stopPropagation()
                                                e.preventDefault()
                                                const confirmed = window.confirm('Delete this conversation?')
                                                if (!confirmed) return
                                                await deleteConversation(conv.id)
                                                if (conv.id === activeCid) {
                                                    router.push('/dashboard/text')
                                                } else {
                                                    router.refresh()
                                                }
                                            }}
                                            className="ml-2 text-zinc-500 hover:text-red-400 focus:outline-none"
                                            title="Delete conversation"
                                        >
                                            ×
                                        </button>
                                    </div>
                                )
                            })}
                        </div>
                    )}
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

                    <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-purple-500/10 border border-purple-500/20 mb-4">
                        <ImageIcon className="w-4 h-4 text-purple-400 flex-shrink-0" />
                        <span className="text-sm font-semibold text-purple-300">Prompt to Image</span>
                    </div>

                    <div className="px-3 mb-2 flex items-center gap-2">
                        <ImageIcon className="w-3 h-3 text-zinc-500" />
                        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Recent Images</p>
                    </div>

                    {!recentImages || recentImages.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center gap-2 py-10 text-center">
                            <ImageIcon className="w-6 h-6 text-zinc-700" />
                            <p className="text-xs text-zinc-600 leading-relaxed max-w-[160px]">
                                No images generated yet. Give it a try!
                            </p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-1">
                            {recentImages.map((gen) => (
                                <Link
                                    key={gen.id}
                                    href={`/dashboard/image-prompt?gid=${gen.id}`}
                                    className="group px-3 py-2.5 rounded-lg hover:bg-white/5 transition-all"
                                >
                                    <p className="text-xs font-medium text-zinc-300 truncate mb-0.5 group-hover:text-white transition-colors">
                                        {gen.prompt.length > 38 ? gen.prompt.slice(0, 38) + '…' : gen.prompt}
                                    </p>
                                    <div className="mt-1">
                                        <img
                                            src={`data:image/png;base64,${gen.result}`}
                                            alt="thumb"
                                            className="w-full h-auto rounded-sm"
                                        />
                                    </div>
                                    <p className="text-[10px] text-zinc-700 mt-1">{timeAgo(gen.created_at)}</p>
                                </Link>
                            ))}
                        </div>
                    )}
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

                    <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 mb-4">
                        <SpeakerLoudIcon className="w-4 h-4 text-amber-400 flex-shrink-0" />
                        <span className="text-sm font-semibold text-amber-300">Text to Speech</span>
                    </div>

                    <div className="px-3 mb-2 flex items-center gap-2">
                        <SpeakerLoudIcon className="w-3 h-3 text-zinc-500" />
                        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Recent Audio</p>
                    </div>

                    {!recentSpeech || recentSpeech.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center gap-2 py-10 text-center">
                            <SpeakerLoudIcon className="w-6 h-6 text-zinc-700" />
                            <p className="text-xs text-zinc-600 leading-relaxed max-w-[160px]">
                                No audio generated yet. Give it a try!
                            </p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-1">
                            {recentSpeech.map((gen) => (
                                <div
                                    key={gen.id}
                                    className="group px-3 py-2.5 rounded-lg hover:bg-white/5 transition-all"
                                >
                                    <p className="text-xs font-medium text-zinc-300 truncate mb-1.5 group-hover:text-white transition-colors">
                                        {gen.prompt.length > 38 ? gen.prompt.slice(0, 38) + '…' : gen.prompt}
                                    </p>
                                    <audio
                                        controls
                                        className="w-full h-7"
                                        src={`data:audio/mpeg;base64,${gen.result}`}
                                    />
                                    <p className="text-[10px] text-zinc-700 mt-1">{timeAgo(gen.created_at)}</p>
                                </div>
                            ))}
                        </div>
                    )}
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

                    <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-red-500/10 border border-red-500/20 mb-4">
                        <VideoIcon className="w-4 h-4 text-red-400 flex-shrink-0" />
                        <span className="text-sm font-semibold text-red-300">Video Generator</span>
                    </div>

                    <div className="px-3 mb-2 flex items-center gap-2">
                        <VideoIcon className="w-3 h-3 text-zinc-500" />
                        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Recent Videos</p>
                    </div>

                    {!recentVideos || recentVideos.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center gap-2 py-10 text-center">
                            <VideoIcon className="w-6 h-6 text-zinc-700" />
                            <p className="text-xs text-zinc-600 leading-relaxed max-w-[160px]">
                                No videos generated yet. Give it a try!
                            </p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-1">
                            {recentVideos.map((gen) => (
                                <div
                                    key={gen.id}
                                    className="group flex flex-col gap-1 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-all relative"
                                >
                                    <div className="flex items-start justify-between">
                                        <p className="text-xs font-medium text-zinc-300 truncate mb-1 group-hover:text-white transition-colors flex-1 pr-4">
                                            {gen.prompt.length > 38 ? gen.prompt.slice(0, 38) + '…' : gen.prompt}
                                        </p>
                                    </div>
                                    <div className="mt-1">
                                        <video
                                            src={gen.result}
                                            controls
                                            className="w-full h-auto rounded-sm bg-black/20"
                                        />
                                    </div>
                                    <div className="flex justify-between items-center mt-1">
                                        <p className="text-[10px] text-zinc-700">{timeAgo(gen.created_at)}</p>
                                        <button
                                            onClick={async (e) => {
                                                e.stopPropagation()
                                                e.preventDefault()
                                                const confirmed = window.confirm('Delete this video?')
                                                if (!confirmed) return

                                                try {
                                                    const res = await fetch(`/api/video/delete?id=${gen.id}`, { method: 'DELETE' })
                                                    if (!res.ok) throw new Error('Failed to delete')
                                                    router.refresh()
                                                } catch (err) {
                                                    console.error('Delete error:', err)
                                                    alert('Failed to delete video.')
                                                }
                                            }}
                                            className="text-zinc-500 hover:text-red-400 transition-colors"
                                            title="Delete video"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" /></svg>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
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
                        href="/dashboard/billing"
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium ${pathname === '/dashboard/billing' ? 'bg-white/10 text-white' : 'hover:bg-white/10 text-zinc-300 hover:text-white'}`}
                    >
                        <CardStackIcon className="w-4 h-4 text-zinc-400" />
                        Billing
                    </Link>

                    <Link
                        href="/dashboard/pricing"
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium ${pathname === '/dashboard/pricing' ? 'bg-white/10 text-white' : 'hover:bg-white/10 text-zinc-300 hover:text-white'}`}
                    >
                        <LayoutList className="w-4 h-4 text-zinc-400" />
                        Pricing Plans
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





                </nav>
            )}

            <ClientSidebarProfile email={email} fullName={fullName} avatarUrl={avatarUrl} />
        </aside>
    )
}
