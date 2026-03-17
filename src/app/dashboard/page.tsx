"use client";

import Link from 'next/link'
import { TextIcon, ImageIcon, SpeakerLoudIcon, ArrowRightIcon, DashboardIcon } from '@radix-ui/react-icons'
import HalideLanding from '@/components/ui/demo'
import { fetchOverviewAnalytics } from '@/app/dashboard/overview-actions'
import { DashboardCharts } from '@/components/charts/DashboardCharts'
import { FileText, MessageSquare, Image, Volume2, Video, ArrowRight, Box } from "lucide-react"
import { GlowingEffect } from "@/components/ui/glowing-effect"
import { cn } from "@/lib/utils"
import { useSidebar } from '@/components/SidebarContext'
import { useEffect, useState } from 'react'

export default function DashboardPage() {
    const [analytics, setAnalytics] = useState<any>(null);
    const { sidebarVersion } = useSidebar();

    useEffect(() => {
        fetchOverviewAnalytics().then(setAnalytics);
    }, []);

    return (
        <div className="max-w-5xl mx-auto space-y-10 fade-in pb-20">
            {/* Page Header */}
            <div className="space-y-1 -mt-4">
                <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3 font-outfit">
                    <DashboardIcon className="w-7 h-7 text-indigo-500" />
                    Overview
                </h1>
                <p className="text-base text-zinc-500 font-medium">
                    Welcome back! Here's a summary of your premium AI studio activity.
                </p>
            </div>

            {/* Hero */}
            <div className="relative pt-4">
                <HalideLanding />
            </div>

            {/* Analytics Section */}
            <div className="pt-8">
                {analytics && <DashboardCharts analytics={analytics} />}
            </div>

            {/* Tools Grid Header */}
            <div className="mt-20 mb-8">
                <h2 className="text-2xl font-bold text-white tracking-tight font-outfit">Creative Engines</h2>
                <p className="text-zinc-500 font-medium mt-1">Select a specialized neural tool to start your workflow.</p>
            </div>

            {/* Conditional Tools Design */}
            {sidebarVersion === "v2" ? (
                <div className="pb-20">
                    <GlowingGrid />
                </div>
            ) : (
                <div className="space-y-4 pb-12">
                    {/* Legacy Design */}
                    <Link href="/dashboard/text" className="group block">
                        <div className="relative rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900/30 overflow-hidden transition-all duration-500 hover:border-indigo-500/30 hover:bg-zinc-50 dark:hover:bg-zinc-900/60 shadow-sm dark:shadow-none">
                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-indigo-500 to-indigo-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                            <div className="relative flex items-center justify-between p-8">
                                <div className="flex items-center gap-6">
                                    <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white group-hover:scale-110 transition-all duration-300 flex-shrink-0">
                                        <TextIcon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Text Generator</h3>
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 px-2 py-0.5 rounded-full">AI Chat</span>
                                        </div>
                                        <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed max-w-md">
                                            Have a conversation with Llama 3.2. Generate blog posts, marketing copy, scripts, emails — anything you can imagine.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0 flex-shrink-0 ml-6">
                                    Start writing <ArrowRightIcon className="w-4 h-4" />
                                </div>
                            </div>
                        </div>
                    </Link>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Link href="/dashboard/image-prompt" className="group block">
                            <div className="relative rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900/30 overflow-hidden transition-all duration-500 hover:border-purple-500/30 hover:bg-zinc-50 dark:hover:bg-zinc-900/60 h-full shadow-sm dark:shadow-none">
                                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-purple-500 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                <div className="relative p-8 flex flex-col h-full">
                                    <div className="w-14 h-14 rounded-2xl bg-purple-50 dark:bg-purple-500/10 border border-purple-100 dark:border-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover:bg-purple-500 group-hover:text-white group-hover:scale-110 transition-all duration-300 mb-5">
                                        <ImageIcon className="w-6 h-6" />
                                    </div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Prompt to Image</h3>
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10 border border-purple-100 dark:border-purple-500/20 px-2 py-0.5 rounded-full">Flux</span>
                                    </div>
                                    <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed flex-1">
                                        Describe any image and watch it come to life. Powered by Flux AI generation.
                                    </p>
                                    <div className="flex items-center gap-2 text-sm font-medium text-purple-400 mt-6 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0">
                                        Generate image <ArrowRightIcon className="w-4 h-4" />
                                    </div>
                                </div>
                            </div>
                        </Link>

                        <Link href="/dashboard/text-to-speech" className="group block">
                            <div className="relative rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900/30 overflow-hidden transition-all duration-500 hover:border-amber-500/30 hover:bg-zinc-50 dark:hover:bg-zinc-900/60 h-full shadow-sm dark:shadow-none">
                                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-amber-500 to-amber-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                <div className="relative p-8 flex flex-col h-full">
                                    <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 group-hover:bg-amber-500 group-hover:text-white group-hover:scale-110 transition-all duration-300 mb-5">
                                        <SpeakerLoudIcon className="w-6 h-6" />
                                    </div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Text to Speech</h3>
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 px-2 py-0.5 rounded-full">ElevenLabs</span>
                                    </div>
                                    <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed flex-1">
                                        Convert any text into natural-sounding audio with ElevenLabs.
                                    </p>
                                    <div className="flex items-center gap-2 text-sm font-medium text-amber-400 mt-6 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0">
                                        Generate audio <ArrowRightIcon className="w-4 h-4" />
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </div>
                </div>
            )}
        </div>
    )
}

function GlowingGrid() {
    return (
        <ul className="grid grid-cols-1 grid-rows-none gap-4 md:grid-cols-12 md:grid-rows-3 lg:gap-4 xl:max-h-[34rem] xl:grid-rows-2">
            <GridItem
                area="md:[grid-area:1/1/2/7] xl:[grid-area:1/1/2/5]"
                icon={<FileText className="h-5 w-5" />}
                title="Text Generator"
                description="Generate blog posts, marketing copy, scripts, and emails with Llama 3.2."
                href="/dashboard/text"
                badge="Pro"
            />
            <GridItem
                area="md:[grid-area:1/7/2/13] xl:[grid-area:2/1/3/5]"
                icon={<MessageSquare className="h-5 w-5" />}
                title="AI Chat"
                description="Have a natural conversation with our advanced AI assistant."
                href="/dashboard/text"
                badge="New"
            />
            <GridItem
                area="md:[grid-area:2/1/3/7] xl:[grid-area:1/5/3/8]"
                icon={<Image className="h-5 w-5" />}
                title="Prompt to Image"
                description="Describe any image and watch it come to life. Powered by Flux AI."
                href="/dashboard/image-prompt"
                badge="Flux"
            />
            <GridItem
                area="md:[grid-area:2/7/3/13] xl:[grid-area:1/8/2/13]"
                icon={<Volume2 className="h-5 w-5" />}
                title="Text to Speech"
                description="Convert any text into natural-sounding audio with ElevenLabs voices."
                href="/dashboard/text-to-speech"
                badge="Premium"
            />
            <GridItem
                area="md:[grid-area:3/1/4/7] xl:[grid-area:2/5/3/9]"
                icon={<Video className="h-5 w-5" />}
                title="Instant Video"
                description="Transform your prompts and scripts into professional video content."
                href="/dashboard/video"
                badge="Soon"
                disabled
            />
            <GridItem
                area="md:[grid-area:3/7/4/13] xl:[grid-area:2/9/3/13]"
                icon={<Box className="h-5 w-5" />}
                title="3D Generation"
                description="Convert text or images into high-fidelity 3D assets for games and AR."
                href="/dashboard/3d"
                badge="New"
            />
        </ul>
    );
}

interface GridItemProps {
    area: string;
    icon: React.ReactNode;
    title: string;
    description: React.ReactNode;
    href: string;
    badge?: string;
    disabled?: boolean;
}

const GridItem = ({ area, icon, title, description, href, badge, disabled }: GridItemProps) => {
    return (
        <li className={cn("min-h-[14rem] list-none", area)}>
            <Link href={href} className={cn("block h-full transition-transform active:scale-[0.98]", disabled && "pointer-events-none opacity-80")}>
                <div className="relative h-full rounded-[1.25rem] border-[0.75px] border-zinc-200 dark:border-white/10 p-2 md:rounded-[1.5rem] md:p-3 bg-white/50 dark:bg-zinc-900/10 backdrop-blur-sm shadow-sm dark:shadow-none group">
                    <GlowingEffect
                        spread={40}
                        glow={true}
                        disabled={false}
                        proximity={64}
                        inactiveZone={0.01}
                        borderWidth={3}
                    />
                    <div className="relative flex h-full flex-col justify-between gap-6 overflow-hidden rounded-xl border-[0.75px] border-zinc-200 dark:border-white/5 bg-white/80 dark:bg-zinc-950/50 p-6 shadow-sm transition-all group-hover:bg-zinc-50 dark:group-hover:bg-zinc-900/50">
                        <div className="relative flex flex-1 flex-col justify-between gap-3">
                            <div className="flex items-center justify-between">
                                <div className="w-10 h-10 rounded-lg border-[0.75px] border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/5 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                    {icon}
                                </div>
                                {badge && (
                                    <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                                        {badge}
                                    </span>
                                )}
                            </div>
                            <div className="space-y-3">
                                <h3 className="text-xl font-bold tracking-tight text-white font-outfit">
                                    {title}
                                </h3>
                                <p className="text-sm leading-relaxed text-zinc-500 font-medium">
                                    {description}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-indigo-400 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-1 group-hover:translate-x-0">
                            {disabled ? "Coming Soon" : "Get Started"} <ArrowRight className="h-3 w-3" />
                        </div>
                    </div>
                </div>
            </Link>
        </li>
    );
};