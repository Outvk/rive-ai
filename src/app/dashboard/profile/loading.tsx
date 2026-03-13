import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
    return (
        <div className="max-w-4xl mx-auto space-y-10 fade-in h-screen flex flex-col pt-2">
            <div className="space-y-2">
                <div className="flex items-center gap-3">
                    <Skeleton className="h-8 w-8 rounded-lg bg-indigo-500/10" />
                    <Skeleton className="h-8 w-48 bg-white/10" />
                </div>
                <Skeleton className="h-4 w-3/4 max-w-sm opacity-30" />
            </div>

            <div className="flex-1 space-y-10">
                {/* Profile Header Skeleton */}
                <div className="flex items-center gap-8 p-10 bg-zinc-900/10 border border-white/5 rounded-[2.5rem] relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-500/5 to-transparent opacity-30" />
                    <Skeleton className="h-24 w-24 rounded-3xl bg-white/5 border border-white/10 shrink-0" />
                    <div className="space-y-3 flex-1">
                        <Skeleton className="h-8 w-48 bg-white/10" />
                        <Skeleton className="h-4 w-32 opacity-30" />
                        <div className="flex gap-2 pt-2">
                            <Skeleton className="h-6 w-20 rounded-full bg-indigo-500/10" />
                            <Skeleton className="h-6 w-24 rounded-full bg-white/5" />
                        </div>
                    </div>
                </div>

                {/* Form Fields Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="space-y-3">
                            <Skeleton className="h-3 w-20 opacity-30 ml-1" />
                            <Skeleton className="h-12 w-full rounded-2xl bg-white/5 border border-white/5" />
                        </div>
                    ))}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-4 pt-10 border-t border-white/5">
                    <Skeleton className="h-11 w-28 rounded-xl bg-white/5" />
                    <Skeleton className="h-11 w-32 rounded-xl bg-indigo-600/20" />
                </div>
            </div>
        </div>
    );
}
