import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
    return (
        <div className="max-w-5xl mx-auto space-y-10">
            {/* Header Skeleton */}
            <div className="space-y-3">
                <Skeleton className="h-6 w-32 rounded-full" />
                <Skeleton className="h-12 w-3/4 max-w-xl" />
                <Skeleton className="h-4 w-full max-w-md" />
            </div>

            {/* Stat Strip Skeleton */}
            <div className="grid grid-cols-3 gap-3">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4 px-5 py-4 border border-white/5 rounded-[18px]">
                        <Skeleton className="h-10 w-10 rounded-xl" />
                        <div className="space-y-2">
                            <Skeleton className="h-6 w-12" />
                            <Skeleton className="h-3 w-20" />
                        </div>
                    </div>
                ))}
            </div>

            {/* API Keys Panel Skeleton */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-8 w-8 rounded-lg" />
                        <div className="space-y-1">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-3 w-16" />
                        </div>
                    </div>
                    <Skeleton className="h-9 w-28 rounded-xl" />
                </div>
                <div className="border border-white/5 rounded-[20px] overflow-hidden">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="p-6 border-b border-white/5 last:border-0 space-y-4">
                            <div className="flex justify-between">
                                <div className="space-y-3 flex-1">
                                    <div className="flex items-center gap-2">
                                        <Skeleton className="h-2 w-2 rounded-full" />
                                        <Skeleton className="h-4 w-32" />
                                        <Skeleton className="h-4 w-12 rounded-full" />
                                    </div>
                                    <Skeleton className="h-8 w-3/4 max-w-md rounded-lg" />
                                </div>
                                <div className="flex gap-2">
                                    <Skeleton className="h-8 w-16 rounded-lg" />
                                    <Skeleton className="h-8 w-8 rounded-lg" />
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <Skeleton className="h-3 w-24" />
                                <Skeleton className="h-3 w-20" />
                                <Skeleton className="h-3 w-12" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
