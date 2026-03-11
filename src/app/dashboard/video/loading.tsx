import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
    return (
        <div className="max-w-4xl mx-auto space-y-8 fade-in h-screen flex flex-col pt-2">
            <div className="space-y-2">
                <div className="flex items-center gap-3">
                    <Skeleton className="h-8 w-8 rounded-lg" />
                    <Skeleton className="h-8 w-48" />
                </div>
                <Skeleton className="h-4 w-3/4 max-w-sm" />
            </div>

            <div className="flex-1 space-y-8">
                {/* Aspect Ratio / Mode Selection Skeleton */}
                <div className="flex gap-4">
                    {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} className="h-10 w-24 rounded-full" />
                    ))}
                </div>

                {/* Video Canvas Placeholder */}
                <div className="aspect-video w-full rounded-[2.5rem] bg-white/5 border border-white/5 flex flex-col items-center justify-center p-12 space-y-6">
                    <Skeleton className="w-16 h-16 rounded-3xl opacity-20" />
                    <div className="space-y-2 text-center w-full">
                        <Skeleton className="h-4 w-1/4 mx-auto" />
                        <Skeleton className="h-3 w-1/5 mx-auto opacity-50" />
                    </div>
                </div>

                {/* Form Skeleton */}
                <div className="space-y-6">
                    <div className="bg-white/5 backdrop-blur-3xl rounded-[2rem] border border-white/10 p-4 space-y-4">
                        <Skeleton className="h-28 w-full rounded-xl" />
                        <div className="flex items-center justify-between px-2 pt-2">
                            <Skeleton className="h-11 w-40 rounded-xl" />
                            <div className="flex items-center gap-3">
                                <Skeleton className="h-4 w-20" />
                                <Skeleton className="h-8 w-8 rounded-full" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
