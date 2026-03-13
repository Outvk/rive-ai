import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
    return (
        <div className="max-w-6xl mx-auto space-y-10 fade-in pb-20">
            <div className="space-y-3">
                <div className="flex items-center gap-3">
                    <Skeleton className="h-8 w-8 rounded-lg bg-indigo-500/10" />
                    <Skeleton className="h-8 w-64 bg-white/10" />
                </div>
                <Skeleton className="h-4 w-1/2 max-w-md opacity-30" />
            </div>

            <div className="bg-zinc-900/10 border border-white/5 rounded-[2rem] overflow-hidden">
                {/* Table Header */}
                <div className="grid grid-cols-5 p-6 border-b border-white/5 bg-white/[0.02]">
                    {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className="h-4 w-24 bg-white/5 rounded-md" />
                    ))}
                </div>

                {/* Table Rows */}
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="grid grid-cols-5 p-6 border-b border-white/5 last:border-0 items-center">
                        <div className="flex items-center gap-3">
                            <Skeleton className="h-8 w-8 rounded-full bg-white/5" />
                            <Skeleton className="h-3 w-20 bg-white/10" />
                        </div>
                        <Skeleton className="h-5 w-24 rounded-lg bg-white/5" />
                        <Skeleton className="h-4 w-32 opacity-20" />
                        <Skeleton className="h-6 w-20 rounded-full bg-indigo-500/5" />
                        <div className="flex justify-end pr-4">
                            <Skeleton className="h-8 w-8 rounded-lg bg-white/5" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
