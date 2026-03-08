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
                <div className="bg-white/90 dark:bg-zinc-950/90 border border-zinc-200 dark:border-white/10 p-3 rounded-lg shadow-xl backdrop-blur-md">
                    <p className="text-zinc-500 dark:text-zinc-400 text-xs font-semibold mb-2">{label}</p>
                    {payload.map((entry: any, index: number) => (
                        <div key={index} className="flex items-center gap-2 mb-1">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color || entry.fill || COLORS[entry.name.toLowerCase() as keyof typeof COLORS] }} />
                            <span className="text-sm text-zinc-600 dark:text-zinc-200 capitalize w-16">{entry.name}</span>
                            <span className="text-sm font-bold text-zinc-900 dark:text-white">{entry.value}</span>
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
                    <div className="bg-white/50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-white/5 rounded-2xl p-6 backdrop-blur-xl flex flex-col h-[350px]">
                        <div className="flex items-center gap-2 mb-4">
                            <ActivityLogIcon className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
                            <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">Usage Over Time (Area)</h3>
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
                    <div className="bg-white/50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-white/5 rounded-2xl p-6 backdrop-blur-xl flex flex-col h-[350px]">
                        <div className="flex items-center gap-2 mb-4">
                            <LayersIcon className="w-5 h-5 text-amber-500 dark:text-amber-400" />
                            <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">Requests Breakdown</h3>
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
                    <div className="bg-white/50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-white/5 rounded-2xl p-6 backdrop-blur-xl flex flex-col h-[350px]">
                        <div className="flex items-center gap-2 mb-4">
                            <PieChartIcon className="w-5 h-5 text-red-500 dark:text-red-400" />
                            <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">Tools Distribution</h3>
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
                    <div className="bg-white/50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-white/5 rounded-2xl p-6 backdrop-blur-xl flex flex-col h-[350px]">
                        <div className="flex items-center gap-2 mb-4">
                            <TargetIcon className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
                            <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">Activity Dimensions</h3>
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
                    <div className="bg-white/50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-white/5 rounded-2xl p-6 backdrop-blur-xl flex flex-col h-[350px]">
                        <div className="flex items-center gap-2 mb-4">
                            <ActivityLogIcon className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
                            <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">Credits Usage (Line)</h3>
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
                    <div className="bg-white/50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-white/5 rounded-2xl p-6 backdrop-blur-xl flex flex-col h-[350px]">
                        <div className="flex items-center gap-2 mb-4">
                            <BarChartIcon className="w-5 h-5 text-purple-500 dark:text-purple-400" />
                            <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">Daily Requests (Bar)</h3>
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
        <div className="mt-8 space-y-12">
            {/* Quick Stats Grid - 3D Redesign */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-8 justify-items-center">
                <StatCard
                    title="Total Texts"
                    value={totals.text}
                    icon={<TextIcon className="w-5 h-5" />}
                    color="#818cf8"
                    label="CHARACTERS"
                    subValue={`${Math.round(totals.text * 0.1)} CREDITS`}
                />
                <StatCard
                    title="Total Images"
                    value={totals.image}
                    icon={<ImageIcon className="w-5 h-5" />}
                    color="#c084fc"
                    label="GENERATIONS"
                    subValue={`${totals.image * 10} CREDITS`}
                />
                <StatCard
                    title="Total Audio"
                    value={totals.audio}
                    icon={<SpeakerLoudIcon className="w-5 h-5" />}
                    color="#fbbf24"
                    label="SECONDS"
                    subValue={`${totals.audio * 5} CREDITS`}
                />
                <StatCard
                    title="Total Videos"
                    value={totals.video}
                    icon={<VideoIcon className="w-5 h-5" />}
                    color="#f87171"
                    label="CLIPS"
                    subValue={`${totals.video * 20} CREDITS`}
                />
            </div>

            <div className="pt-8 border-t border-white/5">
                <AnimatedTabs tabs={tabs} />
            </div>
        </div>
    )
}

function StatCard({ title, value, icon, color, label, subValue }: { title: string, value: number, icon: React.ReactNode, color: string, label: string, subValue: string }) {
    return (
        <div className="parent-container">
            <div className="parent">
                <div className="a tl"></div>
                <div className="a t"></div>
                <div className="a tr"></div>
                <div className="a l"></div>
                <div className="a c"></div>
                <div className="a r"></div>
                <div className="a bl"></div>
                <div className="a b"></div>
                <div className="a br"></div>
                <div className="card">
                    <svg height="300" width="300" className="outer bb">
                        <path
                            className="bak"
                            pathLength="360"
                            d="M0 110V70A70 70 135 0170 0H230A70 70 45 01300 70L300 110A40 40 135 01260 150H40A40 40 0 000 190V230A70 70 45 0070 300H230A70 70 135 00300 230V190"
                        ></path>
                        <path
                            className="bak20"
                            pathLength="360"
                            d="M0 110V70A70 70 135 0170 0H230A70 70 45 01300 70L300 110A40 40 135 01260 150H40A40 40 0 000 190V230A70 70 45 0070 300H230A70 70 135 00300 230V190"
                        ></path>
                        <path
                            className="blur patt"
                            pathLength="360"
                            d="M0 110V70A70 70 135 0170 0H230A70 70 45 01300 70L300 110A40 40 135 01260 150H40A40 40 0 000 190V230A70 70 45 0070 300H230A70 70 135 00300 230V190"
                        ></path>
                        <path
                            className="patt"
                            pathLength="360"
                            d="M0 110V70A70 70 135 0170 0H230A70 70 45 01300 70L300 110A40 40 135 01260 150H40A40 40 0 000 190V230A70 70 45 0070 300H230A70 70 135 00300 230V190"
                        ></path>
                    </svg>
                    <svg height="300" width="300" style={{ "--z": -1 } as any} className="outer bb1">
                        <path
                            className="patt"
                            pathLength="360"
                            d="M0 110V70A70 70 135 0170 0H230A70 70 45 01300 70L300 110A40 40 135 01260 150H40A40 40 0 000 190V230A70 70 45 0070 300H230A70 70 135 00300 230V190"
                        ></path>
                    </svg>
                    <svg height="300" width="300" style={{ "--z": 0 } as any} className="outer bb1">
                        <path
                            className="patt"
                            pathLength="360"
                            d="M0 110V70A70 70 135 0170 0H230A70 70 45 01300 70L300 110A40 40 135 01260 150H40A40 40 0 000 190V230A70 70 45 0070 300H230A70 70 135 00300 230V190"
                        ></path>
                    </svg>
                    <svg height="300" width="300" style={{ "--z": 1 } as any} className="outer bb1">
                        <path
                            className="patt"
                            pathLength="360"
                            d="M0 110V70A70 70 135 0170 0H230A70 70 45 01300 70L300 110A40 40 135 01260 150H40A40 40 0 000 190V230A70 70 45 0070 300H230A70 70 135 00300 230V190"
                        ></path>
                    </svg>
                    <div className="inner-blur-thing" style={{ background: color + '22' }}></div>
                    <div className="inner">
                        <div className="inner-bg" style={{ background: `conic-gradient(from 45deg, ${color} 5%, #fff0 10% 40%, ${color} 45% 55%, #fff0 60% 90%, ${color} 95%)` }}></div>
                    </div>
                    <div style={{ "--z": -3 } as any} className="inner-border"></div>
                    <div style={{ "--z": 0 } as any} className="inner-border"></div>
                    <div style={{ "--z": 3 } as any} className="inner-border"></div>
                    <div style={{ "--z": -2 } as any} className="percent top">{value}</div>
                    <div style={{ "--z": -2 } as any} className="percent">{value}</div>
                    <div style={{ "--z": 0 } as any} className="percent">{value}</div>
                    <div style={{ "--z": 2 } as any} className="percent">{value}</div>
                    <div className="percent bak" style={{ color: color }}>{value}</div>
                    <div className="txt charging" style={{ color: color }}>
                        {icon}
                        {title.toUpperCase()}
                    </div>
                    <div className="txt health">
                        {label}
                    </div>
                    <div className="txt cycles">
                        {subValue}
                    </div>
                    <div className="bar-hb"></div>
                    <div style={{ "--z": 0 } as any} className="bar">
                        <div className="bar-slider" style={{ background: `linear-gradient(90deg, ${color}00, ${color}70, ${color}00), linear-gradient(90deg, ${color}00, ${color}9a, ${color}00)` }}></div>
                    </div>
                    <div className="bar bak"><div className="bar-slider" style={{ background: color }}></div></div>
                </div>
            </div>
            <style jsx>{`
                .parent-container {
                    scale: 0.7;
                    margin: -40px;
                }
                .parent {
                    width: 240px;
                    height: 240px;
                    perspective: 3000px;
                    position: relative;
                }

                .card:hover {
                    transform: rotateX(5deg) rotateY(10deg);
                }

                .card:hover div.bar.bak {
                    opacity: 0.7;
                }

                .a:hover ~ .card,
                .card:hover {
                    .outer .patt {
                        stroke-dasharray: 0 90 280 999;
                        stroke-dashoffset: 10;
                    }
                }

                .a {
                    position: absolute;
                    width: 100px;
                    height: 100px;
                    z-index: 10;
                    transform: translateZ(600px);
                }

                .a:hover ~ .card .bar.bak {
                    opacity: 1;
                }

                .tl { top: -30px; left: -30px; }
                .tl:hover ~ .card { transform: rotateX(-20deg) rotateY(20deg); }

                .t { top: -30px; left: 70px; }
                .t:hover ~ .card { transform: rotateX(-20deg); }

                .tr { top: -30px; left: 170px; }
                .tr:hover ~ .card { transform: rotateX(-20deg) rotateY(-20deg); }

                .l { top: 70px; left: -30px; }
                .l:hover ~ .card { transform: rotateY(20deg); }

                .c { top: 70px; left: 70px; }

                .r { top: 70px; left: 170px; }
                .r:hover ~ .card { transform: rotateY(-20deg); }

                .bl { top: 170px; left: -30px; }
                .bl:hover ~ .card { transform: rotateX(20deg) rotateY(20deg); }

                .b { top: 170px; left: 70px; }
                .b:hover ~ .card { transform: rotateX(20deg); }

                .br { top: 170px; left: 170px; }
                .br:hover ~ .card { transform: rotateX(20deg) rotateY(-20deg); }

                .card {
                    position: relative;
                    width: 240px;
                    height: 240px;
                    transform-style: preserve-3d;
                    transition: 0.7s;
                }

                .outer {
                    position: absolute;
                    top: calc(50% - 150px);
                    left: calc(50% - 150px);
                    overflow: visible;
                    transition: 1s;
                    transform: scale(1.05) translateZ(-50px);
                    transform-origin: 170px;
                    pointer-events: none;
                }

                .outer.bb {
                    transform: scale(1.0535) translateZ(-55px);
                }

                .outer.bb1 {
                    transform: scale(1.0535) translateZ(calc(-55px + 5px * var(--z)));
                }

                .outer.bb1 path {
                    stroke-width: calc(6px - 3px * var(--z) * var(--z));
                }

                .outer path {
                    stroke: #fff;
                    fill: none;
                    stroke-width: 6;
                    stroke-linecap: round;
                    stroke-dasharray: 0 0 280 999;
                    transition: 1s;
                }

                .outer path.blur {
                    filter: blur(8px);
                    opacity: 0.4;
                }

                .outer path.bak {
                    stroke: #ffffff09;
                    stroke-dasharray: 0 0 360 0;
                }

                .outer path.bak20 {
                    stroke: #ffffff09;
                    stroke-dasharray: 20 50;
                    stroke-dashoffset: 0;
                    animation: stronk 40s linear infinite;
                }

                @keyframes stronk {
                    from { stroke-dashoffset: 360; }
                }

                .inner {
                    position: absolute;
                    inset: 1px;
                    border-radius: 29px;
                    background: #212121;
                    overflow: hidden;
                    transform-style: preserve-3d;
                    perspective: 100px;
                }

                .inner .inner-bg {
                    position: absolute;
                    inset: -1000%;
                    filter: blur(40px);
                    opacity: 0.3;
                    transform: translateZ(-10px);
                    transition: 1s;
                    animation: speen 24s cubic-bezier(0.36, 0.2, 0.64, 0.8) infinite;
                }

                @keyframes speen {
                    50% { rotate: 180deg; }
                    to { rotate: 360deg; }
                }

                .inner-border {
                    position: absolute;
                    inset: 0;
                    border: double 2px transparent;
                    background-image: linear-gradient(-45deg, #2221, #fff2, #3331);
                    background-origin: border-box;
                    clip-path: path(
                        "M30 0H210A30 30 0 01240 30V210A30 30 0 01210 240H30A30 30 0 010 210V30A30 30 0 0130 0V2A28 28 0 002 30V210A28 28 0 0030 238H210A28 28 0 00238 210V30A28 28 0 00210 2H30"
                    );
                    clip-rule: evenodd;
                    transform: translateZ(calc(var(--z) * 1px));
                    pointer-events: none;
                }

                .percent {
                    position: absolute;
                    top: 24px;
                    left: 34px;
                    font-size: 42px;
                    color: #ccc;
                    transition: 0.4s;
                    transform: translate3d(0px, 0px, calc(40px + var(--z) * 1.5px));
                    cursor: default;
                    pointer-events: none;
                }

                .percent.top {
                    pointer-events: all;
                    color: #0000;
                }

                .percent.bak {
                    transform: translate3d(0px, 0px, 1px);
                    filter: blur(8px);
                    opacity: 0.8;
                }

                .percent.top:hover ~ .percent {
                    text-shadow: 0 0 6px #fff3;
                    transform: translate3d(0px, 0px, calc(60px + var(--z) * 1.5px));
                }

                .txt {
                    position: absolute;
                    font-family: monospace;
                    cursor: default;
                    display: flex;
                    gap: 8px;
                    align-items: center;
                    fill: #888;
                    font-size: 14px;
                    font-weight: 500;
                    color: #888;
                    transition: 0.4s, fill 0.2s, color 0.2s;
                    transform: translate3d(0px, 0px, 20px);
                }

                .txt:hover {
                    transform: translate3d(0px, 0px, 40px);
                    color: #aaa;
                    fill: #aaa;
                }

                .charging { top: 104px; left: 28px; font-weight: 700; letter-spacing: 1px; }
                .health { top: 140px; left: 28px; font-size: 11px; opacity: 0.7; }
                .cycles { top: 164px; left: 28px; font-size: 11px; opacity: 0.7; }

                .bar-hb {
                    position: absolute;
                    width: 190px;
                    height: 14px;
                    top: 205px;
                    left: 25px;
                    transform: translate3d(0px, 0px, 10px);
                }

                .bar-hb:hover ~ .bar:not(.bak) {
                    transform: translate3d(0px, 0px, calc(30px + var(--z) * 2px));
                }

                .bar {
                    position: absolute;
                    width: 180px;
                    height: 4px;
                    background: linear-gradient(90deg, #0000 128px, #ffffff05 0);
                    top: 210px;
                    left: 30px;
                    border-radius: 2px;
                    transform: translate3d(0px, 0px, calc(10px + var(--z) * 1.5px));
                    transition: 0.4s;
                    clip-path: path(
                        "M2 0a1 1 0 000 4h22a1 1 0 000-4Zm30 0a1 1 0 000 4h22a1 1 0 000-4Zm30 0a1 1 0 000 4h22a1 1 0 000-4Zm30 0a1 1 0 000 4h22a1 1 0 000-4Zm30 0a1 1 0 000 4h22a1 1 0 000-4Zm30 0a1 1 0 000 4h22a1 1 0 000-4Z"
                    );
                    pointer-events: none;
                }

                .bar-slider {
                    width: 128px;
                    border-radius: inherit;
                    height: 4px;
                    background-size: 200%;
                    animation: bg-anim 4s linear infinite;
                    transition: 0.3s;
                }

                .bar.bak {
                    transform: translate3d(0px, 0px, 1px);
                    filter: blur(6px);
                    opacity: 0.1;
                    clip-path: none;
                }

                .bar.bak .bar-slider {
                    width: 124px;
                }

                @keyframes bg-anim {
                    from { background-position: 200%, 0%; }
                }
            `}</style>
        </div>
    )
}
