'use client'

import React from 'react'
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar,
    LineChart, Line,
    PieChart, Pie, Cell,
    RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
    RadialBarChart, RadialBar, Legend
} from 'recharts'
import {
    BarChartIcon,
    PieChartIcon,
    ActivityLogIcon,
    LayersIcon,
    TargetIcon,
    TextIcon,
    ImageIcon,
    VideoIcon,
    SpeakerLoudIcon
} from '@radix-ui/react-icons'

import { ChatDataPoint, OverviewAnalytics } from '@/app/dashboard/overview-actions'
import {
    ChartContainer,
    ChartTooltip as ChartUITooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart"

type Props = {
    analytics: OverviewAnalytics
}

const COLORS = {
    text: '#818cf8', // Indigo 400
    image: '#c084fc', // Purple 400
    audio: '#fbbf24', // Amber 400
    video: '#f87171', // Red 400
    credits: '#10b981' // Emerald 500
}

const chartConfig = {
    text: { label: "Text", color: COLORS.text },
    image: { label: "Image", color: COLORS.image },
    audio: { label: "Audio", color: COLORS.audio },
    video: { label: "Video", color: COLORS.video },
} satisfies ChartConfig

import { AnimatedTabs } from '@/components/ui/animated-tabs'

export function DashboardCharts({ analytics }: Props) {
    const { trendData, totals, totalGenerations } = analytics

    // For Pie & Radial
    const pieData = [
        { name: 'Text', value: totals.text, fill: COLORS.text },
        { name: 'Image', value: totals.image, fill: COLORS.image },
        { name: 'Audio', value: totals.audio, fill: COLORS.audio },
        { name: 'Video', value: totals.video, fill: COLORS.video },
    ].filter(d => d.value > 0)

    // For Radar
    const radarData = [
        { subject: 'Text', A: totals.text, fullMark: totalGenerations },
        { subject: 'Image', A: totals.image, fullMark: totalGenerations },
        { subject: 'Audio', A: totals.audio, fullMark: totalGenerations },
        { subject: 'Video', A: totals.video, fullMark: totalGenerations },
    ]

    // Custom Tooltip component for Shadcn-like appearance
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-zinc-950/90 border border-white/10 p-3 rounded-lg shadow-xl backdrop-blur-md">
                    <p className="text-zinc-400 text-xs font-semibold mb-2">{label}</p>
                    {payload.map((entry: any, index: number) => (
                        <div key={index} className="flex items-center gap-2 mb-1">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color || entry.fill || COLORS[entry.name.toLowerCase() as keyof typeof COLORS] }} />
                            <span className="text-sm text-zinc-200 capitalize w-16">{entry.name}</span>
                            <span className="text-sm font-bold text-white">{entry.value}</span>
                        </div>
                    ))}
                </div>
            )
        }
        return null
    }

    if (trendData.length === 0) {
        return <div className="text-zinc-500 text-sm mt-8">No generation data gathered yet. Try generating some content!</div>
    }

    const tabs = [
        {
            id: 'overview',
            label: 'Overview',
            content: (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* 1. Area Chart */}
                    <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-6 backdrop-blur-xl flex flex-col h-[350px]">
                        <div className="flex items-center gap-2 mb-4">
                            <ActivityLogIcon className="w-5 h-5 text-indigo-400" />
                            <h3 className="text-sm font-semibold text-zinc-200">Usage Over Time (Area)</h3>
                        </div>
                        <div className="flex-1 w-full min-h-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={trendData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorText" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={COLORS.text} stopOpacity={0.3} />
                                            <stop offset="95%" stopColor={COLORS.text} stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorImage" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={COLORS.image} stopOpacity={0.3} />
                                            <stop offset="95%" stopColor={COLORS.image} stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                                    <XAxis dataKey="date" stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => val.slice(5)} />
                                    <YAxis stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Area type="monotone" dataKey="text" stroke={COLORS.text} fillOpacity={1} fill="url(#colorText)" strokeWidth={2} />
                                    <Area type="monotone" dataKey="image" stroke={COLORS.image} fillOpacity={1} fill="url(#colorImage)" strokeWidth={2} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* 2. Advanced Stacked Bar */}
                    <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-6 backdrop-blur-xl flex flex-col h-[350px]">
                        <div className="flex items-center gap-2 mb-4">
                            <LayersIcon className="w-5 h-5 text-amber-400" />
                            <h3 className="text-sm font-semibold text-zinc-200">Requests Breakdown</h3>
                        </div>
                        <div className="flex-1 w-full min-h-0">
                            <ChartContainer config={chartConfig} className="w-full h-full">
                                <BarChart accessibilityLayer data={trendData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                                    <XAxis
                                        dataKey="date"
                                        tickLine={false}
                                        tickMargin={10}
                                        axisLine={false}
                                        tickFormatter={(value) => {
                                            return new Date(value).toLocaleDateString("en-US", {
                                                weekday: "short",
                                            })
                                        }}
                                    />
                                    <Bar dataKey="text" stackId="a" fill="var(--color-text)" radius={[0, 0, 4, 4]} />
                                    <Bar dataKey="image" stackId="a" fill="var(--color-image)" radius={[0, 0, 0, 0]} />
                                    <Bar dataKey="audio" stackId="a" fill="var(--color-audio)" radius={[0, 0, 0, 0]} />
                                    <Bar dataKey="video" stackId="a" fill="var(--color-video)" radius={[4, 4, 0, 0]} />
                                    <ChartUITooltip
                                        content={
                                            <ChartTooltipContent
                                                hideLabel
                                                className="w-[180px] bg-zinc-950/95 border-white/10"
                                                formatter={(value, name, item, index) => (
                                                    <>
                                                        <div
                                                            className="h-2.5 w-2.5 shrink-0 rounded-[2px] bg-(--color-bg)"
                                                            style={
                                                                {
                                                                    "--color-bg": `var(--color-${name})`,
                                                                } as React.CSSProperties
                                                            }
                                                        />
                                                        {chartConfig[name as keyof typeof chartConfig]?.label ||
                                                            name}
                                                        <div className="ml-auto flex items-baseline gap-0.5 font-mono font-medium text-white tabular-nums">
                                                            {value}
                                                        </div>
                                                        {index === 3 && (
                                                            <div className="mt-1.5 flex basis-full items-center border-t border-white/10 pt-1.5 text-xs font-medium text-white">
                                                                Total
                                                                <div className="ml-auto flex items-baseline gap-0.5 font-mono font-medium text-white tabular-nums">
                                                                    {Number(item.payload.text || 0) + Number(item.payload.image || 0) + Number(item.payload.audio || 0) + Number(item.payload.video || 0)}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </>
                                                )}
                                            />
                                        }
                                        cursor={false}
                                    />
                                </BarChart>
                            </ChartContainer>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 'distribution',
            label: 'Distribution',
            content: (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* 4. Pie Chart */}
                    <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-6 backdrop-blur-xl flex flex-col h-[350px]">
                        <div className="flex items-center gap-2 mb-4">
                            <PieChartIcon className="w-5 h-5 text-red-400" />
                            <h3 className="text-sm font-semibold text-zinc-200">Tools Distribution</h3>
                        </div>
                        <div className="flex-1 w-full min-h-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        outerRadius={100}
                                        fill="#8884d8"
                                        dataKey="value"
                                        stroke="#18181b"
                                        strokeWidth={2}
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* 5. Radar Chart */}
                    <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-6 backdrop-blur-xl flex flex-col h-[350px]">
                        <div className="flex items-center gap-2 mb-4">
                            <TargetIcon className="w-5 h-5 text-indigo-400" />
                            <h3 className="text-sm font-semibold text-zinc-200">Activity Dimensions</h3>
                        </div>
                        <div className="flex-1 w-full min-h-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius={100} data={radarData}>
                                    <PolarGrid stroke="#3f3f46" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#a1a1aa', fontSize: 12 }} />
                                    <PolarRadiusAxis angle={30} domain={[0, Math.max(10, totalGenerations)]} tick={false} axisLine={false} />
                                    <Radar name="Generations" dataKey="A" stroke={COLORS.image} fill={COLORS.image} fillOpacity={0.4} />
                                    <Tooltip content={<CustomTooltip />} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 'performance',
            label: 'Performance',
            content: (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* 3. Line Chart */}
                    <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-6 backdrop-blur-xl flex flex-col h-[350px]">
                        <div className="flex items-center gap-2 mb-4">
                            <ActivityLogIcon className="w-5 h-5 text-emerald-400" />
                            <h3 className="text-sm font-semibold text-zinc-200">Credits Usage (Line)</h3>
                        </div>
                        <div className="flex-1 w-full min-h-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={trendData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                                    <XAxis dataKey="date" stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => val.slice(5)} />
                                    <YAxis stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Line type="monotone" dataKey="credits" name="Credits" stroke={COLORS.credits} strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Standard Bar for context */}
                    <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-6 backdrop-blur-xl flex flex-col h-[350px]">
                        <div className="flex items-center gap-2 mb-4">
                            <BarChartIcon className="w-5 h-5 text-purple-400" />
                            <h3 className="text-sm font-semibold text-zinc-200">Daily Requests (Bar)</h3>
                        </div>
                        <div className="flex-1 w-full min-h-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={trendData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                                    <XAxis dataKey="date" stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => val.slice(5)} />
                                    <YAxis stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} />
                                    <Tooltip content={<CustomTooltip />} cursor={{ fill: '#27272a', opacity: 0.4 }} />
                                    <Bar dataKey="audio" stackId="a" fill={COLORS.audio} radius={[0, 0, 4, 4]} />
                                    <Bar dataKey="video" stackId="a" fill={COLORS.video} radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            )
        }
    ]

    return (
        <div className="mt-8 space-y-10">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-zinc-900/40 border border-indigo-500/20 rounded-2xl p-6 backdrop-blur-xl">
                    <div className="flex items-center gap-2 text-indigo-400 mb-2">
                        <TextIcon className="w-4 h-4" />
                        <h4 className="text-xs font-semibold uppercase tracking-wider">Total Texts</h4>
                    </div>
                    <p className="text-3xl font-bold text-white">{totals.text}</p>
                </div>
                <div className="bg-zinc-900/40 border border-purple-500/20 rounded-2xl p-6 backdrop-blur-xl">
                    <div className="flex items-center gap-2 text-purple-400 mb-2">
                        <ImageIcon className="w-4 h-4" />
                        <h4 className="text-xs font-semibold uppercase tracking-wider">Total Images</h4>
                    </div>
                    <p className="text-3xl font-bold text-white">{totals.image}</p>
                </div>
                <div className="bg-zinc-900/40 border border-amber-500/20 rounded-2xl p-6 backdrop-blur-xl">
                    <div className="flex items-center gap-2 text-amber-400 mb-2">
                        <SpeakerLoudIcon className="w-4 h-4" />
                        <h4 className="text-xs font-semibold uppercase tracking-wider">Total Audio</h4>
                    </div>
                    <p className="text-3xl font-bold text-white">{totals.audio}</p>
                </div>
                <div className="bg-zinc-900/40 border border-red-500/20 rounded-2xl p-6 backdrop-blur-xl">
                    <div className="flex items-center gap-2 text-red-400 mb-2">
                        <VideoIcon className="w-4 h-4" />
                        <h4 className="text-xs font-semibold uppercase tracking-wider">Total Videos</h4>
                    </div>
                    <p className="text-3xl font-bold text-white">{totals.video}</p>
                </div>
            </div>

            <div className="pt-4 border-t border-white/5">
                <AnimatedTabs tabs={tabs} />
            </div>
        </div>
    )
}
