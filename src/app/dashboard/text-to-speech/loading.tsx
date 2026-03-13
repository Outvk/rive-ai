import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
    return (
        <div className="flex h-auto min-h-full w-full bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl -m-10 min-h-[calc(100vh-4rem)]">
            {/* LEFT SIDE: FORM SKELETON */}
            <div className="w-[420px] border-r border-zinc-800 flex flex-col bg-zinc-950 min-h-full">
                <div className="p-4 flex items-center justify-between border-b border-zinc-800">
                    <div className="space-y-1">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-16 opacity-50" />
                    </div>
                    <Skeleton className="h-8 w-8 rounded-lg" />
                </div>

                <div className="flex-1 p-4 space-y-6">
                    <div className="space-y-2">
                        <Skeleton className="h-3 w-16 opacity-50" />
                        <div className="flex gap-2">
                            <Skeleton className="h-9 flex-1 rounded-lg" />
                            <Skeleton className="h-9 flex-1 rounded-lg" />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Skeleton className="h-3 w-24 opacity-50" />
                        <div className="grid grid-cols-2 gap-2">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="p-3 border border-white/5 rounded-xl space-y-2">
                                    <Skeleton className="h-4 w-1/2" />
                                    <Skeleton className="h-6 w-full rounded-md" />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Skeleton className="h-3 w-20 opacity-50" />
                        <Skeleton className="h-9 w-full rounded-lg" />
                    </div>

                    <div className="space-y-2">
                        <Skeleton className="h-3 w-20 opacity-50" />
                        <Skeleton className="h-32 w-full rounded-lg" />
                    </div>

                    <Skeleton className="h-11 w-full rounded-xl mt-4" />
                </div>
            </div>

            {/* RIGHT SIDE: PREVIEW SKELETON */}
            <div className="flex-1 bg-black flex flex-col items-center justify-center p-12 relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[120px] opacity-20" />

                <div className="w-full max-w-xl z-10 flex flex-col items-center space-y-8">
                    <Skeleton className="w-24 h-24 rounded-3xl opacity-20" />
                    <div className="space-y-3 text-center w-full">
                        <Skeleton className="h-6 w-1/3 mx-auto" />
                        <Skeleton className="h-4 w-1/2 mx-auto opacity-50" />
                    </div>

                    <div className="w-full max-w-sm h-32 bg-white/5 border border-white/5 rounded-[35px] p-6 flex flex-col justify-end space-y-4">
                        <div className="flex justify-between items-center px-4">
                            <Skeleton className="h-3 w-10" />
                            <Skeleton className="h-3 w-10" />
                        </div>
                        <Skeleton className="h-1.5 w-full rounded-full" />
                        <div className="flex justify-center gap-6 pb-2">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <Skeleton className="h-12 w-12 rounded-full" />
                            <Skeleton className="h-10 w-10 rounded-full" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
