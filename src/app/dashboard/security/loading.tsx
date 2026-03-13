import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
    return (
        <div className="min-h-screen bg-black text-white p-6 lg:p-12 overflow-hidden -m-10 min-h-[calc(100vh-4rem)]">
            {/* Ambient Security Glows */}
            <div className="fixed inset-0 pointer-events-none -z-10">
                <div className="absolute top-[20%] right-[-5%] w-[35%] h-[35%] bg-indigo-500/5 rounded-full blur-[100px]" />
                <div className="absolute bottom-[20%] left-[-5%] w-[35%] h-[35%] bg-blue-500/5 rounded-full blur-[100px]" />
            </div>

            <div className="max-w-6xl mx-auto space-y-20">
                {/* Header Section */}
                <header className="space-y-6">
                    <Skeleton className="h-7 w-48 rounded-full bg-emerald-500/5" />
                    <div className="space-y-4">
                        <Skeleton className="h-16 lg:h-20 w-3/4 bg-white/5 rounded-2xl" />
                        <Skeleton className="h-4 w-full max-w-2xl bg-white/5 rounded-lg" />
                        <Skeleton className="h-4 w-5/6 max-w-xl bg-white/5 rounded-lg opacity-50" />
                    </div>
                </header>

                {/* Core Security Metrics */}
                <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="p-8 rounded-[2rem] bg-zinc-900/20 border border-white/5 space-y-6">
                            <Skeleton className="h-11 w-11 rounded-2xl bg-white/5" />
                            <div className="space-y-3">
                                <Skeleton className="h-3 w-20 opacity-30" />
                                <Skeleton className="h-8 w-24 bg-white/10" />
                                <Skeleton className="h-3 w-32 opacity-30" />
                            </div>
                        </div>
                    ))}
                </section>

                {/* Detailed Security Pillars */}
                <section className="space-y-12">
                    <div className="flex flex-col gap-3">
                        <Skeleton className="h-8 w-48 bg-white/10" />
                        <Skeleton className="h-1 w-20 bg-indigo-500/30 rounded-full" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="p-10 rounded-[2.5rem] bg-zinc-900/20 border border-white/5 space-y-8">
                                <div className="flex items-center gap-6">
                                    <Skeleton className="h-14 w-14 rounded-2xl bg-white/5" />
                                    <Skeleton className="h-8 w-40 bg-white/10" />
                                </div>
                                <div className="space-y-3">
                                    <Skeleton className="h-3 w-full opacity-30" />
                                    <Skeleton className="h-3 w-full opacity-30" />
                                    <Skeleton className="h-3 w-3/4 opacity-30" />
                                </div>
                                <div className="space-y-2">
                                    {[...Array(3)].map((_, j) => (
                                        <div key={j} className="flex items-center gap-3">
                                            <Skeleton className="h-1.5 w-1.5 rounded-full bg-indigo-500/30" />
                                            <Skeleton className="h-4 w-32 bg-white/5" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}
