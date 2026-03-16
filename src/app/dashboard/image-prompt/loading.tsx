import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
    return (
        <div className="w-full h-full flex flex-col items-center justify-start p-4 overflow-hidden -m-4">
            {/* Background Ambient Glows */}
            <div className="fixed inset-0 pointer-events-none -z-10">
                <div className="absolute top-[10%] left-[10%] w-[30%] h-[30%] bg-indigo-500/5 rounded-full blur-[100px] animate-pulse" />
                <div className="absolute bottom-[10%] right-[10%] w-[30%] h-[30%] bg-purple-500/5 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
            </div>

            <div className="w-full max-w-[1240px] h-[780px] bg-[#09090b]/80 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] flex overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)]">
                {/* LEFT COLUMN: Controls Skeleton */}
                <div className="w-[340px] flex flex-col border-r border-white/5 bg-[#0c0c0e]/50 shrink-0">
                    {/* Header */}
                    <div className="p-6 flex items-center justify-between border-b border-white/5">
                        <div className="space-y-1.5">
                            <Skeleton className="h-4 w-28 bg-white/10" />
                            <div className="flex gap-2">
                                <Skeleton className="h-2.5 w-12 bg-white/5" />
                                <Skeleton className="h-2.5 w-8 bg-white/5" />
                            </div>
                        </div>
                        <Skeleton className="h-10 w-10 rounded-2xl bg-white/5" />
                    </div>

                    {/* Form Content */}
                    <div className="flex-1 p-6 space-y-8 overflow-y-hidden">
                        {/* Mode Switcher */}
                        <div className="bg-zinc-900/50 border border-white/5 p-1.5 rounded-2xl flex gap-1.5">
                            <Skeleton className="h-9 flex-1 rounded-xl bg-indigo-500/10" />
                            <Skeleton className="h-9 flex-1 rounded-xl bg-white/5" />
                        </div>

                        {/* Prompt Area */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Skeleton className="h-4 w-4 rounded-full bg-indigo-500/20" />
                                    <Skeleton className="h-3 w-20 bg-white/10" />
                                </div>
                                <Skeleton className="h-7 w-7 rounded-lg bg-white/5" />
                            </div>
                            <Skeleton className="h-32 w-full rounded-[1.5rem] bg-white/5 border border-white/5" />
                        </div>

                        {/* Generate Button */}
                        <div className="pt-2">
                            <Skeleton className="h-12 w-full rounded-2xl bg-indigo-600/20 shadow-lg shadow-indigo-500/5" />
                            <div className="mt-4 flex justify-between px-1">
                                <Skeleton className="h-2.5 w-24 bg-white/5" />
                                <Skeleton className="h-2.5 w-12 bg-white/5" />
                            </div>
                        </div>

                        {/* Settings Panel Skeleton */}
                        <div className="space-y-4 p-5 rounded-[1.75rem] bg-white/[0.02] border border-white/5">
                            <Skeleton className="h-3 w-24 bg-white/10 mb-2" />
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Skeleton className="h-4 w-4 rounded-full bg-white/5" />
                                        <Skeleton className="h-2.5 w-16 bg-white/5" />
                                    </div>
                                    <Skeleton className="h-7 w-[130px] rounded-xl bg-white/5" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: Studio Canvas Skeleton */}
                <div className="flex-1 bg-black relative overflow-hidden flex flex-col items-center justify-center p-12">
                    {/* Canvas Decorative Elements */}
                    <div className="absolute inset-0 opacity-20">
                        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,#4f46e50a_0%,transparent_70%)]" />
                    </div>

                    <div className="w-full max-w-2xl h-full flex flex-col items-center justify-center gap-8">
                        {/* Main Viewport */}
                        <div className="relative w-full aspect-[4/5] max-h-[500px] bg-zinc-900/30 rounded-[2.5rem] overflow-hidden shadow-[0_48px_100px_-24px_rgba(0,0,0,0.8)] flex flex-col items-center justify-center space-y-6 border border-white/5 group">
                            <div className="relative h-24 w-24">
                                <Skeleton className="absolute inset-0 rounded-full bg-indigo-500/10 animate-ping duration-[3000ms]" />
                                <Skeleton className="absolute inset-2 rounded-3xl bg-white/5" />
                            </div>
                            <div className="space-y-2 text-center">
                                <Skeleton className="h-4 w-40 bg-white/10 mx-auto" />
                                <Skeleton className="h-2.5 w-48 bg-white/5 mx-auto" />
                            </div>
                        </div>

                        {/* Footer controls under canvas */}
                        <div className="w-full flex items-center justify-between px-6 animate-pulse">
                            <div className="flex gap-6">
                                <div className="space-y-2">
                                    <Skeleton className="h-6 w-20 rounded-lg bg-white/10" />
                                    <Skeleton className="h-2 w-12 bg-white/5" />
                                </div>
                                <div className="space-y-2">
                                    <Skeleton className="h-6 w-28 rounded-lg bg-white/10" />
                                    <Skeleton className="h-2 w-16 bg-white/5" />
                                </div>
                            </div>
                            <Skeleton className="h-11 w-40 rounded-2xl bg-white/10 border border-white/10 shadow-xl" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
