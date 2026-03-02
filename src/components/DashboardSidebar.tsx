'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
    DashboardIcon,
    TextIcon,
    ImageIcon,
    TextAlignJustifyIcon,
    ClockIcon,
    ArrowLeftIcon,
    ChatBubbleIcon,
} from '@radix-ui/react-icons'
import { ClientSidebarProfile } from '@/components/ClientSidebarProfile'

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
    recentGenerations: Generation[]
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

export function DashboardSidebar({ email, fullName, recentGenerations }: Props) {
    const pathname = usePathname()
    const isTextGenerator = pathname === '/dashboard/text'

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
                /* ── TEXT GENERATOR MODE: show history ── */
                <nav className="flex-1 p-4 flex flex-col gap-1 overflow-y-auto">
                    {/* Back link */}
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-2 px-3 py-2 mb-3 text-zinc-400 hover:text-white text-xs font-medium uppercase tracking-widest transition-colors group"
                    >
                        <ArrowLeftIcon className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform" />
                        Overview
                    </Link>

                    {/* Active tool indicator */}
                    <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 mb-4">
                        <TextIcon className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                        <span className="text-sm font-semibold text-indigo-300">Text Generator</span>
                    </div>

                    {/* History header */}
                    <div className="px-3 mb-2 flex items-center gap-2">
                        <ChatBubbleIcon className="w-3 h-3 text-zinc-500" />
                        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                            Recent Conversations
                        </p>
                    </div>

                    {recentGenerations.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center gap-2 py-10 text-center">
                            <ChatBubbleIcon className="w-6 h-6 text-zinc-700" />
                            <p className="text-xs text-zinc-600 leading-relaxed max-w-[160px]">
                                No conversations yet. Start generating!
                            </p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-1">
                            {recentGenerations.map((gen) => (
                                <div
                                    key={gen.id}
                                    className="group px-3 py-2.5 rounded-lg hover:bg-white/5 cursor-default transition-all"
                                >
                                    {/* Prompt (truncated title) */}
                                    <p className="text-xs font-medium text-zinc-300 truncate mb-0.5 group-hover:text-white transition-colors">
                                        {gen.prompt.length > 38
                                            ? gen.prompt.slice(0, 38) + '…'
                                            : gen.prompt}
                                    </p>
                                    {/* Result snippet */}
                                    <p className="text-[11px] text-zinc-600 leading-relaxed line-clamp-2">
                                        {gen.result.slice(0, 80)}…
                                    </p>
                                    {/* Timestamp */}
                                    <p className="text-[10px] text-zinc-700 mt-1">
                                        {timeAgo(gen.created_at)}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </nav>
            ) : (
                /* ── DEFAULT MODE: show tools ── */
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/10 text-zinc-300 hover:text-white transition-all text-sm font-medium"
                    >
                        <DashboardIcon className="w-4 h-4 text-zinc-400" />
                        Overview
                    </Link>

                    <div className="pt-6 pb-2">
                        <p className="px-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                            AI Tools
                        </p>
                    </div>

                    <Link
                        href="/dashboard/text"
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/10 text-zinc-300 hover:text-white transition-all text-sm font-medium"
                    >
                        <TextIcon className="w-4 h-4 text-zinc-400" />
                        Text Generator
                    </Link>

                    <Link
                        href="/dashboard/image-prompt"
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/10 text-zinc-300 hover:text-white transition-all text-sm font-medium"
                    >
                        <ImageIcon className="w-4 h-4 text-zinc-400" />
                        Image to Prompt
                    </Link>

                    <Link
                        href="/dashboard/summarize"
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/10 text-zinc-300 hover:text-white transition-all text-sm font-medium"
                    >
                        <TextAlignJustifyIcon className="w-4 h-4 text-zinc-400" />
                        Summarizer
                    </Link>

                    <div className="pt-6 pb-2">
                        <p className="px-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                            Account
                        </p>
                    </div>

                    <Link
                        href="/dashboard/credits"
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/10 text-zinc-300 hover:text-white transition-all text-sm font-medium"
                    >
                        <ClockIcon className="w-4 h-4 text-zinc-400" />
                        Transactions History
                    </Link>
                </nav>
            )}

            <ClientSidebarProfile email={email} fullName={fullName} />
        </aside>
    )
}
