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

            {/* Premium Bento Grid Charts */}
            <div className="pt-8 border-t border-white/5">
                <div className="grid grid-cols-12 gap-6">
                    {/* 1. Large Usage Trend - Spans 8 columns */}
                    <div className="col-span-12 lg:col-span-8 bg-zinc-900/40 border border-white/5 rounded-3xl p-8 backdrop-blur-3xl flex flex-col h-[450px] group transition-all hover:bg-zinc-900/60 hover:border-white/10 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
                                    <ActivityLogIcon className="w-5 h-5 text-indigo-400" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white tracking-tight">Usage Evolution</h3>
                                    <p className="text-xs text-zinc-500 font-medium uppercase tracking-widest">Real-time engagement tracking</p>
                                </div>
                            </div>
                            <div className="px-3 py-1 rounded-full bg-white/5 border border-white/5 text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">Live Updates</div>
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
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                                    <XAxis dataKey="date" stroke="#ffffff20" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => val.slice(5)} />
                                    <YAxis stroke="#ffffff20" fontSize={10} tickLine={false} axisLine={false} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Area type="monotone" dataKey="text" stroke={COLORS.text} fillOpacity={1} fill="url(#colorText)" strokeWidth={3} />
                                    <Area type="monotone" dataKey="image" stroke={COLORS.image} fillOpacity={1} fill="url(#colorImage)" strokeWidth={3} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* 2. Tool Distribution - Spans 4 columns */}
                    <div className="col-span-12 lg:col-span-4 bg-zinc-900/40 border border-white/5 rounded-3xl p-8 backdrop-blur-3xl flex flex-col h-[450px] transition-all hover:bg-zinc-900/60 hover:border-white/10 shadow-2xl relative">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-2.5 rounded-2xl bg-red-500/10 border border-red-500/20">
                                <PieChartIcon className="w-5 h-5 text-red-500" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white tracking-tight">Distribution</h3>
                                <p className="text-xs text-zinc-500 font-medium uppercase tracking-widest">Tool popularity</p>
                            </div>
                        </div>
                        <div className="flex-1 w-full min-h-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={85}
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={entry.fill}
                                                className="hover:opacity-80 transition-opacity cursor-pointer shadow-xl"
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend
                                        verticalAlign="bottom"
                                        height={36}
                                        content={(props) => {
                                            const { payload } = props;
                                            return (
                                                <div className="flex flex-wrap justify-center gap-4 mt-4">
                                                    {payload?.map((entry: any, index: number) => (
                                                        <div key={index} className="flex items-center gap-2">
                                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                                                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{entry.value}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            );
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* 3. Requests Breakdown - Spans 6 columns */}
                    <div className="col-span-12 lg:col-span-6 bg-zinc-900/40 border border-white/5 rounded-3xl p-8 backdrop-blur-3xl flex flex-col h-[400px] transition-all hover:bg-zinc-900/60 hover:border-white/10 shadow-2xl">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                                <LayersIcon className="w-5 h-5 text-amber-500" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white tracking-tight">Breakdown</h3>
                                <p className="text-xs text-zinc-500 font-medium uppercase tracking-widest">Daily request types</p>
                            </div>
                        </div>
                        <div className="flex-1 w-full min-h-0">
                            <ChartContainer config={chartConfig} className="w-full h-full">
                                <BarChart accessibilityLayer data={trendData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                                    <XAxis
                                        dataKey="date"
                                        tickLine={false}
                                        tickMargin={10}
                                        axisLine={false}
                                        tick={{ fill: "#ffffff20", fontSize: 10 }}
                                        tickFormatter={(value) => new Date(value).toLocaleDateString("en-US", { weekday: "short" })}
                                    />
                                    <Bar dataKey="text" stackId="a" fill="var(--color-text)" radius={[0, 0, 4, 4]} />
                                    <Bar dataKey="image" stackId="a" fill="var(--color-image)" radius={[0, 0, 0, 0]} />
                                    <Bar dataKey="audio" stackId="a" fill="var(--color-audio)" radius={[0, 0, 0, 0]} />
                                    <Bar dataKey="video" stackId="a" fill="var(--color-video)" radius={[4, 4, 0, 0]} />
                                    <ChartUITooltip
                                        content={
                                            <ChartTooltipContent
                                                hideLabel
                                                className="bg-black/80 border-white/10 backdrop-blur-xl"
                                                formatter={(value, name) => (
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-2 w-2 rounded-full bg-(--color-bg)" style={{ "--color-bg": `var(--color-${name})` } as any} />
                                                        <span className="text-xs font-bold text-white capitalize">{name}</span>
                                                        <span className="ml-auto text-xs font-mono text-zinc-400">{value}</span>
                                                    </div>
                                                )}
                                            />
                                        }
                                        cursor={false}
                                    />
                                </BarChart>
                            </ChartContainer>
                        </div>
                    </div>

                    {/* 4. Activity Dimensions - Spans 6 columns */}
                    <div className="col-span-12 lg:col-span-6 bg-zinc-900/40 border border-white/5 rounded-3xl p-8 backdrop-blur-3xl flex flex-col h-[400px] transition-all hover:bg-zinc-900/60 hover:border-white/10 shadow-2xl">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-2.5 rounded-2xl bg-purple-500/10 border border-purple-500/20">
                                <TargetIcon className="w-5 h-5 text-purple-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white tracking-tight">Dimensions</h3>
                                <p className="text-xs text-zinc-500 font-medium uppercase tracking-widest">Multi-tool activity radar</p>
                            </div>
                        </div>
                        <div className="flex-1 w-full min-h-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius={110} data={radarData}>
                                    <PolarGrid stroke="#ffffff08" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#ffffff40', fontSize: 10, fontWeight: 700 }} />
                                    <PolarRadiusAxis angle={30} domain={[0, Math.max(10, totalGenerations)]} tick={false} axisLine={false} />
                                    <Radar name="Generations" dataKey="A" stroke={COLORS.image} fill={COLORS.image} fillOpacity={0.3} strokeWidth={3} />
                                    <Tooltip content={<CustomTooltip />} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* 5. Credit Efficiency - Full Width Footer Card */}
                    <div className="col-span-12 bg-zinc-900/40 border border-white/5 rounded-3xl p-8 backdrop-blur-3xl flex flex-col lg:flex-row items-center gap-10 transition-all hover:bg-zinc-900/60 hover:border-white/10 shadow-2xl relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/[0.03] to-transparent pointer-events-none" />
                        <div className="w-full lg:w-1/3 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                                    <ActivityLogIcon className="w-5 h-5 text-emerald-500" />
                                </div>
                                <h3 className="text-lg font-bold text-white tracking-tight">Credit Efficiency</h3>
                            </div>
                            <p className="text-sm text-zinc-400 leading-relaxed font-light">Your consumption trends show high stability in credit usage across all integrated AI models.</p>
                            <div className="pt-4 flex gap-6">
                                <div>
                                    <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Efficiency</div>
                                    <div className="text-xl font-bold text-white">94.2%</div>
                                </div>
                                <div>
                                    <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Projection</div>
                                    <div className="text-xl font-bold text-emerald-400">+12%</div>
                                </div>
                            </div>
                        </div>
                        <div className="flex-1 w-full h-[200px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={trendData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                                    <XAxis dataKey="date" hide />
                                    <YAxis hide domain={['auto', 'auto']} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Line type="monotone" dataKey="credits" name="Credits" stroke={COLORS.credits} strokeWidth={3} dot={false} activeDot={{ r: 6, fill: COLORS.credits, stroke: '#000', strokeWidth: 2 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
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
